import json
import os
import smtplib
import ssl
import psycopg2
from psycopg2.extras import RealDictCursor
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
}

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'], cursor_factory=RealDictCursor)


def send_new_order_email(to_email: str, master_name: str, order_title: str, order_category: str, order_city: str, order_description: str, budget, order_id: int):
    """Уведомление мастеру о новой заявке в его категории и городе."""
    host = os.environ['SMTP_HOST']
    port = int(os.environ['SMTP_PORT'])
    user = os.environ['SMTP_USER']
    pw = os.environ['SMTP_PASS']

    orders_url = 'https://handyman.poehali.dev/orders'
    budget_text = f"до {int(budget):,} ₽".replace(",", " ") if budget else "не указан"

    msg = MIMEMultipart('alternative')
    msg['Subject'] = f'Новая заявка по вашей категории — {order_title}'
    msg['From'] = f'HandyMan <{user}>'
    msg['To'] = to_email

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0f1117; color: #ffffff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 32px 32px 24px;">
        <h1 style="margin: 0; font-size: 22px; color: #ffffff;">⚡ HandyMan</h1>
        <p style="margin: 8px 0 0; color: #c4b5fd; font-size: 14px;">Маркетплейс бытовых услуг</p>
      </div>
      <div style="padding: 32px;">
        <h2 style="margin: 0 0 8px; font-size: 20px; color: #ffffff;">Привет, {master_name}!</h2>
        <p style="margin: 0 0 24px; color: #9ca3af; font-size: 14px;">В вашем городе появилась новая заявка по вашей специализации.</p>

        <div style="background: #1a1d27; border: 1px solid #2d3148; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px; font-size: 16px; color: #ffffff;">{order_title}</h3>
          <div style="margin-bottom: 8px;">
            <span style="font-size: 12px; color: #6b7280;">Категория: </span>
            <span style="font-size: 13px; color: #a78bfa; font-weight: bold;">{order_category}</span>
          </div>
          <div style="margin-bottom: 8px;">
            <span style="font-size: 12px; color: #6b7280;">Город: </span>
            <span style="font-size: 13px; color: #e5e7eb;">{order_city}</span>
          </div>
          <div style="margin-bottom: 8px;">
            <span style="font-size: 12px; color: #6b7280;">Бюджет: </span>
            <span style="font-size: 13px; color: #34d399; font-weight: bold;">{budget_text}</span>
          </div>
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #2d3148;">
            <p style="margin: 0; font-size: 13px; color: #d1d5db; line-height: 1.5;">{order_description[:200]}{'...' if len(order_description) > 200 else ''}</p>
          </div>
        </div>

        <a href="{orders_url}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-size: 14px; font-weight: bold;">
          Откликнуться на заявку →
        </a>
        <p style="margin: 16px 0 0; font-size: 12px; color: #4b5563;">Отклики бесплатные — токены списываются только когда заказчик выбирает вас исполнителем.</p>
      </div>
      <div style="padding: 16px 32px; border-top: 1px solid #1f2937;">
        <p style="margin: 0; color: #4b5563; font-size: 12px;">Вы получаете это письмо как зарегистрированный мастер HandyMan. Войдите в <a href="https://handyman.poehali.dev/master" style="color: #7c3aed;">кабинет мастера</a> для управления уведомлениями.</p>
      </div>
    </div>
    """

    msg.attach(MIMEText(f'Новая заявка: {order_title} ({order_category}, {order_city}). Перейдите на {orders_url} чтобы откликнуться.', 'plain'))
    msg.attach(MIMEText(html, 'html', 'utf-8'))

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
        _urllib.urlopen(_req, timeout=3)
    except Exception:
        pass


def notify_masters(category: str, city: str, order_title: str, order_description: str, budget, order_id: int):
    """Находит мастеров с совпадающей категорией и городом и рассылает уведомления."""
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT name, email, phone FROM {SCHEMA}.masters WHERE category = %s AND city = %s",
            (category, city)
        )
        masters = cur.fetchall()
        cur.close()
        conn.close()

        for master in masters:
            if master['email']:
                try:
                    send_new_order_email(
                        to_email=master['email'],
                        master_name=master['name'],
                        order_title=order_title,
                        order_category=category,
                        order_city=city,
                        order_description=order_description,
                        budget=budget,
                        order_id=order_id,
                    )
                except Exception:
                    pass
            # Push-уведомление мастеру о новой заявке
            if master['phone']:
                send_push(
                    phone=master['phone'],
                    title='Новая заявка в вашем городе',
                    body=f'{order_title} — {category}',
                    url='/orders'
                )
    except Exception:
        pass


def handler(event: dict, context) -> dict:
    """Создание и получение заявок от заказчиков с фильтрацией по городу."""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': HEADERS, 'body': ''}

    method = event.get('httpMethod')

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        title = body.get('title', '').strip()
        description = body.get('description', '').strip()
        category = body.get('category', '').strip()
        city = body.get('city', '').strip()
        budget = body.get('budget')
        contact_name = body.get('contact_name', '').strip()
        contact_phone = body.get('contact_phone', '').strip()
        contact_email = body.get('contact_email', '').strip()

        if not all([title, description, category, city, contact_name, contact_phone]):
            return {
                'statusCode': 400,
                'headers': HEADERS,
                'body': json.dumps({'error': 'Заполните все обязательные поля'})
            }

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.orders (title, description, category, city, budget, contact_name, contact_phone, contact_email) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (title, description, category, city, int(budget) if budget else None,
             contact_name, contact_phone, contact_email)
        )
        order_id = cur.fetchone()['id']
        conn.commit()
        cur.close()
        conn.close()

        # Уведомляем мастеров с совпадающей категорией и городом
        notify_masters(category, city, title, description, budget, order_id)

        return {
            'statusCode': 200,
            'headers': HEADERS,
            'body': json.dumps({'success': True, 'order_id': order_id})
        }

    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        city_filter = params.get('city', '').strip()
        master_id = params.get('master_id', '').strip()
        master_phone = params.get('master_phone', '').strip()
        tab = params.get('tab', 'all').strip()

        conn = get_conn()
        cur = conn.cursor()

        if tab == 'active' and master_id:
            cur.execute(
                f"SELECT o.id, o.title, o.description, o.category, o.city, o.budget, o.contact_name, o.contact_phone, o.status, o.created_at "
                f"FROM {SCHEMA}.orders o "
                f"JOIN {SCHEMA}.responses r ON r.order_id = o.id "
                "WHERE r.master_id = %s AND o.status = 'in_progress' "
                "ORDER BY o.created_at DESC LIMIT 50",
                (int(master_id),)
            )
        elif tab == 'done' and master_id:
            cur.execute(
                f"SELECT o.id, o.title, o.description, o.category, o.city, o.budget, o.contact_name, o.contact_phone, o.status, o.created_at "
                f"FROM {SCHEMA}.orders o "
                f"JOIN {SCHEMA}.responses r ON r.order_id = o.id "
                "WHERE r.master_id = %s AND o.status = 'done' "
                "ORDER BY o.created_at DESC LIMIT 50",
                (int(master_id),)
            )
        elif city_filter:
            cur.execute(
                f"SELECT id, title, description, category, city, budget, contact_name, contact_phone, status, created_at "
                f"FROM {SCHEMA}.orders WHERE city = %s AND status = 'new' ORDER BY created_at DESC LIMIT 50",
                (city_filter,)
            )
        else:
            cur.execute(
                f"SELECT id, title, description, category, city, budget, contact_name, contact_phone, status, created_at "
                f"FROM {SCHEMA}.orders WHERE status = 'new' ORDER BY created_at DESC LIMIT 50"
            )

        rows = cur.fetchall()
        cur.close()
        conn.close()

        def normalize_phone(p):
            return ''.join(filter(str.isdigit, p or ''))[-10:]

        orders = [
            {
                'id': r['id'],
                'title': r['title'],
                'description': r['description'],
                'category': r['category'],
                'city': r['city'] or '',
                'budget': r['budget'],
                'contact_name': r['contact_name'],
                'status': r['status'],
                'created_at': r['created_at'].isoformat() if r['created_at'] else None,
                'is_own': bool(master_phone and normalize_phone(master_phone) == normalize_phone(r.get('contact_phone', ''))),
            }
            for r in rows
        ]

        return {
            'statusCode': 200,
            'headers': HEADERS,
            'body': json.dumps({'orders': orders}, ensure_ascii=False)
        }

    return {'statusCode': 405, 'headers': HEADERS, 'body': json.dumps({'error': 'Method not allowed'})}