-- Google Trends response cache. Written only by the google-trends Edge Function
-- (service role). Browser clients never read this table directly.

CREATE TABLE IF NOT EXISTS public.google_trends_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key TEXT NOT NULL,
    query TEXT NOT NULL,
    data_type TEXT NOT NULL,
    geo TEXT,
    date_range TEXT,
    response_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS google_trends_cache_cache_key_uidx
    ON public.google_trends_cache (cache_key);

CREATE INDEX IF NOT EXISTS google_trends_cache_expires_at_idx
    ON public.google_trends_cache (expires_at);

CREATE INDEX IF NOT EXISTS google_trends_cache_lookup_idx
    ON public.google_trends_cache (data_type, query, expires_at);

ALTER TABLE public.google_trends_cache ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.google_trends_cache FROM anon, authenticated;

-- Service role bypasses RLS; no public policies on purpose.
