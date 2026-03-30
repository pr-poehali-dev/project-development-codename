import json
import os
import re
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


def send_chat_notification_email(to_email: str, to_name: str, from_name: str, text: str, cabinet_url: str):
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
      <p style="color:#9ca3af;font-size:14px;margin-bottom:20px;">Привет, {to_name}! Мастер {from_name} написал вам:</p>
      <div style="background:#1e1b4b;border:1px solid #4c1d95;border-radius:12px;padding:20px;margin-bottom:20px;">
        <p style="color:#e5e7eb;font-size:14px;margin:0;">«{text}»</p>
      </div>
      <a href="{cabinet_url}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;">Открыть кабинет</a>
      <p style="color:#6b7280;font-size:12px;margin-top:20px;">Войдите в кабинет HandyMan, чтобы ответить мастеру.</p>
    </div>
    """
    msg.attach(MIMEText(f'Сообщение от мастера {from_name}:\n\n{text}\n\nОткрыть кабинет: {cabinet_url}', 'plain'))
    msg.attach(MIMEText(html, 'html'))
    ctx = ssl.create_default_context()
    with smtplib.SMTP_SSL(host, port, context=ctx) as server:
        server.login(user, pw)
        server.sendmail(user, to_email, msg.as_string())


CONTACT_BLOCK_RE = r'(\+?[78][\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}|[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,})'


def has_contacts(text: str) -> bool:
    return bool(re.search(CONTACT_BLOCK_RE, text))


def send_deal_waiting_customer_email(to_email: str, to_name: str, master_name: str, cabinet_url: str):
    host = os.environ['SMTP_HOST']
    port = int(os.environ['SMTP_PORT'])
    user = os.environ['SMTP_USER']
    pw = os.environ['SMTP_PASS']
    msg = MIMEMultipart('alternative')
    msg['Subject'] = f'Мастер {master_name} нажал «Договорились» — HandyMan'
    msg['From'] = f'HandyMan <{user}>'
    msg['To'] = to_email
    html = f"""<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0d16;border-radius:16px;">
      <h2 style="color:#fff;">HandyMan</h2>
      <p style="color:#9ca3af;font-size:14px;">Привет, {to_name}!</p>
      <div style="background:#1e1b4b;border:1px solid #4c1d95;border-radius:12px;padding:20px;margin:16px 0;">
        <p style="color:#a78bfa;font-weight:600;margin:0 0 8px;">Мастер {master_name} подтвердил договорённость.</p>
        <p style="color:#d1d5db;font-size:14px;margin:0;">Войдите в кабинет и нажмите «Договорились» в чате, чтобы обменяться контактами.</p>
      </div>
      <a href="{cabinet_url}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;">Открыть кабинет</a>
    </div>"""
    msg.attach(MIMEText(f'Мастер {master_name} подтвердил договорённость. Войдите в кабинет: {cabinet_url}', 'plain'))
    msg.attach(MIMEText(html, 'html'))
    ctx = ssl.create_default_context()
    with smtplib.SMTP_SSL(host, port, context=ctx) as server:
        server.login(user, pw)
        server.sendmail(user, to_email, msg.as_string())


def send_deal_contacts_email(to_email: str, to_name: str, master_name: str, master_email: str):
    host = os.environ['SMTP_HOST']
    port = int(os.environ['SMTP_PORT'])
    user = os.environ['SMTP_USER']
    pw = os.environ['SMTP_PASS']
    msg = MIMEMultipart('alternative')
    msg['Subject'] = f'Договорённость подтверждена — HandyMan'
    msg['From'] = f'HandyMan <{user}>'
    msg['To'] = to_email
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0d16;border-radius:16px;">
      <h2 style="color:#fff;margin-bottom:4px;">HandyMan</h2>
      <p style="color:#9ca3af;font-size:14px;margin-bottom:20px;">Привет, {to_name}! Вы и мастер {master_name} подтвердили договорённость.</p>
      <div style="background:#1e1b4b;border:1px solid #4c1d95;border-radius:12px;padding:20px;margin-bottom:20px;">
        <p style="color:#a78bfa;font-weight:600;font-size:15px;margin:0 0 8px 0;">Контакт мастера:</p>
        <p style="color:#e5e7eb;font-size:14px;margin:0;">Email: <a href="mailto:{master_email}" style="color:#a78bfa;">{master_email}</a></p>
      </div>
      <p style="color:#6b7280;font-size:12px;">Вы можете связаться с мастером напрямую.</p>
    </div>
    """
    msg.attach(MIMEText(f'Договорённость подтверждена!\n\nМастер {master_name}\nEmail: {master_email}', 'plain'))
    msg.attach(MIMEText(html, 'html'))
    ctx = ssl.create_default_context()
    with smtplib.SMTP_SSL(host, port, context=ctx) as server:
        server.login(user, pw)
        server.sendmail(user, to_email, msg.as_string())


def send_deal_master_email(to_email: str, to_name: str, customer_name: str, customer_phone: str, customer_email: str):
    host = os.environ['SMTP_HOST']
    port = int(os.environ['SMTP_PORT'])
    user = os.environ['SMTP_USER']
    pw = os.environ['SMTP_PASS']
    msg = MIMEMultipart('alternative')
    msg['Subject'] = f'Договорённость подтверждена — HandyMan'
    msg['From'] = f'HandyMan <{user}>'
    msg['To'] = to_email
    contact_lines = ""
    if customer_phone:
        contact_lines += f'<p style="margin:4px 0;color:#d1d5db;">📞 {customer_phone}</p>'
    if customer_email:
        contact_lines += f'<p style="margin:4px 0;color:#d1d5db;">✉️ {customer_email}</p>'
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0d16;border-radius:16px;">
      <h2 style="color:#fff;margin-bottom:4px;">HandyMan</h2>
      <p style="color:#9ca3af;font-size:14px;margin-bottom:20px;">Привет, {to_name}! Вы и заказчик подтвердили договорённость.</p>
      <div style="background:#1e1b4b;border:1px solid #4c1d95;border-radius:12px;padding:20px;margin-bottom:20px;">
        <p style="color:#a78bfa;font-weight:600;font-size:15px;margin:0 0 8px 0;">Контакты заказчика {customer_name}:</p>
        {contact_lines}
      </div>
      <p style="color:#6b7280;font-size:12px;">С баланса списано 5 токенов.</p>
    </div>
    """
    msg.attach(MIMEText(f'Договорённость подтверждена!\n\nЗаказчик {customer_name}\nТелефон: {customer_phone}\nEmail: {customer_email}', 'plain'))
    msg.attach(MIMEText(html, 'html'))
    ctx = ssl.create_default_context()
    with smtplib.SMTP_SSL(host, port, context=ctx) as server:
        server.login(user, pw)
        server.sendmail(user, to_email, msg.as_string())


def send_inquiry_email(to_email: str, master_name: str, from_name: str, from_phone: str, from_email: str, message: str):
    host = os.environ['SMTP_HOST']
    port = int(os.environ['SMTP_PORT'])
    user = os.environ['SMTP_USER']
    pw = os.environ['SMTP_PASS']
    msg = MIMEMultipart('alternative')
    msg['Subject'] = f'Новое обращение от {from_name} — HandyMan'
    msg['From'] = f'HandyMan <{user}>'
    msg['To'] = to_email
    contact_lines = ""
    if from_phone:
        contact_lines += f'<p style="margin:4px 0;color:#d1d5db;font-size:14px;">📞 Телефон: <a href="tel:{from_phone}" style="color:#a78bfa;">{from_phone}</a></p>'
    if from_email:
        contact_lines += f'<p style="margin:4px 0;color:#d1d5db;font-size:14px;">✉️ Email: <a href="mailto:{from_email}" style="color:#a78bfa;">{from_email}</a></p>'
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0d16;border-radius:16px;">
      <h2 style="color:#fff;margin-bottom:4px;">HandyMan</h2>
      <p style="color:#9ca3af;font-size:14px;margin-bottom:20px;">Привет, {master_name}! Вам написал новый клиент.</p>
      <div style="background:#1e1b4b;border:1px solid #4c1d95;border-radius:12px;padding:20px;margin-bottom:20px;">
        <p style="color:#a78bfa;font-weight:600;font-size:16px;margin:0 0 12px 0;">{from_name}</p>
        {contact_lines}
        <p style="color:#e5e7eb;font-size:14px;margin:12px 0 0 0;border-top:1px solid #3730a3;padding-top:12px;">«{message}»</p>
      </div>
      <p style="color:#6b7280;font-size:12px;">Войдите в кабинет мастера на HandyMan, чтобы ответить клиенту.</p>
    </div>
    """
    msg.attach(MIMEText(f'Новое обращение от {from_name}\nТелефон: {from_phone}\nEmail: {from_email}\n\n{message}', 'plain'))
    msg.attach(MIMEText(html, 'html'))
    ctx = ssl.create_default_context()
    with smtplib.SMTP_SSL(host, port, context=ctx) as server:
        server.login(user, pw)
        server.sendmail(user, to_email, msg.as_string())


def master_to_dict(m):
    cats = m['categories'] if m['categories'] else []
    if not cats and m['category']:
        cats = [m['category']]
    return {
        'id': m['id'],
        'name': m['name'],
        'phone': m['phone'],
        'category': m['category'],
        'categories': list(cats),
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

        # ── ПРЯМОЕ ОБРАЩЕНИЕ К МАСТЕРУ ──
        if body_raw.get('action') == 'contact_master':
            master_id = body_raw.get('master_id')
            service_id = body_raw.get('service_id')
            contact_name = (body_raw.get('contact_name') or '').strip()
            contact_phone = (body_raw.get('contact_phone') or '').strip()
            contact_email = (body_raw.get('contact_email') or '').strip().lower()
            message = (body_raw.get('message') or '').strip()
            if not master_id:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Не указан мастер'})}
            if not contact_name:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите ваше имя'})}
            if not message:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Напишите сообщение'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"SELECT name, email FROM {SCHEMA}.masters WHERE id=%s", (int(master_id),))
            master_row = cur.fetchone()
            if not master_row:
                cur.close(); conn.close()
                return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Мастер не найден'})}
            cur.execute(
                f"INSERT INTO {SCHEMA}.master_inquiries (master_id, service_id, contact_name, contact_phone, contact_email, message, expires_at) VALUES (%s, %s, %s, %s, %s, %s, NOW() + INTERVAL '3 days') RETURNING id",
                (int(master_id), int(service_id) if service_id else None, contact_name, contact_phone or None, contact_email or None, message)
            )
            inquiry_id = cur.fetchone()['id']
            conn.commit()
            cur.close(); conn.close()
            if master_row['email']:
                try:
                    send_inquiry_email(master_row['email'], master_row['name'], contact_name, '', '', message)
                except Exception:
                    pass
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True, 'id': inquiry_id})}

        # ── ПОДТВЕРДИТЬ ДОГОВОРЁННОСТЬ (мастер) ──
        if body_raw.get('action') == 'confirm_deal':
            inquiry_id = body_raw.get('inquiry_id')
            master_id = body_raw.get('master_id')
            if not inquiry_id or not master_id:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Не все поля'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                f"SELECT i.id, i.deal_status, i.master_deal_confirmed, i.customer_deal_confirmed, i.contact_name, i.contact_phone, i.contact_email, m.balance, m.name as master_name, m.email as master_email "
                f"FROM {SCHEMA}.master_inquiries i JOIN {SCHEMA}.masters m ON m.id = i.master_id "
                f"WHERE i.id=%s AND i.master_id=%s",
                (int(inquiry_id), int(master_id))
            )
            inq = cur.fetchone()
            if not inq:
                cur.close(); conn.close()
                return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Обращение не найдено'})}
            if inq['deal_status'] == 'deal':
                cur.close(); conn.close()
                return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True, 'already_done': True})}
            cur.execute(
                f"UPDATE {SCHEMA}.master_inquiries SET master_deal_confirmed=TRUE WHERE id=%s",
                (int(inquiry_id),)
            )
            both_confirmed = inq['customer_deal_confirmed']
            if both_confirmed:
                if inq['balance'] < 5:
                    conn.rollback(); cur.close(); conn.close()
                    return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Недостаточно токенов (нужно 5)'})}
                cur.execute(
                    f"UPDATE {SCHEMA}.master_inquiries SET deal_status='deal', deal_completed_at=NOW() WHERE id=%s",
                    (int(inquiry_id),)
                )
                cur.execute(
                    f"UPDATE {SCHEMA}.masters SET balance=balance-5 WHERE id=%s",
                    (int(master_id),)
                )
                cur.execute(
                    f"INSERT INTO {SCHEMA}.master_transactions (master_id, type, amount, description) VALUES (%s,'spend',5,'Подтверждение договорённости с заказчиком (обращение #{inquiry_id})')",
                    (int(master_id),)
                )
                conn.commit(); cur.close(); conn.close()
                if inq['contact_email']:
                    try:
                        send_deal_contacts_email(
                            to_email=inq['contact_email'], to_name=inq['contact_name'],
                            master_name=inq['master_name'], master_email=inq['master_email']
                        )
                    except Exception:
                        pass
                return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({
                    'success': True, 'deal_done': True,
                    'contacts': {'phone': inq['contact_phone'], 'email': inq['contact_email'], 'name': inq['contact_name']}
                })}
            conn.commit(); cur.close(); conn.close()
            if inq['contact_email']:
                try:
                    send_deal_waiting_customer_email(
                        to_email=inq['contact_email'],
                        to_name=inq['contact_name'],
                        master_name=inq['master_name'],
                        cabinet_url='https://handyman.poehali.dev/cabinet'
                    )
                except Exception:
                    pass
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True, 'deal_done': False, 'waiting_customer': True})}

        # ── ОТКЛОНИТЬ ДОГОВОРЁННОСТЬ (мастер или заказчик) ──
        if body_raw.get('action') == 'reject_deal':
            inquiry_id = body_raw.get('inquiry_id')
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

        # ── УДАЛИТЬ ЧАТ (мастер) ──
        if body_raw.get('action') == 'delete_inquiry':
            inquiry_id = body_raw.get('inquiry_id')
            master_id = body_raw.get('master_id')
            if not inquiry_id or not master_id:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Не все поля'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                f"SELECT id FROM {SCHEMA}.master_inquiries WHERE id=%s AND master_id=%s",
                (int(inquiry_id), int(master_id))
            )
            if not cur.fetchone():
                cur.close(); conn.close()
                return {'statusCode': 403, 'headers': HEADERS, 'body': json.dumps({'error': 'Нет доступа'})}
            cur.execute(f"DELETE FROM {SCHEMA}.chat_messages WHERE inquiry_id=%s", (int(inquiry_id),))
            cur.execute(f"DELETE FROM {SCHEMA}.master_inquiries WHERE id=%s AND master_id=%s", (int(inquiry_id), int(master_id)))
            conn.commit(); cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True})}

        # ── ОТПРАВИТЬ СООБЩЕНИЕ В ЧАТ (мастер) ──
        if body_raw.get('action') == 'send_message':
            inquiry_id = body_raw.get('inquiry_id')
            sender_name = (body_raw.get('sender_name') or '').strip()
            text = (body_raw.get('text') or '').strip()
            if not all([inquiry_id, sender_name, text]):
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Не все поля заполнены'})}
            if has_contacts(text):
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Нельзя отправлять телефон или email в чате. Используйте кнопку «Договорились» для обмена контактами.'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                f"INSERT INTO {SCHEMA}.chat_messages (inquiry_id, sender_role, sender_name, text) VALUES (%s, 'master', %s, %s) RETURNING id, created_at",
                (int(inquiry_id), sender_name, text)
            )
            row = cur.fetchone()
            conn.commit()
            cur.execute(
                f"SELECT contact_name, contact_email FROM {SCHEMA}.master_inquiries WHERE id = %s",
                (int(inquiry_id),)
            )
            inq = cur.fetchone()
            cur.close(); conn.close()
            if inq:
                if inq['contact_email']:
                    try:
                        send_chat_notification_email(
                            to_email=inq['contact_email'],
                            to_name=inq['contact_name'],
                            from_name=sender_name,
                            text=text,
                            cabinet_url='https://handyman.poehali.dev/cabinet'
                        )
                    except Exception:
                        pass
                # Push заказчику
                if inq['contact_phone']:
                    try:
                        import urllib.request as _urllib
                        _push_data = json.dumps({'action': 'send', 'phone': inq['contact_phone'], 'title': f'Новое сообщение от {sender_name}', 'body': text[:80], 'url': '/cabinet?tab=chats'}).encode()
                        _req = _urllib.Request('https://functions.poehali.dev/272080b1-1a80-40bd-8201-0951cb380c57', data=_push_data, headers={'Content-Type': 'application/json'}, method='POST')
                        _urllib.urlopen(_req, timeout=3)
                    except Exception:
                        pass
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({
                'success': True,
                'message': {'id': row['id'], 'inquiry_id': int(inquiry_id), 'sender_role': 'master', 'sender_name': sender_name, 'text': text, 'created_at': row['created_at'].isoformat()}
            })}

        # ── ПОМЕТИТЬ СООБЩЕНИЯ КАК ПРОЧИТАННЫЕ (мастер) ──
        if body_raw.get('action') == 'mark_messages_read':
            inquiry_id = body_raw.get('inquiry_id')
            if not inquiry_id:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'inquiry_id обязателен'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                f"UPDATE {SCHEMA}.chat_messages SET is_read=TRUE WHERE inquiry_id=%s AND sender_role='customer' AND is_read=FALSE",
                (int(inquiry_id),)
            )
            conn.commit()
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True})}

        # ── ПОМЕТИТЬ ОБРАЩЕНИЯ КАК ПРОЧИТАННЫЕ ──
        if body_raw.get('action') == 'read_inquiries':
            master_id = body_raw.get('master_id')
            if not master_id:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Не авторизован'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"UPDATE {SCHEMA}.master_inquiries SET is_read=TRUE WHERE master_id=%s AND is_read=FALSE", (int(master_id),))
            conn.commit()
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True})}

        # ── ОБНОВЛЕНИЕ ПРОФИЛЯ ──
        if body_raw.get('action') == 'update_profile':
            master_id = body_raw.get('master_id')
            about = body_raw.get('about', '')
            name = (body_raw.get('name') or '').strip()
            city = (body_raw.get('city') or '').strip()
            categories_raw = body_raw.get('categories')
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
            if isinstance(categories_raw, list) and categories_raw:
                cats = [c.strip() for c in categories_raw if c and c.strip()]
                if cats:
                    fields.append("categories=%s::TEXT[]"); vals.append(cats)
                    fields.append("category=%s"); vals.append(cats[0])
            if fields:
                vals.append(int(master_id))
                cur.execute(f"UPDATE {SCHEMA}.masters SET {', '.join(fields)} WHERE id=%s RETURNING id, name, phone, city, about, category, categories, balance, avatar_color, responses_count, created_at", vals)
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

    # GET — список мастеров для страницы /masters
    if method == 'GET' and params.get('action') == 'masters':
        city = params.get('city', '').strip()
        category = params.get('category', '').strip()
        search = params.get('search', '').strip()

        conn = get_conn()
        cur = conn.cursor()

        conditions = ['TRUE']
        args = []
        if city:
            conditions.append('m.city ILIKE %s')
            args.append(city)
        if category:
            conditions.append('(%s = ANY(m.categories) OR m.category ILIKE %s)')
            args.extend([category, category])
        if search:
            conditions.append("(m.name ILIKE %s OR m.category ILIKE %s OR m.about ILIKE %s)")
            args.extend([f'%{search}%', f'%{search}%', f'%{search}%'])

        where = ' AND '.join(conditions)
        cur.execute(
            f"SELECT m.id, m.name, m.category, m.categories, m.city, m.about, m.avatar_color, m.created_at, "
            f"ROUND(AVG(r.rating)::numeric, 1) as rating, COUNT(r.id) as reviews_count, "
            f"COUNT(DISTINCT ms.id) as services_count "
            f"FROM masters m "
            f"LEFT JOIN reviews r ON r.master_id = m.id "
            f"LEFT JOIN master_services ms ON ms.master_id = m.id AND ms.is_active = TRUE AND (ms.paid_until IS NULL OR ms.paid_until > NOW()) "
            f"WHERE {where} "
            f"GROUP BY m.id, m.name, m.category, m.categories, m.city, m.about, m.avatar_color, m.created_at "
            f"ORDER BY rating DESC NULLS LAST, reviews_count DESC, m.created_at DESC LIMIT 100",
            args
        )
        masters = cur.fetchall()
        cur.execute("SELECT DISTINCT city FROM masters WHERE city IS NOT NULL AND city != '' ORDER BY city")
        cities = [row['city'] for row in cur.fetchall()]
        cur.execute("SELECT DISTINCT category FROM masters WHERE category IS NOT NULL AND category != '' ORDER BY category")
        cats = [row['category'] for row in cur.fetchall()]
        cur.close(); conn.close()

        return {
            'statusCode': 200,
            'headers': HEADERS,
            'body': json.dumps({
                'masters': [{
                    'id': m['id'],
                    'name': m['name'],
                    'category': m['category'],
                    'categories': list(m['categories']) if m['categories'] else [],
                    'city': m['city'] or '',
                    'about': m['about'] or '',
                    'avatar_color': m['avatar_color'] or '#7c3aed',
                    'rating': float(m['rating']) if m['rating'] else None,
                    'reviews_count': int(m['reviews_count']),
                    'services_count': int(m['services_count']),
                    'created_at': m['created_at'].isoformat() if m['created_at'] else None,
                } for m in masters],
                'cities': cities,
                'categories': cats,
            }, ensure_ascii=False)
        }

    # GET — список услуг мастеров для главной страницы
    if method == 'GET' and params.get('action') == 'services':
        city = params.get('city', '').strip()
        # Поддержка нескольких категорий через categories=A,B,C или одиночной category=A
        categories_raw = params.get('categories', '').strip()
        category_single = params.get('category', '').strip()
        selected_categories = [c.strip() for c in categories_raw.split(',') if c.strip()] if categories_raw else ([category_single] if category_single else [])

        conn = get_conn()
        cur = conn.cursor()

        conditions = ['ms.is_active = TRUE', '(ms.paid_until IS NULL OR ms.paid_until > NOW())']
        args = []
        if selected_categories:
            placeholders = ','.join(['%s'] * len(selected_categories))
            conditions.append(f'ms.category IN ({placeholders})')
            args.extend(selected_categories)
        if city:
            conditions.append('ms.city ILIKE %s')
            args.append(city)

        where = ' AND '.join(conditions)
        cur.execute(
            f"SELECT ms.id, ms.title, ms.description, ms.category, ms.city, ms.price, ms.created_at, "
            f"ms.sort_order, ms.boosted_until, "
            f"m.id as master_id, m.name as master_name, m.avatar_color, "
            f"ROUND(AVG(r.rating)::numeric, 1) as rating, COUNT(r.id) as reviews_count "
            f"FROM {SCHEMA}.master_services ms "
            f"JOIN {SCHEMA}.masters m ON m.id = ms.master_id "
            f"LEFT JOIN {SCHEMA}.reviews r ON r.master_id = m.id "
            f"WHERE {where} "
            f"GROUP BY ms.id, ms.title, ms.description, ms.category, ms.city, ms.price, ms.created_at, "
            f"ms.sort_order, ms.boosted_until, m.id, m.name, m.avatar_color "
            f"ORDER BY (COALESCE(ms.boosted_until, '2000-01-01') > NOW()) DESC, ms.sort_order DESC, ms.created_at DESC LIMIT 50",
            args
        )
        services = cur.fetchall()
        cur.execute(f"SELECT DISTINCT city FROM {SCHEMA}.master_services WHERE is_active = TRUE AND (paid_until IS NULL OR paid_until > NOW()) ORDER BY city")
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
                    'boosted_until': s['boosted_until'].isoformat() if s['boosted_until'] else None,
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

        # PUT: поднятие услуги в топ (5 токенов / 7 дней)
        if body.get('action') == 'boost_service':
            service_id = body.get('service_id')
            master_id = body.get('master_id')
            if not service_id or not master_id:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Неверные данные'})}
            conn = get_conn()
            cur = conn.cursor()
            # Проверяем баланс
            cur.execute(f"SELECT balance FROM {SCHEMA}.masters WHERE id = %s", (int(master_id),))
            m = cur.fetchone()
            if not m or m['balance'] < 5:
                cur.close(); conn.close()
                return {'statusCode': 402, 'headers': HEADERS, 'body': json.dumps({'error': 'Недостаточно токенов. Нужно 5 токенов.', 'no_balance': True})}
            import time as _time
            new_sort = int(_time.time() * 1000)
            cur.execute(
                f"UPDATE {SCHEMA}.master_services SET sort_order = %s, boost_count = boost_count + 1, boosted_until = NOW() + INTERVAL '7 days' WHERE id = %s AND master_id = %s",
                (new_sort, int(service_id), int(master_id))
            )
            cur.execute(f"UPDATE {SCHEMA}.masters SET balance = balance - 5 WHERE id = %s", (int(master_id),))
            cur.execute(
                f"INSERT INTO {SCHEMA}.master_transactions (master_id, type, amount, description) VALUES (%s, 'spend', 5, %s)",
                (int(master_id), f"Поднятие услуги #{service_id} в топ на 7 дней")
            )
            conn.commit()
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True})}

        # PUT: продление услуги на 30 дней
        if body.get('action') == 'renew_service':
            service_id = body.get('service_id')
            master_id = body.get('master_id')
            if not service_id or not master_id:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Неверные данные'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"SELECT balance FROM {SCHEMA}.masters WHERE id = %s", (int(master_id),))
            m = cur.fetchone()
            cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.master_services WHERE master_id = %s", (int(master_id),))
            cnt = cur.fetchone()['cnt']
            cost = 10 if cnt <= 1 else (8 if cnt == 2 else 6)
            if not m or m['balance'] < cost:
                cur.close(); conn.close()
                return {'statusCode': 402, 'headers': HEADERS, 'body': json.dumps({'error': f'Недостаточно токенов. Нужно {cost} токенов.', 'no_balance': True, 'cost': cost})}
            cur.execute(
                f"UPDATE {SCHEMA}.master_services SET paid_until = GREATEST(COALESCE(paid_until, NOW()), NOW()) + INTERVAL '30 days', is_active = TRUE WHERE id = %s AND master_id = %s",
                (int(service_id), int(master_id))
            )
            cur.execute(f"UPDATE {SCHEMA}.masters SET balance = balance - %s WHERE id = %s", (cost, int(master_id)))
            cur.execute(
                f"INSERT INTO {SCHEMA}.master_transactions (master_id, type, amount, description) VALUES (%s, 'spend', %s, %s)",
                (int(master_id), cost, f"Продление услуги #{service_id} на 30 дней")
            )
            conn.commit()
            cur.execute(f"SELECT paid_until FROM {SCHEMA}.master_services WHERE id = %s", (int(service_id),))
            row = cur.fetchone()
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({
                'success': True,
                'cost': cost,
                'paid_until': row['paid_until'].isoformat() if row and row['paid_until'] else None
            })}

        # PUT: публикация новой услуги мастером (10/8/6 токенов / 30 дней)
        if body.get('action') == 'add_service':
            master_id = body.get('master_id')
            title = (body.get('title') or '').strip()
            description = (body.get('description') or '').strip()
            category = (body.get('category') or '').strip()
            subcategories = body.get('subcategories') or []
            city = (body.get('city') or '').strip()
            price = body.get('price')
            if not all([master_id, title, category, city]):
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Заполните все обязательные поля'})}
            conn = get_conn()
            cur = conn.cursor()
            # Считаем текущее количество активных услуг мастера
            cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.master_services WHERE master_id = %s AND is_active = TRUE", (int(master_id),))
            active_count = cur.fetchone()['cnt']
            # Определяем стоимость публикации (1-я: 10, 2-я: 8, 3-я и далее: 6)
            if active_count == 0:
                token_cost = 10
            elif active_count == 1:
                token_cost = 8
            else:
                token_cost = 6
            # Проверяем баланс
            cur.execute(f"SELECT balance FROM {SCHEMA}.masters WHERE id = %s", (int(master_id),))
            m = cur.fetchone()
            if not m or m['balance'] < token_cost:
                cur.close(); conn.close()
                return {'statusCode': 402, 'headers': HEADERS, 'body': json.dumps({'error': f'Недостаточно токенов. Нужно {token_cost}.', 'no_balance': True, 'required': token_cost})}
            import time as _time
            sort_order = int(_time.time() * 1000)
            subs_array = '{' + ','.join(f'"{s}"' for s in subcategories) + '}' if subcategories else '{}'
            cur.execute(
                f"INSERT INTO {SCHEMA}.master_services (master_id, title, description, category, subcategories, city, price, sort_order, paid_until) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW() + INTERVAL '30 days') RETURNING id",
                (int(master_id), title, description, category, subs_array, city, int(price) if price else None, sort_order)
            )
            new_id = cur.fetchone()['id']
            cur.execute(f"UPDATE {SCHEMA}.masters SET balance = balance - %s WHERE id = %s", (token_cost, int(master_id)))
            cur.execute(
                f"INSERT INTO {SCHEMA}.master_transactions (master_id, type, amount, description) VALUES (%s, 'spend', %s, %s)",
                (int(master_id), token_cost, f"Публикация услуги на 30 дней")
            )
            conn.commit()
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True, 'id': new_id, 'token_cost': token_cost})}

        # PUT: удаление услуги мастером
        if body.get('action') == 'delete_service':
            service_id = body.get('service_id')
            master_id = body.get('master_id')
            if not service_id or not master_id:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Недостаточно данных'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"DELETE FROM {SCHEMA}.master_services WHERE id=%s AND master_id=%s", (int(service_id), int(master_id)))
            conn.commit()
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True})}

        # PUT: обновление профиля мастера (имя, город, о себе, категории)
        if body.get('action') == 'update_profile':
            master_id = body.get('master_id')
            name = (body.get('name') or '').strip()
            city = (body.get('city') or '').strip()
            about = (body.get('about') or '').strip()
            categories_raw = body.get('categories')
            if isinstance(categories_raw, list):
                cats = [c.strip() for c in categories_raw if c and c.strip()]
            else:
                cats = []
            primary_cat = cats[0] if cats else None
            conn = get_conn()
            cur = conn.cursor()
            if cats:
                cur.execute(
                    f"UPDATE {SCHEMA}.masters SET name=COALESCE(NULLIF(%s,''),name), city=COALESCE(NULLIF(%s,''),city), about=COALESCE(NULLIF(%s,''),about), category=%s, categories=%s::TEXT[] WHERE id=%s RETURNING *",
                    (name, city, about, primary_cat, cats, int(master_id))
                )
            else:
                cur.execute(
                    f"UPDATE {SCHEMA}.masters SET name=COALESCE(NULLIF(%s,''),name), city=COALESCE(NULLIF(%s,''),city), about=COALESCE(NULLIF(%s,''),about) WHERE id=%s RETURNING *",
                    (name, city, about, int(master_id))
                )
            master = cur.fetchone()
            conn.commit()
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True, 'master': master_to_dict(master)}, ensure_ascii=False)}

        # PUT: редактирование услуги мастером
        if body.get('action') == 'update_service':
            service_id = body.get('service_id')
            master_id = body.get('master_id')
            title = (body.get('title') or '').strip()
            description = (body.get('description') or '').strip()
            category = (body.get('category') or '').strip()
            city = (body.get('city') or '').strip()
            price = body.get('price')
            if not all([service_id, master_id, title, category, city]):
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Заполните все обязательные поля'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                f"UPDATE {SCHEMA}.master_services SET title=%s, description=%s, category=%s, city=%s, price=%s WHERE id=%s AND master_id=%s",
                (title, description, category, city, int(price) if price else None, int(service_id), int(master_id))
            )
            conn.commit()
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True})}

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
                f"UPDATE {SCHEMA}.orders SET status = %s, closed_at = CASE WHEN %s IN ('done','cancelled') THEN now() ELSE NULL END WHERE id = %s AND customer_id = %s",
                (status, status, int(order_id), int(customer_id))
            )
        else:
            cur.execute(
                f"UPDATE {SCHEMA}.orders SET status = %s WHERE id = %s",
                (status, int(order_id))
            )
        conn.commit()
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True})}

    # GET: быстрая проверка непрочитанных обращений для polling
    if method == 'GET' and params.get('action') == 'unread' and params.get('master_id'):
        master_id = int(params['master_id'])
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT COUNT(cm.id) as cnt FROM {SCHEMA}.chat_messages cm "
            f"JOIN {SCHEMA}.master_inquiries i ON i.id = cm.inquiry_id "
            f"WHERE i.master_id=%s AND cm.sender_role='customer' AND cm.is_read=FALSE",
            (master_id,)
        )
        row = cur.fetchone()
        cur.execute(
            f"SELECT id, service_id, contact_name, contact_phone, contact_email, message, is_read, created_at, deal_status, master_deal_confirmed, customer_deal_confirmed "
            f"FROM {SCHEMA}.master_inquiries WHERE master_id=%s ORDER BY created_at DESC LIMIT 50",
            (master_id,)
        )
        inquiries = cur.fetchall()
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({
            'unread': int(row['cnt']),
            'unread_inquiries': int(row['cnt']),
            'inquiries': [{
                'id': i['id'], 'service_id': i['service_id'],
                'contact_name': i['contact_name'],
                'contact_phone': i['contact_phone'] if i['deal_status'] == 'deal' else None,
                'contact_email': i['contact_email'] if i['deal_status'] == 'deal' else None,
                'message': i['message'],
                'is_read': i['is_read'],
                'deal_status': i['deal_status'],
                'master_deal_confirmed': i['master_deal_confirmed'],
                'customer_deal_confirmed': i['customer_deal_confirmed'],
                'created_at': i['created_at'].isoformat() if i['created_at'] else None,
            } for i in inquiries]
        })}

    # GET messages для polling (мастер)
    if method == 'GET' and params.get('inquiry_id'):
        inquiry_id = int(params['inquiry_id'])
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, inquiry_id, sender_role, sender_name, text, created_at FROM {SCHEMA}.chat_messages WHERE inquiry_id=%s ORDER BY created_at ASC",
            (inquiry_id,)
        )
        messages = cur.fetchall()
        cur.execute(
            f"SELECT deal_status, master_deal_confirmed, customer_deal_confirmed, contact_name, contact_phone, contact_email FROM {SCHEMA}.master_inquiries WHERE id=%s",
            (inquiry_id,)
        )
        inq = cur.fetchone()
        cur.close(); conn.close()
        deal_status = inq['deal_status'] if inq else 'pending'
        contacts = None
        if inq and deal_status == 'deal':
            contacts = {'name': inq['contact_name'], 'phone': inq['contact_phone'], 'email': inq['contact_email']}
        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({
            'messages': [{'id': m['id'], 'inquiry_id': m['inquiry_id'], 'sender_role': m['sender_role'], 'sender_name': m['sender_name'], 'text': m['text'], 'created_at': m['created_at'].isoformat()} for m in messages],
            'deal_status': deal_status,
            'master_deal_confirmed': inq['master_deal_confirmed'] if inq else False,
            'customer_deal_confirmed': inq['customer_deal_confirmed'] if inq else False,
            'contacts': contacts,
        })}

    # GET публичного профиля мастера по id
    if method == 'GET' and params.get('master_id'):
        master_id = int(params['master_id'])
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT * FROM {SCHEMA}.masters WHERE id = %s", (master_id,))
        master = cur.fetchone()
        if not master:
            cur.close(); conn.close()
            return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Мастер не найден'})}

        cur.execute(
            f"SELECT r.id, r.rating, r.comment, r.created_at, o.title as order_title "
            f"FROM {SCHEMA}.reviews r JOIN {SCHEMA}.orders o ON o.id = r.order_id "
            f"WHERE r.master_id = %s ORDER BY r.created_at DESC LIMIT 20",
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
            f"SELECT id, title, description, price, category, subcategories, city FROM {SCHEMA}.master_services "
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
                    'subcategories': list(s['subcategories']) if s['subcategories'] else [],
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
        cur.execute(f"SELECT * FROM {SCHEMA}.masters WHERE phone = %s", (phone,))
        master = cur.fetchone()
        if not master:
            cur.close(); conn.close()
            return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Мастер не найден', 'not_found': True})}

        cur.execute(
            f"SELECT * FROM {SCHEMA}.master_transactions WHERE master_id = %s ORDER BY created_at DESC LIMIT 20",
            (master['id'],)
        )
        transactions = cur.fetchall()
        cur.execute(f"SELECT ROUND(AVG(rating)::numeric,1) as avg, COUNT(*) as cnt FROM {SCHEMA}.reviews WHERE master_id = %s", (master['id'],))
        stats = cur.fetchone()
        cur.execute(
            f"SELECT r.id, r.order_id, r.message, r.created_at, o.title as order_title, o.category as order_category, o.status as order_status, o.city as order_city, "
            f"CASE WHEN o.accepted_response_id = r.id THEN o.contact_phone ELSE NULL END as contact_phone, "
            f"CASE WHEN o.accepted_response_id = r.id THEN o.contact_email ELSE NULL END as contact_email, "
            f"CASE WHEN o.accepted_response_id = r.id THEN o.contact_name ELSE NULL END as contact_name "
            f"FROM {SCHEMA}.responses r JOIN {SCHEMA}.orders o ON o.id = r.order_id "
            f"WHERE r.master_id = %s ORDER BY r.created_at DESC LIMIT 50",
            (master['id'],)
        )
        my_responses = cur.fetchall()
        cur.execute(
            f"SELECT id, title, description, category, subcategories, city, price, is_active, paid_until, boosted_until, boost_count, created_at FROM {SCHEMA}.master_services WHERE master_id = %s ORDER BY sort_order DESC, created_at DESC",
            (master['id'],)
        )
        my_services = cur.fetchall()
        cur.execute(
            f"SELECT id, service_id, contact_name, contact_phone, contact_email, message, is_read, created_at, deal_status, master_deal_confirmed, customer_deal_confirmed "
            f"FROM {SCHEMA}.master_inquiries WHERE master_id = %s ORDER BY created_at DESC LIMIT 50",
            (master['id'],)
        )
        inquiries = cur.fetchall()
        cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.master_inquiries WHERE master_id=%s AND is_read=FALSE", (master['id'],))
        unread_inquiries = cur.fetchone()['cnt']
        # Удаляем устаревшие переписки (старше 3 дней)
        cur.execute(
            f"DELETE FROM {SCHEMA}.chat_messages WHERE inquiry_id IN (SELECT id FROM {SCHEMA}.master_inquiries WHERE master_id=%s AND expires_at < NOW())",
            (master['id'],)
        )
        cur.execute(
            f"DELETE FROM {SCHEMA}.master_inquiries WHERE master_id=%s AND expires_at < NOW()",
            (master['id'],)
        )
        conn.commit()
        cur.close(); conn.close()

        return {
            'statusCode': 200,
            'headers': HEADERS,
            'body': json.dumps({
                'master': master_to_dict(master),
                'rating': float(stats['avg']) if stats['avg'] else None,
                'reviews_total': stats['cnt'],
                'unread_inquiries': int(unread_inquiries),
                'inquiries': [{
                    'id': i['id'],
                    'service_id': i['service_id'],
                    'contact_name': i['contact_name'],
                    'contact_phone': i['contact_phone'] if i['deal_status'] == 'deal' else None,
                    'contact_email': i['contact_email'] if i['deal_status'] == 'deal' else None,
                    'message': i['message'],
                    'is_read': i['is_read'],
                    'deal_status': i['deal_status'],
                    'master_deal_confirmed': i['master_deal_confirmed'],
                    'customer_deal_confirmed': i['customer_deal_confirmed'],
                    'created_at': i['created_at'].isoformat() if i['created_at'] else None,
                } for i in inquiries],
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
                    'contact_phone': r['contact_phone'],
                    'contact_email': r['contact_email'],
                    'contact_name': r['contact_name'],
                } for r in my_responses],
                'my_services': [{
                    'id': s['id'],
                    'title': s['title'],
                    'description': s['description'],
                    'category': s['category'],
                    'subcategories': list(s['subcategories']) if s['subcategories'] else [],
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
        categories_raw = body.get('categories')
        if isinstance(categories_raw, list):
            categories = [c.strip() for c in categories_raw if c and c.strip()]
        elif category:
            categories = [category]
        else:
            categories = []
        primary_cat = categories[0] if categories else category
        city = (body.get('city') or '').strip()
        about = (body.get('about') or '').strip()

        if not phone:
            return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите телефон'})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT * FROM masters WHERE phone = %s", (phone,))
        master = cur.fetchone()

        if master:
            if name or about or email or categories:
                cur.execute(
                    "UPDATE masters SET name = COALESCE(NULLIF(%s,''), name), category = COALESCE(NULLIF(%s,''), category), categories = CASE WHEN %s::TEXT[] IS NOT NULL AND array_length(%s::TEXT[], 1) > 0 THEN %s::TEXT[] ELSE categories END, city = COALESCE(NULLIF(%s,''), city), about = COALESCE(NULLIF(%s,''), about), email = COALESCE(%s, email) WHERE phone = %s",
                    (name, primary_cat, categories or None, categories or None, categories or None, city, about, email, phone)
                )
                conn.commit()
                cur.execute("SELECT * FROM masters WHERE phone = %s", (phone,))
                master = cur.fetchone()
        else:
            if not name:
                cur.close(); conn.close()
                return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Мастер не найден', 'not_found': True})}
            cur.execute(
                "INSERT INTO masters (name, phone, email, category, categories, city, about, balance) VALUES (%s, %s, %s, %s, %s::TEXT[], %s, %s, 0) RETURNING *",
                (name, phone, email, primary_cat, categories or [], city, about)
            )
            master = cur.fetchone()
            conn.commit()

        cur.execute("SELECT * FROM master_transactions WHERE master_id = %s ORDER BY created_at DESC LIMIT 20", (master['id'],))
        transactions = cur.fetchall()
        cur.execute("SELECT ROUND(AVG(rating)::numeric,1) as avg, COUNT(*) as cnt FROM reviews WHERE master_id = %s", (master['id'],))
        stats = cur.fetchone()
        cur.execute(
            "SELECT r.id, r.order_id, r.message, r.created_at, o.title as order_title, o.category as order_category, o.status as order_status, o.city as order_city, "
            "CASE WHEN o.accepted_response_id = r.id THEN o.contact_phone ELSE NULL END as contact_phone, "
            "CASE WHEN o.accepted_response_id = r.id THEN o.contact_email ELSE NULL END as contact_email, "
            "CASE WHEN o.accepted_response_id = r.id THEN o.contact_name ELSE NULL END as contact_name "
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
                    'contact_phone': r['contact_phone'],
                    'contact_email': r['contact_email'],
                    'contact_name': r['contact_name'],
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