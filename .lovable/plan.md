# Plan: Duffel flight pipeline audit and hardening

## Goal
Make the Tripile flight booking pipeline use Duffel as the source of truth from search through payment, order status, booking record, confirmation, webhook sync, and recovery. Do not introduce Stripe into flight payment logic.

## Current Duffel flow found
- Frontend search results call `duffel-flights-search`, store the selected Duffel offer, then route to `/flight/checkout`.
- Checkout revalidates the selected offer through `duffel-offer-get`, collects passenger details, renders Duffel’s card component, runs 3DS, then calls `duffel-order-create`.
- `duffel-order-create` re-fetches the offer, inserts a provisional `bookings` row, creates a Duffel instant order with card/balance payment, then marks the Tripile booking confirmed.
- `duffel-webhook` receives Duffel order events and updates bookings by `duffel_order_id`.
- `bookings` stores Duffel fields: `duffel_offer_id`, `duffel_order_id`, `duffel_booking_reference`, `payment_provider`, `live_mode`.

## Critical issues to fix
- Duplicate payment/order risk: repeated Pay clicks, retries, two tabs, or network timeouts can insert multiple provisional bookings and submit multiple Duffel order requests for the same offer/payment attempt.
- Timeout ambiguity: if Duffel receives an order request but the edge function times out or loses the response, Tripile can mark the booking failed/cancelled even though Duffel may still be processing or paid.
- Missing reconciliation endpoint: there is no safe backend mechanism to recover stuck `processing`, `pending`, or unknown Duffel flight bookings by querying Duffel.
- Over-eager confirmation: order creation currently treats any successful Duffel order response as immediately confirmed/ticketed, without normalizing delayed/pending order states.
- Webhook state handling is too broad: it can mark orders paid/confirmed on generic order events without strict status/payment-state checks.
- Confirmation page fallback can show fake booking details from only a URL `booking_id`; flight confirmation should come from verified Duffel-backed booking data.
- Admin refund flow is Stripe-only and should explicitly reject Duffel flight refunds/cancellations until a Duffel-verified cancellation/refund path is implemented.

## Implementation
### Backend shared Duffel helpers
- Extend the shared Duffel helper to support:
  - explicit long timeouts for order creation/retrieval,
  - Duffel idempotency headers for order creation,
  - safe order-status normalization,
  - order retrieval by Duffel order ID.

### Database hardening
- Add flight-safe database constraints/indexes:
  - unique in-progress Duffel offer/attempt guard where appropriate,
  - indexes for stuck Duffel bookings and reconciliation,
  - optional status values for `payment_pending` / `unknown` if needed by the existing constraint.
- Keep `booking_status` compatible with the existing enum; use `payment_status` and `booking_details` metadata for Duffel pending/unknown states where enum expansion is unnecessary.

### Duffel order creation
- Add a required server-tracked idempotency key per checkout attempt.
- Reuse an existing in-progress or confirmed booking for the same authenticated/guest attempt instead of inserting another row.
- Send a Duffel idempotency key when creating `/air/orders`.
- Persist order-attempt metadata before calling Duffel.
- On timeout/indeterminate errors, do not mark failed; mark as pending/unknown and return a recoverable response.
- On successful Duffel response, derive Tripile status from actual Duffel order/payment state.
- Verify Duffel amount/currency against the revalidated offer/order before updating the booking.

### Reconciliation function
- Add a `duffel-booking-reconcile` backend function that:
  - accepts a Tripile booking ID or Duffel order ID,
  - authorizes the caller for the booking or allows service/admin use,
  - fetches the authoritative Duffel order,
  - updates Tripile booking/payment status only from verified Duffel state,
  - is safe to call repeatedly for refreshes, retries, webhooks, and stuck bookings.

### Webhook hardening
- Make Duffel webhook updates idempotent and status-aware.
- Do not mark paid/confirmed unless Duffel order/payment state indicates success.
- Preserve pending/processing when Duffel reports delayed confirmation.
- Prevent invalid transitions like cancelled/refunded back to confirmed unless verified and explicitly allowed.

### Frontend checkout recovery
- Generate and persist a checkout attempt ID for the selected offer.
- Disable duplicate payment submission across double-clicks and refreshes.
- Handle `PENDING`, `UNKNOWN`, and timeout responses with a clear “verifying with airline” state and a reconcile retry.
- Do not show confirmed/ticketed unless the backend returns verified confirmed Duffel state.

### Confirmation and My Bookings
- For Duffel flight bookings, display verified Duffel booking reference/order data from the backend/database.
- Remove URL-only fake confirmation fallback for flight bookings.
- Improve My Bookings rendering for Duffel `booking_details.duffel_order` data.

### Refund/cancellation safety
- Update admin refund flow to reject Duffel flight refunds via Stripe.
- If cancellation/refund is requested for a Duffel flight, require a Duffel-specific verified flow or admin review instead of local-only status changes.

## Tests and verification
- Add edge-function tests for:
  - price mismatch,
  - invalid passenger IDs,
  - duplicate idempotency key reuse,
  - timeout/unknown response handling,
  - reconciliation status mapping,
  - webhook pending/succeeded/cancelled behavior,
  - Duffel flight refund rejection in Stripe refund endpoint.
- Use backend function smoke tests where live secrets are available.
- Run targeted frontend checks for checkout state transitions and confirmation rendering.

## Final report
After implementation and tests, provide a concise report covering:
- critical/medium/low issues found,
- files and functions changed,
- Duffel APIs involved,
- payment and booking states tested,
- failure scenarios tested,
- security fixes,
- remaining items requiring real Duffel live dashboard/webhook data.
