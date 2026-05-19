import json
import os
import uuid
import urllib.request
import urllib.error
import base64
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')
ADMIN_EMAIL = 'handymanbusiness@yandex.ru'


def send_admin_donation_email(amount: int, donor_name: str, donor_email: str, message: str, donation_id: int):
    try:
        host = os.environ['SMTP_HOST']
        port = int(os.environ['SMTP_PORT'])
        user = os.environ['SMTP_USER']
        pw = os.environ['SMTP_PASS']
    except KeyError:
        return
    name = donor_name or 'Анонимный донор'
    msg = MIMEMultipart('alternative')
    msg['Subject'] = f'Новое пожертвование {amount} ₽ — HandyMan'
    msg['From'] = f'HandyMan <{user}>'
    msg['To'] = ADMIN_EMAIL
    email_line = f'<p style="margin:4px 0;color:#d1d5db;font-size:14px;">Email: <a href="mailto:{donor_email}" style="color:#a78bfa;">{donor_email}</a></p>' if donor_email else ''
    message_line = f'<div style="background:#0a0d16;border:1px solid #3730a3;border-radius:10px;padding:14px;margin-top:12px;"><p style="color:#9ca3af;font-size:12px;margin:0 0 4px 0;">Пожелание:</p><p style="color:#e5e7eb;font-size:14px;margin:0;font-style:italic;">«{message}»</p></div>' if message else ''
    html = f"""
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0d16;border-radius:16px;">
      <h2 style="color:#fff;margin:0 0 4px 0;">💜 HandyMan</h2>
      <p style="color:#9ca3af;font-size:14px;margin:0 0 20px 0;">Кто-то поддержал проект!</p>
      <div style="background:#1e1b4b;border:1px solid #4c1d95;border-radius:12px;padding:20px;margin-bottom:16px;">
        <p style="color:#a78bfa;font-weight:700;font-size:28px;margin:0 0 12px 0;">+{amount:,} ₽</p>
        <p style="margin:4px 0;color:#d1d5db;font-size:14px;">От: <strong style="color:#fff;">{name}</strong></p>
        {email_line}
        {message_line}
      </div>
      <a href="https://хандиман.рф/admin" style="display:inline-block;background:#7c3aed;color:#fff;padding:11px 22px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;">Открыть админку</a>
      <p style="color:#6b7280;font-size:11px;margin-top:16px;">ID пожертвования: #{donation_id}</p>
    </div>
    """
    plain = f'Новое пожертвование {amount} ₽ от {name}\n'
    if donor_email:
        plain += f'Email: {donor_email}\n'
    if message:
        plain += f'\nПожелание: {message}\n'
    plain += f'\nID: #{donation_id}'
    msg.attach(MIMEText(plain, 'plain'))
    msg.attach(MIMEText(html, 'html'))
    try:
        ctx = ssl.create_default_context()
        with smtplib.SMTP_SSL(host, port, context=ctx) as server:
            server.login(user, pw)
            server.sendmail(user, ADMIN_EMAIL, msg.as_string())
    except Exception:
        pass

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'], cursor_factory=RealDictCursor)


def yookassa_request(method, path, body=None):
    shop_id = os.environ['YOOKASSA_SHOP_ID']
    secret_key = os.environ['YOOKASSA_SECRET_KEY']
    credentials = base64.b64encode(f"{shop_id}:{secret_key}".encode()).decode()
    url = f"https://api.yookassa.ru/v3{path}"
    headers = {
        'Authorization': f'Basic {credentials}',
        'Content-Type': 'application/json',
    }
    if body:
        headers['Idempotence-Key'] = str(uuid.uuid4())
    data = json.dumps(body).encode('utf-8') if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        raise Exception(f"YooKassa error {e.code}: {error_body}")


def handler(event, context):
    """Создание и проверка добровольных пожертвований через ЮKassa"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        action = body.get('action', action)

        # Автодетект webhook от ЮKassa: они шлют {type:'notification', event:..., object:...}
        if not action and (body.get('type') == 'notification' or 'event' in body):
            action = 'webhook'

        if action == 'create':
            try:
                amount = int(body.get('amount') or 0)
            except (TypeError, ValueError):
                amount = 0
            if amount < 50 or amount > 100000:
                return {'statusCode': 400, 'headers': CORS,
                        'body': json.dumps({'error': 'Сумма должна быть от 50 до 100 000 ₽'})}

            donor_name = (body.get('donor_name') or '').strip()[:150] or None
            donor_email = (body.get('donor_email') or '').strip()[:255] or None
            donor_message = (body.get('message') or '').strip()[:500] or None
            return_url = body.get('return_url') or 'https://хандиман.рф/?donate=ok'

            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                f"INSERT INTO {SCHEMA}.donations (amount, donor_name, donor_email, message, status) "
                f"VALUES (%s, %s, %s, %s, 'pending') RETURNING id",
                (amount, donor_name, donor_email, donor_message)
            )
            donation_id = cur.fetchone()['id']
            conn.commit()

            yk = yookassa_request('POST', '/payments', {
                'amount': {'value': f'{amount}.00', 'currency': 'RUB'},
                'confirmation': {
                    'type': 'redirect',
                    'return_url': return_url,
                },
                'capture': True,
                'description': f'Поддержка проекта HandyMan — {amount} ₽',
                'metadata': {
                    'donation_id': str(donation_id),
                    'kind': 'donation',
                }
            })
            yk_id = yk['id']
            confirmation_url = yk['confirmation']['confirmation_url']
            cur.execute(
                f"UPDATE {SCHEMA}.donations SET yookassa_payment_id = %s WHERE id = %s",
                (yk_id, donation_id)
            )
            conn.commit()
            cur.close()
            conn.close()

            return {
                'statusCode': 200,
                'headers': CORS,
                'body': json.dumps({
                    'donation_id': donation_id,
                    'confirmation_url': confirmation_url,
                    'yookassa_id': yk_id,
                })
            }

        if action == 'webhook':
            event_type = body.get('event', '')
            obj = body.get('object', {})
            if event_type != 'payment.succeeded':
                return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}
            metadata = obj.get('metadata', {})
            donation_id = metadata.get('donation_id')
            if not donation_id:
                return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                f"UPDATE {SCHEMA}.donations SET status='succeeded', succeeded_at=NOW() "
                f"WHERE id=%s AND status!='succeeded' "
                f"RETURNING amount, donor_name, donor_email, message",
                (donation_id,)
            )
            updated = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            if updated:
                send_admin_donation_email(
                    amount=updated['amount'],
                    donor_name=updated['donor_name'] or '',
                    donor_email=updated['donor_email'] or '',
                    message=updated['message'] or '',
                    donation_id=int(donation_id),
                )
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        if action == 'check':
            donation_id = body.get('donation_id')
            if not donation_id:
                return {'statusCode': 400, 'headers': CORS,
                        'body': json.dumps({'error': 'donation_id обязателен'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                f"SELECT id, yookassa_payment_id, status FROM {SCHEMA}.donations WHERE id=%s",
                (donation_id,)
            )
            row = cur.fetchone()
            if not row:
                cur.close(); conn.close()
                return {'statusCode': 404, 'headers': CORS,
                        'body': json.dumps({'error': 'Пожертвование не найдено'})}
            if row['status'] == 'succeeded':
                cur.close(); conn.close()
                return {'statusCode': 200, 'headers': CORS,
                        'body': json.dumps({'status': 'succeeded'})}
            yk = yookassa_request('GET', f"/payments/{row['yookassa_payment_id']}")
            yk_status = yk.get('status', 'pending')
            notify_payload = None
            if yk_status == 'succeeded':
                cur.execute(
                    f"UPDATE {SCHEMA}.donations SET status='succeeded', succeeded_at=NOW() "
                    f"WHERE id=%s AND status!='succeeded' "
                    f"RETURNING amount, donor_name, donor_email, message",
                    (donation_id,)
                )
                upd = cur.fetchone()
                conn.commit()
                if upd:
                    notify_payload = upd
            cur.close(); conn.close()
            if notify_payload:
                send_admin_donation_email(
                    amount=notify_payload['amount'],
                    donor_name=notify_payload['donor_name'] or '',
                    donor_email=notify_payload['donor_email'] or '',
                    message=notify_payload['message'] or '',
                    donation_id=int(donation_id),
                )
            return {'statusCode': 200, 'headers': CORS,
                    'body': json.dumps({'status': yk_status})}

    if method == 'GET':
        if action == 'stats':
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                f"SELECT COALESCE(SUM(amount),0) AS total, COUNT(*) AS count "
                f"FROM {SCHEMA}.donations WHERE status='succeeded'"
            )
            row = cur.fetchone()
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': CORS,
                'body': json.dumps({'total': int(row['total']), 'count': int(row['count'])})
            }

        if action == 'list':
            # Админский список — требует ADMIN_SECRET_TOKEN в заголовке X-Admin-Token
            headers_in = event.get('headers') or {}
            token = headers_in.get('x-admin-token') or headers_in.get('X-Admin-Token') or params.get('token')
            if token != os.environ.get('ADMIN_SECRET_TOKEN'):
                return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'unauthorized'})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                f"SELECT id, amount, donor_name, donor_email, message, status, "
                f"yookassa_payment_id, created_at, succeeded_at "
                f"FROM {SCHEMA}.donations ORDER BY created_at DESC LIMIT 500"
            )
            rows = cur.fetchall()
            cur.execute(
                f"SELECT COALESCE(SUM(amount),0) AS total, COUNT(*) AS count "
                f"FROM {SCHEMA}.donations WHERE status='succeeded'"
            )
            stats = cur.fetchone()
            cur.close()
            conn.close()
            donations_list = []
            for r in rows:
                donations_list.append({
                    'id': r['id'],
                    'amount': r['amount'],
                    'donor_name': r['donor_name'],
                    'donor_email': r['donor_email'],
                    'message': r['message'],
                    'status': r['status'],
                    'yookassa_payment_id': r['yookassa_payment_id'],
                    'created_at': r['created_at'].isoformat() if r['created_at'] else None,
                    'succeeded_at': r['succeeded_at'].isoformat() if r['succeeded_at'] else None,
                })
            return {
                'statusCode': 200,
                'headers': CORS,
                'body': json.dumps({
                    'donations': donations_list,
                    'total': int(stats['total']),
                    'count': int(stats['count']),
                })
            }

    return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'unknown action'})}