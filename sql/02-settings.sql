-- ==============================================================
-- PASSO 2: Configurações iniciais do sistema
-- Cole e execute APÓS o passo 01
-- ==============================================================

INSERT OR IGNORE INTO settings (key, value, label) VALUES
  ('champion',             NULL, 'Campeão da Copa'),
  ('runner_up',            NULL, 'Vice-campeão'),
  ('top_scorer',           NULL, 'Artilheiro'),
  ('last_sync_at',         NULL, 'Último sync API-Football'),
  ('last_sync_status',     NULL, 'Status do sync'),
  ('last_sync_plan_error', '0',  'Erro de plano API');

-- Confirmar:
SELECT * FROM settings;
