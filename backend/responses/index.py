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
    """Отклики мастеров на заявки заказчиков."""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': HEADERS, 'body': ''}

    method = event.get('httpMethod')

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        order_id = body.get('order_id')
        master_name = body.get('master_name', '').strip()
        master_phone = body.get('master_phone', '').strip()
        master_category = body.get('master_category', '').strip()
        message = body.get('message', '').strip()

        if not all([order_id, master_name, master_phone]):
            return {
                'statusCode': 400,
                'headers': HEADERS,
                'body': json.dumps({'error': 'Заполните все обязательные поля'})
            }

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO responses (order_id, master_name, master_phone, master_category, message) "
            "VALUES (%s, %s, %s, %s, %s) RETURNING id",
            (int(order_id), master_name, master_phone, master_category, message)
        )
        response_id = cur.fetchone()['id']
        conn.commit()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': HEADERS,
            'body': json.dumps({'success': True, 'response_id': response_id})
        }

    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        order_id = params.get('order_id')

        conn = get_conn()
        cur = conn.cursor()

        if order_id:
            cur.execute(
                "SELECT id, order_id, master_name, master_phone, master_category, message, created_at "
                "FROM responses WHERE order_id = %s ORDER BY created_at DESC",
                (int(order_id),)
            )
        else:
            cur.execute(
                "SELECT id, order_id, master_name, master_phone, master_category, message, created_at "
                "FROM responses ORDER BY created_at DESC LIMIT 100"
            )

        rows = cur.fetchall()
        cur.close()
        conn.close()

        responses = [
            {
                'id': r['id'],
                'order_id': r['order_id'],
                'master_name': r['master_name'],
                'master_phone': r['master_phone'],
                'master_category': r['master_category'],
                'message': r['message'],
                'created_at': r['created_at'].isoformat() if r['created_at'] else None,
            }
            for r in rows
        ]

        return {
            'statusCode': 200,
            'headers': HEADERS,
            'body': json.dumps({'responses': responses}, ensure_ascii=False)
        }

    return {'statusCode': 405, 'headers': HEADERS, 'body': json.dumps({'error': 'Method not allowed'})}
