ALTER TABLE public.webhook_events
  DROP CONSTRAINT IF EXISTS webhook_events_provider_check;

ALTER TABLE public.webhook_events
  ADD CONSTRAINT webhook_events_provider_check
  CHECK (provider IN ('stripe', 'amadeus', 'duffel'));

CREATE UNIQUE INDEX IF NOT EXISTS bookings_duffel_offer_active_key
  ON public.bookings (duffel_offer_id)
  WHERE duffel_offer_id IS NOT NULL
    AND status IN ('pending_payment', 'confirmed');