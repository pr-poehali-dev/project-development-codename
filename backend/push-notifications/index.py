import json
import os
import base64
import time
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")

HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'], cursor_factory=RealDictCursor)


def load_private_key(env_value: str):
    from cryptography.hazmat.primitives.serialization import load_pem_private_key
    raw = env_value.strip()
    if '-----' not in raw:
        pem_bytes = base64.b64decode(raw)
    else:
        pem_bytes = raw.replace('\\n', '\n').encode('utf-8')
    return load_pem_private_key(pem_bytes, password=None)


def get_public_key_b64(priv_key) -> str:
    pub_numbers = priv_key.public_key().public_numbers()
    x = pub_numbers.x.to_bytes(32, 'big')
    y = pub_numbers.y.to_bytes(32, 'big')
    pub_raw = b'\x04' + x + y
    return base64.urlsafe_b64encode(pub_raw).rstrip(b'=').decode('utf-8')


def send_web_push(subscription_info, data, priv_key, vapid_email, audience):
    import http_ece
    import requests
    from cryptography.hazmat.primitives.asymmetric import ec, utils as ecutils
    from cryptography.hazmat.primitives import hashes
    from py_vapid.utils import b64urlencode

    endpoint = subscription_info['endpoint']
    p256dh = subscription_info['keys']['p256dh']
    auth = subscription_info['keys']['auth']

    encoded = http_ece.encrypt(
        data.encode('utf-8'),
        salt=os.urandom(16),
        private_key=ec.generate_private_key(ec.SECP256R1()),
        dh=base64.urlsafe_b64decode(p256dh + '=='),
        auth_secret=base64.urlsafe_b64decode(auth + '=='),
        version='aes128gcm',
    )

    pub_key = priv_key.public_key()
    pub_numbers = pub_key.public_numbers()
    x = pub_numbers.x.to_bytes(32, 'big')
    y = pub_numbers.y.to_bytes(32, 'big')
    pub_raw = b'\x04' + x + y
    pub_b64 = b64urlencode(pub_raw)

    now = int(time.time())
    header_b64 = b64urlencode(json.dumps({"typ": "JWT", "alg": "ES256"}).encode())
    payload_b64 = b64urlencode(json.dumps({
        "aud": audience,
        "exp": now + 86400,
        "sub": f"mailto:{vapid_email}"
    }).encode())

    sign_input = f"{header_b64}.{payload_b64}".encode()
    der_sig = priv_key.sign(sign_input, ec.ECDSA(hashes.SHA256()))
    r, s = ecutils.decode_dss_signature(der_sig)
    sig_bytes = r.to_bytes(32, 'big') + s.to_bytes(32, 'big')
    sig_b64 = b64urlencode(sig_bytes)

    jwt_token = f"{header_b64}.{payload_b64}.{sig_b64}"

    resp = requests.post(
        endpoint,
        data=encoded,
        headers={
            'Content-Encoding': 'aes128gcm',
            'Content-Type': 'application/octet-stream',
            'TTL': '86400',
            'Authorization': f'vapid t={jwt_token},k={pub_b64}',
        },
        timeout=10
    )

    if resp.status_code >= 400:
        raise Exception(f"Push failed: {resp.status_code} {resp.reason}\nResponse body:{resp.text}")

    return resp


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

        priv_key = load_private_key(vapid_private_raw)

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
                send_web_push(
                    subscription_info={
                        'endpoint': endpoint_url,
                        'keys': {'p256dh': sub['p256dh'], 'auth': sub['auth']}
                    },
                    data=payload,
                    priv_key=priv_key,
                    vapid_email=vapid_email,
                    audience=aud
                )
                sent += 1
                print(f"[PUSH] sent OK to {endpoint_url[:50]}")
            except Exception as e:
                err_str = str(e)
                print(f"[PUSH ERROR] {err_str[:500]}")
                errors.append({'error': err_str[:200]})
                if '404' in err_str or '410' in err_str:
                    failed_endpoints.append(sub['endpoint'])

        if failed_endpoints:
            conn2 = get_conn()
            cur2 = conn2.cursor()
            for ep in failed_endpoints:
                cur2.execute(f"DELETE FROM {SCHEMA}.push_subscriptions WHERE endpoint=%s", (ep,))
            conn2.commit()
            cur2.close(); conn2.close()

        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({
            'success': True, 'sent': sent, 'errors': errors
        })}

    # ── ПОЛУЧИТЬ ПУБЛИЧНЫЙ КЛЮЧ (вычисляем из приватного) ──
    if method == 'GET':
        vapid_private_raw = os.environ.get('VAPID_PRIVATE_KEY', '')
        vapid_public = ''
        if vapid_private_raw:
            try:
                priv_key = load_private_key(vapid_private_raw)
                vapid_public = get_public_key_b64(priv_key)
            except Exception:
                pass
        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'vapid_public_key': vapid_public})}

    return {'statusCode': 405, 'headers': HEADERS, 'body': json.dumps({'error': 'Method not allowed'})}
