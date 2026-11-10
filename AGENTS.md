# Architecture rules

- Vercel must serve existing static files and prerendered pages before falling back to the Vite entry document, so direct authentication links work without replacing SEO assets.

- Keep flight bookings on the existing Duffel card/3DS pipeline; hotel/car payment architecture is separate to prevent cross-provider regressions.
- Store temporary flight passenger drafts only in tab-scoped session storage with expiry and guarded writes; keep payment-recovery capabilities separate from passenger data so interrupted payments remain recoverable.
- Revalidate Duffel offers without persistent price caching; share only active identical offer requests to reduce duplicate calls without trusting stale availability.
- Treat pending/unknown flight payments as recovery-only until authoritative reconciliation; never automatically repeat a money-moving request after a network failure.
- Offer optional hotels inside Duffel checkout using the shared hotel selector and embed the existing hotel payment stage after authoritative flight confirmation; itemize hotel charges without including them in Duffel's flight total to keep providers isolated.- Hotel display prices come only from SerpApi google_hotels matched to Places records (name + coordinates); charge only an Amadeus-confirmed rate signed by prebooking-validate and verified at booking creation, so estimated prices can never be charged or tampered with.
