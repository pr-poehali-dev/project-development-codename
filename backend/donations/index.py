import json
import os
import uuid
import urllib.request
import urllib.error
import base64

import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')

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
                f"WHERE id=%s AND status!='succeeded'",
                (donation_id,)
            )
            conn.commit()
            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

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

    return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'unknown action'})}
