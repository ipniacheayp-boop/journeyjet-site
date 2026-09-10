ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS duffel_attempt_id uuid;

CREATE UNIQUE INDEX IF NOT EXISTS bookings_duffel_attempt_id_key
  ON public.bookings (duffel_attempt_id)
  WHERE duffel_attempt_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS bookings_duffel_reconciliation_idx
  ON public.bookings (payment_status, updated_at)
  WHERE booking_type = 'flight' AND payment_provider IN ('duffel_card', 'duffel_balance');

ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_payment_status_check
  CHECK (payment_status IN (
    'pending', 'processing', 'payment_pending', 'unknown', 'succeeded', 'paid',
    'failed', 'cancelled', 'amount_mismatch', 'refunded'
  )) NOT VALID;
ALTER TABLE public.bookings VALIDATE CONSTRAINT bookings_payment_status_check;