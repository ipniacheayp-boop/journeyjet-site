# Architecture rules

- Keep flight bookings on the existing Duffel card/3DS pipeline; hotel/car payment architecture is separate to prevent cross-provider regressions.
- Store temporary flight passenger drafts only in tab-scoped session storage with expiry and guarded writes; keep payment-recovery capabilities separate from passenger data so interrupted payments remain recoverable.
- Revalidate Duffel offers without persistent price caching; share only active identical offer requests to reduce duplicate calls without trusting stale availability.
- Treat pending/unknown flight payments as recovery-only until authoritative reconciliation; never automatically repeat a money-moving request after a network failure.
- Offer optional hotels inside Duffel checkout using the shared hotel selector, but hand selected hotels to their existing checkout after flight confirmation; never include a hotel charge in Duffel's flight total.