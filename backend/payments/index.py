import json
import os
import uuid
import psycopg2
from psycopg2.extras import RealDictCursor
import urllib.request
import urllib.error
import base64

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
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


def send_push(phone: str, title: str, body: str, url: str = '/'):
    try:
        _push_data = json.dumps({'action': 'send', 'phone': phone, 'title': title, 'body': body, 'url': url}).encode()
        _req = urllib.request.Request(
            'https://functions.poehali.dev/272080b1-1a80-40bd-8201-0951cb380c57',
            data=_push_data, headers={'Content-Type': 'application/json'}, method='POST'
        )
        urllib.request.urlopen(_req, timeout=10)
    except Exception:
        pass


def handler(event: dict, context) -> dict:
    """Создание и проверка платежей через ЮKassa"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        action = body.get('action', action)

        if action == 'webhook':
            event_type = body.get('event', '')
            obj = body.get('object', {})

            if event_type != 'payment.succeeded':
                return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

            yk_payment_id = obj.get('id')
            metadata = obj.get('metadata', {})
            payment_db_id = metadata.get('payment_db_id')
            master_id = metadata.get('master_id')

            if not yk_payment_id or not payment_db_id:
                return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                f"SELECT p.*, rp.responses_count FROM {SCHEMA}.payments p "
                f"JOIN {SCHEMA}.response_packages rp ON p.package_id = rp.id "
                f"WHERE p.id = %s AND p.status != 'succeeded'",
                (payment_db_id,)
            )
            payment = cur.fetchone()
            if not payment:
                conn.close()
                return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

            tokens = payment['responses_count']
            cur.execute(
                f"UPDATE {SCHEMA}.payments SET status = 'succeeded' WHERE id = %s",
                (payment_db_id,)
            )
            cur.execute(
                f"UPDATE {SCHEMA}.masters SET balance = balance + %s WHERE id = %s",
                (tokens, payment['master_id'])
            )
            cur.execute(
                f"INSERT INTO {SCHEMA}.master_transactions (master_id, type, amount, description) "
                f"VALUES (%s, 'purchase', %s, %s)",
                (payment['master_id'], tokens, f"Покупка {tokens} токенов через ЮKassa")
            )
            cur.execute(f"SELECT phone FROM {SCHEMA}.masters WHERE id = %s", (payment['master_id'],))
            mp = cur.fetchone()
            conn.commit()
            conn.close()
            if mp and mp['phone']:
                send_push(mp['phone'], 'Баланс пополнен!', f'+{tokens} токенов зачислено на ваш счёт', '/master?tab=balance')
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        if action == 'create':
            master_id = body.get('master_id')
            package_id = body.get('package_id')
            return_url = body.get('return_url', 'https://your-site.ru/master?tab=balance')

            if not master_id or not package_id:
                return {'statusCode': 400, 'headers': CORS,
                        'body': json.dumps({'error': 'master_id и package_id обязательны'})}

            conn = get_conn()
            cur = conn.cursor()

            cur.execute(
                f"SELECT id, name, responses_count, price FROM {SCHEMA}.response_packages WHERE id = %s AND is_active = TRUE",
                (package_id,)
            )
            pkg = cur.fetchone()
            if not pkg:
                conn.close()
                return {'statusCode': 404, 'headers': CORS,
                        'body': json.dumps({'error': 'Пакет не найден'})}

            cur.execute(
                f"INSERT INTO {SCHEMA}.payments (master_id, package_id, amount, status, tokens_count, return_url) "
                f"VALUES (%s, %s, %s, 'pending', %s, %s) RETURNING id",
                (master_id, package_id, pkg['price'], pkg['responses_count'], return_url)
            )
            payment_row = cur.fetchone()
            payment_db_id = payment_row['id']
            conn.commit()

            amount_str = f"{pkg['price']}.00"
            yk_payment = yookassa_request('POST', '/payments', {
                'amount': {'value': amount_str, 'currency': 'RUB'},
                'confirmation': {
                    'type': 'embedded',
                },
                'capture': True,
                'description': f"Покупка пакета «{pkg['name']}» — {pkg['responses_count']} токенов",
                'metadata': {
                    'payment_db_id': str(payment_db_id),
                    'master_id': str(master_id),
                    'package_id': str(package_id),
                }
            })

            yk_id = yk_payment['id']
            confirmation_token = yk_payment['confirmation']['confirmation_token']

            cur.execute(
                f"UPDATE {SCHEMA}.payments SET yookassa_payment_id = %s WHERE id = %s",
                (yk_id, payment_db_id)
            )
            conn.commit()
            conn.close()

            return {
                'statusCode': 200,
                'headers': CORS,
                'body': json.dumps({
                    'payment_id': payment_db_id,
                    'confirmation_token': confirmation_token,
                    'yookassa_id': yk_id,
                })
            }

        if action == 'check':
            payment_id = body.get('payment_id') or params.get('payment_id')
            if not payment_id:
                return {'statusCode': 400, 'headers': CORS,
                        'body': json.dumps({'error': 'payment_id обязателен'})}

            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                f"SELECT p.*, rp.responses_count FROM {SCHEMA}.payments p "
                f"JOIN {SCHEMA}.response_packages rp ON p.package_id = rp.id "
                f"WHERE p.id = %s",
                (payment_id,)
            )
            payment = cur.fetchone()
            if not payment:
                conn.close()
                return {'statusCode': 404, 'headers': CORS,
                        'body': json.dumps({'error': 'Платёж не найден'})}

            if payment['status'] == 'succeeded':
                conn.close()
                return {'statusCode': 200, 'headers': CORS,
                        'body': json.dumps({'status': 'succeeded', 'tokens': payment['tokens_count']})}

            yk_payment = yookassa_request('GET', f"/payments/{payment['yookassa_payment_id']}")
            yk_status = yk_payment['status']

            if yk_status == 'succeeded' and payment['status'] != 'succeeded':
                tokens = payment['responses_count']
                cur.execute(
                    f"UPDATE {SCHEMA}.payments SET status = 'succeeded' WHERE id = %s",
                    (payment_id,)
                )
                cur.execute(
                    f"UPDATE {SCHEMA}.masters SET balance = balance + %s WHERE id = %s",
                    (tokens, payment['master_id'])
                )
                cur.execute(
                    f"INSERT INTO {SCHEMA}.master_transactions (master_id, type, amount, description) "
                    f"VALUES (%s, 'purchase', %s, %s)",
                    (payment['master_id'], tokens, f"Покупка {tokens} токенов через ЮKassa")
                )
                cur.execute(f"SELECT phone FROM {SCHEMA}.masters WHERE id = %s", (payment['master_id'],))
                mp = cur.fetchone()
                conn.commit()
                conn.close()
                if mp and mp['phone']:
                    send_push(mp['phone'], 'Баланс пополнен!', f'+{tokens} токенов зачислено на ваш счёт', '/master?tab=balance')
                return {'statusCode': 200, 'headers': CORS,
                        'body': json.dumps({'status': 'succeeded', 'tokens': tokens})}

            if yk_status == 'canceled':
                cur.execute(
                    f"UPDATE {SCHEMA}.payments SET status = 'canceled' WHERE id = %s",
                    (payment_id,)
                )
                conn.commit()

            conn.close()
            return {'statusCode': 200, 'headers': CORS,
                    'body': json.dumps({'status': yk_status})}

    if method == 'GET' and action == 'check':
        payment_id = params.get('payment_id')
        if not payment_id:
            return {'statusCode': 400, 'headers': CORS,
                    'body': json.dumps({'error': 'payment_id обязателен'})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT p.*, rp.responses_count FROM {SCHEMA}.payments p "
            f"JOIN {SCHEMA}.response_packages rp ON p.package_id = rp.id "
            f"WHERE p.id = %s",
            (payment_id,)
        )
        payment = cur.fetchone()
        if not payment:
            conn.close()
            return {'statusCode': 404, 'headers': CORS,
                    'body': json.dumps({'error': 'Платёж не найден'})}

        if payment['status'] == 'succeeded':
            conn.close()
            return {'statusCode': 200, 'headers': CORS,
                    'body': json.dumps({'status': 'succeeded', 'tokens': payment['tokens_count']})}

        yk_payment = yookassa_request('GET', f"/payments/{payment['yookassa_payment_id']}")
        yk_status = yk_payment['status']

        if yk_status == 'succeeded' and payment['status'] != 'succeeded':
            tokens = payment['responses_count']
            cur.execute(
                f"UPDATE {SCHEMA}.payments SET status = 'succeeded' WHERE id = %s",
                (payment_id,)
            )
            cur.execute(
                f"UPDATE {SCHEMA}.masters SET balance = balance + %s WHERE id = %s",
                (tokens, payment['master_id'])
            )
            cur.execute(
                f"INSERT INTO {SCHEMA}.master_transactions (master_id, type, amount, description) "
                f"VALUES (%s, 'purchase', %s, %s)",
                (payment['master_id'], tokens, f"Покупка {tokens} токенов через ЮKassa")
            )
            conn.commit()
            conn.close()
            return {'statusCode': 200, 'headers': CORS,
                    'body': json.dumps({'status': 'succeeded', 'tokens': tokens})}

        if yk_status == 'canceled':
            cur.execute(
                f"UPDATE {SCHEMA}.payments SET status = 'canceled' WHERE id = %s",
                (payment_id,)
            )
            conn.commit()

        conn.close()
        return {'statusCode': 200, 'headers': CORS,
                'body': json.dumps({'status': yk_status})}

    return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Неверный запрос'})}