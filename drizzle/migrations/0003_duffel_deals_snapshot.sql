CREATE TABLE public.duffel_deals_snapshot (
  id text PRIMARY KEY,
  deals jsonb NOT NULL,
  routes_with_offers integer NOT NULL DEFAULT 0,
  fetched_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.duffel_deals_snapshot TO service_role;
ALTER TABLE public.duffel_deals_snapshot ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.duffel_deals_snapshot IS 'Display-only snapshot of Duffel deal listings; checkout always revalidates the offer with Duffel.';