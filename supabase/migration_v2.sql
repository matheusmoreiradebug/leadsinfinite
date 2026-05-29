-- ═══════════════════════════════════════════════════════════════
--  Infinite Leads v2 — Migration
--  Rode no Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- 1. Adiciona colunas de status e controle na tabela leads
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS status              TEXT NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS last_interaction_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS assigned_at         TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS closed_at           TIMESTAMPTZ;

-- Índices de performance
CREATE INDEX IF NOT EXISTS leads_status_idx           ON leads(status);
CREATE INDEX IF NOT EXISTS leads_last_interaction_idx ON leads(last_interaction_at DESC);

-- 2. Tabela de timeline (eventos do lead)
CREATE TABLE IF NOT EXISTS lead_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id         UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,    -- 'created' | 'status_change' | 'note' | 'assigned'
  content         TEXT,             -- texto da nota ou descrição
  previous_status TEXT,
  new_status      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS lead_events_lead_id_idx   ON lead_events(lead_id);
CREATE INDEX IF NOT EXISTS lead_events_created_at_idx ON lead_events(created_at DESC);

-- 3. Tabela de notas internas
CREATE TABLE IF NOT EXISTS lead_notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id    UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS lead_notes_lead_id_idx ON lead_notes(lead_id);

-- 4. RLS
ALTER TABLE lead_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notes  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_events" ON lead_events;
CREATE POLICY "anon_read_events" ON lead_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "anon_read_notes" ON lead_notes;
CREATE POLICY "anon_read_notes"  ON lead_notes  FOR SELECT USING (true);

-- 5. Popula last_interaction_at para leads existentes
UPDATE leads SET last_interaction_at = created_at WHERE last_interaction_at IS NULL;
UPDATE leads SET assigned_at = created_at WHERE assigned_at IS NULL;
