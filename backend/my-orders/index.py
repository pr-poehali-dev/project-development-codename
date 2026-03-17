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


def get_orders(cur, customer_id=None, phone=None):
    if customer_id:
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
                'master_phone': r['master_phone'],
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
            if not email:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите email'})}
            if not name:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите имя'})}
            if not phone:
                return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите телефон'})}

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
                    cur.execute(f"UPDATE {SCHEMA}.customers SET name=%s, email=%s WHERE phone=%s", (name, email, phone))
                else:
                    cur.execute(
                        f"INSERT INTO {SCHEMA}.customers (name, phone, email, email_verified) VALUES (%s,%s,%s,FALSE) RETURNING id",
                        (name, phone, email)
                    )
            else:
                cur.execute(f"UPDATE {SCHEMA}.customers SET name=%s, phone=%s WHERE email=%s", (name, phone, email))

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
                cur.execute(f"SELECT id, name, phone, email, password_hash, email_verified FROM {SCHEMA}.customers WHERE email=%s", (identifier.lower(),))
            else:
                cur.execute(f"SELECT id, name, phone, email, password_hash, email_verified FROM {SCHEMA}.customers WHERE phone=%s", (identifier,))
            row = cur.fetchone()
            cur.close(); conn.close()
            if not row:
                return {'statusCode': 401, 'headers': HEADERS, 'body': json.dumps({'error': 'Пользователь не найден'})}
            if not row['email_verified'] or not row['password_hash']:
                return {'statusCode': 401, 'headers': HEADERS,
                        'body': json.dumps({'error': 'Завершите регистрацию — подтвердите email.'})}
            if not verify_password(password, row['password_hash']):
                return {'statusCode': 401, 'headers': HEADERS, 'body': json.dumps({'error': 'Неверный пароль'})}
            return {'statusCode': 200, 'headers': HEADERS,
                    'body': json.dumps({'success': True,
                                        'user': {'id': row['id'], 'name': row['name'],
                                                 'phone': row['phone'], 'email': row['email'] or ''}})}

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
            conn.commit()
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True})}

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
                'body': json.dumps({'customer': {'id': customer['id'], 'name': customer['name'], 'phone': customer['phone'], 'email': customer.get('email') or ''}, 'orders': orders_data}, ensure_ascii=False)}

    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        phone = (params.get('phone') or '').strip()
        if not phone:
            return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Укажите номер телефона'})}
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT * FROM {SCHEMA}.customers WHERE phone = %s", (phone,))
        customer = cur.fetchone()
        if customer:
            orders_data = get_orders(cur, customer_id=customer['id'])
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': HEADERS,
                    'body': json.dumps({'customer': {'id': customer['id'], 'name': customer['name'], 'phone': customer['phone'], 'email': customer.get('email') or ''}, 'orders': orders_data}, ensure_ascii=False)}
        orders_data = get_orders(cur, phone=phone)
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'orders': orders_data}, ensure_ascii=False)}

    return {'statusCode': 405, 'headers': HEADERS, 'body': json.dumps({'error': 'Method not allowed'})}