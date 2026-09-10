CREATE UNIQUE INDEX IF NOT EXISTS webhook_events_event_id_key
  ON public.webhook_events (event_id);

ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_payment_status_check
  CHECK (payment_status IN (
    'pending', 'processing', 'succeeded', 'paid', 'failed', 'amount_mismatch', 'refunded'
  )) NOT VALID;
ALTER TABLE public.bookings VALIDATE CONSTRAINT bookings_payment_status_check;

UPDATE public.bookings
SET payment_status = 'amount_mismatch',
    booking_details = COALESCE(booking_details, '{}'::jsonb)
      || jsonb_build_object('requiresAdminReview', true, 'reviewReason', 'simulated_payment_method'),
    updated_at = now()
WHERE payment_method IN ('qr', 'upi')
  AND status = 'confirmed'
  AND stripe_payment_intent_id IS NULL;