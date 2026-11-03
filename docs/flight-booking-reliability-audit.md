# Flight booking reliability audit

## Implemented fixes
- The live-flight search selection previously saved an unrelated storage key without navigating; it now opens the existing Duffel checkout with the exact offer ID.
- Captured hydration state before deferred React state updates: saved passenger details previously disappeared on refresh because the updater read an already-mutated ref.
- Removed delayed draft writes; saved all traveller/contact fields in tab-scoped storage with guarded writes, inactivity expiry, and explicit cancellation cleanup. Rebind passenger IDs to fresh Duffel IDs without losing names.
- Payment recovery is stored separately from passenger details, and can reconcile by the original cryptographic attempt ID after a lost response, even if the offer expires.
- Deduplicated active offer requests without caching settled checkout fares; load the Duffel card component only when payment is reached.
- Revalidate before entering payment and before card authentication, while preserving traveller inputs. Require reviewed amount and currency independently on the server.
- Add synchronous payment-submission guards, reset failed authentication state, and offer secure-form retries.
- Never automatically repeat an order-creation request after a transport failure. Pending/unknown payments show status recovery rather than another pay button.
- Remove generic order status as payment evidence; require an airline reference with explicit paid evidence or an authoritative electronic ticket, excluding pending/failed outcomes.
- Check an existing attempt before live offer revalidation, preventing expired offers from hiding previous payment results. Reject duplicate passenger IDs.
- Recover orders through cursor pagination, retaining the next cursor across checks. Report database synchronization failures as pending rather than confirmed.
- Fetch authoritative current orders during signed webhook processing, compare amounts, and only mark events processed after successful writes; unprocessed duplicate deliveries can retry.
- Fix checkout controls hidden beneath the fixed header. No site redesign or provider replacement.

## Verification
- 36 focused Vitest tests passed across passenger draft retention/expiry/cleanup, itinerary scope, airport-local timestamps, expired cached offers, request deduplication/cancellation, price validation, and payment recovery/state.
- Guest browser check used real JFK–LAX offers for 3 December 2026: 185 selectable flights, exact selection to checkout, traveller entry, review/back, refresh, payment/back, cancellation cleanup. Duffel card iframe loaded nine real inputs. No browser runtime errors. Mobile check at 390×844 had no horizontal overflow.
- Deployed order creation, reconciliation, and webhook functions. Live requests confirmed missing terms and missing payment are rejected before order creation; unsigned webhook rejected with 401.
- Deployed database has a unique partial index on duffel_attempt_id, protecting concurrent inserts for the same attempt.
- Latest preview build signal: OK.

## Unverified / limitations
- No paid order was created: live charges, actual bank 3DS interruption, signed webhook delivery, ticket issuance and simultaneous paid bookings require approved payment-testing arrangements. Unit coverage is not proof of those live outcomes.
- Authenticated path: UNVERIFIED; guest search-to-payment was verified. Existing owner/admin permissions were not redesigned.
- Payment frame fields come from Duffel; no attempt was made to modify cross-origin billing rules.
- No guarantee of a faster provider response; initial payment module loading and duplicate requests were improved without replacing APIs.
- Prior unrelated SEO work remains outside this audit.