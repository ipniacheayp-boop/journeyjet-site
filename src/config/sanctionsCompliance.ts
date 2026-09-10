/**
 * Sanctions / OFAC compliance configuration.
 *
 * ⚠️ STRIPE SANCTIONS COMPLIANCE
 * ------------------------------------------------------------------
 * This module is the single source of truth for the destinations that
 * Tripile is prohibited from selling travel to under international
 * sanctions regulations (OFAC / EU / UN comprehensively-sanctioned
 * jurisdictions). It is intentionally kept dependency-free and reusable
 * so the same list/logic can be imported by:
 *   - hotel search & listing pages (remove restricted results)
 *   - hotel detail pages (disable "Book Now")
 *   - the checkout / payment step (block Stripe initialisation)
 *
 * The backend (Supabase edge functions) keeps an equivalent copy of this
 * list and performs the authoritative HTTP 403 enforcement before any
 * booking is created or any Stripe API is invoked. Never rely on the
 * frontend alone for compliance.
 * ------------------------------------------------------------------
 */

/** Canonical display names of restricted countries / territories. */
export const RESTRICTED_DESTINATIONS: readonly string[] = [
  "Cuba",
  "Iran",
  "North Korea",
  "Syria",
  "Crimea",
  "Donetsk",
  "Luhansk",
] as const;

/**
 * Match patterns (lowercase) used to detect a restricted destination inside
 * free-form text such as an address, city query, or hotel name. Includes
 * common aliases so direct-URL / API responses can't bypass the screen.
 */
const RESTRICTED_PATTERNS: { label: string; terms: string[] }[] = [
  { label: "Cuba", terms: ["cuba", "havana", "varadero"] },
  { label: "Iran", terms: ["iran", "tehran", "islamic republic of iran"] },
  {
    label: "North Korea",
    terms: ["north korea", "dprk", "democratic people's republic of korea", "pyongyang"],
  },
  { label: "Syria", terms: ["syria", "syrian arab republic", "damascus", "aleppo"] },
  { label: "Crimea", terms: ["crimea", "sevastopol", "simferopol"] },
  { label: "Donetsk", terms: ["donetsk"] },
  { label: "Luhansk", terms: ["luhansk", "lugansk"] },
];

/** Escape a term for safe use in a word-boundary RegExp. */
function termToRegExp(term: string): RegExp {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`, "i");
}

/**
 * Returns the matched restricted destination label, or null if the supplied
 * text values contain no restricted jurisdiction. Pass any number of strings
 * (address, city, country, hotel name, etc.).
 */
export function getRestrictedDestinationMatch(
  ...texts: (string | null | undefined)[]
): string | null {
  const haystack = texts
    .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
    .join(" | ")
    .toLowerCase();

  if (!haystack) return null;

  for (const entry of RESTRICTED_PATTERNS) {
    for (const term of entry.terms) {
      if (termToRegExp(term).test(haystack)) {
        return entry.label;
      }
    }
  }
  return null;
}

/** Convenience boolean wrapper around {@link getRestrictedDestinationMatch}. */
export function isRestrictedDestination(
  ...texts: (string | null | undefined)[]
): boolean {
  return getRestrictedDestinationMatch(...texts) !== null;
}

/**
 * Extracts the location-relevant text fields from a hotel/flight/car offer
 * object so it can be screened against the sanctions list. Tolerant of the
 * various offer shapes returned by our providers.
 */
export function getOfferDestinationText(offer: any): string[] {
  if (!offer || typeof offer !== "object") return [];
  const gp = offer.googlePlace || {};
  const addressComponents = Array.isArray(gp.addressComponents)
    ? gp.addressComponents.map((c: any) => c?.longText || c?.long_name || "").filter(Boolean)
    : [];

  return [
    offer?.hotel?.name,
    offer?.hotel?.address,
    offer?.hotel?.cityCode,
    offer?.hotel?.country,
    offer?.searchMeta?.cityQuery,
    offer?.address,
    offer?.city,
    offer?.country,
    gp?.formattedAddress,
    gp?.shortFormattedAddress,
    gp?.displayName?.text,
    // Car / flight location hints
    offer?.pickup?.location,
    offer?.pickUpLocation,
    ...addressComponents,
  ].filter((v): v is string => typeof v === "string" && v.length > 0);
}

/** Determine if a given offer targets a restricted destination. */
export function isRestrictedOffer(offer: any): boolean {
  return isRestrictedDestination(...getOfferDestinationText(offer));
}

/** Shared user-facing copy (kept consistent across all surfaces). */
export const COMPLIANCE_COPY = {
  title: "Booking Unavailable",
  emoji: "🚫",
  shortNotice:
    "Bookings for this destination are unavailable due to international compliance requirements.",
  checkoutMessage:
    "This destination is currently unavailable due to international sanctions and compliance regulations.",
  paymentDisabledLabel: "Payment Unavailable",
  noProviderNote:
    "No payment provider is available for bookings to restricted destinations.",
  paymentDisabledLine: "Online payment is disabled for these destinations.",
} as const;
