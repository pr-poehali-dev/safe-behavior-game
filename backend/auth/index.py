"""Регистрация и вход. action=register|login в теле запроса"""
import json, os, hashlib, secrets
import psycopg2

SCHEMA = "t_p1187654_safe_behavior_game"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def make_token(user_id: int, username: str) -> str:
    raw = f"{user_id}:{username}:{secrets.token_hex(8)}"
    return hashlib.sha256(raw.encode()).hexdigest()[:32] + str(user_id)

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    body = json.loads(event.get("body") or "{}")
    action = body.get("action") or "login"
    username = (body.get("username") or "").strip()
    password = body.get("password") or ""

    if not username or not password:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Введите имя и пароль"})}
    if len(username) < 2 or len(username) > 30:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Имя: от 2 до 30 символов"})}
    if len(password) < 4:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Пароль: минимум 4 символа"})}

    pw_hash = hash_password(password)
    conn = get_conn()
    cur = conn.cursor()

    if action == "register":
        try:
            cur.execute(
                f"INSERT INTO {SCHEMA}.users (username, password_hash) VALUES (%s, %s) RETURNING id",
                (username, pw_hash)
            )
            user_id = cur.fetchone()[0]
            cur.execute(f"INSERT INTO {SCHEMA}.scores (user_id) VALUES (%s)", (user_id,))
            conn.commit()
            token = make_token(user_id, username)
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"id": user_id, "username": username, "token": token})}
        except Exception as e:
            conn.rollback()
            if "unique" in str(e).lower():
                return {"statusCode": 409, "headers": CORS, "body": json.dumps({"error": "Это имя уже занято"})}
            raise
        finally:
            conn.close()
    else:
        cur.execute(
            f"SELECT id FROM {SCHEMA}.users WHERE username=%s AND password_hash=%s",
            (username, pw_hash)
        )
        row = cur.fetchone()
        conn.close()
        if not row:
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Неверное имя или пароль"})}
        user_id = row[0]
        token = make_token(user_id, username)
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"id": user_id, "username": username, "token": token})}