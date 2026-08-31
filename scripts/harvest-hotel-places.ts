/**
 * Harvest REAL hotels from the Google Places API (through the existing
 * `hotels-search` Edge Function — the Google key stays server-side) into
 * src/data/hotelPlaceCatalog.ts
 *
 * Run on demand:  bunx tsx scripts/harvest-hotel-places.ts
 *
 * Only hotels that Google Places actually returns, with a stable Place ID and
 * enough real information to justify a page, are written. The catalog is the
 * source of truth for /hotel/{city}/{hotel} pages and sitemap-hotel-places.xml.
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { hotelDestinations, slugifyDestination } from "../src/data/hotelDestinations";

function readEnv(): Record<string, string> {
  const out: Record<string, string> = { ...process.env } as Record<string, string>;
  for (const file of [".env", ".env.local"]) {
    const p = resolve(file);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
  return out;
}

const env = readEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const ANON_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !ANON_KEY) {
  console.error("Missing VITE_SUPABASE_URL / publishable key — cannot harvest.");
  process.exit(1);
}

/** Major US destinations first — quality over URL count. */
const CITY_SLUGS = [
  "new-york",
  "las-vegas",
  "miami",
  "orlando",
  "chicago",
  "los-angeles",
  "san-francisco",
  "boston",
  "seattle",
  "washington-dc",
  "new-orleans",
  "san-diego",
  "atlanta",
  "denver",
  "nashville",
  "austin",
  "dallas",
  "houston",
  "phoenix",
  "honolulu",
];

const MAX_PER_CITY = Number(env.HARVEST_HOTELS_PER_CITY ?? 10);
const MIN_REVIEWS = 150;

function futureDate(daysAhead: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

interface Row {
  placeId?: string;
  hotel?: { name?: string; address?: string; location?: { lat?: number; lng?: number } };
  rating?: number;
  reviewCount?: number;
  googleMapsUri?: string;
  websiteUri?: string;
  googlePlace?: { types?: string[]; primaryTypeDisplayName?: { text?: string }; businessStatus?: string };
}

interface HotelPlace {
  placeId: string;
  slug: string;
  name: string;
  citySlug: string;
  cityName: string;
  address: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  reviewCount?: number;
  category?: string;
  googleMapsUri?: string;
  websiteUri?: string;
}

async function searchCity(query: string): Promise<Row[]> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/hotels-search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({
      cityCode: query,
      checkInDate: futureDate(30),
      checkOutDate: futureDate(32),
      adults: 2,
      roomQuantity: 1,
    }),
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { data?: Row[]; error?: string };
  if (json.error || !Array.isArray(json.data)) return [];
  return json.data;
}

(async () => {
  const seenPlaceIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const hotels: HotelPlace[] = [];

  for (const citySlug of CITY_SLUGS) {
    const dest = hotelDestinations.find((d) => d.slug === citySlug);
    if (!dest) {
      console.log(`  – skipping ${citySlug} (not in hotel destination catalog)`);
      continue;
    }
    const query = [dest.name, dest.stateCode ?? dest.state, dest.country].filter(Boolean).join(", ");
    const rows = await searchCity(query);

    const usable = rows
      .filter((r) => {
        const name = r.hotel?.name?.trim();
        const status = r.googlePlace?.businessStatus;
        return (
          !!r.placeId &&
          !!name &&
          name.toLowerCase() !== "hotel" &&
          !!r.hotel?.address?.trim() &&
          (r.reviewCount ?? 0) >= MIN_REVIEWS &&
          (status === undefined || status === "OPERATIONAL")
        );
      })
      .sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));

    let added = 0;
    for (const r of usable) {
      if (added >= MAX_PER_CITY) break;
      const placeId = r.placeId!;
      if (seenPlaceIds.has(placeId)) continue; // never duplicate a Place ID
      const name = r.hotel!.name!.trim();
      let slug = slugifyDestination(name);
      if (!slug) continue;
      const key = `${citySlug}/${slug}`;
      if (seenSlugs.has(key)) continue;
      seenPlaceIds.add(placeId);
      seenSlugs.add(key);
      hotels.push({
        placeId,
        slug,
        name,
        citySlug,
        cityName: dest.name,
        address: r.hotel!.address!.trim(),
        latitude: r.hotel?.location?.lat,
        longitude: r.hotel?.location?.lng,
        rating: typeof r.rating === "number" && r.rating > 0 ? r.rating : undefined,
        reviewCount: r.reviewCount,
        category: r.googlePlace?.primaryTypeDisplayName?.text,
        googleMapsUri: r.googleMapsUri || undefined,
        websiteUri: r.websiteUri || undefined,
      });
      added++;
    }
    console.log(`  ✓ ${citySlug} — ${added} hotels from ${rows.length} Places results`);
  }

  hotels.sort((a, b) => (a.citySlug + a.slug).localeCompare(b.citySlug + b.slug));

  const file = `// AUTO-GENERATED by scripts/harvest-hotel-places.ts — do not edit by hand.
// Every entry is a REAL place returned by the Google Places API, deduplicated by
// Google Place ID. Only data Places actually provides is stored — no invented
// prices, rooms, availability or amenities.
// Regenerate with: bunx tsx scripts/harvest-hotel-places.ts

export interface HotelPlace {
  /** Stable Google Place ID — the unique identity of the page. */
  placeId: string;
  /** URL segment for /hotel/{citySlug}/{slug} */
  slug: string;
  name: string;
  citySlug: string;
  cityName: string;
  address: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  reviewCount?: number;
  category?: string;
  googleMapsUri?: string;
  websiteUri?: string;
}

export const HOTEL_PLACES_HARVESTED_AT = ${JSON.stringify(new Date().toISOString().slice(0, 10))};

export const hotelPlaces: HotelPlace[] = ${JSON.stringify(hotels, null, 2)};

const byPath = new Map(hotelPlaces.map((h) => [\`\${h.citySlug}/\${h.slug}\`, h]));

export function hotelPlacePath(h: HotelPlace): string {
  return \`/hotel/\${h.citySlug}/\${h.slug}\`;
}

export function getHotelPlace(citySlug?: string, slug?: string): HotelPlace | undefined {
  if (!citySlug || !slug) return undefined;
  return byPath.get(\`\${citySlug}/\${slug}\`);
}

export function hotelPlacesForCity(citySlug: string): HotelPlace[] {
  return hotelPlaces.filter((h) => h.citySlug === citySlug);
}

/** City slugs that have enough real Places-backed hotels to justify linking. */
export function citiesWithHotelPlaces(): string[] {
  return [...new Set(hotelPlaces.map((h) => h.citySlug))];
}

export function indexableHotelPlacePaths(): string[] {
  return hotelPlaces.map(hotelPlacePath);
}
`;

  writeFileSync(resolve("src/data/hotelPlaceCatalog.ts"), file);
  console.log(`hotelPlaceCatalog.ts written — ${hotels.length} real hotels across ${new Set(hotels.map((h) => h.citySlug)).size} cities`);
})();
