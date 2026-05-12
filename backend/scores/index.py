"""Лидерборд и сохранение очков. action=leaderboard|save в запросе"""
import json, os
import psycopg2

SCHEMA = "t_p1187654_safe_behavior_game"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    qs = event.get("queryStringParameters") or {}
    action = qs.get("action") or "leaderboard"

    conn = get_conn()
    cur = conn.cursor()

    if action == "leaderboard":
        cur.execute(f"""
            SELECT u.username, s.total_points, s.levels_completed, s.quiz_correct
            FROM {SCHEMA}.scores s
            JOIN {SCHEMA}.users u ON u.id = s.user_id
            ORDER BY s.total_points DESC
            LIMIT 20
        """)
        rows = cur.fetchall()
        conn.close()
        result = [{"username": r[0], "total_points": r[1], "levels_completed": r[2], "quiz_correct": r[3]} for r in rows]
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(result)}

    elif action == "save" and method == "POST":
        body = json.loads(event.get("body") or "{}")
        user_id = body.get("user_id")
        total_points = int(body.get("total_points") or 0)
        quiz_correct = int(body.get("quiz_correct") or 0)
        levels_completed = int(body.get("levels_completed") or 0)

        if not user_id:
            conn.close()
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "user_id required"})}

        cur.execute(f"""
            UPDATE {SCHEMA}.scores
            SET total_points=%s, quiz_correct=%s, levels_completed=%s, updated_at=NOW()
            WHERE user_id=%s
        """, (total_points, quiz_correct, levels_completed, user_id))
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    conn.close()
    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}
