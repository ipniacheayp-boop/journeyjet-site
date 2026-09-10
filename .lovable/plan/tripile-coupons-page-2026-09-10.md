# Tripile Coupons Page

## Goal
Add a responsive `/coupons` page inspired by the supplied reference while preserving Tripile’s existing branding, search, APIs, and booking behavior.

## Implementation
- Add a Tripile-branded coupons page with the existing header/footer, a travel-focused banner, flight search entry point, coupon list, and “How to apply” guidance.
- Use the coupon codes and eligibility rules already supported by checkout so the page does not advertise unusable offers.
- Add accessible “Reveal code” and “Copy code” interactions, then direct travelers into the existing flight search or deals flow.
- Add the `/coupons` route and link it from the existing Deals navigation area without disrupting current routes.
- Add page-specific title, description, canonical/social metadata, breadcrumb structured data, and sitemap/prerender coverage.

## Technical Details
- Reuse existing Tripile components, semantic design tokens, and responsive layout conventions.
- Move shared coupon definitions into one typed data source consumed by both the new page and checkout validation, preventing offer mismatches.
- Use an existing project travel image rather than embedding the reference screenshots.
- Verify desktop/mobile rendering, code reveal/copy behavior, navigation, metadata, and type checks.
