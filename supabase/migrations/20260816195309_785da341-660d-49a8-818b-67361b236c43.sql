ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS duffel_offer_id text,
  ADD COLUMN IF NOT EXISTS duffel_order_id text,
  ADD COLUMN IF NOT EXISTS duffel_booking_reference text,
  ADD COLUMN IF NOT EXISTS payment_provider text,
  ADD COLUMN IF NOT EXISTS live_mode boolean;

CREATE UNIQUE INDEX IF NOT EXISTS bookings_duffel_order_id_key ON public.bookings (duffel_order_id) WHERE duffel_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS bookings_duffel_offer_id_idx ON public.bookings (duffel_offer_id);
CREATE INDEX IF NOT EXISTS bookings_contact_email_idx ON public.bookings (contact_email);