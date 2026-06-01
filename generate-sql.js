const XLSX   = require('xlsx')
const crypto = require('crypto')
const fs     = require('fs')

const HASH        = '$2a$12$sNhU6H.SBtJBqrFQKZsaS.zZDp8yxVMf88F583kGS0dqRuPX7.yj.'
const ADMIN_EMAIL = 'gppereira@vendemmia.com.br'

const DEPT_MAP = {
  'Administrativo - Vila Olímpia':      'Administrativo',
  'Comercial - Navegantes CD01':        'Comercial',
  'Comercial - Vila Olímpia':           'Comercial',
  'Compras - Itapevi':                  'Compras',
  'Compras - Navegantes CD01':          'Compras',
  'Compras - Navegantes CD02':          'Compras',
  'Compras - Vila Olímpia':             'Compras',
  'Controladoria - Vila Olímpia':       'Controladoria',
  'Contábil - Vila Olímpia':            'Contábil',
  'Fiscal - Navegantes CD02':           'Fiscal',
  'Fiscal - Vila Olímpia':              'Fiscal',
  'Jurídico - Vila Olímpia':            'Jurídico',
  'Logística - Vila Olímpia':           'Logística',
  'Marketing - Vila Olímpia':           'Marketing',
  'Não informado':                      null,
  'Operacional - Garuva':               'Operacional',
  'Operacional - Itapevi':              'Operacional',
  'Operacional - Navegantes CD01':      'Operacional',
  'Operacional - Navegantes CD02':      'Operacional',
  'Operações - Vila Olímpia':           'Operações',
  'Operações 01 - Vila Olímpia':        'Operações',
  'Operações 02 - Vila Olímpia':        'Operações',
  'Operações 03 - Vila Olímpia':        'Operações',
  'Projetos - Itapevi':                 'Projetos',
  'Projetos - Navegantes CD02':         'Projetos',
  'Projetos/Qualidade - Vila Olímpia':  'Projetos',
  'RH - Itapevi':                       'RH',
  'RH - Navegantes CD01':               'RH',
  'RH - Navegantes CD02':               'RH',
  'RH - Vila Olímpia':                  'RH',
  'Sócio Diretor - Navegantes CD01':    'Diretoria',
  'Sócio Diretor - Vila Olímpia':       'Diretoria',
  'TI - Vila Olímpia':                  'TI',
  'Tesouraria - Vila Olímpia':          'Tesouraria',
  'Transporte - Itapevi':               'Transporte',
  'Transporte - Navegantes CD01':       'Transporte',
}

function toTitleCase(str) {
  const lower = ['de','da','do','das','dos','e','em','a','o','as','os','para','com','por','no','na','nos','nas']
  return str.toLowerCase().split(' ')
    .map((w, i) => (i > 0 && lower.includes(w)) ? w : w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function s(v) {
  if (v === null || v === undefined) return 'NULL'
  return "'" + String(v).replace(/'/g, "''") + "'"
}

const wb   = XLSX.readFile('pessoas.xlsx')
const ws   = wb.Sheets[wb.SheetNames[0]]
const data = XLSX.utils.sheet_to_json(ws, { defval: '' })

// Filtra emails inválidos e duplicados
const seen  = new Set()
const valid = data.filter(row => {
  const email = (row['Informações de trabalho - E-mail profissional'] || '').trim().toLowerCase()
  if (!email || email === 'não informado' || seen.has(email)) return false
  seen.add(email)
  return true
})

console.log('Válidos:', valid.length, '| Descartados:', data.length - valid.length)

// Gera rows de INSERT
const rows = valid.map(row => {
  const name    = toTitleCase(row['Nome do colaborador'])
  const email   = (row['Informações de trabalho - E-mail profissional'] || '').trim().toLowerCase()
  const deptRaw = row['Informações de trabalho - Departamento'] || ''
  const dept    = DEPT_MAP.hasOwnProperty(deptRaw) ? DEPT_MAP[deptRaw] : deptRaw
  const role    = email === ADMIN_EMAIL ? 'admin' : 'user'
  const id      = crypto.randomUUID()
  return '(' + [s(id), s(name), s(email), s(HASH), s(role), dept ? s(dept) : 'NULL'].join(',') + ')'
})

const now = new Date().toISOString()

let sql = `-- ==============================================================
-- Bolão Copa 2026 | Vendemmia — Setup Completo do Banco Turso
-- Gerado em: ${now}
-- Total de colaboradores: ${valid.length}
-- Senha padrão (todos): Vendemmia@2026
-- Admin: ${ADMIN_EMAIL}
-- ==============================================================

PRAGMA foreign_keys = ON;

-- ─────────────────────────────────────────────────────────────
-- TABELA: users
-- ─────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────
-- TABELA: matches
-- ─────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────
-- TABELA: predictions
-- ─────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────
-- TABELA: tournament_predictions
-- ─────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────
-- TABELA: settings
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT    PRIMARY KEY,
  value      TEXT,
  label      TEXT,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ─────────────────────────────────────────────────────────────
-- TABELA: notifications_log
-- ─────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────
-- CONFIGURAÇÕES INICIAIS DO SISTEMA
-- ─────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO settings (key, value, label) VALUES
  ('champion',             NULL, 'Campeão da Copa'),
  ('runner_up',            NULL, 'Vice-campeão'),
  ('top_scorer',           NULL, 'Artilheiro'),
  ('last_sync_at',         NULL, 'Último sync API-Football'),
  ('last_sync_status',     NULL, 'Status do sync'),
  ('last_sync_plan_error', '0',  'Erro de plano API');

-- ─────────────────────────────────────────────────────────────
-- COLABORADORES (${valid.length} usuários)
-- Senha padrão para todos: Vendemmia@2026
-- O usuário ${ADMIN_EMAIL} recebe role='admin'
-- Os demais recebem role='user'
-- ─────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO users (id, name, email, password_hash, role, department)
VALUES
`

sql += rows.join(',\n') + ';\n\n-- FIM DO SETUP — Execute este arquivo no Turso Shell\n'

fs.writeFileSync('setup-database.sql', sql, 'utf8')
const size = (fs.statSync('setup-database.sql').size / 1024).toFixed(1)
console.log('Arquivo gerado: setup-database.sql (' + size + ' KB)')
console.log('Total usuarios:', valid.length)
