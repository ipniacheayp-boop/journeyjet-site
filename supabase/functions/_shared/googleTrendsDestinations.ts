/**
 * Curated Tripile destinations for Google Trends. Must stay aligned with
 * `src/data/googleTrendsDestinations.ts` and existing `popularDestinations`
 * slugs. Bali/Maldives are omitted — they have no /flights-to pages.
 */
export const TRENDING_DESTINATIONS = [
  { city: "Dubai", slug: "dubai", query: "Dubai" },
  { city: "Paris", slug: "paris", query: "Paris" },
  { city: "London", slug: "london", query: "London" },
  { city: "New York", slug: "new-york", query: "New York" },
  { city: "Tokyo", slug: "tokyo", query: "Tokyo" },
  { city: "Singapore", slug: "singapore", query: "Singapore" },
  { city: "Bangkok", slug: "bangkok", query: "Bangkok" },
  { city: "Barcelona", slug: "barcelona", query: "Barcelona" },
] as const;
