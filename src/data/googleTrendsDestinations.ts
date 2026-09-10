import { popularDestinations } from "@/data/destinationsData";

/**
 * High-value destinations that already have Tripile landing pages
 * (`/flights-to/:slug`, `/travel-guide/:slug`). Bali and Maldives appear on
 * Explore cards but have no dedicated SEO route, so they are omitted.
 *
 * Query = canonical city name from `popularDestinations` (not a generated
 * "… travel" suffix).
 */
const TRENDING_SLUGS = [
  "dubai",
  "paris",
  "london",
  "new-york",
  "tokyo",
  "singapore",
  "bangkok",
  "barcelona",
] as const;

export interface TrendDestination {
  city: string;
  slug: string;
  query: string;
}

export const trendingDestinations: TrendDestination[] = TRENDING_SLUGS.map((slug) => {
  const dest = popularDestinations.find((d) => d.slug === slug);
  if (!dest) {
    throw new Error(`trendingDestinations: slug "${slug}" is missing from popularDestinations`);
  }
  return { city: dest.city, slug: dest.slug, query: dest.city };
});

export function getTrendDestination(slug?: string): TrendDestination | undefined {
  if (!slug) return undefined;
  return trendingDestinations.find((d) => d.slug === slug);
}

/** SerpApi TIMESERIES/GEO_MAP accept at most 5 queries per request. */
export function trendQueryBatches(items = trendingDestinations, size = 5): TrendDestination[][] {
  const batches: TrendDestination[][] = [];
  for (let i = 0; i < items.length; i += size) batches.push(items.slice(i, i + size));
  return batches;
}
