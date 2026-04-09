import json
import os
import base64
# redeploy: new VAPID keys v2
import psycopg2
# v9
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


def get_raw_vapid_key(env_value: str) -> str:
    """Извлекает 32-byte raw EC private key из PEM/base64 и возвращает url-safe base64"""
    from cryptography.hazmat.primitives.serialization import load_pem_private_key
    raw = env_value.strip()
    if '-----' not in raw:
        pem_bytes = base64.b64decode(raw)
    else:
        pem_bytes = raw.replace('\\n', '\n').encode('utf-8')
    priv_key = load_pem_private_key(pem_bytes, password=None)
    raw_d = priv_key.private_numbers().private_value.to_bytes(32, 'big')
    return base64.urlsafe_b64encode(raw_d).rstrip(b'=').decode('utf-8')


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

    # ── ОЧИСТИТЬ ВСЕ ПОДПИСКИ ──
    if method == 'POST' and body_raw.get('action') == 'clear_all':
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {SCHEMA}.push_subscriptions")
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
        vapid_email = os.environ.get('SMTP_USER', 'noreply@handyman.ru')

        if not vapid_private_raw:
            return {'statusCode': 500, 'headers': HEADERS, 'body': json.dumps({'error': 'VAPID ключи не настроены'})}

        print(f"[PUSH] priv_key starts={vapid_private_raw[:20]!r}")
        vapid_private = get_raw_vapid_key(vapid_private_raw)

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

        from py_vapid import Vapid
        v = Vapid.from_file(vapid_private)
        pub_key_from_pem = base64.urlsafe_b64encode(
            v.public_key.public_numbers().x.to_bytes(32, 'big') +
            v.public_key.public_numbers().y.to_bytes(32, 'big')
        ).rstrip(b'=').decode('utf-8')
        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({
            'success': True, 'sent': sent, 'errors': errors,
            '_debug_pub_from_pem': pub_key_from_pem
        })}

    # ── СГЕНЕРИРОВАТЬ НОВУЮ ПАРУ VAPID-КЛЮЧЕЙ ──
    if method == 'POST' and body_raw.get('action') == 'generate_vapid':
        from cryptography.hazmat.primitives.asymmetric import ec
        from cryptography.hazmat.primitives import serialization
        private_key = ec.generate_private_key(ec.SECP256R1())
        pem = private_key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption())
        priv_b64 = base64.b64encode(pem).decode('utf-8')
        pub_numbers = private_key.public_key().public_numbers()
        x = pub_numbers.x.to_bytes(32, 'big')
        y = pub_numbers.y.to_bytes(32, 'big')
        pub_raw = b'\x04' + x + y
        pub_b64 = base64.urlsafe_b64encode(pub_raw).rstrip(b'=').decode('utf-8')
        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({
            'vapid_public_key': pub_b64,
            'vapid_private_key_base64': priv_b64,
            'instruction': 'Обновите секреты: VAPID_PUBLIC_KEY = vapid_public_key, VAPID_PRIVATE_KEY = vapid_private_key_base64'
        })}

    # ── ПОЛУЧИТЬ ПУБЛИЧНЫЙ КЛЮЧ (вычисляем из приватного для гарантии совпадения) ──
    if method == 'GET':
        vapid_private_raw = os.environ.get('VAPID_PRIVATE_KEY', '')
        vapid_public = os.environ.get('VAPID_PUBLIC_KEY', '')
        if vapid_private_raw:
            try:
                from cryptography.hazmat.primitives.serialization import load_pem_private_key
                raw = vapid_private_raw.strip()
                if '-----' not in raw:
                    pem_bytes = base64.b64decode(raw)
                else:
                    pem_bytes = raw.replace('\\n', '\n').encode('utf-8')
                priv_key = load_pem_private_key(pem_bytes, password=None)
                pub_numbers = priv_key.public_key().public_numbers()
                x = pub_numbers.x.to_bytes(32, 'big')
                y = pub_numbers.y.to_bytes(32, 'big')
                pub_raw = b'\x04' + x + y
                vapid_public = base64.urlsafe_b64encode(pub_raw).rstrip(b'=').decode('utf-8')
            except Exception:
                pass
        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'vapid_public_key': vapid_public})}

    return {'statusCode': 405, 'headers': HEADERS, 'body': json.dumps({'error': 'Method not allowed'})}