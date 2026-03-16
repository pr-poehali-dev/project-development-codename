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


def get_orders(cur, customer_id=None, phone=None):
    if customer_id:
        cur.execute(
            "SELECT id, title, description, category, city, budget, status, created_at "
            "FROM orders WHERE customer_id = %s ORDER BY created_at DESC",
            (customer_id,)
        )
    else:
        cur.execute(
            "SELECT id, title, description, category, city, budget, status, created_at "
            "FROM orders WHERE contact_phone = %s ORDER BY created_at DESC",
            (phone,)
        )
    orders = cur.fetchall()
    result = []
    for o in orders:
        cur.execute(
            "SELECT r.id, r.master_name, r.master_phone, r.master_category, r.message, r.created_at, r.master_id, "
            "rv.id as review_id, rv.rating, rv.comment "
            "FROM responses r "
            "LEFT JOIN reviews rv ON rv.order_id = r.order_id AND rv.master_name = r.master_name "
            "WHERE r.order_id = %s ORDER BY r.created_at ASC",
            (o['id'],)
        )
        responses = cur.fetchall()
        result.append({
            'id': o['id'],
            'title': o['title'],
            'description': o['description'],
            'category': o['category'],
            'city': o['city'] or '',
            'budget': o['budget'],
            'status': o['status'],
            'created_at': o['created_at'].isoformat() if o['created_at'] else None,
            'responses': [{
                'id': r['id'],
                'master_name': r['master_name'],
                'master_phone': r['master_phone'],
                'master_category': r['master_category'],
                'message': r['message'],
                'master_id': r['master_id'],
                'created_at': r['created_at'].isoformat() if r['created_at'] else None,
                'review': {'id': r['review_id'], 'rating': r['rating'], 'comment': r['comment']} if r['review_id'] else None,
            } for r in responses]
        })
    return result


def handler(event: dict, context) -> dict:
    """Кабинет заказчика: вход/регистрация по телефону, заявки с откликами, отзывы о мастерах."""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': HEADERS, 'body': ''}

    method = event.get('httpMethod')

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        action = body.get('action', 'login')

        if action == 'review':
            customer_id = body.get('customer_id')
            order_id = body.get('order_id')
            master_name = (body.get('master_name') or '').strip()
            master_id = body.get('master_id')
            rating = body.get('rating')
            comment = (body.get('comment') or '').strip()

            if not all([customer_id, order_id, master_name, rating]):
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Заполните все обязательные поля'})}
            if not (1 <= int(rating) <= 5):
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Оценка от 1 до 5'})}

            conn = get_conn()
            cur = conn.cursor()
            try:
                cur.execute(
                    "INSERT INTO reviews (order_id, customer_id, master_id, master_name, rating, comment) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
                    (int(order_id), int(customer_id), int(master_id) if master_id else None, master_name, int(rating), comment)
                )
                review_id = cur.fetchone()['id']
                conn.commit()
            except Exception:
                conn.rollback()
                cur.close(); conn.close()
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Отзыв уже оставлен'})}
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True, 'review_id': review_id})}

        # Вход / регистрация
        phone = (body.get('phone') or '').strip()
        name = (body.get('name') or '').strip()

        if not phone:
            return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите телефон'})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT * FROM customers WHERE phone = %s", (phone,))
        customer = cur.fetchone()

        if customer:
            if name:
                cur.execute("UPDATE customers SET name = %s WHERE phone = %s", (name, phone))
                conn.commit()
                cur.execute("SELECT * FROM customers WHERE phone = %s", (phone,))
                customer = cur.fetchone()
        else:
            if not name:
                cur.close(); conn.close()
                return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Заказчик не найден', 'not_found': True})}
            cur.execute("INSERT INTO customers (name, phone) VALUES (%s, %s) RETURNING *", (name, phone))
            customer = cur.fetchone()
            conn.commit()

        cur.execute("UPDATE orders SET customer_id = %s WHERE contact_phone = %s AND customer_id IS NULL", (customer['id'], phone))
        conn.commit()

        orders_data = get_orders(cur, customer_id=customer['id'])
        cur.close(); conn.close()

        return {
            'statusCode': 200,
            'headers': HEADERS,
            'body': json.dumps({
                'customer': {'id': customer['id'], 'name': customer['name'], 'phone': customer['phone']},
                'orders': orders_data
            }, ensure_ascii=False)
        }

    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        phone = (params.get('phone') or '').strip()

        if not phone:
            return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите номер телефона'})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT * FROM customers WHERE phone = %s", (phone,))
        customer = cur.fetchone()

        if customer:
            orders_data = get_orders(cur, customer_id=customer['id'])
            cur.close(); conn.close()
            return {
                'statusCode': 200,
                'headers': HEADERS,
                'body': json.dumps({
                    'customer': {'id': customer['id'], 'name': customer['name'], 'phone': customer['phone']},
                    'orders': orders_data
                }, ensure_ascii=False)
            }

        # Fallback: старый поиск по телефону в заявках
        orders_data = get_orders(cur, phone=phone)
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'orders': orders_data}, ensure_ascii=False)}

    return {'statusCode': 405, 'headers': HEADERS, 'body': json.dumps({'error': 'Method not allowed'})}
