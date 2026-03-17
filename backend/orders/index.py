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
    """Создание и получение заявок от заказчиков с фильтрацией по городу."""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': HEADERS, 'body': ''}

    method = event.get('httpMethod')

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        title = body.get('title', '').strip()
        description = body.get('description', '').strip()
        category = body.get('category', '').strip()
        city = body.get('city', '').strip()
        budget = body.get('budget')
        contact_name = body.get('contact_name', '').strip()
        contact_phone = body.get('contact_phone', '').strip()
        contact_email = body.get('contact_email', '').strip()

        if not all([title, description, category, city, contact_name, contact_phone]):
            return {
                'statusCode': 400,
                'headers': HEADERS,
                'body': json.dumps({'error': 'Заполните все обязательные поля'})
            }

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO orders (title, description, category, city, budget, contact_name, contact_phone, contact_email) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (title, description, category, city, int(budget) if budget else None,
             contact_name, contact_phone, contact_email)
        )
        order_id = cur.fetchone()['id']
        conn.commit()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': HEADERS,
            'body': json.dumps({'success': True, 'order_id': order_id})
        }

    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        city_filter = params.get('city', '').strip()
        master_id = params.get('master_id', '').strip()
        tab = params.get('tab', 'all').strip()

        conn = get_conn()
        cur = conn.cursor()

        if tab == 'active' and master_id:
            cur.execute(
                "SELECT o.id, o.title, o.description, o.category, o.city, o.budget, o.contact_name, o.status, o.created_at "
                "FROM orders o "
                "JOIN responses r ON r.order_id = o.id "
                "WHERE r.master_id = %s AND o.status = 'in_progress' "
                "ORDER BY o.created_at DESC LIMIT 50",
                (int(master_id),)
            )
        elif tab == 'done' and master_id:
            cur.execute(
                "SELECT o.id, o.title, o.description, o.category, o.city, o.budget, o.contact_name, o.status, o.created_at "
                "FROM orders o "
                "JOIN responses r ON r.order_id = o.id "
                "WHERE r.master_id = %s AND o.status = 'done' "
                "ORDER BY o.created_at DESC LIMIT 50",
                (int(master_id),)
            )
        elif city_filter:
            cur.execute(
                "SELECT id, title, description, category, city, budget, contact_name, status, created_at "
                "FROM orders WHERE city = %s AND status = 'new' ORDER BY created_at DESC LIMIT 50",
                (city_filter,)
            )
        else:
            cur.execute(
                "SELECT id, title, description, category, city, budget, contact_name, status, created_at "
                "FROM orders WHERE status = 'new' ORDER BY created_at DESC LIMIT 50"
            )

        rows = cur.fetchall()
        cur.close()
        conn.close()

        orders = [
            {
                'id': r['id'],
                'title': r['title'],
                'description': r['description'],
                'category': r['category'],
                'city': r['city'] or '',
                'budget': r['budget'],
                'contact_name': r['contact_name'],
                'status': r['status'],
                'created_at': r['created_at'].isoformat() if r['created_at'] else None,
            }
            for r in rows
        ]

        return {
            'statusCode': 200,
            'headers': HEADERS,
            'body': json.dumps({'orders': orders}, ensure_ascii=False)
        }

    return {'statusCode': 405, 'headers': HEADERS, 'body': json.dumps({'error': 'Method not allowed'})}