import json
import os
import smtplib
import psycopg2
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from psycopg2.extras import RealDictCursor

HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'], cursor_factory=RealDictCursor)


def send_email(to_email: str, order_title: str, master_name: str, master_phone: str, master_category: str, message: str, order_id: int):
    smtp_host = os.environ.get('SMTP_HOST', 'smtp.yandex.ru')
    smtp_user = os.environ['SMTP_USER']
    smtp_password = os.environ['SMTP_PASSWORD']

    msg = MIMEMultipart('alternative')
    msg['Subject'] = f'Новый отклик на вашу заявку — {order_title}'
    msg['From'] = f'ЦифровойХаб <{smtp_user}>'
    msg['To'] = to_email

    cabinet_url = 'https://your-domain.poehali.dev/cabinet'

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0f1117; color: #ffffff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 32px 32px 24px;">
        <h1 style="margin: 0; font-size: 22px; color: #ffffff;">⚡ ХэндиМэн</h1>
        <p style="margin: 8px 0 0; color: #c4b5fd; font-size: 14px;">Маркетплейс бытовых услуг</p>
      </div>
      <div style="padding: 32px;">
        <h2 style="margin: 0 0 8px; font-size: 20px; color: #ffffff;">На вашу заявку откликнулся мастер!</h2>
        <p style="margin: 0 0 24px; color: #9ca3af; font-size: 14px;">Заявка: <strong style="color: #e5e7eb;">{order_title}</strong></p>

        <div style="background: #1a1d27; border: 1px solid #2d3148; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <div style="display: flex; align-items: center; margin-bottom: 16px;">
            <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #7c3aed, #4f46e5); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; color: white; margin-right: 12px;">{master_name[0].upper()}</div>
            <div>
              <div style="font-size: 16px; font-weight: bold; color: #ffffff;">{master_name}</div>
              {f'<div style="font-size: 13px; color: #8b5cf6;">{master_category}</div>' if master_category else ''}
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <span style="font-size: 13px; color: #6b7280;">Телефон: </span>
            <a href="tel:{master_phone}" style="font-size: 14px; color: #34d399; font-weight: bold; text-decoration: none;">{master_phone}</a>
          </div>
          {f'<div style="background: #0f1117; border-radius: 8px; padding: 12px; font-size: 14px; color: #d1d5db; line-height: 1.5;">{message}</div>' if message else ''}
        </div>

        <a href="{cabinet_url}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-size: 14px; font-weight: bold;">
          Смотреть все отклики →
        </a>
      </div>
      <div style="padding: 16px 32px; border-top: 1px solid #1f2937;">
        <p style="margin: 0; color: #4b5563; font-size: 12px;">Это письмо отправлено автоматически. Войдите в личный кабинет по номеру телефона, указанному при создании заявки.</p>
      </div>
    </div>
    """

    msg.attach(MIMEText(html, 'html', 'utf-8'))

    with smtplib.SMTP_SSL(smtp_host, 465) as server:
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, to_email, msg.as_string())


def handler(event: dict, context) -> dict:
    """Отклики мастеров на заявки заказчиков с email-уведомлением."""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': HEADERS, 'body': ''}

    method = event.get('httpMethod')

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        order_id = body.get('order_id')
        master_name = body.get('master_name', '').strip()
        master_phone = body.get('master_phone', '').strip()
        master_category = body.get('master_category', '').strip()
        message = body.get('message', '').strip()

        master_id = body.get('master_id')

        if not all([order_id, master_name, master_phone]):
            return {
                'statusCode': 400,
                'headers': HEADERS,
                'body': json.dumps({'error': 'Заполните все обязательные поля'})
            }

        conn = get_conn()
        cur = conn.cursor()

        if master_id:
            cur.execute("SELECT balance FROM masters WHERE id = %s", (int(master_id),))
            master = cur.fetchone()
            if not master or master['balance'] < 1:
                cur.close()
                conn.close()
                return {
                    'statusCode': 402,
                    'headers': HEADERS,
                    'body': json.dumps({'error': 'Недостаточно откликов. Пополните баланс.', 'no_balance': True})
                }

        cur.execute(
            "SELECT title, contact_email FROM orders WHERE id = %s",
            (int(order_id),)
        )
        order = cur.fetchone()

        cur.execute(
            "INSERT INTO responses (order_id, master_name, master_phone, master_category, message, master_id) "
            "VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
            (int(order_id), master_name, master_phone, master_category, message, int(master_id) if master_id else None)
        )
        response_id = cur.fetchone()['id']

        if master_id:
            cur.execute("UPDATE masters SET balance = balance - 1 WHERE id = %s", (int(master_id),))
            cur.execute(
                "INSERT INTO master_transactions (master_id, type, amount, description, order_id) VALUES (%s, 'spend', 1, %s, %s)",
                (int(master_id), f"Отклик на заявку #{order_id}", response_id)
            )

        conn.commit()
        cur.close()
        conn.close()

        if order and order['contact_email']:
            try:
                send_email(
                    to_email=order['contact_email'],
                    order_title=order['title'],
                    master_name=master_name,
                    master_phone=master_phone,
                    master_category=master_category,
                    message=message,
                    order_id=int(order_id)
                )
            except Exception:
                pass

        return {
            'statusCode': 200,
            'headers': HEADERS,
            'body': json.dumps({'success': True, 'response_id': response_id})
        }

    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        order_id = params.get('order_id')

        conn = get_conn()
        cur = conn.cursor()

        if order_id:
            cur.execute(
                "SELECT id, order_id, master_name, master_phone, master_category, message, created_at "
                "FROM responses WHERE order_id = %s ORDER BY created_at DESC",
                (int(order_id),)
            )
        else:
            cur.execute(
                "SELECT id, order_id, master_name, master_phone, master_category, message, created_at "
                "FROM responses ORDER BY created_at DESC LIMIT 100"
            )

        rows = cur.fetchall()
        cur.close()
        conn.close()

        responses = [
            {
                'id': r['id'],
                'order_id': r['order_id'],
                'master_name': r['master_name'],
                'master_phone': r['master_phone'],
                'master_category': r['master_category'],
                'message': r['message'],
                'created_at': r['created_at'].isoformat() if r['created_at'] else None,
            }
            for r in rows
        ]

        return {
            'statusCode': 200,
            'headers': HEADERS,
            'body': json.dumps({'responses': responses}, ensure_ascii=False)
        }

    return {'statusCode': 405, 'headers': HEADERS, 'body': json.dumps({'error': 'Method not allowed'})}