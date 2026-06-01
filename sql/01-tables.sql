-- ==============================================================
-- PASSO 1: Criação das Tabelas
-- Cole e execute ESTE BLOCO PRIMEIRO no Turso Shell
-- ==============================================================

CREATE TABLE IF NOT EXISTS users (
  id                    TEXT    PRIMARY KEY,
  name                  TEXT    NOT NULL,
  email                 TEXT    NOT NULL,
  password_hash         TEXT    NOT NULL,
  role                  TEXT    NOT NULL DEFAULT 'user',
  avatar_url            TEXT,
  department            TEXT,
  phone                 TEXT,
  whatsapp_opt_in       INTEGER NOT NULL DEFAULT 0,
  is_active             INTEGER NOT NULL DEFAULT 1,
  total_points          INTEGER NOT NULL DEFAULT 0,
  is_prediction_locked  INTEGER NOT NULL DEFAULT 0,
  predictions_locked_at INTEGER,
  created_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at            INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users(email);

CREATE TABLE IF NOT EXISTS matches (
  id              TEXT    PRIMARY KEY,
  phase           TEXT    NOT NULL,
  group_name      TEXT,
  match_number    INTEGER NOT NULL,
  home_team       TEXT    NOT NULL,
  away_team       TEXT    NOT NULL,
  home_flag       TEXT,
  away_flag       TEXT,
  home_score      INTEGER,
  away_score      INTEGER,
  match_result    TEXT,
  match_date      INTEGER NOT NULL,
  venue           TEXT,
  city            TEXT,
  status          TEXT    NOT NULL DEFAULT 'upcoming',
  elapsed         INTEGER,
  is_scored       INTEGER NOT NULL DEFAULT 0,
  api_fixture_id  INTEGER,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS matches_status_idx      ON matches(status);
CREATE INDEX IF NOT EXISTS matches_date_idx        ON matches(match_date);
CREATE INDEX IF NOT EXISTS matches_api_fixture_idx ON matches(api_fixture_id);

CREATE TABLE IF NOT EXISTS predictions (
  id               TEXT    PRIMARY KEY,
  user_id          TEXT    NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  match_id         TEXT    NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  home_score       INTEGER NOT NULL,
  away_score       INTEGER NOT NULL,
  points           INTEGER NOT NULL DEFAULT 0,
  points_breakdown TEXT,
  is_scored        INTEGER NOT NULL DEFAULT 0,
  created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at       INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE UNIQUE INDEX IF NOT EXISTS predictions_user_match_idx ON predictions(user_id, match_id);
CREATE INDEX IF NOT EXISTS predictions_user_idx  ON predictions(user_id);
CREATE INDEX IF NOT EXISTS predictions_match_idx ON predictions(match_id);

CREATE TABLE IF NOT EXISTS tournament_predictions (
  id           TEXT    PRIMARY KEY,
  user_id      TEXT    NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  champion     TEXT    NOT NULL,
  runner_up    TEXT    NOT NULL,
  top_scorer   TEXT    NOT NULL,
  bonus_points INTEGER NOT NULL DEFAULT 0,
  is_scored    INTEGER NOT NULL DEFAULT 0,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS settings (
  key        TEXT    PRIMARY KEY,
  value      TEXT,
  label      TEXT,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS notifications_log (
  id       TEXT    PRIMARY KEY,
  user_id  TEXT    REFERENCES users(id)   ON DELETE SET NULL,
  match_id TEXT    REFERENCES matches(id) ON DELETE SET NULL,
  type     TEXT    NOT NULL,
  phone    TEXT    NOT NULL,
  message  TEXT    NOT NULL,
  status   TEXT    NOT NULL,
  error    TEXT,
  sent_at  INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS notif_user_idx ON notifications_log(user_id);
CREATE INDEX IF NOT EXISTS notif_type_idx ON notifications_log(type);
CREATE INDEX IF NOT EXISTS notif_sent_idx ON notifications_log(sent_at);

-- Confirmar tabelas criadas:
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
