/**
 * Hotel destination catalog.
 *
 * This is the single, maintained catalog of destinations the application supports for
 * hotel search. Entries originate from destinations the app already searches through the
 * existing Google Places (New) integration (`places-autocomplete` + `hotels-search`
 * `places:searchText`). Only Place IDs and the destination's own name/administrative
 * labels are persisted — Google Maps Platform permits caching Place IDs indefinitely; we
 * do not persist Places content such as ratings, reviews or photos here.
 *
 * IMPORTANT — SEO contract:
 * - `slug` values are frozen. They back already-indexed `/cheap-hotels-in/{slug}` URLs.
 *   Never rename a slug; add a new entry instead.
 * - Only `isIndexable: true` destinations get canonical landing pages, appear in
 *   `/hotel-destinations` and in `sitemap-hotels.xml`.
 * - Arbitrary user-typed Places locations are NOT added here automatically.
 */

export interface HotelDestination {
  /** Frozen URL segment for /cheap-hotels-in/{slug}. Never change for an existing entry. */
  slug: string;
  /** City / destination display name. */
  name: string;
  /** State or administrative area (full name where known, e.g. "Florida"). */
  state?: string;
  /** Short administrative code where applicable, e.g. "FL". */
  stateCode?: string;
  country: string;
  countryCode: string;
  /** Google Place ID, when it has been resolved and stored. */
  placeId?: string;
  latitude?: number;
  longitude?: number;
  /** Only indexable destinations get canonical SEO pages, directory links and sitemap entries. */
  isIndexable: boolean;
}

/** Normalize any string into a URL slug. */
export function slugifyDestination(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Deterministic slug for a destination, disambiguated when the plain city name is not
 * globally unique (e.g. Portland OR vs Portland ME, or London GB vs London CA).
 * Existing catalog slugs always win — see `canonicalSlugFor`.
 */
export function deterministicSlug(input: {
  name: string;
  stateCode?: string;
  state?: string;
  countryCode: string;
}): string {
  const base = slugifyDestination(input.name);
  const admin = input.stateCode || input.state;
  const isUS = input.countryCode.toUpperCase() === "US";
  const conflicts = catalogByName.get(base);
  if (!conflicts || conflicts.length <= 1) return base;
  return isUS && admin
    ? `${base}-${slugifyDestination(admin)}`
    : `${base}-${slugifyDestination(input.countryCode)}`;
}

/** Stable dedupe key: Google Place ID when known, otherwise normalized city+admin+country. */
export function destinationDedupeKey(d: {
  placeId?: string;
  name: string;
  state?: string;
  stateCode?: string;
  countryCode: string;
}): string {
  if (d.placeId) return `place:${d.placeId}`;
  return [
    slugifyDestination(d.name),
    slugifyDestination(d.stateCode || d.state || ""),
    d.countryCode.toUpperCase(),
  ].join("|");
}

const RAW_DESTINATIONS: HotelDestination[] = [
  // United States
  { slug: "new-york", name: "New York", state: "New York", stateCode: "NY", country: "United States", countryCode: "US", latitude: 40.7128, longitude: -74.006, isIndexable: true },
  { slug: "los-angeles", name: "Los Angeles", state: "California", stateCode: "CA", country: "United States", countryCode: "US", latitude: 34.0522, longitude: -118.2437, isIndexable: true },
  { slug: "chicago", name: "Chicago", state: "Illinois", stateCode: "IL", country: "United States", countryCode: "US", latitude: 41.8781, longitude: -87.6298, isIndexable: true },
  { slug: "miami", name: "Miami", state: "Florida", stateCode: "FL", country: "United States", countryCode: "US", latitude: 25.7617, longitude: -80.1918, isIndexable: true },
  { slug: "san-francisco", name: "San Francisco", state: "California", stateCode: "CA", country: "United States", countryCode: "US", latitude: 37.7749, longitude: -122.4194, isIndexable: true },
  { slug: "las-vegas", name: "Las Vegas", state: "Nevada", stateCode: "NV", country: "United States", countryCode: "US", latitude: 36.1699, longitude: -115.1398, isIndexable: true },
  { slug: "orlando", name: "Orlando", state: "Florida", stateCode: "FL", country: "United States", countryCode: "US", latitude: 28.5383, longitude: -81.3792, isIndexable: true },
  { slug: "atlanta", name: "Atlanta", state: "Georgia", stateCode: "GA", country: "United States", countryCode: "US", latitude: 33.749, longitude: -84.388, isIndexable: true },
  { slug: "dallas", name: "Dallas", state: "Texas", stateCode: "TX", country: "United States", countryCode: "US", latitude: 32.7767, longitude: -96.797, isIndexable: true },
  { slug: "denver", name: "Denver", state: "Colorado", stateCode: "CO", country: "United States", countryCode: "US", latitude: 39.7392, longitude: -104.9903, isIndexable: true },
  { slug: "seattle", name: "Seattle", state: "Washington", stateCode: "WA", country: "United States", countryCode: "US", latitude: 47.6062, longitude: -122.3321, isIndexable: true },
  { slug: "boston", name: "Boston", state: "Massachusetts", stateCode: "MA", country: "United States", countryCode: "US", latitude: 42.3601, longitude: -71.0589, isIndexable: true },
  { slug: "houston", name: "Houston", state: "Texas", stateCode: "TX", country: "United States", countryCode: "US", latitude: 29.7604, longitude: -95.3698, isIndexable: true },
  { slug: "phoenix", name: "Phoenix", state: "Arizona", stateCode: "AZ", country: "United States", countryCode: "US", latitude: 33.4484, longitude: -112.074, isIndexable: true },
  { slug: "nashville", name: "Nashville", state: "Tennessee", stateCode: "TN", country: "United States", countryCode: "US", latitude: 36.1627, longitude: -86.7816, isIndexable: true },
  { slug: "san-diego", name: "San Diego", state: "California", stateCode: "CA", country: "United States", countryCode: "US", latitude: 32.7157, longitude: -117.1611, isIndexable: true },
  { slug: "tampa", name: "Tampa", state: "Florida", stateCode: "FL", country: "United States", countryCode: "US", latitude: 27.9506, longitude: -82.4572, isIndexable: true },
  { slug: "portland", name: "Portland", state: "Oregon", stateCode: "OR", country: "United States", countryCode: "US", latitude: 45.5152, longitude: -122.6784, isIndexable: true },
  { slug: "minneapolis", name: "Minneapolis", state: "Minnesota", stateCode: "MN", country: "United States", countryCode: "US", latitude: 44.9778, longitude: -93.265, isIndexable: true },
  { slug: "detroit", name: "Detroit", state: "Michigan", stateCode: "MI", country: "United States", countryCode: "US", latitude: 42.3314, longitude: -83.0458, isIndexable: true },
  { slug: "philadelphia", name: "Philadelphia", state: "Pennsylvania", stateCode: "PA", country: "United States", countryCode: "US", latitude: 39.9526, longitude: -75.1652, isIndexable: true },
  { slug: "charlotte", name: "Charlotte", state: "North Carolina", stateCode: "NC", country: "United States", countryCode: "US", latitude: 35.2271, longitude: -80.8431, isIndexable: true },
  { slug: "salt-lake-city", name: "Salt Lake City", state: "Utah", stateCode: "UT", country: "United States", countryCode: "US", latitude: 40.7608, longitude: -111.891, isIndexable: true },
  { slug: "honolulu", name: "Honolulu", state: "Hawaii", stateCode: "HI", country: "United States", countryCode: "US", latitude: 21.3069, longitude: -157.8583, isIndexable: true },
  { slug: "fort-lauderdale", name: "Fort Lauderdale", state: "Florida", stateCode: "FL", country: "United States", countryCode: "US", latitude: 26.1224, longitude: -80.1373, isIndexable: true },
  { slug: "washington-dc", name: "Washington", state: "District of Columbia", stateCode: "DC", country: "United States", countryCode: "US", latitude: 38.9072, longitude: -77.0369, isIndexable: true },
  { slug: "baltimore", name: "Baltimore", state: "Maryland", stateCode: "MD", country: "United States", countryCode: "US", latitude: 39.2904, longitude: -76.6122, isIndexable: true },
  { slug: "austin", name: "Austin", state: "Texas", stateCode: "TX", country: "United States", countryCode: "US", latitude: 30.2672, longitude: -97.7431, isIndexable: true },
  { slug: "raleigh", name: "Raleigh", state: "North Carolina", stateCode: "NC", country: "United States", countryCode: "US", latitude: 35.7796, longitude: -78.6382, isIndexable: true },
  { slug: "new-orleans", name: "New Orleans", state: "Louisiana", stateCode: "LA", country: "United States", countryCode: "US", latitude: 29.9511, longitude: -90.0715, isIndexable: true },

  // International
  { slug: "london", name: "London", state: "England", country: "United Kingdom", countryCode: "GB", latitude: 51.5072, longitude: -0.1276, isIndexable: true },
  { slug: "paris", name: "Paris", state: "Île-de-France", country: "France", countryCode: "FR", latitude: 48.8566, longitude: 2.3522, isIndexable: true },
  { slug: "tokyo", name: "Tokyo", state: "Tokyo", country: "Japan", countryCode: "JP", latitude: 35.6762, longitude: 139.6503, isIndexable: true },
  { slug: "dubai", name: "Dubai", state: "Dubai", country: "United Arab Emirates", countryCode: "AE", latitude: 25.2048, longitude: 55.2708, isIndexable: true },
  { slug: "cancun", name: "Cancún", state: "Quintana Roo", country: "Mexico", countryCode: "MX", latitude: 21.1619, longitude: -86.8515, isIndexable: true },
  { slug: "barcelona", name: "Barcelona", state: "Catalonia", country: "Spain", countryCode: "ES", latitude: 41.3874, longitude: 2.1686, isIndexable: true },
  { slug: "rome", name: "Rome", state: "Lazio", country: "Italy", countryCode: "IT", latitude: 41.9028, longitude: 12.4964, isIndexable: true },
  { slug: "amsterdam", name: "Amsterdam", state: "North Holland", country: "Netherlands", countryCode: "NL", latitude: 52.3676, longitude: 4.9041, isIndexable: true },
  { slug: "bangkok", name: "Bangkok", state: "Bangkok", country: "Thailand", countryCode: "TH", latitude: 13.7563, longitude: 100.5018, isIndexable: true },
  { slug: "toronto", name: "Toronto", state: "Ontario", stateCode: "ON", country: "Canada", countryCode: "CA", latitude: 43.6532, longitude: -79.3832, isIndexable: true },
  { slug: "sydney", name: "Sydney", state: "New South Wales", stateCode: "NSW", country: "Australia", countryCode: "AU", latitude: -33.8688, longitude: 151.2093, isIndexable: true },
  { slug: "frankfurt", name: "Frankfurt", state: "Hesse", country: "Germany", countryCode: "DE", latitude: 50.1109, longitude: 8.6821, isIndexable: true },
  { slug: "singapore", name: "Singapore", country: "Singapore", countryCode: "SG", latitude: 1.3521, longitude: 103.8198, isIndexable: true },
  { slug: "istanbul", name: "Istanbul", state: "Istanbul", country: "Türkiye", countryCode: "TR", latitude: 41.0082, longitude: 28.9784, isIndexable: true },
  { slug: "seoul", name: "Seoul", state: "Seoul", country: "South Korea", countryCode: "KR", latitude: 37.5665, longitude: 126.978, isIndexable: true },
  { slug: "mumbai", name: "Mumbai", state: "Maharashtra", country: "India", countryCode: "IN", latitude: 19.076, longitude: 72.8777, isIndexable: true },
  { slug: "delhi", name: "Delhi", state: "Delhi", country: "India", countryCode: "IN", latitude: 28.6139, longitude: 77.209, isIndexable: true },
  { slug: "cape-town", name: "Cape Town", state: "Western Cape", country: "South Africa", countryCode: "ZA", latitude: -33.9249, longitude: 18.4241, isIndexable: true },
  { slug: "athens", name: "Athens", state: "Attica", country: "Greece", countryCode: "GR", latitude: 37.9838, longitude: 23.7275, isIndexable: true },
  { slug: "lisbon", name: "Lisbon", state: "Lisbon", country: "Portugal", countryCode: "PT", latitude: 38.7223, longitude: -9.1393, isIndexable: true },
];

/** Dedupe by Place ID (when present) or normalized city/admin/country. */
export const hotelDestinations: HotelDestination[] = (() => {
  const seenKeys = new Set<string>();
  const seenSlugs = new Set<string>();
  const out: HotelDestination[] = [];
  for (const d of RAW_DESTINATIONS) {
    const key = destinationDedupeKey(d);
    if (seenKeys.has(key) || seenSlugs.has(d.slug)) continue;
    seenKeys.add(key);
    seenSlugs.add(d.slug);
    out.push(d);
  }
  return out;
})();

const catalogByName = new Map<string, HotelDestination[]>();
for (const d of hotelDestinations) {
  const base = slugifyDestination(d.name);
  const list = catalogByName.get(base) ?? [];
  list.push(d);
  catalogByName.set(base, list);
}

const bySlug = new Map(hotelDestinations.map((d) => [d.slug, d]));

/** Indexable destinations only — used for canonical pages, the directory and sitemaps. */
export const indexableHotelDestinations: HotelDestination[] = hotelDestinations.filter(
  (d) => d.isIndexable,
);

export function getHotelDestinationBySlug(slug?: string): HotelDestination | undefined {
  if (!slug) return undefined;
  return bySlug.get(slug) ?? bySlug.get(slugifyDestination(slug));
}

/**
 * Canonical slug for a destination. Frozen catalog slugs always win so previously
 * indexed URLs never change, even when normalization would produce something else.
 */
export function canonicalSlugFor(input: {
  placeId?: string;
  name: string;
  state?: string;
  stateCode?: string;
  countryCode: string;
}): string {
  const key = destinationDedupeKey(input);
  const existing = hotelDestinations.find((d) => destinationDedupeKey(d) === key);
  if (existing) return existing.slug;
  return deterministicSlug(input);
}

export function hotelDestinationPath(slug: string): string {
  return `/cheap-hotels-in/${slug}`;
}

export const SITE_ORIGIN = "https://tripile.com";

export function hotelDestinationCanonical(slug: string): string {
  return `${SITE_ORIGIN}${hotelDestinationPath(slug)}`;
}

/** "Miami, Florida, United States" — the text query the existing hotels-search flow expects. */
export function destinationSearchQuery(d: HotelDestination): string {
  return [d.name, d.state, d.country].filter(Boolean).join(", ");
}

/** "Miami, Florida" — short human label for headings and metadata. */
export function destinationRegionLabel(d: HotelDestination): string {
  return [d.name, d.state ?? d.country].filter(Boolean).join(", ");
}

/** "Miami, FL" — compact label for title tags. */
export function destinationShortLabel(d: HotelDestination): string {
  const admin = d.stateCode ?? (d.countryCode === "US" ? d.state : d.country);
  return [d.name, admin].filter(Boolean).join(", ");
}

/** Group indexable destinations Country → State for the crawlable directory. */
export function groupedIndexableDestinations(): {
  country: string;
  countryCode: string;
  regions: { region: string; destinations: HotelDestination[] }[];
}[] {
  const countries = new Map<string, HotelDestination[]>();
  for (const d of indexableHotelDestinations) {
    const list = countries.get(d.country) ?? [];
    list.push(d);
    countries.set(d.country, list);
  }
  return [...countries.entries()]
    .sort((a, b) => (a[0] === "United States" ? -1 : b[0] === "United States" ? 1 : a[0].localeCompare(b[0])))
    .map(([country, list]) => {
      const regions = new Map<string, HotelDestination[]>();
      for (const d of list) {
        const region = d.state ?? d.country;
        const r = regions.get(region) ?? [];
        r.push(d);
        regions.set(region, r);
      }
      return {
        country,
        countryCode: list[0].countryCode,
        regions: [...regions.entries()]
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([region, destinations]) => ({
            region,
            destinations: destinations.sort((a, b) => a.name.localeCompare(b.name)),
          })),
      };
    });
}
