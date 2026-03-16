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
    """Профиль мастера: регистрация/вход по телефону, баланс, история транзакций."""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': HEADERS, 'body': ''}

    method = event.get('httpMethod')

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        phone = (body.get('phone') or '').strip()
        name = (body.get('name') or '').strip()
        category = (body.get('category') or '').strip()
        city = (body.get('city') or '').strip()

        if not phone:
            return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите телефон'})}

        conn = get_conn()
        cur = conn.cursor()

        cur.execute("SELECT * FROM masters WHERE phone = %s", (phone,))
        master = cur.fetchone()

        if master:
            if name:
                cur.execute(
                    "UPDATE masters SET name = %s, category = %s, city = %s WHERE phone = %s",
                    (name, category, city, phone)
                )
                conn.commit()
                cur.execute("SELECT * FROM masters WHERE phone = %s", (phone,))
                master = cur.fetchone()
        else:
            if not name:
                cur.close()
                conn.close()
                return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Мастер не найден', 'not_found': True})}
            cur.execute(
                "INSERT INTO masters (name, phone, category, city, balance) VALUES (%s, %s, %s, %s, 0) RETURNING *",
                (name, phone, category, city)
            )
            master = cur.fetchone()
            conn.commit()

        cur.execute(
            "SELECT * FROM master_transactions WHERE master_id = %s ORDER BY created_at DESC LIMIT 20",
            (master['id'],)
        )
        transactions = cur.fetchall()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': HEADERS,
            'body': json.dumps({
                'master': {
                    'id': master['id'],
                    'name': master['name'],
                    'phone': master['phone'],
                    'category': master['category'],
                    'city': master['city'],
                    'balance': master['balance'],
                    'created_at': master['created_at'].isoformat() if master['created_at'] else None,
                },
                'transactions': [
                    {
                        'id': t['id'],
                        'type': t['type'],
                        'amount': t['amount'],
                        'description': t['description'],
                        'created_at': t['created_at'].isoformat() if t['created_at'] else None,
                    }
                    for t in transactions
                ]
            }, ensure_ascii=False)
        }

    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        phone = (params.get('phone') or '').strip()

        if not phone:
            return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите телефон'})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT * FROM masters WHERE phone = %s", (phone,))
        master = cur.fetchone()

        if not master:
            cur.close()
            conn.close()
            return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Мастер не найден', 'not_found': True})}

        cur.execute(
            "SELECT * FROM master_transactions WHERE master_id = %s ORDER BY created_at DESC LIMIT 20",
            (master['id'],)
        )
        transactions = cur.fetchall()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': HEADERS,
            'body': json.dumps({
                'master': {
                    'id': master['id'],
                    'name': master['name'],
                    'phone': master['phone'],
                    'category': master['category'],
                    'city': master['city'],
                    'balance': master['balance'],
                    'created_at': master['created_at'].isoformat() if master['created_at'] else None,
                },
                'transactions': [
                    {
                        'id': t['id'],
                        'type': t['type'],
                        'amount': t['amount'],
                        'description': t['description'],
                        'created_at': t['created_at'].isoformat() if t['created_at'] else None,
                    }
                    for t in transactions
                ]
            }, ensure_ascii=False)
        }

    return {'statusCode': 405, 'headers': HEADERS, 'body': json.dumps({'error': 'Method not allowed'})}
