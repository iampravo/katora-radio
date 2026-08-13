-- =====================================================
-- mera radio — visitor count
-- =====================================================
-- Purpose: a minimal, append-only log of visits, so the top-left corner
-- can show a real visitor count instead of a static/fake number. One row
-- is inserted per unique browser (gated by localStorage client-side —
-- see js/visitor-count.js — so refreshes/repeat visits don't inflate it).
--
-- Same table/project as TripAI's page_visits (see
-- TripAI-Mono/apps/backend-tripai/database/14_create_page_visits.sql) —
-- kept as its own table, scoped to this site, rather than sharing
-- page_visits, so the two sites' counts never mix.
-- =====================================================

CREATE TABLE IF NOT EXISTS mera_radio_visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mera_radio_visits_created_at ON mera_radio_visits(created_at DESC);

-- Row Level Security
--
-- No per-user ownership (it's an anonymous counter, not user data) — only
-- the backend's service-role client should read/write it, matching
-- page_visits' own policy.
ALTER TABLE mera_radio_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to mera radio visits"
ON mera_radio_visits FOR ALL
USING (auth.role() = 'service_role');
