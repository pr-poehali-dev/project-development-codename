import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'], cursor_factory=RealDictCursor)


def handler(event: dict, context) -> dict:
    """Пакеты откликов для мастеров: список пакетов и покупка (зачисление баланса)."""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': HEADERS, 'body': ''}

    method = event.get('httpMethod')

    if method == 'GET':
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT * FROM response_packages WHERE is_active = true ORDER BY price ASC")
        packages = cur.fetchall()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': HEADERS,
            'body': json.dumps({
                'packages': [
                    {'id': p['id'], 'name': p['name'], 'responses_count': p['responses_count'], 'price': p['price']}
                    for p in packages
                ]
            }, ensure_ascii=False)
        }

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        master_id = body.get('master_id')
        package_id = body.get('package_id')

        if not master_id or not package_id:
            return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите master_id и package_id'})}

        conn = get_conn()
        cur = conn.cursor()

        cur.execute("SELECT * FROM masters WHERE id = %s", (int(master_id),))
        master = cur.fetchone()
        if not master:
            cur.close(); conn.close()
            return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Мастер не найден'})}

        cur.execute("SELECT * FROM response_packages WHERE id = %s AND is_active = true", (int(package_id),))
        package = cur.fetchone()
        if not package:
            cur.close(); conn.close()
            return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Пакет не найден'})}

        cur.execute(
            "INSERT INTO payments (master_id, package_id, amount, status) VALUES (%s, %s, %s, 'pending') RETURNING id",
            (int(master_id), int(package_id), package['price'])
        )
        payment_id = cur.fetchone()['id']

        cur.execute(
            "UPDATE masters SET balance = balance + %s WHERE id = %s",
            (package['responses_count'], int(master_id))
        )
        cur.execute(
            "UPDATE payments SET status = 'succeeded' WHERE id = %s",
            (payment_id,)
        )
        cur.execute(
            "INSERT INTO master_transactions (master_id, type, amount, description) VALUES (%s, 'purchase', %s, %s)",
            (int(master_id), package['responses_count'], f"Куплен пакет «{package['name']}» — {package['responses_count']} откликов")
        )
        conn.commit()

        cur.execute("SELECT balance FROM masters WHERE id = %s", (int(master_id),))
        new_balance = cur.fetchone()['balance']
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': HEADERS,
            'body': json.dumps({
                'success': True,
                'added': package['responses_count'],
                'new_balance': new_balance,
                'payment_id': payment_id
            }, ensure_ascii=False)
        }

    return {'statusCode': 405, 'headers': HEADERS, 'body': json.dumps({'error': 'Method not allowed'})}
