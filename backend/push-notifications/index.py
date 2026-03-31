import json
import os
import base64
import psycopg2
# v3
from psycopg2.extras import RealDictCursor
from pywebpush import webpush, WebPushException

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")

HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'], cursor_factory=RealDictCursor)


def write_pem_file(raw: str) -> str:
    """Декодирует ключ из base64 и записывает в /tmp/vapid.pem, возвращает путь"""
    raw = raw.strip()
    if '-----' not in raw:
        pem = base64.b64decode(raw).decode('utf-8')
    else:
        pem = raw.replace('\\n', '\n')
    print(f"[PUSH] pem len={len(pem)} starts={pem[:30]!r}")
    path = '/tmp/vapid.pem'
    with open(path, 'w') as f:
        f.write(pem)
    return path


def handler(event: dict, context) -> dict:
    """Управление Web Push подписками и отправка push-уведомлений"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    body_raw = {}
    if event.get('body'):
        try:
            body_raw = json.loads(event['body'])
        except Exception:
            pass

    # ── СОХРАНИТЬ ПОДПИСКУ ──
    if method == 'POST' and body_raw.get('action') == 'subscribe':
        phone = (body_raw.get('phone') or '').strip()
        role = (body_raw.get('role') or '').strip()
        subscription = body_raw.get('subscription') or {}
        endpoint = subscription.get('endpoint', '')
        keys = subscription.get('keys') or {}
        p256dh = keys.get('p256dh', '')
        auth = keys.get('auth', '')

        if not all([phone, role, endpoint, p256dh, auth]):
            return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Не все данные переданы'})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.push_subscriptions (user_phone, user_role, endpoint, p256dh, auth) "
            f"VALUES (%s, %s, %s, %s, %s) "
            f"ON CONFLICT (endpoint, user_phone) DO UPDATE SET user_role=%s, p256dh=%s, auth=%s",
            (phone, role, endpoint, p256dh, auth, role, p256dh, auth)
        )
        conn.commit()
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True})}

    # ── УДАЛИТЬ ПОДПИСКУ ──
    if method == 'POST' and body_raw.get('action') == 'unsubscribe':
        endpoint = body_raw.get('endpoint', '')
        if not endpoint:
            return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'endpoint обязателен'})}
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {SCHEMA}.push_subscriptions WHERE endpoint=%s", (endpoint,))
        conn.commit()
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True})}

    # ── ОТПРАВИТЬ PUSH ПО ТЕЛЕФОНУ ──
    if method == 'POST' and body_raw.get('action') == 'send':
        phone = (body_raw.get('phone') or '').strip()
        title = body_raw.get('title', 'HandyMan')
        body = body_raw.get('body', 'У вас новое сообщение')
        url = body_raw.get('url', '/')

        if not phone:
            return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'phone обязателен'})}

        vapid_private_raw = os.environ.get('VAPID_PRIVATE_KEY', '')
        vapid_public = os.environ.get('VAPID_PUBLIC_KEY', '')
        vapid_email = os.environ.get('SMTP_USER', 'noreply@handyman.ru')

        if not vapid_private_raw or not vapid_public:
            return {'statusCode': 500, 'headers': HEADERS, 'body': json.dumps({'error': 'VAPID ключи не настроены'})}

        vapid_private = write_pem_file(vapid_private_raw)

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT endpoint, p256dh, auth FROM {SCHEMA}.push_subscriptions WHERE user_phone=%s", (phone,))
        subs = cur.fetchall()
        cur.close(); conn.close()

        print(f"[PUSH] phone={phone!r} subs={len(subs)}")

        payload = json.dumps({'title': title, 'body': body, 'url': url})
        sent = 0
        errors = []
        failed_endpoints = []

        for sub in subs:
            try:
                from urllib.parse import urlparse
                endpoint_url = sub['endpoint']
                parsed = urlparse(endpoint_url)
                aud = f"{parsed.scheme}://{parsed.netloc}"
                webpush(
                    subscription_info={
                        'endpoint': endpoint_url,
                        'keys': {'p256dh': sub['p256dh'], 'auth': sub['auth']}
                    },
                    data=payload,
                    vapid_private_key=vapid_private,
                    vapid_claims={'sub': f'mailto:{vapid_email}', 'aud': aud}
                )
                sent += 1
                print(f"[PUSH] sent OK to {sub['endpoint'][:50]}")
            except WebPushException as e:
                status = e.response.status_code if e.response else 'no_response'
                body_text = e.response.text if e.response else str(e)
                print(f"[PUSH ERROR] status={status} body={body_text[:500]}")
                errors.append({'status': status, 'body': body_text[:200]})
                if e.response and e.response.status_code in (404, 410):
                    failed_endpoints.append(sub['endpoint'])
            except Exception as e:
                print(f"[PUSH ERROR] unexpected: {e}")
                errors.append({'error': str(e)})

        if failed_endpoints:
            conn2 = get_conn()
            cur2 = conn2.cursor()
            for ep in failed_endpoints:
                cur2.execute(f"DELETE FROM {SCHEMA}.push_subscriptions WHERE endpoint=%s", (ep,))
            conn2.commit()
            cur2.close(); conn2.close()

        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True, 'sent': sent, 'errors': errors})}

    return {'statusCode': 405, 'headers': HEADERS, 'body': json.dumps({'error': 'Method not allowed'})}