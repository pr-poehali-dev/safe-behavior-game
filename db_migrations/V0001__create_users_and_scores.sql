CREATE TABLE IF NOT EXISTS t_p1187654_safe_behavior_game.users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p1187654_safe_behavior_game.scores (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES t_p1187654_safe_behavior_game.users(id),
  total_points INTEGER DEFAULT 0,
  quiz_correct INTEGER DEFAULT 0,
  levels_completed INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);
