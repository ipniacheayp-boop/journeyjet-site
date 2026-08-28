# Repair booking reliability and flight times

## Goal
Make hotel and flight checkout resilient across navigation and network uncertainty, show confirmations only after authoritative backend confirmation, and preserve airline-local flight times.

## Changes
1. **Stop hotel checkout crashes**
   - Normalize selected hotel data before rendering and booking so string/object address variants, absent arrays, and partial provider records cannot throw.
   - Use router navigation instead of a hard page reload when selecting hotels, while keeping a persistent fallback copy of the selected offer.
   - Add a focused checkout-level recovery state so malformed or expired selections return the user to results instead of the global error page.

2. **Preserve checkout progress**
   - Persist hotel/car checkout step, guest/contact details, coupon state, terms state, validated pricing, and selected offer in session storage.
   - Restore that draft after refresh or browser Back/Forward, and clear it only after confirmed booking or an explicit new selection.
   - Make browser history track steps without pushing duplicate history entries on every render.
   - Preserve Duffel traveller/contact/review progress in the same way while an offer remains valid.

3. **Clarify payment and network outcomes**
   - Distinguish definitive declines from unknown/time-out outcomes.
   - For unknown outcomes, retain the booking/attempt identifiers, disable duplicate submission, and provide retryable status reconciliation instead of claiming no payment occurred.
   - Improve payment verification polling so one timer owns the loop and transient network failures remain recoverable.

4. **Harden ticket confirmation**
   - Never show a confirmed/ticketed state from browser storage alone.
   - Load confirmation details from an authorized backend verification response, retain pending records until verification completes, and show the real provider/airline reference when available.
   - Keep confirmed bookings accessible through My Bookings instead of depending on one-time session data.

5. **Fix flight timestamps**
   - Centralize airport-local date/time formatting that preserves Duffel’s supplied wall-clock time and does not reinterpret it in the browser timezone.
   - Apply it consistently to search cards, details, checkout, ticketed itinerary, and confirmation views; continue using absolute timestamps only for expiry/countdown logic.

## Validation
- Exercise hotel select → guest details → payment → browser Back/Forward and refresh with a representative hotel result.
- Exercise Duffel checkout navigation restoration, failed network/unknown outcome, reconciliation, and confirmed ticket display.
- Verify identical displayed departure/arrival times under at least two browser timezones.
- Run focused unit tests for local timestamp formatting and relevant booking-state helpers.

## Technical details
- Keep flight payments exclusively on the Duffel customer-card/order pipeline; hotel/car payments remain on their existing payment path.
- Treat provider price, payment state, and booking state as server-authoritative; browser storage is recovery UI state only.
- Do not alter search providers, routes, pricing formulas, or visual design.
