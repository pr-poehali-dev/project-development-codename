import json
import os
import random
import secrets
import hashlib
import smtplib
import ssl
import psycopg2
from psycopg2.extras import RealDictCursor
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")

HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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


def send_chat_email(to_email: str, to_name: str, from_name: str, text: str, cabinet_url: str):
    host = os.environ['SMTP_HOST']
    port = int(os.environ['SMTP_PORT'])
    user = os.environ['SMTP_USER']
    pw = os.environ['SMTP_PASS']
    msg = MIMEMultipart('alternative')
    msg['Subject'] = f'Новое сообщение от {from_name} — HandyMan'
    msg['From'] = f'HandyMan <{user}>'
    msg['To'] = to_email
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0d16;border-radius:16px;">
      <h2 style="color:#fff;margin-bottom:4px;">HandyMan</h2>
      <p style="color:#9ca3af;font-size:14px;margin-bottom:20px;">Привет, {to_name}! Вам написал {from_name}:</p>
      <div style="background:#1e1b4b;border:1px solid #4c1d95;border-radius:12px;padding:20px;margin-bottom:20px;">
        <p style="color:#e5e7eb;font-size:14px;margin:0;">«{text}»</p>
      </div>
      <a href="{cabinet_url}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;">Открыть кабинет</a>
      <p style="color:#6b7280;font-size:12px;margin-top:20px;">Войдите в кабинет HandyMan, чтобы ответить.</p>
    </div>
    """
    msg.attach(MIMEText(f'Новое сообщение от {from_name}:\n\n{text}\n\nОткрыть: {cabinet_url}', 'plain'))
    msg.attach(MIMEText(html, 'html'))
    ctx = ssl.create_default_context()
    with smtplib.SMTP_SSL(host, port, context=ctx) as server:
        server.login(user, pw)
        server.sendmail(user, to_email, msg.as_string())


def send_code_email(to_email: str, code: str, name: str = ""):
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
      <p style="color:#6b7280;font-size:12px;">Код действителен 15 минут. Если вы не регистрировались — проигнорируйте письмо.</p>
    </div>
    """
    msg.attach(MIMEText(f'Ваш код подтверждения: {code}\n\nКод действителен 15 минут.', 'plain'))
    msg.attach(MIMEText(html, 'html'))
    ctx = ssl.create_default_context()
    with smtplib.SMTP_SSL(host, port, context=ctx) as server:
        server.login(user, pw)
        server.sendmail(user, to_email, msg.as_string())


def send_deal_waiting_email(to_email: str, to_name: str, customer_name: str, cabinet_url: str):
    host = os.environ['SMTP_HOST']
    port = int(os.environ['SMTP_PORT'])
    user = os.environ['SMTP_USER']
    pw = os.environ['SMTP_PASS']
    msg = MIMEMultipart('alternative')
    msg['Subject'] = f'{customer_name} нажал «Договорились» — HandyMan'
    msg['From'] = f'HandyMan <{user}>'
    msg['To'] = to_email
    html = f"""<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0d16;border-radius:16px;">
      <h2 style="color:#fff;">HandyMan</h2>
      <p style="color:#9ca3af;font-size:14px;">Привет, {to_name}!</p>
      <div style="background:#1e1b4b;border:1px solid #4c1d95;border-radius:12px;padding:20px;margin:16px 0;">
        <p style="color:#a78bfa;font-weight:600;margin:0 0 8px;">Заказчик {customer_name} подтвердил договорённость.</p>
        <p style="color:#d1d5db;font-size:14px;margin:0;">Войдите в кабинет и нажмите «Договорились» в чате, чтобы обменяться контактами.</p>
      </div>
      <a href="{cabinet_url}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;">Открыть кабинет</a>
    </div>"""
    msg.attach(MIMEText(f'{customer_name} подтвердил договорённость. Войдите в кабинет: {cabinet_url}', 'plain'))
    msg.attach(MIMEText(html, 'html'))
    ctx = ssl.create_default_context()
    with smtplib.SMTP_SSL(host, port, context=ctx) as server:
        server.login(user, pw)
        server.sendmail(user, to_email, msg.as_string())


def send_deal_contacts_customer_email(to_email: str, to_name: str, customer_name: str, customer_phone: str, customer_email: str):
    host = os.environ['SMTP_HOST']
    port = int(os.environ['SMTP_PORT'])
    user = os.environ['SMTP_USER']
    pw = os.environ['SMTP_PASS']
    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Договорённость подтверждена — HandyMan'
    msg['From'] = f'HandyMan <{user}>'
    msg['To'] = to_email
    lines = ""
    if customer_phone:
        lines += f'<p style="margin:4px 0;color:#d1d5db;">📞 {customer_phone}</p>'
    if customer_email:
        lines += f'<p style="margin:4px 0;color:#d1d5db;">✉️ {customer_email}</p>'
    html = f"""<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0d16;border-radius:16px;">
      <h2 style="color:#fff;">HandyMan</h2>
      <p style="color:#9ca3af;font-size:14px;">Привет, {to_name}! Договорённость подтверждена.</p>
      <div style="background:#1e1b4b;border:1px solid #4c1d95;border-radius:12px;padding:20px;margin:16px 0;">
        <p style="color:#a78bfa;font-weight:600;margin:0 0 8px;">Контакты заказчика {customer_name}:</p>
        {lines}
      </div>
      <p style="color:#6b7280;font-size:12px;">С баланса списано 5 токенов.</p>
    </div>"""
    msg.attach(MIMEText(f'Договорённость подтверждена!\nЗаказчик: {customer_name}\nТел: {customer_phone}\nEmail: {customer_email}', 'plain'))
    msg.attach(MIMEText(html, 'html'))
    ctx = ssl.create_default_context()
    with smtplib.SMTP_SSL(host, port, context=ctx) as server:
        server.login(user, pw)
        server.sendmail(user, to_email, msg.as_string())


def send_deal_contacts_master_email(to_email: str, to_name: str, master_name: str, master_email: str):
    host = os.environ['SMTP_HOST']
    port = int(os.environ['SMTP_PORT'])
    user = os.environ['SMTP_USER']
    pw = os.environ['SMTP_PASS']
    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Договорённость подтверждена — HandyMan'
    msg['From'] = f'HandyMan <{user}>'
    msg['To'] = to_email
    html = f"""<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0d16;border-radius:16px;">
      <h2 style="color:#fff;">HandyMan</h2>
      <p style="color:#9ca3af;font-size:14px;">Привет, {to_name}! Договорённость подтверждена.</p>
      <div style="background:#1e1b4b;border:1px solid #4c1d95;border-radius:12px;padding:20px;margin:16px 0;">
        <p style="color:#a78bfa;font-weight:600;margin:0 0 8px;">Контакт мастера {master_name}:</p>
        <p style="color:#d1d5db;">✉️ <a href="mailto:{master_email}" style="color:#a78bfa;">{master_email}</a></p>
      </div>
    </div>"""
    msg.attach(MIMEText(f'Договорённость подтверждена!\nМастер: {master_name}\nEmail: {master_email}', 'plain'))
    msg.attach(MIMEText(html, 'html'))
    ctx = ssl.create_default_context()
    with smtplib.SMTP_SSL(host, port, context=ctx) as server:
        server.login(user, pw)
        server.sendmail(user, to_email, msg.as_string())


def send_push(phone: str, title: str, body: str, url: str = '/'):
    """Отправляет push-уведомление пользователю по телефону."""
    try:
        import urllib.request as _urllib
        _push_data = json.dumps({'action': 'send', 'phone': phone, 'title': title, 'body': body, 'url': url}).encode()
        _req = _urllib.Request(
            'https://functions.poehali.dev/272080b1-1a80-40bd-8201-0951cb380c57',
            data=_push_data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        _urllib.urlopen(_req, timeout=10)
    except Exception:
        pass


def get_orders(cur, customer_id=None, phone=None):
    if customer_id and phone:
        cur.execute(
            "SELECT id, title, description, category, city, budget, status, accepted_response_id, created_at "
            f"FROM {SCHEMA}.orders WHERE customer_id = %s OR (contact_phone = %s AND customer_id IS NULL) ORDER BY created_at DESC",
            (customer_id, phone)
        )
    elif customer_id:
        cur.execute(
            "SELECT id, title, description, category, city, budget, status, accepted_response_id, created_at "
            f"FROM {SCHEMA}.orders WHERE customer_id = %s ORDER BY created_at DESC",
            (customer_id,)
        )
    else:
        cur.execute(
            "SELECT id, title, description, category, city, budget, status, accepted_response_id, created_at "
            f"FROM {SCHEMA}.orders WHERE contact_phone = %s ORDER BY created_at DESC",
            (phone,)
        )
    orders = cur.fetchall()
    result = []
    for o in orders:
        cur.execute(
            "SELECT r.id, r.master_name, r.master_phone, r.master_category, r.message, r.created_at, r.master_id, "
            "rv.id as review_id, rv.rating, rv.comment, "
            "COALESCE(m.balance, 0) as master_balance "
            f"FROM {SCHEMA}.responses r "
            f"LEFT JOIN {SCHEMA}.reviews rv ON rv.order_id = r.order_id AND rv.master_name = r.master_name "
            f"LEFT JOIN {SCHEMA}.masters m ON m.id = r.master_id "
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
            'accepted_response_id': o.get('accepted_response_id'),
            'created_at': o['created_at'].isoformat() if o['created_at'] else None,
            'responses': [{
                'id': r['id'],
                'master_name': r['master_name'],
                'master_phone': r['master_phone'] if r['id'] == o.get('accepted_response_id') else None,
                'master_category': r['master_category'],
                'message': r['message'],
                'master_id': r['master_id'],
                'master_balance': int(r['master_balance']),
                'created_at': r['created_at'].isoformat() if r['created_at'] else None,
                'review': {'id': r['review_id'], 'rating': r['rating'], 'comment': r['comment']} if r['review_id'] else None,
            } for r in responses]
        })
    return result


def handler(event: dict, context) -> dict:
    """Кабинет заказчика: регистрация с кодом на email, вход по email/телефону+пароль, заявки, отзывы."""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': HEADERS, 'body': ''}

    method = event.get('httpMethod')

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        action = body.get('action', 'login')

        # ── ШАГ 1: РЕГИСТРАЦИЯ — создать аккаунт и отправить код ──
        if action == 'register':
            email = (body.get('email') or '').strip().lower()
            phone = (body.get('phone') or '').strip()
            name = (body.get('name') or '').strip()
            city = (body.get('city') or '').strip()
            if not email:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите email'})}
            if not name:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите имя'})}
            if not phone:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите телефон'})}
            if not city:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите город'})}

            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"SELECT id, password_hash, email_verified FROM {SCHEMA}.customers WHERE email=%s", (email,))
            row = cur.fetchone()
            if row and row['email_verified'] and row['password_hash']:
                cur.close(); conn.close()
                return {'statusCode': 400, 'headers': HEADERS,
                        'body': json.dumps({'error': 'Этот email уже зарегистрирован. Войдите с паролем.', 'already_exists': True})}

            if not row:
                # Проверяем не занят ли телефон другим пользователем
                cur.execute(f"SELECT id, email_verified, password_hash FROM {SCHEMA}.customers WHERE phone=%s", (phone,))
                phone_row = cur.fetchone()
                if phone_row and phone_row['email_verified'] and phone_row['password_hash']:
                    cur.close(); conn.close()
                    return {'statusCode': 400, 'headers': HEADERS,
                            'body': json.dumps({'error': 'Этот номер телефона уже зарегистрирован. Войдите с паролем.', 'already_exists': True})}
                if phone_row:
                    # Телефон есть, но аккаунт не завершён — обновляем
                    cur.execute(f"UPDATE {SCHEMA}.customers SET name=%s, email=%s, city=%s WHERE phone=%s", (name, email, city, phone))
                else:
                    cur.execute(
                        f"INSERT INTO {SCHEMA}.customers (name, phone, email, city, email_verified) VALUES (%s,%s,%s,%s,FALSE) RETURNING id",
                        (name, phone, email, city)
                    )
            else:
                cur.execute(f"UPDATE {SCHEMA}.customers SET name=%s, phone=%s, city=%s WHERE email=%s", (name, phone, city, email))

            # Генерируем 6-значный код и сохраняем в auth_codes
            code = str(random.randint(100000, 999999))
            cur.execute(f"UPDATE {SCHEMA}.auth_codes SET used=TRUE WHERE email=%s AND used=FALSE", (email,))
            cur.execute(
                f"INSERT INTO {SCHEMA}.auth_codes (email, code) VALUES (%s, %s)",
                (email, code)
            )
            conn.commit()
            cur.close(); conn.close()

            send_code_email(email, code, name)
            return {'statusCode': 200, 'headers': HEADERS,
                    'body': json.dumps({'success': True, 'message': 'Код отправлен на вашу почту.'})}

        # ── ШАГ 2: ПОДТВЕРЖДЕНИЕ КОДА ──
        if action == 'verify_code':
            email = (body.get('email') or '').strip().lower()
            code = (body.get('code') or '').strip()
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
            return {'statusCode': 200, 'headers': HEADERS,
                    'body': json.dumps({'success': True, 'email': email})}

        # ── ШАГ 3: УСТАНОВКА ПАРОЛЯ ──
        if action == 'set_password':
            email = (body.get('email') or '').strip().lower()
            password = body.get('password', '')
            if not email:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Email не указан'})}
            if len(password) < 6:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Пароль минимум 6 символов'})}
            conn = get_conn()
            cur = conn.cursor()
            pw_hash = hash_password(password)
            cur.execute(
                f"UPDATE {SCHEMA}.customers SET password_hash=%s, email_verified=TRUE WHERE email=%s RETURNING id, name, phone, email",
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

        # ── СБРОС ПАРОЛЯ: запрос кода ──
        if action == 'reset_password_request':
            email = (body.get('email') or '').strip().lower()
            if not email:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите email'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"SELECT id, name FROM {SCHEMA}.customers WHERE email=%s AND email_verified=TRUE", (email,))
            row = cur.fetchone()
            if not row:
                cur.close(); conn.close()
                return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Аккаунт с таким email не найден'})}
            code = str(random.randint(100000, 999999))
            cur.execute(f"UPDATE {SCHEMA}.auth_codes SET used=TRUE WHERE email=%s AND used=FALSE", (email,))
            cur.execute(f"INSERT INTO {SCHEMA}.auth_codes (email, code) VALUES (%s,%s)", (email, code))
            conn.commit()
            cur.close(); conn.close()
            send_code_email(email, code, row['name'])
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True})}

        # ── СБРОС ПАРОЛЯ: подтверждение кода и новый пароль ──
        if action == 'reset_password_confirm':
            email = (body.get('email') or '').strip().lower()
            code = (body.get('code') or '').strip()
            password = body.get('password', '')
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
                f"UPDATE {SCHEMA}.customers SET password_hash=%s WHERE email=%s RETURNING id, name, phone, email",
                (pw_hash, email)
            )
            user_row = cur.fetchone()
            conn.commit()
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS,
                    'body': json.dumps({'success': True,
                                        'user': {'id': user_row['id'], 'name': user_row['name'],
                                                 'phone': user_row['phone'], 'email': user_row['email'] or ''}})}

        # ── СМЕНА ПАРОЛЯ (из кабинета) ──
        if action == 'change_password':
            customer_id = body.get('customer_id')
            old_password = body.get('old_password', '')
            new_password = body.get('new_password', '')
            if not customer_id:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Не авторизован'})}
            if len(new_password) < 6:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Новый пароль минимум 6 символов'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"SELECT password_hash FROM {SCHEMA}.customers WHERE id=%s", (int(customer_id),))
            row = cur.fetchone()
            if not row:
                cur.close(); conn.close()
                return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Пользователь не найден'})}
            if row['password_hash'] and not verify_password(old_password, row['password_hash']):
                cur.close(); conn.close()
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Текущий пароль неверен'})}
            pw_hash = hash_password(new_password)
            cur.execute(f"UPDATE {SCHEMA}.customers SET password_hash=%s WHERE id=%s", (pw_hash, int(customer_id)))
            conn.commit()
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True})}

        # ── ВХОД ЗАКАЗЧИКА ──
        if action == 'auth_login':
            identifier = (body.get('email') or body.get('phone') or '').strip()
            password = body.get('password', '')
            if not identifier or not password:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Введите логин и пароль'})}
            conn = get_conn()
            cur = conn.cursor()
            if '@' in identifier:
                cur.execute(f"SELECT id, name, phone, email, city, password_hash, email_verified FROM {SCHEMA}.customers WHERE email=%s", (identifier.lower(),))
            else:
                cur.execute(f"SELECT id, name, phone, email, city, password_hash, email_verified FROM {SCHEMA}.customers WHERE phone=%s", (identifier,))
            row = cur.fetchone()
            cur.close(); conn.close()
            if not row:
                return {'statusCode': 401, 'headers': HEADERS, 'body': json.dumps({'error': 'Пользователь не найден'})}
            if not row['email_verified'] or not row['password_hash']:
                return {'statusCode': 401, 'headers': HEADERS,
                        'body': json.dumps({'error': 'Завершите регистрацию — подтвердите email.'})}
            if not verify_password(password, row['password_hash']):
                return {'statusCode': 401, 'headers': HEADERS, 'body': json.dumps({'error': 'Неверный пароль'})}
            # Проверяем зарегистрирован ли также как мастер
            conn2 = get_conn()
            cur2 = conn2.cursor()
            cur2.execute(f"SELECT phone FROM {SCHEMA}.masters WHERE phone=%s OR email=%s", (row['phone'], (row['email'] or '').lower()))
            master_row = cur2.fetchone()
            cur2.close(); conn2.close()
            return {'statusCode': 200, 'headers': HEADERS,
                    'body': json.dumps({'success': True,
                                        'user': {'id': row['id'], 'name': row['name'],
                                                 'phone': row['phone'], 'email': row['email'] or '', 'city': row.get('city') or ''},
                                        'master_phone': master_row['phone'] if master_row else None})}

        if action == 'delete_order':
            order_id = body.get('order_id')
            customer_id = body.get('customer_id')
            if not order_id or not customer_id:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Недостаточно данных'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"SELECT status FROM {SCHEMA}.orders WHERE id=%s AND customer_id=%s", (int(order_id), int(customer_id)))
            row = cur.fetchone()
            if not row:
                cur.close(); conn.close()
                return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Заявка не найдена'})}
            if row['status'] not in ('new', 'cancelled'):
                cur.close(); conn.close()
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Нельзя удалить заявку в работе или выполненную'})}
            cur.execute(f"DELETE FROM {SCHEMA}.reviews WHERE order_id=%s", (int(order_id),))
            cur.execute(f"DELETE FROM {SCHEMA}.responses WHERE order_id=%s", (int(order_id),))
            cur.execute(f"DELETE FROM {SCHEMA}.orders WHERE id=%s AND customer_id=%s", (int(order_id), int(customer_id)))
            conn.commit()
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True})}

        if action == 'update_order':
            order_id = body.get('order_id')
            customer_id = body.get('customer_id')
            title = (body.get('title') or '').strip()
            description = (body.get('description') or '').strip()
            category = (body.get('category') or '').strip()
            city = (body.get('city') or '').strip()
            budget = body.get('budget')
            if not order_id or not customer_id or not title:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Заполните обязательные поля'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                f"UPDATE {SCHEMA}.orders SET title=%s, description=%s, category=%s, city=%s, budget=%s WHERE id=%s AND customer_id=%s",
                (title, description, category, city, int(budget) if budget else None, int(order_id), int(customer_id))
            )
            conn.commit()
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True})}

        if action == 'select_master':
            order_id = body.get('order_id')
            response_id = body.get('response_id')
            customer_id = body.get('customer_id')
            if not all([order_id, response_id, customer_id]):
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Недостаточно данных'})}
            conn = get_conn()
            cur = conn.cursor()
            # Получаем master_id из отклика
            cur.execute(f"SELECT master_id FROM {SCHEMA}.responses WHERE id = %s", (int(response_id),))
            resp_row = cur.fetchone()
            master_id = resp_row['master_id'] if resp_row else None
            # Проверяем баланс мастера (минимум 5 токенов)
            if master_id:
                cur.execute(f"SELECT balance FROM {SCHEMA}.masters WHERE id = %s", (int(master_id),))
                master_row = cur.fetchone()
                if not master_row or master_row['balance'] < 5:
                    cur.close(); conn.close()
                    return {'statusCode': 402, 'headers': HEADERS, 'body': json.dumps({'error': 'У мастера недостаточно токенов для принятия заказа', 'no_balance': True})}
            # Принимаем заявку
            cur.execute(
                f"UPDATE {SCHEMA}.orders SET accepted_response_id = %s, status = 'in_progress' WHERE id = %s AND customer_id = %s",
                (int(response_id), int(order_id), int(customer_id))
            )
            # Списываем 5 токенов с мастера
            if master_id:
                cur.execute(f"UPDATE {SCHEMA}.masters SET balance = balance - 5 WHERE id = %s", (int(master_id),))
                cur.execute(
                    f"INSERT INTO {SCHEMA}.master_transactions (master_id, type, amount, description, order_id) VALUES (%s, 'spend', 5, %s, %s)",
                    (int(master_id), f"Выбран исполнителем по заявке #{order_id}", int(response_id))
                )
            # Получаем данные заявки и телефон мастера для push
            cur.execute(f"SELECT title FROM {SCHEMA}.orders WHERE id = %s", (int(order_id),))
            order_row = cur.fetchone()
            conn.commit()
            cur.close(); conn.close()
            # Push-уведомление мастеру — заказчик выбрал его исполнителем
            if master_id:
                try:
                    cur2 = get_conn().cursor()
                    cur2.execute(f"SELECT phone FROM {SCHEMA}.masters WHERE id = %s", (int(master_id),))
                    mp = cur2.fetchone()
                    cur2.close()
                    if mp and mp['phone']:
                        order_title = order_row['title'] if order_row else f'заявка #{order_id}'
                        send_push(
                            phone=mp['phone'],
                            title='Вас выбрали исполнителем!',
                            body=f'Заказчик принял ваш отклик на «{order_title}»',
                            url='/master?tab=orders'
                        )
                except Exception:
                    pass
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True})}

        if action == 'update_profile':
            customer_id = body.get('customer_id')
            name = (body.get('name') or '').strip()
            phone = (body.get('phone') or '').strip()
            email = (body.get('email') or '').strip().lower()
            city = (body.get('city') or '').strip()
            if not customer_id:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Не авторизован'})}
            if not name:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите имя'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                f"UPDATE {SCHEMA}.customers SET name=%s, phone=%s, email=%s, city=%s WHERE id=%s "
                f"RETURNING id, name, phone, email, city",
                (name, phone, email, city, int(customer_id))
            )
            row = cur.fetchone()
            conn.commit()
            cur.close(); conn.close()
            if not row:
                return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Пользователь не найден'})}
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({
                'success': True,
                'customer': {'id': row['id'], 'name': row['name'], 'phone': row['phone'], 'email': row.get('email') or '', 'city': row.get('city') or ''}
            })}

        # ── Запрос на смену email: отправка кода на новый email ──
        if action == 'verify_email_change':
            customer_id = body.get('customer_id')
            new_email = (body.get('new_email') or '').strip().lower()
            if not customer_id:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Не авторизован'})}
            if not new_email:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите новый email'})}
            conn = get_conn()
            cur = conn.cursor()
            # Проверяем что email не занят другим пользователем
            cur.execute(f"SELECT id FROM {SCHEMA}.customers WHERE email=%s AND id!=%s", (new_email, int(customer_id)))
            if cur.fetchone():
                cur.close(); conn.close()
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Этот email уже используется другим аккаунтом'})}
            # Получаем имя пользователя
            cur.execute(f"SELECT name FROM {SCHEMA}.customers WHERE id=%s", (int(customer_id),))
            cust = cur.fetchone()
            if not cust:
                cur.close(); conn.close()
                return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Пользователь не найден'})}
            # Генерируем код и сохраняем с префиксом email_change для различия
            code = str(random.randint(100000, 999999))
            marker = f'email_change:{customer_id}:{new_email}'
            cur.execute(f"UPDATE {SCHEMA}.auth_codes SET used=TRUE WHERE email=%s AND used=FALSE", (marker,))
            cur.execute(f"INSERT INTO {SCHEMA}.auth_codes (email, code) VALUES (%s, %s)", (marker, code))
            conn.commit()
            cur.close(); conn.close()
            send_code_email(new_email, code, cust['name'])
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True})}

        # ── Подтверждение смены email кодом ──
        if action == 'confirm_email_change':
            customer_id = body.get('customer_id')
            new_email = (body.get('new_email') or '').strip().lower()
            code = (body.get('code') or '').strip()
            if not customer_id or not new_email or not code:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Не все поля заполнены'})}
            conn = get_conn()
            cur = conn.cursor()
            marker = f'email_change:{customer_id}:{new_email}'
            cur.execute(
                f"SELECT id FROM {SCHEMA}.auth_codes WHERE email=%s AND code=%s AND used=FALSE AND created_at > NOW() - INTERVAL '15 minutes'",
                (marker, code)
            )
            row = cur.fetchone()
            if not row:
                cur.close(); conn.close()
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Неверный или устаревший код'})}
            cur.execute(f"UPDATE {SCHEMA}.auth_codes SET used=TRUE WHERE email=%s AND code=%s", (marker, code))
            cur.execute(
                f"UPDATE {SCHEMA}.customers SET email=%s WHERE id=%s RETURNING id, name, phone, email, city",
                (new_email, int(customer_id))
            )
            cust = cur.fetchone()
            conn.commit()
            cur.close(); conn.close()
            if not cust:
                return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Пользователь не найден'})}
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({
                'success': True,
                'customer': {'id': cust['id'], 'name': cust['name'], 'phone': cust['phone'], 'email': cust.get('email') or '', 'city': cust.get('city') or ''}
            })}

        # ── Запрос на смену телефона: отправка кода на текущий email ──
        if action == 'verify_phone_change':
            customer_id = body.get('customer_id')
            new_phone = (body.get('new_phone') or '').strip()
            if not customer_id:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Не авторизован'})}
            if not new_phone:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите новый телефон'})}
            conn = get_conn()
            cur = conn.cursor()
            # Проверяем что телефон не занят
            cur.execute(f"SELECT id FROM {SCHEMA}.customers WHERE phone=%s AND id!=%s", (new_phone, int(customer_id)))
            if cur.fetchone():
                cur.close(); conn.close()
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Этот телефон уже используется другим аккаунтом'})}
            cur.execute(f"SELECT name, email FROM {SCHEMA}.customers WHERE id=%s", (int(customer_id),))
            cust = cur.fetchone()
            if not cust:
                cur.close(); conn.close()
                return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Пользователь не найден'})}
            code = str(random.randint(100000, 999999))
            marker = f'phone_change:{customer_id}:{new_phone}'
            cur.execute(f"UPDATE {SCHEMA}.auth_codes SET used=TRUE WHERE email=%s AND used=FALSE", (marker,))
            cur.execute(f"INSERT INTO {SCHEMA}.auth_codes (email, code) VALUES (%s, %s)", (marker, code))
            conn.commit()
            cur.close(); conn.close()
            # Код отправляем на текущий email
            send_code_email(cust['email'], code, cust['name'])
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True})}

        # ── Подтверждение смены телефона кодом ──
        if action == 'confirm_phone_change':
            customer_id = body.get('customer_id')
            new_phone = (body.get('new_phone') or '').strip()
            code = (body.get('code') or '').strip()
            if not customer_id or not new_phone or not code:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Не все поля заполнены'})}
            conn = get_conn()
            cur = conn.cursor()
            marker = f'phone_change:{customer_id}:{new_phone}'
            cur.execute(
                f"SELECT id FROM {SCHEMA}.auth_codes WHERE email=%s AND code=%s AND used=FALSE AND created_at > NOW() - INTERVAL '15 minutes'",
                (marker, code)
            )
            row = cur.fetchone()
            if not row:
                cur.close(); conn.close()
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Неверный или устаревший код'})}
            cur.execute(f"UPDATE {SCHEMA}.auth_codes SET used=TRUE WHERE email=%s AND code=%s", (marker, code))
            cur.execute(
                f"UPDATE {SCHEMA}.customers SET phone=%s WHERE id=%s RETURNING id, name, phone, email, city",
                (new_phone, int(customer_id))
            )
            cust = cur.fetchone()
            conn.commit()
            cur.close(); conn.close()
            if not cust:
                return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Пользователь не найден'})}
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({
                'success': True,
                'customer': {'id': cust['id'], 'name': cust['name'], 'phone': cust['phone'], 'email': cust.get('email') or '', 'city': cust.get('city') or ''}
            })}

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
                    f"INSERT INTO {SCHEMA}.reviews (order_id, customer_id, master_id, master_name, rating, comment) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
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

        # ── ОТПРАВИТЬ СООБЩЕНИЕ В ЧАТ ──
        if action == 'send_message':
            import re as _re
            CONTACT_RE = r'(\+?[78][\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}|[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,})'
            inquiry_id = body.get('inquiry_id')
            sender_role = body.get('sender_role')
            sender_name = (body.get('sender_name') or '').strip()
            text = (body.get('text') or '').strip()
            if not all([inquiry_id, sender_role, sender_name, text]):
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Не все поля заполнены'})}
            if sender_role not in ('customer', 'master'):
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Неверная роль'})}
            if _re.search(CONTACT_RE, text):
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Нельзя отправлять телефон или email в чате. Используйте кнопку «Договорились» для обмена контактами.'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                f"INSERT INTO {SCHEMA}.chat_messages (inquiry_id, sender_role, sender_name, text) VALUES (%s, %s, %s, %s) RETURNING id, created_at",
                (int(inquiry_id), sender_role, sender_name, text)
            )
            row = cur.fetchone()
            conn.commit()
            cur.execute(
                f"SELECT i.contact_name, i.contact_email, m.name as master_name, m.email as master_email "
                f"FROM {SCHEMA}.master_inquiries i "
                f"JOIN {SCHEMA}.masters m ON m.id = i.master_id "
                f"WHERE i.id = %s",
                (int(inquiry_id),)
            )
            inq = cur.fetchone()
            cur.close(); conn.close()
            if inq and sender_role == 'customer':
                if inq['master_email']:
                    try:
                        send_chat_email(
                            to_email=inq['master_email'],
                            to_name=inq['master_name'],
                            from_name=sender_name,
                            text=text,
                            cabinet_url='https://handyman.poehali.dev/master?tab=inquiries'
                        )
                    except Exception:
                        pass
                try:
                    conn3 = get_conn()
                    cur3 = conn3.cursor()
                    cur3.execute(f"SELECT phone FROM {SCHEMA}.masters WHERE id=(SELECT master_id FROM {SCHEMA}.master_inquiries WHERE id=%s)", (int(inquiry_id),))
                    mp = cur3.fetchone()
                    cur3.close(); conn3.close()
                    if mp:
                        send_push(mp['phone'], f'Сообщение от {sender_name}', text[:80], '/master?tab=inquiries')
                except Exception:
                    pass
            if inq and sender_role == 'master':
                try:
                    conn3 = get_conn()
                    cur3 = conn3.cursor()
                    cur3.execute(
                        f"SELECT contact_phone FROM {SCHEMA}.master_inquiries WHERE id = %s",
                        (int(inquiry_id),)
                    )
                    cp = cur3.fetchone()
                    cur3.close(); conn3.close()
                    if cp and cp['contact_phone']:
                        send_push(cp['contact_phone'], f'Сообщение от {sender_name}', text[:80], '/cabinet?tab=inquiries')
                except Exception:
                    pass
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({
                'success': True,
                'message': {'id': row['id'], 'inquiry_id': int(inquiry_id), 'sender_role': sender_role, 'sender_name': sender_name, 'text': text, 'created_at': row['created_at'].isoformat()}
            })}

        # ── ПОМЕТИТЬ СООБЩЕНИЯ КАК ПРОЧИТАННЫЕ (заказчик) ──
        if action == 'mark_messages_read':
            inquiry_id = body.get('inquiry_id')
            customer_phone = (body.get('customer_phone') or '').strip()
            if not inquiry_id:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'inquiry_id обязателен'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                f"UPDATE {SCHEMA}.chat_messages SET is_read=TRUE WHERE inquiry_id=%s AND sender_role='master' AND is_read=FALSE",
                (int(inquiry_id),)
            )
            conn.commit()
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True})}

        # ── ПОЛУЧИТЬ СООБЩЕНИЯ ЧАТА ──
        if action == 'get_messages':
            inquiry_id = body.get('inquiry_id')
            if not inquiry_id:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'inquiry_id обязателен'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                f"SELECT id, inquiry_id, sender_role, sender_name, text, created_at FROM {SCHEMA}.chat_messages WHERE inquiry_id=%s ORDER BY created_at ASC",
                (int(inquiry_id),)
            )
            messages = cur.fetchall()
            cur.execute(
                f"SELECT deal_status, master_deal_confirmed, customer_deal_confirmed, contact_name, m.name as master_name, m.email as master_email "
                f"FROM {SCHEMA}.master_inquiries i JOIN {SCHEMA}.masters m ON m.id = i.master_id WHERE i.id=%s",
                (int(inquiry_id),)
            )
            inq = cur.fetchone()
            cur.close(); conn.close()
            deal_status = inq['deal_status'] if inq else 'pending'
            contacts = None
            if inq and deal_status == 'deal':
                contacts = {'master_name': inq['master_name'], 'master_email': inq['master_email']}
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({
                'messages': [{'id': m['id'], 'inquiry_id': m['inquiry_id'], 'sender_role': m['sender_role'], 'sender_name': m['sender_name'], 'text': m['text'], 'created_at': m['created_at'].isoformat()} for m in messages],
                'deal_status': deal_status,
                'master_deal_confirmed': inq['master_deal_confirmed'] if inq else False,
                'customer_deal_confirmed': inq['customer_deal_confirmed'] if inq else False,
                'contacts': contacts,
            })}

        # ── ПОДТВЕРДИТЬ ДОГОВОРЁННОСТЬ (заказчик) ──
        if action == 'confirm_deal':
            inquiry_id = body.get('inquiry_id')
            customer_email = (body.get('customer_email') or '').strip().lower()
            customer_phone = (body.get('customer_phone') or '').strip()
            if not inquiry_id:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'inquiry_id обязателен'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                f"SELECT i.id, i.deal_status, i.master_deal_confirmed, i.customer_deal_confirmed, i.contact_name, i.contact_phone, i.contact_email, "
                f"m.name as master_name, m.email as master_email, m.id as master_id, m.balance "
                f"FROM {SCHEMA}.master_inquiries i JOIN {SCHEMA}.masters m ON m.id = i.master_id "
                f"WHERE i.id=%s",
                (int(inquiry_id),)
            )
            inq = cur.fetchone()
            if not inq:
                cur.close(); conn.close()
                return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Обращение не найдено'})}
            if inq['deal_status'] == 'deal':
                cur.close(); conn.close()
                return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True, 'already_done': True})}
            cur.execute(
                f"UPDATE {SCHEMA}.master_inquiries SET customer_deal_confirmed=TRUE WHERE id=%s",
                (int(inquiry_id),)
            )
            both_confirmed = inq['master_deal_confirmed']
            if both_confirmed:
                if inq['balance'] < 5:
                    conn.rollback(); cur.close(); conn.close()
                    return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'У мастера недостаточно токенов'})}
                cur.execute(
                    f"UPDATE {SCHEMA}.master_inquiries SET deal_status='deal', deal_completed_at=NOW() WHERE id=%s",
                    (int(inquiry_id),)
                )
                cur.execute(
                    f"UPDATE {SCHEMA}.masters SET balance=balance-5 WHERE id=%s",
                    (inq['master_id'],)
                )
                cur.execute(
                    f"INSERT INTO {SCHEMA}.master_transactions (master_id, type, amount, description) VALUES (%s,'spend',5,'Подтверждение договорённости с заказчиком (обращение #{inquiry_id})')",
                    (inq['master_id'],)
                )
                conn.commit(); cur.close(); conn.close()
                if inq['master_email']:
                    try:
                        send_deal_contacts_customer_email(
                            to_email=inq['master_email'],
                            to_name=inq['master_name'],
                            customer_name=inq['contact_name'],
                            customer_phone=inq['contact_phone'] or '',
                            customer_email=inq['contact_email'] or ''
                        )
                    except Exception:
                        pass
                if inq['contact_email']:
                    try:
                        send_deal_contacts_master_email(
                            to_email=inq['contact_email'],
                            to_name=inq['contact_name'],
                            master_name=inq['master_name'],
                            master_email=inq['master_email']
                        )
                    except Exception:
                        pass
                # Push мастеру — договорённость подтверждена обеими сторонами
                try:
                    cur3 = get_conn().cursor()
                    cur3.execute(f"SELECT phone FROM {SCHEMA}.masters WHERE id=%s", (inq['master_id'],))
                    mp = cur3.fetchone()
                    cur3.close()
                    if mp and mp['phone']:
                        send_push(
                            phone=mp['phone'],
                            title='Договорённость подтверждена!',
                            body=f'Вы и заказчик {inq["contact_name"]} подтвердили договорённость',
                            url='/master?tab=inquiries'
                        )
                except Exception:
                    pass
                return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({
                    'success': True, 'deal_done': True,
                    'contacts': {'master_name': inq['master_name'], 'master_email': inq['master_email']}
                })}
            conn.commit(); cur.close(); conn.close()
            if inq['master_email']:
                try:
                    send_deal_waiting_email(
                        to_email=inq['master_email'],
                        to_name=inq['master_name'],
                        customer_name=inq['contact_name'],
                        cabinet_url='https://handyman.poehali.dev/master?tab=inquiries'
                    )
                except Exception:
                    pass
            # Push мастеру — заказчик нажал «Договорились», ждём мастера
            try:
                cur3 = get_conn().cursor()
                cur3.execute(f"SELECT phone FROM {SCHEMA}.masters WHERE id=%s", (inq['master_id'],))
                mp = cur3.fetchone()
                cur3.close()
                if mp and mp['phone']:
                    send_push(
                        phone=mp['phone'],
                        title=f'Заказчик {inq["contact_name"]} нажал «Договорились»',
                        body='Войдите в кабинет и подтвердите договорённость',
                        url='/master?tab=inquiries'
                    )
            except Exception:
                pass
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True, 'deal_done': False, 'waiting_master': True})}

        # ── ОТКЛОНИТЬ ДОГОВОРЁННОСТЬ ──
        if action == 'reject_deal':
            inquiry_id = body.get('inquiry_id')
            if not inquiry_id:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'inquiry_id обязателен'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                f"UPDATE {SCHEMA}.master_inquiries SET deal_status='no_deal', master_deal_confirmed=FALSE, customer_deal_confirmed=FALSE WHERE id=%s",
                (int(inquiry_id),)
            )
            conn.commit(); cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True})}

        # ── УДАЛИТЬ ЧАТ (заказчик) ──
        if action == 'delete_inquiry':
            inquiry_id = body.get('inquiry_id')
            customer_email = (body.get('customer_email') or '').strip().lower()
            customer_phone = (body.get('customer_phone') or '').strip()
            if not inquiry_id or (not customer_email and not customer_phone):
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Не все поля'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                f"SELECT id FROM {SCHEMA}.master_inquiries WHERE id=%s AND (LOWER(COALESCE(contact_email,''))=%s OR COALESCE(contact_phone,'')=%s)",
                (int(inquiry_id), customer_email, customer_phone)
            )
            if not cur.fetchone():
                cur.close(); conn.close()
                return {'statusCode': 403, 'headers': HEADERS, 'body': json.dumps({'error': 'Нет доступа'})}
            cur.execute(f"DELETE FROM {SCHEMA}.chat_messages WHERE inquiry_id=%s", (int(inquiry_id),))
            cur.execute(f"DELETE FROM {SCHEMA}.master_inquiries WHERE id=%s", (int(inquiry_id),))
            conn.commit(); cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True})}

        # ── МОИ ОБРАЩЕНИЯ К МАСТЕРАМ (для заказчика) ──
        if action == 'get_customer_inquiries':
            customer_email = (body.get('customer_email') or '').strip().lower()
            customer_phone = (body.get('customer_phone') or '').strip()
            if not customer_email and not customer_phone:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите email или телефон'})}
            conn = get_conn()
            cur = conn.cursor()
            conditions = []
            args = []
            if customer_email:
                conditions.append("LOWER(COALESCE(i.contact_email,'')) = %s")
                args.append(customer_email)
            if customer_phone:
                cond = "COALESCE(i.contact_phone,'') = %s"
                if conditions:
                    conditions = [f"({conditions[0]} OR {cond})"]
                    args.append(customer_phone)
                else:
                    conditions.append(cond)
                    args.append(customer_phone)
            where = ' AND '.join(conditions)
            cur.execute(
                f"SELECT i.id, i.master_id, i.service_id, i.contact_name, i.contact_phone, i.contact_email, i.message, i.is_read, i.created_at, i.deal_status, i.master_deal_confirmed, i.customer_deal_confirmed, "
                f"m.name as master_name, m.city as master_city, m.category as master_category, m.avatar_color, m.email as master_email, "
                f"ms.title as service_title "
                f"FROM {SCHEMA}.master_inquiries i "
                f"JOIN {SCHEMA}.masters m ON m.id = i.master_id "
                f"LEFT JOIN {SCHEMA}.master_services ms ON ms.id = i.service_id "
                f"WHERE {where} ORDER BY i.created_at DESC",
                args
            )
            inquiries = cur.fetchall()
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({
                'inquiries': [{
                    'id': i['id'],
                    'master_id': i['master_id'],
                    'service_id': i['service_id'],
                    'contact_name': i['contact_name'],
                    'message': i['message'],
                    'is_read': i['is_read'],
                    'deal_status': i['deal_status'],
                    'master_deal_confirmed': i['master_deal_confirmed'],
                    'customer_deal_confirmed': i['customer_deal_confirmed'],
                    'master_contacts': {'email': i['master_email']} if i['deal_status'] == 'deal' else None,
                    'created_at': i['created_at'].isoformat() if i['created_at'] else None,
                    'master_name': i['master_name'],
                    'master_city': i['master_city'],
                    'master_category': i['master_category'],
                    'avatar_color': i['avatar_color'] or '#7c3aed',
                    'service_title': i['service_title'],
                } for i in inquiries]
            }, ensure_ascii=False)}

        # Старый вход по телефону (обратная совместимость)
        phone = (body.get('phone') or '').strip()
        name = (body.get('name') or '').strip()
        email = (body.get('email') or '').strip()
        if not phone:
            return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите телефон'})}
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT * FROM {SCHEMA}.customers WHERE phone = %s", (phone,))
        customer = cur.fetchone()
        if customer:
            updates = []
            vals = []
            if name:
                updates.append("name = %s"); vals.append(name)
            if email:
                updates.append("email = %s"); vals.append(email)
            if updates:
                vals.append(phone)
                cur.execute(f"UPDATE {SCHEMA}.customers SET {', '.join(updates)} WHERE phone = %s", vals)
                conn.commit()
                cur.execute(f"SELECT * FROM {SCHEMA}.customers WHERE phone = %s", (phone,))
                customer = cur.fetchone()
        else:
            if not name:
                cur.close(); conn.close()
                return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Заказчик не найден', 'not_found': True})}
            cur.execute(f"INSERT INTO {SCHEMA}.customers (name, phone, email) VALUES (%s, %s, %s) RETURNING *", (name, phone, email or None))
            customer = cur.fetchone()
            conn.commit()
        cur.execute(f"UPDATE {SCHEMA}.orders SET customer_id = %s WHERE contact_phone = %s AND customer_id IS NULL", (customer['id'], phone))
        conn.commit()
        orders_data = get_orders(cur, customer_id=customer['id'])
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': HEADERS,
                'body': json.dumps({'customer': {'id': customer['id'], 'name': customer['name'], 'phone': customer['phone'], 'email': customer.get('email') or '', 'city': customer.get('city') or ''}, 'orders': orders_data}, ensure_ascii=False)}

    if method == 'GET':
        params = event.get('queryStringParameters') or {}

        # GET: количество непрочитанных сообщений для заказчика
        if params.get('action') == 'unread' and params.get('customer_phone'):
            customer_phone = params['customer_phone'].strip()
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                f"SELECT COUNT(cm.id) as cnt FROM {SCHEMA}.chat_messages cm "
                f"JOIN {SCHEMA}.master_inquiries i ON i.id = cm.inquiry_id "
                f"WHERE COALESCE(i.contact_phone,'') = %s AND cm.sender_role = 'master' AND cm.is_read = FALSE",
                (customer_phone,)
            )
            row = cur.fetchone()
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'unread': int(row['cnt']) if row else 0})}

        # GET messages для polling
        if params.get('inquiry_id'):
            inquiry_id = int(params['inquiry_id'])
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                f"SELECT id, inquiry_id, sender_role, sender_name, text, created_at FROM {SCHEMA}.chat_messages WHERE inquiry_id=%s ORDER BY created_at ASC",
                (inquiry_id,)
            )
            messages = cur.fetchall()
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({
                'messages': [{'id': m['id'], 'inquiry_id': m['inquiry_id'], 'sender_role': m['sender_role'], 'sender_name': m['sender_name'], 'text': m['text'], 'created_at': m['created_at'].isoformat()} for m in messages]
            })}

        phone = (params.get('phone') or '').strip()
        if not phone:
            return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите номер телефона'})}
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT * FROM {SCHEMA}.customers WHERE phone = %s", (phone,))
        customer = cur.fetchone()
        if customer:
            # Привязываем заказы созданные по телефону к аккаунту
            cur.execute(f"UPDATE {SCHEMA}.orders SET customer_id = %s WHERE contact_phone = %s AND customer_id IS NULL", (customer['id'], phone))
            conn.commit()
            orders_data = get_orders(cur, customer_id=customer['id'], phone=phone)
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS,
                    'body': json.dumps({'customer': {'id': customer['id'], 'name': customer['name'], 'phone': customer['phone'], 'email': customer.get('email') or '', 'city': customer.get('city') or ''}, 'orders': orders_data}, ensure_ascii=False)}
        orders_data = get_orders(cur, phone=phone)
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'orders': orders_data}, ensure_ascii=False)}

    return {'statusCode': 405, 'headers': HEADERS, 'body': json.dumps({'error': 'Method not allowed'})}