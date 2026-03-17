import json
import os
import random
import secrets
import hashlib
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")

HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
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


def send_code_email_master(to_email: str, code: str, name: str = ""):
    host = os.environ['SMTP_HOST']
    port = int(os.environ['SMTP_PORT'])
    user = os.environ['SMTP_USER']
    pw = os.environ['SMTP_PASS']
    greeting = f"Привет, {name}!" if name else "Привет!"
    msg = MIMEMultipart('alternative')
    msg['Subject'] = f'{code} — код подтверждения HandyMan'
    msg['From'] = f'HandyMan <{user}>'
    msg['To'] = to_email
    html = f"""
    <div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:32px;background:#0a0d16;border-radius:16px;">
      <h2 style="color:#fff;margin-bottom:4px;">HandyMan</h2>
      <p style="color:#9ca3af;font-size:14px;margin-bottom:20px;">{greeting} Ваш код подтверждения:</p>
      <div style="background:#1e1b4b;border:1px solid #4c1d95;border-radius:12px;padding:24px;text-align:center;margin-bottom:20px;">
        <span style="font-size:42px;font-weight:700;letter-spacing:14px;color:#a78bfa;">{code}</span>
      </div>
      <p style="color:#6b7280;font-size:12px;">Код действителен 15 минут.</p>
    </div>
    """
    msg.attach(MIMEText(f'Ваш код подтверждения: {code}\n\nКод действителен 15 минут.', 'plain'))
    msg.attach(MIMEText(html, 'html'))
    ctx = ssl.create_default_context()
    with smtplib.SMTP_SSL(host, port, context=ctx) as server:
        server.login(user, pw)
        server.sendmail(user, to_email, msg.as_string())


def send_code_email(to_email: str, code: str):
    host = os.environ['SMTP_HOST']
    port = int(os.environ['SMTP_PORT'])
    user = os.environ['SMTP_USER']
    password = os.environ['SMTP_PASS']
    msg = MIMEMultipart('alternative')
    msg['Subject'] = f'{code} — код входа в HandyMan'
    msg['From'] = f'HandyMan <{user}>'
    msg['To'] = to_email
    html = f"""
    <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:32px;background:#0a0d16;border-radius:16px;">
      <h2 style="color:#fff;margin-bottom:8px;">Вход в кабинет мастера</h2>
      <p style="color:#9ca3af;font-size:14px;margin-bottom:24px;">Ваш одноразовый код:</p>
      <div style="background:#1e1b4b;border:1px solid #4c1d95;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
        <span style="font-size:40px;font-weight:700;letter-spacing:12px;color:#a78bfa;">{code}</span>
      </div>
      <p style="color:#6b7280;font-size:12px;">Код действителен 10 минут.</p>
    </div>
    """
    msg.attach(MIMEText(f'Ваш код входа: {code}\n\nКод действителен 10 минут.', 'plain'))
    msg.attach(MIMEText(html, 'html'))
    ctx = ssl.create_default_context()
    with smtplib.SMTP_SSL(host, port, context=ctx) as server:
        server.login(user, password)
        server.sendmail(user, to_email, msg.as_string())


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
    """Профиль мастера: вход/регистрация, публичный профиль с рейтингом и отзывами, смена статуса заявки. v3"""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': HEADERS, 'body': ''}

    method = event.get('httpMethod')
    params = event.get('queryStringParameters') or {}

    # POST actions
    if method == 'POST':
        body_raw = json.loads(event.get('body') or '{}')

        # ── РЕГИСТРАЦИЯ МАСТЕРА — шаг 1: создать и отправить код ──
        if body_raw.get('action') == 'register':
            email = (body_raw.get('email') or '').strip().lower()
            phone = (body_raw.get('phone') or '').strip()
            name = (body_raw.get('name') or '').strip()
            if not email:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите email'})}
            if not name:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите имя'})}
            if not phone:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите телефон'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"SELECT id, password_hash, email_verified FROM {SCHEMA}.masters WHERE email=%s", (email,))
            row = cur.fetchone()
            if row and row['email_verified'] and row['password_hash']:
                cur.close(); conn.close()
                return {'statusCode': 400, 'headers': HEADERS,
                        'body': json.dumps({'error': 'Этот email уже зарегистрирован. Войдите с паролем.', 'already_exists': True})}
            if not row:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.masters (name, phone, email, email_verified) VALUES (%s,%s,%s,FALSE) RETURNING id",
                    (name, phone, email)
                )
            else:
                cur.execute(f"UPDATE {SCHEMA}.masters SET name=%s, phone=%s WHERE email=%s", (name, phone, email))
            code = str(random.randint(100000, 999999))
            cur.execute(f"UPDATE {SCHEMA}.auth_codes SET used=TRUE WHERE email=%s AND used=FALSE", (email,))
            cur.execute(f"INSERT INTO {SCHEMA}.auth_codes (email, code) VALUES (%s,%s)", (email, code))
            conn.commit()
            cur.close(); conn.close()
            send_code_email_master(email, code, name)
            return {'statusCode': 200, 'headers': HEADERS,
                    'body': json.dumps({'success': True, 'message': 'Код отправлен на вашу почту.'})}

        # ── РЕГИСТРАЦИЯ МАСТЕРА — шаг 2: подтвердить код ──
        if body_raw.get('action') == 'verify_code_reg':
            email = (body_raw.get('email') or '').strip().lower()
            code = (body_raw.get('code') or '').strip()
            if not email or not code:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите email и код'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                f"SELECT id FROM {SCHEMA}.auth_codes WHERE email=%s AND code=%s AND used=FALSE AND expires_at > NOW()",
                (email, code)
            )
            row = cur.fetchone()
            if not row:
                cur.close(); conn.close()
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Неверный или устаревший код'})}
            cur.execute(f"UPDATE {SCHEMA}.auth_codes SET used=TRUE WHERE id=%s", (row['id'],))
            conn.commit()
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True, 'email': email})}

        # ── РЕГИСТРАЦИЯ МАСТЕРА — шаг 3: установить пароль ──
        if body_raw.get('action') == 'set_password':
            email = (body_raw.get('email') or '').strip().lower()
            password = body_raw.get('password', '')
            if not email:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Email не указан'})}
            if len(password) < 6:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Пароль минимум 6 символов'})}
            conn = get_conn()
            cur = conn.cursor()
            pw_hash = hash_password(password)
            cur.execute(
                f"UPDATE {SCHEMA}.masters SET password_hash=%s, email_verified=TRUE WHERE email=%s RETURNING id, name, phone, email",
                (pw_hash, email)
            )
            user_row = cur.fetchone()
            if not user_row:
                cur.close(); conn.close()
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Пользователь не найден'})}
            conn.commit()
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS,
                    'body': json.dumps({'success': True,
                                        'user': {'id': user_row['id'], 'name': user_row['name'],
                                                 'phone': user_row['phone'], 'email': user_row['email'] or ''}})}

        # ── ВХОД МАСТЕРА ──
        if body_raw.get('action') == 'auth_login':
            identifier = (body_raw.get('email') or body_raw.get('phone') or '').strip()
            password = body_raw.get('password', '')
            if not identifier or not password:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Введите логин и пароль'})}
            conn = get_conn()
            cur = conn.cursor()
            if '@' in identifier:
                cur.execute(f"SELECT id, name, phone, email, password_hash, email_verified FROM {SCHEMA}.masters WHERE email=%s", (identifier.lower(),))
            else:
                cur.execute(f"SELECT id, name, phone, email, password_hash, email_verified FROM {SCHEMA}.masters WHERE phone=%s", (identifier,))
            row = cur.fetchone()
            cur.close(); conn.close()
            if not row:
                return {'statusCode': 401, 'headers': HEADERS, 'body': json.dumps({'error': 'Мастер не найден'})}
            if not row['email_verified'] or not row['password_hash']:
                return {'statusCode': 401, 'headers': HEADERS,
                        'body': json.dumps({'error': 'Завершите регистрацию — подтвердите email.'})}
            if not verify_password(password, row['password_hash']):
                return {'statusCode': 401, 'headers': HEADERS, 'body': json.dumps({'error': 'Неверный пароль'})}
            return {'statusCode': 200, 'headers': HEADERS,
                    'body': json.dumps({'success': True,
                                        'user': {'id': row['id'], 'name': row['name'],
                                                 'phone': row['phone'], 'email': row['email'] or ''}})}

        # ── СБРОС ПАРОЛЯ: запрос кода ──
        if body_raw.get('action') == 'reset_password_request':
            email = (body_raw.get('email') or '').strip().lower()
            if not email:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите email'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"SELECT id, name FROM {SCHEMA}.masters WHERE email=%s AND email_verified=TRUE", (email,))
            row = cur.fetchone()
            if not row:
                cur.close(); conn.close()
                return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Аккаунт с таким email не найден'})}
            code = str(random.randint(100000, 999999))
            cur.execute(f"UPDATE {SCHEMA}.auth_codes SET used=TRUE WHERE email=%s AND used=FALSE", (email,))
            cur.execute(f"INSERT INTO {SCHEMA}.auth_codes (email, code) VALUES (%s,%s)", (email, code))
            conn.commit()
            cur.close(); conn.close()
            send_code_email_master(email, code, row['name'])
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True})}

        # ── СБРОС ПАРОЛЯ: подтверждение кода и новый пароль ──
        if body_raw.get('action') == 'reset_password_confirm':
            email = (body_raw.get('email') or '').strip().lower()
            code = (body_raw.get('code') or '').strip()
            password = body_raw.get('password', '')
            if not email or not code:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите email и код'})}
            if len(password) < 6:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Пароль минимум 6 символов'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                f"SELECT id FROM {SCHEMA}.auth_codes WHERE email=%s AND code=%s AND used=FALSE AND expires_at > NOW()",
                (email, code)
            )
            row = cur.fetchone()
            if not row:
                cur.close(); conn.close()
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Неверный или устаревший код'})}
            cur.execute(f"UPDATE {SCHEMA}.auth_codes SET used=TRUE WHERE id=%s", (row['id'],))
            pw_hash = hash_password(password)
            cur.execute(
                f"UPDATE {SCHEMA}.masters SET password_hash=%s WHERE email=%s RETURNING id, name, phone, email",
                (pw_hash, email)
            )
            user_row = cur.fetchone()
            conn.commit()
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS,
                    'body': json.dumps({'success': True,
                                        'user': {'id': user_row['id'], 'name': user_row['name'],
                                                 'phone': user_row['phone'], 'email': user_row['email'] or ''}})}

        # ── ОБНОВЛЕНИЕ ПРОФИЛЯ ──
        if body_raw.get('action') == 'update_profile':
            master_id = body_raw.get('master_id')
            about = body_raw.get('about', '')
            name = (body_raw.get('name') or '').strip()
            city = (body_raw.get('city') or '').strip()
            if not master_id:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Не авторизован'})}
            conn = get_conn()
            cur = conn.cursor()
            fields, vals = [], []
            if name:
                fields.append("name=%s"); vals.append(name)
            if city is not None:
                fields.append("city=%s"); vals.append(city)
            if about is not None:
                fields.append("about=%s"); vals.append(about)
            if fields:
                vals.append(int(master_id))
                cur.execute(f"UPDATE {SCHEMA}.masters SET {', '.join(fields)} WHERE id=%s RETURNING id, name, phone, city, about, category, balance, avatar_color, responses_count, created_at", vals)
                updated = cur.fetchone()
                conn.commit()
                cur.close(); conn.close()
                return {'statusCode': 200, 'headers': HEADERS,
                        'body': json.dumps({'success': True, 'master': master_to_dict(updated)})}
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True})}

        # ── СМЕНА ПАРОЛЯ (из кабинета) ──
        if body_raw.get('action') == 'change_password':
            master_id = body_raw.get('master_id')
            old_password = body_raw.get('old_password', '')
            new_password = body_raw.get('new_password', '')
            if not master_id:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Не авторизован'})}
            if len(new_password) < 6:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Новый пароль минимум 6 символов'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"SELECT password_hash FROM {SCHEMA}.masters WHERE id=%s", (int(master_id),))
            row = cur.fetchone()
            if not row:
                cur.close(); conn.close()
                return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Пользователь не найден'})}
            if row['password_hash'] and not verify_password(old_password, row['password_hash']):
                cur.close(); conn.close()
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Текущий пароль неверен'})}
            pw_hash = hash_password(new_password)
            cur.execute(f"UPDATE {SCHEMA}.masters SET password_hash=%s WHERE id=%s", (pw_hash, int(master_id)))
            conn.commit()
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True})}

        # ── ОТПРАВИТЬ КОД ВХОДА (для существующих мастеров без пароля) ──
        if body_raw.get('action') == 'send_code':
            email = (body_raw.get('email') or '').strip().lower()
            if not email:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'email обязателен'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute("SELECT id, name FROM masters WHERE LOWER(email) = %s", (email,))
            master = cur.fetchone()
            if not master:
                cur.close(); conn.close()
                return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Мастер с таким email не найден'})}
            code = str(random.randint(100000, 999999))
            cur.execute("UPDATE auth_codes SET used = true WHERE email = %s AND used = false", (email,))
            cur.execute("INSERT INTO auth_codes (email, code) VALUES (%s, %s)", (email, code))
            conn.commit()
            cur.close(); conn.close()
            send_code_email(email, code)
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True, 'name': master['name']})}

        # POST action=verify_code — проверить код и вернуть телефон
        if body_raw.get('action') == 'verify_code':
            email = (body_raw.get('email') or '').strip().lower()
            code = (body_raw.get('code') or '').strip()
            if not email or not code:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'email и code обязательны'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                "SELECT id FROM auth_codes WHERE email = %s AND code = %s AND used = false AND expires_at > now()",
                (email, code)
            )
            row = cur.fetchone()
            if not row:
                cur.close(); conn.close()
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Неверный или устаревший код'})}
            cur.execute("UPDATE auth_codes SET used = true WHERE id = %s", (row['id'],))
            cur.execute("SELECT phone FROM masters WHERE LOWER(email) = %s", (email,))
            master = cur.fetchone()
            conn.commit()
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True, 'phone': master['phone']})}

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
            f"ms.sort_order, ms.boosted_until, "
            f"m.id as master_id, m.name as master_name, m.avatar_color, "
            f"ROUND(AVG(r.rating)::numeric, 1) as rating, COUNT(r.id) as reviews_count "
            f"FROM master_services ms "
            f"JOIN masters m ON m.id = ms.master_id "
            f"LEFT JOIN reviews r ON r.master_id = m.id "
            f"WHERE {where} "
            f"GROUP BY ms.id, ms.title, ms.description, ms.category, ms.city, ms.price, ms.created_at, "
            f"ms.sort_order, ms.boosted_until, m.id, m.name, m.avatar_color "
            f"ORDER BY ms.sort_order DESC, ms.created_at DESC LIMIT 50",
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

        # PUT: поднятие услуги в топ
        if body.get('action') == 'boost_service':
            service_id = body.get('service_id')
            master_id = body.get('master_id')
            if not service_id or not master_id:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Неверные данные'})}
            conn = get_conn()
            cur = conn.cursor()
            import time as _time
            new_sort = int(_time.time() * 1000)
            cur.execute(
                "UPDATE master_services SET sort_order = %s, boost_count = boost_count + 1, boosted_until = NOW() + INTERVAL '7 days' WHERE id = %s AND master_id = %s",
                (new_sort, int(service_id), int(master_id))
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
            import time as _time
            sort_order = int(_time.time() * 1000)
            cur.execute(
                "INSERT INTO master_services (master_id, title, description, category, city, price, sort_order) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id",
                (int(master_id), title, description, category, city, int(price) if price else None, sort_order)
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
            f"FROM {SCHEMA}.reviews WHERE master_id = %s",
            (master_id,)
        )
        stats = cur.fetchone()

        cur.execute(
            f"SELECT id, title, description, price, category, city FROM {SCHEMA}.master_services "
            "WHERE master_id = %s AND is_active = TRUE ORDER BY sort_order DESC, created_at DESC",
            (master_id,)
        )
        services = cur.fetchall()
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
                } for r in reviews],
                'services': [{
                    'id': s['id'],
                    'title': s['title'],
                    'description': s['description'],
                    'price': s['price'],
                    'category': s['category'],
                    'city': s['city'],
                } for s in services],
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
            "SELECT id, title, description, category, city, price, is_active, paid_until, boosted_until, boost_count, created_at FROM master_services WHERE master_id = %s ORDER BY sort_order DESC, created_at DESC",
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
                    'paid_until': s['paid_until'].isoformat() if s['paid_until'] else None,
                    'boosted_until': s['boosted_until'].isoformat() if s['boosted_until'] else None,
                    'boost_count': s['boost_count'] or 0,
                    'created_at': s['created_at'].isoformat() if s['created_at'] else None,
                } for s in my_services],
            }, ensure_ascii=False)
        }

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        phone = (body.get('phone') or '').strip()
        name = (body.get('name') or '').strip()
        email = (body.get('email') or '').strip().lower() or None
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
            if name or about or email:
                cur.execute(
                    "UPDATE masters SET name = COALESCE(NULLIF(%s,''), name), category = COALESCE(NULLIF(%s,''), category), city = COALESCE(NULLIF(%s,''), city), about = COALESCE(NULLIF(%s,''), about), email = COALESCE(%s, email) WHERE phone = %s",
                    (name, category, city, about, email, phone)
                )
                conn.commit()
                cur.execute("SELECT * FROM masters WHERE phone = %s", (phone,))
                master = cur.fetchone()
        else:
            if not name:
                cur.close(); conn.close()
                return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Мастер не найден', 'not_found': True})}
            cur.execute(
                "INSERT INTO masters (name, phone, email, category, city, about, balance) VALUES (%s, %s, %s, %s, %s, %s, 0) RETURNING *",
                (name, phone, email, category, city, about)
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
        cur.execute(
            "SELECT id, title, description, category, city, price, is_active, paid_until, boosted_until, boost_count, created_at FROM master_services WHERE master_id = %s ORDER BY sort_order DESC, created_at DESC",
            (master['id'],)
        )
        my_services_post = cur.fetchall()
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
                    'id': s['id'], 'title': s['title'], 'description': s['description'],
                    'category': s['category'], 'city': s['city'], 'price': s['price'],
                    'is_active': s['is_active'],
                    'paid_until': s['paid_until'].isoformat() if s['paid_until'] else None,
                    'boosted_until': s['boosted_until'].isoformat() if s['boosted_until'] else None,
                    'boost_count': s['boost_count'] or 0,
                    'created_at': s['created_at'].isoformat() if s['created_at'] else None,
                } for s in my_services_post],
            }, ensure_ascii=False)
        }

    return {'statusCode': 405, 'headers': HEADERS, 'body': json.dumps({'error': 'Method not allowed'})}