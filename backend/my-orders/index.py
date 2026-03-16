import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'], cursor_factory=RealDictCursor)


def handler(event: dict, context) -> dict:
    """Личный кабинет заказчика — заявки и отклики по номеру телефона."""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': HEADERS, 'body': ''}

    params = event.get('queryStringParameters') or {}
    phone = (params.get('phone') or '').strip()

    if not phone:
        return {
            'statusCode': 400,
            'headers': HEADERS,
            'body': json.dumps({'error': 'Укажите номер телефона'})
        }

    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        "SELECT id, title, description, category, budget, status, created_at "
        "FROM orders WHERE contact_phone = %s ORDER BY created_at DESC",
        (phone,)
    )
    orders = cur.fetchall()

    result = []
    for o in orders:
        cur.execute(
            "SELECT id, master_name, master_phone, master_category, message, created_at "
            "FROM responses WHERE order_id = %s ORDER BY created_at ASC",
            (o['id'],)
        )
        responses = cur.fetchall()
        result.append({
            'id': o['id'],
            'title': o['title'],
            'description': o['description'],
            'category': o['category'],
            'budget': o['budget'],
            'status': o['status'],
            'created_at': o['created_at'].isoformat() if o['created_at'] else None,
            'responses': [
                {
                    'id': r['id'],
                    'master_name': r['master_name'],
                    'master_phone': r['master_phone'],
                    'master_category': r['master_category'],
                    'message': r['message'],
                    'created_at': r['created_at'].isoformat() if r['created_at'] else None,
                }
                for r in responses
            ]
        })

    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': HEADERS,
        'body': json.dumps({'orders': result}, ensure_ascii=False)
    }
