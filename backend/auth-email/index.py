import json
import os
import random
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import psycopg2
import psycopg2.extras

HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
}

def get_conn():
    schema = os.environ.get("MAIN_DB_SCHEMA", "public")
    conn = psycopg2.connect(os.environ["DATABASE_URL"], options=f"-c search_path={schema}")
    conn.autocommit = True
    return conn

def send_email(to_email: str, code: str):
    """Отправляет письмо с кодом подтверждения через Яндекс SMTP."""
    host = os.environ["SMTP_HOST"]
    port = int(os.environ["SMTP_PORT"])
    user = os.environ["SMTP_USER"]
    password = os.environ["SMTP_PASS"]

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"{code} — код входа в HandyMan"
    msg["From"] = f"HandyMan <{user}>"
    msg["To"] = to_email

    text = f"Ваш код входа: {code}\n\nКод действителен 10 минут."
    html = f"""
    <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:32px;background:#0a0d16;border-radius:16px;">
      <h2 style="color:#fff;margin-bottom:8px;">Вход в кабинет мастера</h2>
      <p style="color:#9ca3af;font-size:14px;margin-bottom:24px;">Ваш одноразовый код:</p>
      <div style="background:#1e1b4b;border:1px solid #4c1d95;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
        <span style="font-size:40px;font-weight:700;letter-spacing:12px;color:#a78bfa;">{code}</span>
      </div>
      <p style="color:#6b7280;font-size:12px;">Код действителен 10 минут. Если вы не запрашивали код — проигнорируйте письмо.</p>
    </div>
    """
    msg.attach(MIMEText(text, "plain"))
    msg.attach(MIMEText(html, "html"))

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(host, port, context=context) as server:
        server.login(user, password)
        server.sendmail(user, to_email, msg.as_string())


def handler(event: dict, context) -> dict:
    """Отправка и проверка кода авторизации по email для мастеров."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # POST /send — отправить код на email
    if method == "POST" and body.get("action") == "send":
        email = (body.get("email") or "").strip().lower()
        if not email:
            cur.close(); conn.close()
            return {"statusCode": 400, "headers": HEADERS, "body": json.dumps({"error": "email обязателен"})}

        # Проверяем, есть ли мастер с таким email
        cur.execute("SELECT id, name FROM masters WHERE LOWER(email) = %s", (email,))
        master = cur.fetchone()
        if not master:
            cur.close(); conn.close()
            return {"statusCode": 404, "headers": HEADERS, "body": json.dumps({"error": "Мастер с таким email не найден"})}

        # Генерируем код
        code = str(random.randint(100000, 999999))

        # Инвалидируем старые коды
        cur.execute("UPDATE auth_codes SET used = true WHERE email = %s AND used = false", (email,))

        # Сохраняем новый
        cur.execute(
            "INSERT INTO auth_codes (email, code) VALUES (%s, %s)",
            (email, code)
        )

        # Отправляем письмо
        send_email(email, code)

        cur.close(); conn.close()
        return {"statusCode": 200, "headers": HEADERS, "body": json.dumps({"success": True, "name": master["name"]})}

    # POST /verify — проверить код
    if method == "POST" and body.get("action") == "verify":
        email = (body.get("email") or "").strip().lower()
        code = (body.get("code") or "").strip()
        if not email or not code:
            cur.close(); conn.close()
            return {"statusCode": 400, "headers": HEADERS, "body": json.dumps({"error": "email и code обязательны"})}

        cur.execute(
            "SELECT id FROM auth_codes WHERE email = %s AND code = %s AND used = false AND expires_at > now()",
            (email, code)
        )
        row = cur.fetchone()
        if not row:
            cur.close(); conn.close()
            return {"statusCode": 400, "headers": HEADERS, "body": json.dumps({"error": "Неверный или устаревший код"})}

        # Помечаем код использованным
        cur.execute("UPDATE auth_codes SET used = true WHERE id = %s", (row["id"],))

        # Получаем телефон мастера для совместимости с существующей авторизацией
        cur.execute("SELECT phone FROM masters WHERE LOWER(email) = %s", (email,))
        master = cur.fetchone()
        cur.close(); conn.close()

        return {"statusCode": 200, "headers": HEADERS, "body": json.dumps({"success": True, "phone": master["phone"]})}

    cur.close(); conn.close()
    return {"statusCode": 400, "headers": HEADERS, "body": json.dumps({"error": "Неизвестный action"})}
