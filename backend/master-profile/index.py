import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'], cursor_factory=RealDictCursor)


def master_to_dict(m):
    return {
        'id': m['id'],
        'name': m['name'],
        'phone': m['phone'],
        'category': m['category'],
        'city': m['city'],
        'about': m['about'],
        'avatar_color': m['avatar_color'] or '#7c3aed',
        'balance': m['balance'],
        'responses_count': m['responses_count'] or 0,
        'created_at': m['created_at'].isoformat() if m['created_at'] else None,
    }


def handler(event: dict, context) -> dict:
    """Профиль мастера: вход/регистрация, публичный профиль с рейтингом и отзывами, смена статуса заявки."""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': HEADERS, 'body': ''}

    method = event.get('httpMethod')
    params = event.get('queryStringParameters') or {}

    # GET — список услуг мастеров для главной страницы
    if method == 'GET' and params.get('action') == 'services':
        category = params.get('category', '').strip()
        city = params.get('city', '').strip()

        conn = get_conn()
        cur = conn.cursor()

        conditions = ['ms.is_active = TRUE']
        args = []
        if category:
            conditions.append('ms.category = %s')
            args.append(category)
        if city:
            conditions.append('ms.city ILIKE %s')
            args.append(city)

        where = ' AND '.join(conditions)
        cur.execute(
            f"SELECT ms.id, ms.title, ms.description, ms.category, ms.city, ms.price, ms.created_at, "
            f"m.id as master_id, m.name as master_name, m.avatar_color, "
            f"ROUND(AVG(r.rating)::numeric, 1) as rating, COUNT(r.id) as reviews_count "
            f"FROM master_services ms "
            f"JOIN masters m ON m.id = ms.master_id "
            f"LEFT JOIN reviews r ON r.master_id = m.id "
            f"WHERE {where} "
            f"GROUP BY ms.id, ms.title, ms.description, ms.category, ms.city, ms.price, ms.created_at, "
            f"m.id, m.name, m.avatar_color "
            f"ORDER BY ms.created_at DESC LIMIT 50",
            args
        )
        services = cur.fetchall()
        cur.execute("SELECT DISTINCT city FROM master_services WHERE is_active = TRUE ORDER BY city")
        cities = [row['city'] for row in cur.fetchall()]
        cur.close(); conn.close()

        return {
            'statusCode': 200,
            'headers': HEADERS,
            'body': json.dumps({
                'services': [{
                    'id': s['id'],
                    'title': s['title'],
                    'description': s['description'],
                    'category': s['category'],
                    'city': s['city'],
                    'price': s['price'],
                    'master_id': s['master_id'],
                    'master_name': s['master_name'],
                    'avatar_color': s['avatar_color'] or '#7c3aed',
                    'rating': float(s['rating']) if s['rating'] else None,
                    'reviews_count': int(s['reviews_count']),
                    'created_at': s['created_at'].isoformat() if s['created_at'] else None,
                } for s in services],
                'cities': cities,
            }, ensure_ascii=False)
        }

    # PUT — смена статуса заявки заказчиком ИЛИ управление услугами мастера
    if method == 'PUT':
        body = json.loads(event.get('body') or '{}')

        # PUT: скрыть/показать услугу
        if body.get('action') == 'toggle_service':
            service_id = body.get('service_id')
            master_id = body.get('master_id')
            is_active = body.get('is_active')
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                "UPDATE master_services SET is_active = %s WHERE id = %s AND master_id = %s",
                (bool(is_active), int(service_id), int(master_id))
            )
            conn.commit()
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True})}

        # PUT: публикация новой услуги мастером
        if body.get('action') == 'add_service':
            master_id = body.get('master_id')
            title = (body.get('title') or '').strip()
            description = (body.get('description') or '').strip()
            category = (body.get('category') or '').strip()
            city = (body.get('city') or '').strip()
            price = body.get('price')
            if not all([master_id, title, category, city]):
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Заполните все обязательные поля'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO master_services (master_id, title, description, category, city, price) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
                (int(master_id), title, description, category, city, int(price) if price else None)
            )
            new_id = cur.fetchone()['id']
            conn.commit()
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True, 'id': new_id})}

        order_id = body.get('order_id')
        status = body.get('status')
        customer_id = body.get('customer_id')

        allowed = ('new', 'in_progress', 'done', 'cancelled')
        if not order_id or status not in allowed:
            return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Неверные данные'})}

        conn = get_conn()
        cur = conn.cursor()
        if customer_id:
            cur.execute(
                "UPDATE orders SET status = %s, closed_at = CASE WHEN %s IN ('done','cancelled') THEN now() ELSE NULL END WHERE id = %s AND customer_id = %s",
                (status, status, int(order_id), int(customer_id))
            )
        else:
            cur.execute(
                "UPDATE orders SET status = %s WHERE id = %s",
                (status, int(order_id))
            )
        conn.commit()
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True})}

    # GET публичного профиля мастера по id
    if method == 'GET' and params.get('master_id'):
        master_id = int(params['master_id'])
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT * FROM masters WHERE id = %s", (master_id,))
        master = cur.fetchone()
        if not master:
            cur.close(); conn.close()
            return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Мастер не найден'})}

        cur.execute(
            "SELECT r.id, r.rating, r.comment, r.created_at, o.title as order_title "
            "FROM reviews r JOIN orders o ON o.id = r.order_id "
            "WHERE r.master_id = %s ORDER BY r.created_at DESC LIMIT 20",
            (master_id,)
        )
        reviews = cur.fetchall()

        cur.execute(
            "SELECT ROUND(AVG(rating)::numeric, 1) as avg_rating, COUNT(*) as total "
            "FROM reviews WHERE master_id = %s",
            (master_id,)
        )
        stats = cur.fetchone()
        cur.close(); conn.close()

        return {
            'statusCode': 200,
            'headers': HEADERS,
            'body': json.dumps({
                'master': master_to_dict(master),
                'rating': float(stats['avg_rating']) if stats['avg_rating'] else None,
                'reviews_total': stats['total'],
                'reviews': [{
                    'id': r['id'],
                    'rating': r['rating'],
                    'comment': r['comment'],
                    'order_title': r['order_title'],
                    'created_at': r['created_at'].isoformat() if r['created_at'] else None,
                } for r in reviews]
            }, ensure_ascii=False)
        }

    # GET профиля по телефону (личный кабинет)
    if method == 'GET':
        phone = (params.get('phone') or '').strip()
        if not phone:
            return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите телефон'})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT * FROM masters WHERE phone = %s", (phone,))
        master = cur.fetchone()
        if not master:
            cur.close(); conn.close()
            return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Мастер не найден', 'not_found': True})}

        cur.execute(
            "SELECT * FROM master_transactions WHERE master_id = %s ORDER BY created_at DESC LIMIT 20",
            (master['id'],)
        )
        transactions = cur.fetchall()
        cur.execute("SELECT ROUND(AVG(rating)::numeric,1) as avg, COUNT(*) as cnt FROM reviews WHERE master_id = %s", (master['id'],))
        stats = cur.fetchone()
        cur.execute(
            "SELECT r.id, r.order_id, r.message, r.created_at, o.title as order_title, o.category as order_category, o.status as order_status, o.city as order_city "
            "FROM responses r JOIN orders o ON o.id = r.order_id "
            "WHERE r.master_id = %s ORDER BY r.created_at DESC LIMIT 50",
            (master['id'],)
        )
        my_responses = cur.fetchall()
        cur.execute(
            "SELECT id, title, description, category, city, price, is_active, created_at FROM master_services WHERE master_id = %s ORDER BY created_at DESC",
            (master['id'],)
        )
        my_services = cur.fetchall()
        cur.close(); conn.close()

        return {
            'statusCode': 200,
            'headers': HEADERS,
            'body': json.dumps({
                'master': master_to_dict(master),
                'rating': float(stats['avg']) if stats['avg'] else None,
                'reviews_total': stats['cnt'],
                'transactions': [{
                    'id': t['id'], 'type': t['type'], 'amount': t['amount'],
                    'description': t['description'],
                    'created_at': t['created_at'].isoformat() if t['created_at'] else None,
                } for t in transactions],
                'my_responses': [{
                    'id': r['id'],
                    'order_id': r['order_id'],
                    'order_title': r['order_title'],
                    'order_category': r['order_category'],
                    'order_status': r['order_status'],
                    'order_city': r['order_city'],
                    'message': r['message'],
                    'created_at': r['created_at'].isoformat() if r['created_at'] else None,
                } for r in my_responses],
                'my_services': [{
                    'id': s['id'],
                    'title': s['title'],
                    'description': s['description'],
                    'category': s['category'],
                    'city': s['city'],
                    'price': s['price'],
                    'is_active': s['is_active'],
                    'created_at': s['created_at'].isoformat() if s['created_at'] else None,
                } for s in my_services],
            }, ensure_ascii=False)
        }

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        phone = (body.get('phone') or '').strip()
        name = (body.get('name') or '').strip()
        category = (body.get('category') or '').strip()
        city = (body.get('city') or '').strip()
        about = (body.get('about') or '').strip()

        if not phone:
            return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите телефон'})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT * FROM masters WHERE phone = %s", (phone,))
        master = cur.fetchone()

        if master:
            if name or about:
                cur.execute(
                    "UPDATE masters SET name = COALESCE(NULLIF(%s,''), name), category = COALESCE(NULLIF(%s,''), category), city = COALESCE(NULLIF(%s,''), city), about = COALESCE(NULLIF(%s,''), about) WHERE phone = %s",
                    (name, category, city, about, phone)
                )
                conn.commit()
                cur.execute("SELECT * FROM masters WHERE phone = %s", (phone,))
                master = cur.fetchone()
        else:
            if not name:
                cur.close(); conn.close()
                return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Мастер не найден', 'not_found': True})}
            cur.execute(
                "INSERT INTO masters (name, phone, category, city, about, balance) VALUES (%s, %s, %s, %s, %s, 0) RETURNING *",
                (name, phone, category, city, about)
            )
            master = cur.fetchone()
            conn.commit()

        cur.execute("SELECT * FROM master_transactions WHERE master_id = %s ORDER BY created_at DESC LIMIT 20", (master['id'],))
        transactions = cur.fetchall()
        cur.execute("SELECT ROUND(AVG(rating)::numeric,1) as avg, COUNT(*) as cnt FROM reviews WHERE master_id = %s", (master['id'],))
        stats = cur.fetchone()
        cur.execute(
            "SELECT r.id, r.order_id, r.message, r.created_at, o.title as order_title, o.category as order_category, o.status as order_status, o.city as order_city "
            "FROM responses r JOIN orders o ON o.id = r.order_id "
            "WHERE r.master_id = %s ORDER BY r.created_at DESC LIMIT 50",
            (master['id'],)
        )
        my_responses = cur.fetchall()
        cur.close(); conn.close()

        return {
            'statusCode': 200,
            'headers': HEADERS,
            'body': json.dumps({
                'master': master_to_dict(master),
                'rating': float(stats['avg']) if stats['avg'] else None,
                'reviews_total': stats['cnt'],
                'transactions': [{
                    'id': t['id'], 'type': t['type'], 'amount': t['amount'],
                    'description': t['description'],
                    'created_at': t['created_at'].isoformat() if t['created_at'] else None,
                } for t in transactions],
                'my_responses': [{
                    'id': r['id'],
                    'order_id': r['order_id'],
                    'order_title': r['order_title'],
                    'order_category': r['order_category'],
                    'order_status': r['order_status'],
                    'order_city': r['order_city'],
                    'message': r['message'],
                    'created_at': r['created_at'].isoformat() if r['created_at'] else None,
                } for r in my_responses]
            }, ensure_ascii=False)
        }

    return {'statusCode': 405, 'headers': HEADERS, 'body': json.dumps({'error': 'Method not allowed'})}