"""
Пакеты откликов для мастеров + административная панель сайта.
Управление пользователями, заявками, категориями, отзывами и балансами.
"""
import json
import os
import hashlib
import secrets
import smtplib
import ssl
import psycopg2
from psycopg2.extras import RealDictCursor
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SCHEMA = "t_p86314354_project_development_"

HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
    'Content-Type': 'application/json',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'], cursor_factory=RealDictCursor)


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    h = hashlib.sha256((salt + password).encode()).hexdigest()
    return f"{salt}:{h}"


def verify_password(password: str, stored_hash: str) -> bool:
    parts = stored_hash.split(":")
    if len(parts) != 2:
        return False
    salt, h = parts
    return hashlib.sha256((salt + password).encode()).hexdigest() == h


def ok(data: dict, status: int = 200) -> dict:
    return {'statusCode': status, 'headers': HEADERS, 'body': json.dumps(data, default=str, ensure_ascii=False)}


def err(msg: str, status: int = 400) -> dict:
    return {'statusCode': status, 'headers': HEADERS, 'body': json.dumps({'error': msg}, ensure_ascii=False)}


def check_auth(event: dict) -> bool:
    hdrs = event.get('headers') or {}
    token = hdrs.get('X-Admin-Token') or hdrs.get('x-admin-token') or ''
    admin_token = os.environ.get('ADMIN_SECRET_TOKEN', '')
    return bool(token) and token == admin_token


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')

    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except Exception:
            pass

    # ========== ПАКЕТЫ ДЛЯ МАСТЕРОВ ==========

    if method == 'GET' and not action.startswith('admin_'):
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT * FROM {SCHEMA}.response_packages WHERE is_active = true ORDER BY price ASC")
        packages = cur.fetchall()
        cur.close()
        conn.close()
        return ok({'packages': [
            {'id': p['id'], 'name': p['name'], 'responses_count': p['responses_count'], 'price': p['price']}
            for p in packages
        ]})

    if method == 'POST' and not action:
        master_id = body.get('master_id')
        package_id = body.get('package_id')
        if not master_id or not package_id:
            return err('Укажите master_id и package_id')

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT * FROM {SCHEMA}.masters WHERE id = %s", (int(master_id),))
        master = cur.fetchone()
        if not master:
            conn.close()
            return err('Мастер не найден', 404)

        cur.execute(f"SELECT * FROM {SCHEMA}.response_packages WHERE id = %s AND is_active = true", (int(package_id),))
        package = cur.fetchone()
        if not package:
            conn.close()
            return err('Пакет не найден', 404)

        cur.execute(
            f"INSERT INTO {SCHEMA}.payments (master_id, package_id, amount, status) VALUES (%s, %s, %s, 'pending') RETURNING id",
            (int(master_id), int(package_id), package['price'])
        )
        payment_id = cur.fetchone()['id']
        cur.execute(f"UPDATE {SCHEMA}.masters SET balance = balance + %s WHERE id = %s", (package['responses_count'], int(master_id)))
        cur.execute(f"UPDATE {SCHEMA}.payments SET status = 'succeeded' WHERE id = %s", (payment_id,))
        cur.execute(
            f"INSERT INTO {SCHEMA}.master_transactions (master_id, type, amount, description) VALUES (%s, 'purchase', %s, %s)",
            (int(master_id), package['responses_count'], f"Куплен пакет «{package['name']}» — {package['responses_count']} откликов")
        )
        conn.commit()
        cur.execute(f"SELECT balance FROM {SCHEMA}.masters WHERE id = %s", (int(master_id),))
        new_balance = cur.fetchone()['balance']
        conn.close()
        return ok({'success': True, 'added': package['responses_count'], 'new_balance': new_balance, 'payment_id': payment_id})

    # ========== АДМИНИСТРАТИВНАЯ ПАНЕЛЬ ==========

    # --- Вход ---
    if method == 'POST' and action == 'admin_login':
        login = body.get('login', '').strip()
        password = body.get('password', '')
        if not login or not password:
            return err('Введите логин и пароль')
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT * FROM {SCHEMA}.admins WHERE login=%s", (login,))
        admin = cur.fetchone()
        conn.close()
        if not admin or not verify_password(password, admin['password_hash']):
            return err('Неверный логин или пароль', 401)
        token = os.environ.get('ADMIN_SECRET_TOKEN', '')
        return ok({'success': True, 'token': token})

    # --- Первоначальная настройка ---
    if method == 'POST' and action == 'admin_setup':
        login = body.get('login', '').strip()
        password = body.get('password', '')
        if not login or not password or len(password) < 6:
            return err('Логин и пароль (мин. 6 символов) обязательны')
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.admins")
        if cur.fetchone()['cnt'] > 0:
            conn.close()
            return err('Администратор уже создан', 403)
        cur.execute(f"INSERT INTO {SCHEMA}.admins (login, password_hash) VALUES (%s, %s)", (login, hash_password(password)))
        conn.commit()
        conn.close()
        return ok({'success': True})

    # Все остальные admin-запросы требуют токен
    if action.startswith('admin_') and not check_auth(event):
        return err('Не авторизован', 401)

    # --- GET: дашборд ---
    if method == 'GET' and action == 'admin_dashboard':
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.masters")
        masters_count = cur.fetchone()['cnt']
        cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.customers")
        customers_count = cur.fetchone()['cnt']
        cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.orders")
        orders_count = cur.fetchone()['cnt']
        cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.orders WHERE status='new'")
        orders_new = cur.fetchone()['cnt']
        cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.reviews")
        reviews_count = cur.fetchone()['cnt']
        cur.execute(f"SELECT COALESCE(SUM(balance),0) as total FROM {SCHEMA}.masters")
        total_balance = cur.fetchone()['total']
        conn.close()
        return ok({'masters_count': masters_count, 'customers_count': customers_count,
                   'orders_count': orders_count, 'orders_new': orders_new,
                   'reviews_count': reviews_count, 'total_balance': total_balance})

    # --- GET: мастера ---
    if method == 'GET' and action == 'admin_masters':
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"""
            SELECT m.id, m.name, m.phone, m.email, m.category, m.city,
                   m.balance, m.is_blocked, m.email_verified, m.created_at,
                   COALESCE(AVG(r.rating),0) as avg_rating,
                   COUNT(DISTINCT r.id) as reviews_count
            FROM {SCHEMA}.masters m
            LEFT JOIN {SCHEMA}.reviews r ON r.master_id = m.id
            GROUP BY m.id ORDER BY m.created_at DESC LIMIT 200
        """)
        masters = cur.fetchall()
        conn.close()
        return ok({'masters': masters})

    # --- GET: заказчики ---
    if method == 'GET' and action == 'admin_customers':
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"""
            SELECT id, name, phone, email, is_blocked, created_at
            FROM {SCHEMA}.customers
            ORDER BY created_at DESC LIMIT 200
        """)
        customers = cur.fetchall()
        conn.close()
        return ok({'customers': customers})

    # --- GET: заявки ---
    if method == 'GET' and action == 'admin_orders':
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"""
            SELECT id, title, description, category, city, budget,
                   contact_name, contact_phone, status, created_at
            FROM {SCHEMA}.orders ORDER BY created_at DESC LIMIT 200
        """)
        orders = cur.fetchall()
        conn.close()
        return ok({'orders': orders})

    # --- GET: отзывы ---
    if method == 'GET' and action == 'admin_reviews':
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"""
            SELECT rv.id, rv.master_id, rv.rating, rv.comment as text, rv.created_at,
                   m.name as master_name
            FROM {SCHEMA}.reviews rv
            LEFT JOIN {SCHEMA}.masters m ON m.id = rv.master_id
            ORDER BY rv.created_at DESC LIMIT 200
        """)
        reviews = cur.fetchall()
        conn.close()
        return ok({'reviews': reviews})

    # --- GET: категории ---
    if method == 'GET' and action == 'admin_categories':
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT * FROM {SCHEMA}.service_categories ORDER BY name")
        categories = cur.fetchall()
        conn.close()
        return ok({'categories': categories})

    # --- GET: транзакции мастера ---
    if method == 'GET' and action == 'admin_master_transactions':
        master_id = params.get('master_id')
        if not master_id:
            return err('Укажите master_id')
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT * FROM {SCHEMA}.master_transactions WHERE master_id=%s ORDER BY created_at DESC LIMIT 50", (master_id,))
        txs = cur.fetchall()
        conn.close()
        return ok({'transactions': txs})

    # --- POST: действия admin ---
    if method == 'POST' and action == 'admin_update_master':
        master_id = body.get('master_id')
        name = body.get('name', '').strip()
        phone = body.get('phone', '').strip()
        email = body.get('email', '').strip()
        city = body.get('city', '').strip()
        category = body.get('category', '').strip()
        about = body.get('about', '').strip()
        if not master_id or not name or not phone:
            return err('Имя и телефон обязательны')
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"UPDATE {SCHEMA}.masters SET name=%s, phone=%s, email=%s, city=%s, category=%s, about=%s WHERE id=%s",
            (name, phone, email or None, city or None, category or None, about or None, master_id)
        )
        conn.commit()
        conn.close()
        return ok({'success': True})

    if method == 'POST' and action == 'admin_update_customer':
        customer_id = body.get('customer_id')
        name = body.get('name', '').strip()
        phone = body.get('phone', '').strip()
        email = body.get('email', '').strip()
        if not customer_id or not name or not phone:
            return err('Имя и телефон обязательны')
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"UPDATE {SCHEMA}.customers SET name=%s, phone=%s, email=%s WHERE id=%s",
            (name, phone, email or None, customer_id)
        )
        conn.commit()
        conn.close()
        return ok({'success': True})

    if method == 'POST' and action == 'admin_block_master':
        master_id = body.get('master_id')
        block = body.get('block', True)
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"UPDATE {SCHEMA}.masters SET is_blocked=%s WHERE id=%s", (block, master_id))
        conn.commit()
        conn.close()
        return ok({'success': True})

    if method == 'POST' and action == 'admin_block_customer':
        customer_id = body.get('customer_id')
        block = body.get('block', True)
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"UPDATE {SCHEMA}.customers SET is_blocked=%s WHERE id=%s", (block, customer_id))
        conn.commit()
        conn.close()
        return ok({'success': True})

    if method == 'POST' and action == 'admin_update_order_status':
        order_id = body.get('order_id')
        status = body.get('status')
        if status not in ['new', 'in_progress', 'done', 'cancelled']:
            return err('Неверный статус')
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"UPDATE {SCHEMA}.orders SET status=%s WHERE id=%s", (status, order_id))
        conn.commit()
        conn.close()
        return ok({'success': True})

    if method == 'POST' and action == 'admin_delete_order':
        order_id = body.get('order_id')
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {SCHEMA}.responses WHERE order_id=%s", (order_id,))
        cur.execute(f"DELETE FROM {SCHEMA}.orders WHERE id=%s", (order_id,))
        conn.commit()
        conn.close()
        return ok({'success': True})

    if method == 'POST' and action == 'admin_delete_review':
        review_id = body.get('review_id')
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {SCHEMA}.reviews WHERE id=%s", (review_id,))
        conn.commit()
        conn.close()
        return ok({'success': True})

    if method == 'POST' and action == 'admin_add_category':
        name = body.get('name', '').strip()
        if not name:
            return err('Введите название')
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"INSERT INTO {SCHEMA}.service_categories (name) VALUES (%s) ON CONFLICT (name) DO NOTHING", (name,))
        conn.commit()
        conn.close()
        return ok({'success': True})

    if method == 'POST' and action == 'admin_delete_category':
        cat_id = body.get('id')
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {SCHEMA}.service_categories WHERE id=%s", (cat_id,))
        conn.commit()
        conn.close()
        return ok({'success': True})

    if method == 'POST' and action == 'admin_adjust_balance':
        master_id = body.get('master_id')
        amount = body.get('amount')
        comment = body.get('comment', 'Корректировка администратором')
        if not master_id or amount is None:
            return err('Укажите master_id и amount')
        amount = int(amount)
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"UPDATE {SCHEMA}.masters SET balance = balance + %s WHERE id=%s", (amount, master_id))
        cur.execute(f"INSERT INTO {SCHEMA}.master_transactions (master_id, amount, type, description) VALUES (%s, %s, 'admin_adjust', %s)",
                    (master_id, amount, comment))
        conn.commit()
        conn.close()
        return ok({'success': True})

    if method == 'POST' and action == 'admin_change_password':
        old_pass = body.get('old_password', '')
        new_pass = body.get('new_password', '')
        if not old_pass or not new_pass or len(new_pass) < 6:
            return err('Проверьте пароли (мин. 6 символов)')
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT * FROM {SCHEMA}.admins LIMIT 1")
        admin = cur.fetchone()
        if not admin or not verify_password(old_pass, admin['password_hash']):
            conn.close()
            return err('Неверный текущий пароль', 401)
        cur.execute(f"UPDATE {SCHEMA}.admins SET password_hash=%s WHERE id=%s", (hash_password(new_pass), admin['id']))
        conn.commit()
        conn.close()
        return ok({'success': True})

    # --- GET: объявления мастеров (master_services) ---
    if method == 'GET' and action == 'admin_services':
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"""
            SELECT s.id, s.master_id, s.title, s.description, s.category, s.city,
                   s.price, s.is_active, s.paid_until, s.boost_count, s.created_at,
                   m.name as master_name, m.phone as master_phone
            FROM {SCHEMA}.master_services s
            JOIN {SCHEMA}.masters m ON m.id = s.master_id
            ORDER BY s.created_at DESC LIMIT 300
        """)
        services = cur.fetchall()
        conn.close()
        return ok({'services': services})

    # --- GET: переписки (master_inquiries + кол-во сообщений) ---
    if method == 'GET' and action == 'admin_chats':
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"""
            SELECT i.id, i.master_id, i.contact_name, i.contact_phone, i.contact_email,
                   i.message, i.deal_status, i.created_at, i.expires_at,
                   m.name as master_name, m.phone as master_phone,
                   COUNT(c.id) as messages_count
            FROM {SCHEMA}.master_inquiries i
            JOIN {SCHEMA}.masters m ON m.id = i.master_id
            LEFT JOIN {SCHEMA}.chat_messages c ON c.inquiry_id = i.id
            GROUP BY i.id, m.name, m.phone
            ORDER BY i.created_at DESC LIMIT 300
        """)
        chats = cur.fetchall()
        conn.close()
        return ok({'chats': chats})

    # --- GET: сообщения конкретного чата ---
    if method == 'GET' and action == 'admin_chat_messages':
        inquiry_id = params.get('inquiry_id')
        if not inquiry_id:
            return err('Укажите inquiry_id')
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"""
            SELECT id, sender_role, sender_name, text, created_at
            FROM {SCHEMA}.chat_messages WHERE inquiry_id=%s ORDER BY created_at ASC
        """, (int(inquiry_id),))
        messages = cur.fetchall()
        conn.close()
        return ok({'messages': messages})

    # --- GET: отклики мастеров на заявки ---
    if method == 'GET' and action == 'admin_responses':
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"""
            SELECT r.id, r.order_id, r.master_id, r.master_name, r.master_phone,
                   r.master_category, r.message, r.created_at,
                   o.title as order_title, o.status as order_status, o.city as order_city,
                   o.accepted_response_id
            FROM {SCHEMA}.responses r
            JOIN {SCHEMA}.orders o ON o.id = r.order_id
            ORDER BY r.created_at DESC LIMIT 300
        """)
        responses = cur.fetchall()
        conn.close()
        return ok({'responses': responses})

    # --- GET: платежи ---
    if method == 'GET' and action == 'admin_payments':
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"""
            SELECT p.id, p.master_id, p.amount, p.status, p.tokens_count, p.created_at,
                   m.name as master_name, m.phone as master_phone,
                   pk.name as package_name
            FROM {SCHEMA}.payments p
            JOIN {SCHEMA}.masters m ON m.id = p.master_id
            LEFT JOIN {SCHEMA}.response_packages pk ON pk.id = p.package_id
            ORDER BY p.created_at DESC LIMIT 300
        """)
        payments = cur.fetchall()
        conn.close()
        return ok({'payments': payments})

    # --- GET: расширенный дашборд ---
    if method == 'GET' and action == 'admin_dashboard':
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.masters")
        masters_count = cur.fetchone()['cnt']
        cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.masters WHERE is_blocked=TRUE")
        masters_blocked = cur.fetchone()['cnt']
        cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.customers")
        customers_count = cur.fetchone()['cnt']
        cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.orders")
        orders_count = cur.fetchone()['cnt']
        cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.orders WHERE status='new'")
        orders_new = cur.fetchone()['cnt']
        cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.reviews")
        reviews_count = cur.fetchone()['cnt']
        cur.execute(f"SELECT COALESCE(SUM(balance),0) as total FROM {SCHEMA}.masters")
        total_balance = cur.fetchone()['total']
        cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.master_services WHERE is_active=TRUE")
        active_services = cur.fetchone()['cnt']
        cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.master_inquiries")
        chats_count = cur.fetchone()['cnt']
        cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.master_inquiries WHERE deal_status='deal'")
        deals_done = cur.fetchone()['cnt']
        cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.responses")
        responses_count = cur.fetchone()['cnt']
        cur.execute(f"SELECT COALESCE(SUM(amount),0) as total FROM {SCHEMA}.payments WHERE status='succeeded'")
        revenue = cur.fetchone()['total']
        conn.close()
        return ok({
            'masters_count': masters_count, 'masters_blocked': masters_blocked,
            'customers_count': customers_count,
            'orders_count': orders_count, 'orders_new': orders_new,
            'reviews_count': reviews_count, 'total_balance': total_balance,
            'active_services': active_services, 'chats_count': chats_count,
            'deals_done': deals_done, 'responses_count': responses_count,
            'revenue': revenue,
        })

    # --- POST: редактировать объявление мастера ---
    if method == 'POST' and action == 'admin_update_service':
        service_id = body.get('service_id')
        title = (body.get('title') or '').strip()
        description = (body.get('description') or '').strip()
        category = (body.get('category') or '').strip()
        city = (body.get('city') or '').strip()
        price = body.get('price')
        if not service_id or not title:
            return err('ID и название обязательны')
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"UPDATE {SCHEMA}.master_services SET title=%s, description=%s, category=%s, city=%s, price=%s WHERE id=%s",
            (title, description or None, category or None, city or None, int(price) if price else None, int(service_id))
        )
        conn.commit()
        conn.close()
        return ok({'success': True})

    # --- POST: удалить объявление мастера ---
    if method == 'POST' and action == 'admin_delete_service':
        service_id = body.get('service_id')
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {SCHEMA}.master_services WHERE id=%s", (service_id,))
        conn.commit()
        conn.close()
        return ok({'success': True})

    # --- POST: удалить переписку ---
    if method == 'POST' and action == 'admin_delete_chat':
        inquiry_id = body.get('inquiry_id')
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {SCHEMA}.chat_messages WHERE inquiry_id=%s", (int(inquiry_id),))
        cur.execute(f"DELETE FROM {SCHEMA}.master_inquiries WHERE id=%s", (int(inquiry_id),))
        conn.commit()
        conn.close()
        return ok({'success': True})

    # --- POST: удалить отклик ---
    if method == 'POST' and action == 'admin_delete_response':
        response_id = body.get('response_id')
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {SCHEMA}.responses WHERE id=%s", (response_id,))
        conn.commit()
        conn.close()
        return ok({'success': True})

    # --- POST: удалить мастера ---
    if method == 'POST' and action == 'admin_delete_master':
        master_id = body.get('master_id')
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {SCHEMA}.chat_messages WHERE inquiry_id IN (SELECT id FROM {SCHEMA}.master_inquiries WHERE master_id=%s)", (master_id,))
        cur.execute(f"DELETE FROM {SCHEMA}.master_inquiries WHERE master_id=%s", (master_id,))
        cur.execute(f"DELETE FROM {SCHEMA}.master_services WHERE master_id=%s", (master_id,))
        cur.execute(f"DELETE FROM {SCHEMA}.master_transactions WHERE master_id=%s", (master_id,))
        cur.execute(f"DELETE FROM {SCHEMA}.responses WHERE master_id=%s", (master_id,))
        cur.execute(f"DELETE FROM {SCHEMA}.reviews WHERE master_id=%s", (master_id,))
        cur.execute(f"DELETE FROM {SCHEMA}.payments WHERE master_id=%s", (master_id,))
        cur.execute(f"DELETE FROM {SCHEMA}.masters WHERE id=%s", (master_id,))
        conn.commit()
        conn.close()
        return ok({'success': True})

    # --- POST: удалить заказчика ---
    if method == 'POST' and action == 'admin_delete_customer':
        customer_id = body.get('customer_id')
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {SCHEMA}.orders WHERE customer_id=%s", (customer_id,))
        cur.execute(f"DELETE FROM {SCHEMA}.customers WHERE id=%s", (customer_id,))
        conn.commit()
        conn.close()
        return ok({'success': True})

    # --- POST: изменить статус объявления ---
    if method == 'POST' and action == 'admin_toggle_service':
        service_id = body.get('service_id')
        is_active = body.get('is_active', True)
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"UPDATE {SCHEMA}.master_services SET is_active=%s WHERE id=%s", (is_active, service_id))
        conn.commit()
        conn.close()
        return ok({'success': True})

    # ── ПОДДЕРЖКА: создать тикет (публичный endpoint) ──
    if method == 'POST' and action == 'support_create':
        name = (body.get('name') or '').strip()
        email = (body.get('email') or '').strip().lower()
        subject = (body.get('subject') or 'other').strip()
        message = (body.get('message') or '').strip()
        if not message:
            return err('Напишите сообщение')
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.support_tickets (name, email, subject, message) VALUES (%s, %s, %s, %s) RETURNING id",
            (name or None, email or None, subject, message)
        )
        ticket_id = cur.fetchone()['id']
        conn.commit()
        cur.close(); conn.close()
        # Уведомляем админа на почту
        try:
            _send_support_notify(ticket_id, name, email, subject, message)
        except Exception:
            pass
        return ok({'success': True, 'ticket_id': ticket_id})

    # ── ПОДДЕРЖКА: список тикетов (только для админа) ──
    if method == 'GET' and action == 'admin_tickets':
        if not check_auth(event):
            return err('Не авторизован', 401)
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT * FROM {SCHEMA}.support_tickets ORDER BY created_at DESC LIMIT 200")
        tickets = cur.fetchall()
        cur.close(); conn.close()
        return ok({'tickets': tickets})

    # ── ПОДДЕРЖКА: ответить на тикет (только для админа) ──
    if method == 'POST' and action == 'admin_reply_ticket':
        if not check_auth(event):
            return err('Не авторизован', 401)
        ticket_id = body.get('ticket_id')
        reply = (body.get('reply') or '').strip()
        if not ticket_id or not reply:
            return err('ticket_id и reply обязательны')
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"UPDATE {SCHEMA}.support_tickets SET admin_reply=%s, status='replied', replied_at=NOW() WHERE id=%s RETURNING name, email, subject",
            (reply, int(ticket_id))
        )
        row = cur.fetchone()
        conn.commit()
        cur.close(); conn.close()
        if row and row['email']:
            try:
                _send_support_reply(row['email'], row['name'] or 'Пользователь', row['subject'], reply)
            except Exception:
                pass
        return ok({'success': True})

    # ── ПОДДЕРЖКА: удалить тикет (только для админа) ──
    if method == 'POST' and action == 'admin_delete_ticket':
        if not check_auth(event):
            return err('Не авторизован', 401)
        ticket_id = body.get('ticket_id')
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {SCHEMA}.support_tickets WHERE id=%s", (int(ticket_id),))
        conn.commit()
        cur.close(); conn.close()
        return ok({'success': True})

    return err('Метод или action не поддерживается', 405)


def _send_support_notify(ticket_id: int, name: str, email: str, subject: str, message: str):
    host = os.environ['SMTP_HOST']
    port = int(os.environ['SMTP_PORT'])
    user = os.environ['SMTP_USER']
    pw = os.environ['SMTP_PASS']
    subjects_map = {'question': 'Вопрос', 'complaint': 'Жалоба', 'bug': 'Технический сбой', 'other': 'Другое'}
    subj_label = subjects_map.get(subject, subject)
    msg = MIMEMultipart('alternative')
    msg['Subject'] = f'[HandyMan #{ticket_id}] Обращение в поддержку: {subj_label}'
    msg['From'] = f'HandyMan <{user}>'
    msg['To'] = user
    html = f"""<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#0a0d16;border-radius:16px;">
      <h2 style="color:#fff;">HandyMan — Поддержка #{ticket_id}</h2>
      <div style="background:#1e1b4b;border:1px solid #4c1d95;border-radius:12px;padding:20px;margin:16px 0;">
        <p style="color:#9ca3af;font-size:13px;margin:0 0 4px;">От: <b style="color:#e5e7eb;">{name or '—'}</b> ({email or 'email не указан'})</p>
        <p style="color:#9ca3af;font-size:13px;margin:0 0 12px;">Тема: <b style="color:#a78bfa;">{subj_label}</b></p>
        <p style="color:#e5e7eb;font-size:14px;white-space:pre-wrap;">{message}</p>
      </div>
      <p style="color:#6b7280;font-size:12px;">Войдите в <a href="https://handyman.poehali.dev/admin" style="color:#7c3aed;">админ-панель</a>, чтобы ответить.</p>
    </div>"""
    msg.attach(MIMEText(f'Обращение #{ticket_id} от {name} ({email}):\n\n{message}', 'plain'))
    msg.attach(MIMEText(html, 'html'))
    ctx = ssl.create_default_context()
    with smtplib.SMTP_SSL(host, port, context=ctx) as server:
        server.login(user, pw)
        server.sendmail(user, user, msg.as_string())


def _send_support_reply(to_email: str, to_name: str, subject: str, reply: str):
    host = os.environ['SMTP_HOST']
    port = int(os.environ['SMTP_PORT'])
    user = os.environ['SMTP_USER']
    pw = os.environ['SMTP_PASS']
    subjects_map = {'question': 'Вопрос', 'complaint': 'Жалоба', 'bug': 'Технический сбой', 'other': 'Другое'}
    subj_label = subjects_map.get(subject, subject)
    msg = MIMEMultipart('alternative')
    msg['Subject'] = f'Ответ поддержки HandyMan на ваш запрос: {subj_label}'
    msg['From'] = f'Поддержка HandyMan <{user}>'
    msg['To'] = to_email
    html = f"""<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#0a0d16;border-radius:16px;">
      <h2 style="color:#fff;">Ответ поддержки HandyMan</h2>
      <p style="color:#9ca3af;font-size:14px;">Привет, {to_name}! Мы ответили на ваш запрос ({subj_label}):</p>
      <div style="background:#1e1b4b;border:1px solid #4c1d95;border-radius:12px;padding:20px;margin:16px 0;">
        <p style="color:#e5e7eb;font-size:14px;white-space:pre-wrap;">{reply}</p>
      </div>
      <p style="color:#6b7280;font-size:12px;">Если у вас остались вопросы — напишите нам снова на сайте.</p>
    </div>"""
    msg.attach(MIMEText(f'Ответ поддержки:\n\n{reply}', 'plain'))
    msg.attach(MIMEText(html, 'html'))
    ctx = ssl.create_default_context()
    with smtplib.SMTP_SSL(host, port, context=ctx) as server:
        server.login(user, pw)
        server.sendmail(user, to_email, msg.as_string())