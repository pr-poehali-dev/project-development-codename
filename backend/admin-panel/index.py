"""
Бэкенд для административной панели.
Управление пользователями, заявками, категориями, отзывами и балансами мастеров.
"""
import json
import os
import hashlib
import secrets
import psycopg2
from psycopg2.extras import RealDictCursor

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


def generate_token() -> str:
    return secrets.token_hex(32)


def ok(data: dict, status: int = 200) -> dict:
    return {'statusCode': status, 'headers': HEADERS, 'body': json.dumps(data, default=str)}


def err(msg: str, status: int = 400) -> dict:
    return {'statusCode': status, 'headers': HEADERS, 'body': json.dumps({'error': msg})}


def check_auth(event: dict) -> bool:
    token = event.get('headers', {}).get('X-Admin-Token') or event.get('headers', {}).get('x-admin-token')
    if not token:
        return False
    admin_token = os.environ.get('ADMIN_SECRET_TOKEN', '')
    return token == admin_token


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

    # === АВТОРИЗАЦИЯ АДМИНА ===
    if method == 'POST' and action == 'login':
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
        return ok({'success': True, 'token': token, 'login': login})

    # === СОЗДАНИЕ ПЕРВОГО АДМИНА (только если нет ни одного) ===
    if method == 'POST' and action == 'setup':
        login = body.get('login', '').strip()
        password = body.get('password', '')
        if not login or not password:
            return err('Введите логин и пароль')
        if len(password) < 6:
            return err('Пароль минимум 6 символов')

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.admins")
        row = cur.fetchone()
        if row['cnt'] > 0:
            conn.close()
            return err('Администратор уже создан', 403)

        ph = hash_password(password)
        cur.execute(f"INSERT INTO {SCHEMA}.admins (login, password_hash) VALUES (%s, %s)", (login, ph))
        conn.commit()
        conn.close()
        return ok({'success': True})

    # Все остальные запросы требуют авторизации
    if not check_auth(event):
        return err('Не авторизован', 401)

    # === GET запросы ===
    if method == 'GET':

        # --- ДАШБОРД (статистика) ---
        if action == 'dashboard':
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
            return ok({
                'masters_count': masters_count,
                'customers_count': customers_count,
                'orders_count': orders_count,
                'orders_new': orders_new,
                'reviews_count': reviews_count,
                'total_balance': total_balance,
            })

        # --- СПИСОК МАСТЕРОВ ---
        if action == 'masters':
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"""
                SELECT m.id, m.name, m.phone, m.email, m.category, m.city,
                       m.balance, m.is_blocked, m.email_verified, m.created_at,
                       COALESCE(AVG(r.rating),0) as avg_rating,
                       COUNT(DISTINCT r.id) as reviews_count
                FROM {SCHEMA}.masters m
                LEFT JOIN {SCHEMA}.reviews r ON r.master_id = m.id
                GROUP BY m.id
                ORDER BY m.created_at DESC
                LIMIT 200
            """)
            masters = cur.fetchall()
            conn.close()
            return ok({'masters': masters})

        # --- СПИСОК ЗАКАЗЧИКОВ ---
        if action == 'customers':
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"""
                SELECT c.id, c.name, c.phone, c.email, c.is_blocked, c.created_at,
                       COUNT(DISTINCT o.id) as orders_count
                FROM {SCHEMA}.customers c
                LEFT JOIN {SCHEMA}.orders o ON o.contact_phone = c.phone
                GROUP BY c.id
                ORDER BY c.created_at DESC
                LIMIT 200
            """)
            customers = cur.fetchall()
            conn.close()
            return ok({'customers': customers})

        # --- СПИСОК ЗАЯВОК ---
        if action == 'orders':
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"""
                SELECT id, title, description, category, city, budget,
                       contact_name, contact_phone, status, created_at
                FROM {SCHEMA}.orders
                ORDER BY created_at DESC
                LIMIT 200
            """)
            orders = cur.fetchall()
            conn.close()
            return ok({'orders': orders})

        # --- СПИСОК ОТЗЫВОВ ---
        if action == 'reviews':
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"""
                SELECT rv.id, rv.master_id, rv.rating, rv.text, rv.created_at,
                       m.name as master_name, m.category as master_category
                FROM {SCHEMA}.reviews rv
                LEFT JOIN {SCHEMA}.masters m ON m.id = rv.master_id
                ORDER BY rv.created_at DESC
                LIMIT 200
            """)
            reviews = cur.fetchall()
            conn.close()
            return ok({'reviews': reviews})

        # --- СПИСОК КАТЕГОРИЙ ---
        if action == 'categories':
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"SELECT * FROM {SCHEMA}.service_categories ORDER BY name")
            categories = cur.fetchall()
            conn.close()
            return ok({'categories': categories})

        # --- ТРАНЗАКЦИИ МАСТЕРА ---
        if action == 'master_transactions':
            master_id = params.get('master_id')
            if not master_id:
                return err('Укажите master_id')
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"""
                SELECT * FROM {SCHEMA}.master_transactions
                WHERE master_id=%s ORDER BY created_at DESC LIMIT 50
            """, (master_id,))
            txs = cur.fetchall()
            conn.close()
            return ok({'transactions': txs})

        return err('Неизвестный action')

    # === POST запросы ===
    if method == 'POST':

        # --- БЛОКИРОВКА/РАЗБЛОКИРОВКА МАСТЕРА ---
        if action == 'block_master':
            master_id = body.get('master_id')
            block = body.get('block', True)
            if not master_id:
                return err('Укажите master_id')
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"UPDATE {SCHEMA}.masters SET is_blocked=%s WHERE id=%s", (block, master_id))
            conn.commit()
            conn.close()
            return ok({'success': True})

        # --- БЛОКИРОВКА/РАЗБЛОКИРОВКА ЗАКАЗЧИКА ---
        if action == 'block_customer':
            customer_id = body.get('customer_id')
            block = body.get('block', True)
            if not customer_id:
                return err('Укажите customer_id')
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"UPDATE {SCHEMA}.customers SET is_blocked=%s WHERE id=%s", (block, customer_id))
            conn.commit()
            conn.close()
            return ok({'success': True})

        # --- ИЗМЕНЕНИЕ СТАТУСА ЗАЯВКИ ---
        if action == 'update_order_status':
            order_id = body.get('order_id')
            status = body.get('status')
            allowed = ['new', 'in_progress', 'done', 'cancelled']
            if not order_id or status not in allowed:
                return err('Неверные параметры')
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"UPDATE {SCHEMA}.orders SET status=%s WHERE id=%s", (status, order_id))
            conn.commit()
            conn.close()
            return ok({'success': True})

        # --- УДАЛЕНИЕ ЗАЯВКИ ---
        if action == 'delete_order':
            order_id = body.get('order_id')
            if not order_id:
                return err('Укажите order_id')
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"DELETE FROM {SCHEMA}.responses WHERE order_id=%s", (order_id,))
            cur.execute(f"DELETE FROM {SCHEMA}.orders WHERE id=%s", (order_id,))
            conn.commit()
            conn.close()
            return ok({'success': True})

        # --- УДАЛЕНИЕ ОТЗЫВА ---
        if action == 'delete_review':
            review_id = body.get('review_id')
            if not review_id:
                return err('Укажите review_id')
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"DELETE FROM {SCHEMA}.reviews WHERE id=%s", (review_id,))
            conn.commit()
            conn.close()
            return ok({'success': True})

        # --- ДОБАВЛЕНИЕ КАТЕГОРИИ ---
        if action == 'add_category':
            name = body.get('name', '').strip()
            if not name:
                return err('Введите название категории')
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"INSERT INTO {SCHEMA}.service_categories (name) VALUES (%s) ON CONFLICT (name) DO NOTHING RETURNING id", (name,))
            conn.commit()
            conn.close()
            return ok({'success': True})

        # --- УДАЛЕНИЕ КАТЕГОРИИ ---
        if action == 'delete_category':
            cat_id = body.get('id')
            if not cat_id:
                return err('Укажите id категории')
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"DELETE FROM {SCHEMA}.service_categories WHERE id=%s", (cat_id,))
            conn.commit()
            conn.close()
            return ok({'success': True})

        # --- ПОПОЛНЕНИЕ БАЛАНСА МАСТЕРА ---
        if action == 'adjust_balance':
            master_id = body.get('master_id')
            amount = body.get('amount')
            comment = body.get('comment', 'Корректировка администратором')
            if not master_id or amount is None:
                return err('Укажите master_id и amount')
            amount = int(amount)
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"UPDATE {SCHEMA}.masters SET balance = balance + %s WHERE id=%s", (amount, master_id))
            cur.execute(f"""
                INSERT INTO {SCHEMA}.master_transactions (master_id, amount, type, description)
                VALUES (%s, %s, %s, %s)
            """, (master_id, amount, 'admin_adjust', comment))
            conn.commit()
            conn.close()
            return ok({'success': True})

        # --- СМЕНА ПАРОЛЯ АДМИНИСТРАТОРА ---
        if action == 'change_admin_password':
            old_pass = body.get('old_password', '')
            new_pass = body.get('new_password', '')
            if not old_pass or not new_pass or len(new_pass) < 6:
                return err('Проверьте пароли (минимум 6 символов)')
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"SELECT * FROM {SCHEMA}.admins LIMIT 1")
            admin = cur.fetchone()
            if not admin or not verify_password(old_pass, admin['password_hash']):
                conn.close()
                return err('Неверный текущий пароль', 401)
            new_hash = hash_password(new_pass)
            cur.execute(f"UPDATE {SCHEMA}.admins SET password_hash=%s WHERE id=%s", (new_hash, admin['id']))
            conn.commit()
            conn.close()
            return ok({'success': True})

        return err('Неизвестный action')

    return err('Метод не поддерживается', 405)
