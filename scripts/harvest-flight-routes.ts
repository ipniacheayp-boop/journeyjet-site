/**
 * Harvest Duffel-validated flight routes into src/data/flightRouteCatalog.ts
 *
 * Run on demand (NOT on every build — it hits the live Duffel API through the
 * existing `duffel-flights-search` Edge Function; no API key ever lives here):
 *
 *   bunx tsx scripts/harvest-flight-routes.ts
 *
 * Only routes that actually return valid Duffel offers are written to the
 * catalog, which is the single source of truth for /flights/{a}-to-{b} pages
 * and for sitemap-flights.xml.
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { seoFlightRoutes } from "../src/data/seoRoutes";

// ---- Edge Function access (publishable anon key only) -----------------------
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

const MAX_ROUTES = Number(env.HARVEST_MAX_ROUTES ?? 70);
const CONCURRENCY = Number(env.HARVEST_CONCURRENCY ?? 1);
// Duffel rate-limits aggressively; pace requests instead of hammering it.
const PACING_MS = Number(env.HARVEST_PACING_MS ?? 4000);
const TIMEOUT_MS = 45_000;

function slugify(v: string): string {
  return v
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

interface Candidate {
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
}

// Candidate pairs come from the existing curated high-intent route list, so we
// never invent routes — Duffel then decides which ones are real and bookable.
const seen = new Set<string>();
const candidates: Candidate[] = [];
for (const r of seoFlightRoutes) {
  const key = `${r.originCode}-${r.destinationCode}`;
  if (seen.has(key) || r.originCode === r.destinationCode) continue;
  seen.add(key);
  candidates.push({
    origin: r.origin,
    originCode: r.originCode,
    destination: r.destination,
    destinationCode: r.destinationCode,
  });
  if (candidates.length >= MAX_ROUTES) break;
}

function futureDate(daysAhead: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

interface HarvestResult extends Candidate {
  slug: string;
  reverseSlug: string;
  airlines: string[];
  offerCount: number;
  minDurationMinutes?: number;
  roundTripAvailable: boolean;
}

function isoDurationToMinutes(iso?: string): number | undefined {
  if (!iso) return undefined;
  const m = iso.match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?$/);
  if (!m) return undefined;
  return (Number(m[1] ?? 0) * 1440) + (Number(m[2] ?? 0) * 60) + Number(m[3] ?? 0);
}

async function searchOffers(c: Candidate, returnDate: string | null) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/duffel-flights-search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({
        origin: c.originCode,
        destination: c.destinationCode,
        departureDate: futureDate(45),
        returnDate,
        adults: 1,
        children: 0,
        infants: 0,
        cabinClass: "economy",
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.log(`    ! ${c.originCode}→${c.destinationCode} HTTP ${res.status}`);
      return null;
    }
    const json = (await res.json()) as { offers?: unknown[]; error?: string };
    if (json.error || !Array.isArray(json.offers)) {
      console.log(`    ! ${c.originCode}→${c.destinationCode} ${json.error ?? "no offers array"}`);
      return null;
    }
    return json.offers as Array<Record<string, any>>;
  } catch (err) {
    console.log(`    ! ${c.originCode}→${c.destinationCode} ${(err as Error).message}`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function searchWithRetry(c: Candidate, returnDate: string | null) {
  for (let attempt = 0; attempt < 3; attempt++) {
    await sleep(PACING_MS);
    const offers = await searchOffers(c, returnDate);
    if (offers && offers.length > 0) return offers;
    await sleep(PACING_MS * 3 * (attempt + 1));
  }
  return null;
}

async function harvest(c: Candidate): Promise<HarvestResult | null> {
  const oneWay = await searchWithRetry(c, null);
  if (!oneWay || oneWay.length === 0) {
    console.log(`  ✗ ${c.originCode}→${c.destinationCode} — no Duffel offers`);
    return null;
  }

  const airlines = new Set<string>();
  let minDuration: number | undefined;
  for (const offer of oneWay) {
    const carrier = offer?.owner?.name ?? offer?.slices?.[0]?.segments?.[0]?.marketing_carrier?.name;
    if (typeof carrier === "string" && carrier.trim()) airlines.add(carrier.trim());
    const dur = isoDurationToMinutes(offer?.slices?.[0]?.duration);
    if (dur && (minDuration === undefined || dur < minDuration)) minDuration = dur;
  }

  await sleep(400);
  const roundTrip = await searchWithRetry(c, futureDate(52));

  console.log(
    `  ✓ ${c.originCode}→${c.destinationCode} — ${oneWay.length} offers, ${airlines.size} carriers`,
  );

  return {
    ...c,
    slug: `${slugify(c.origin)}-to-${slugify(c.destination)}`,
    reverseSlug: `${slugify(c.destination)}-to-${slugify(c.origin)}`,
    airlines: [...airlines].sort().slice(0, 8),
    offerCount: oneWay.length,
    minDurationMinutes: minDuration,
    roundTripAvailable: Array.isArray(roundTrip) && roundTrip.length > 0,
  };
}

async function pool<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx]);
      }
    }),
  );
  return out;
}

(async () => {
  console.log(`Validating ${candidates.length} candidate routes against Duffel…`);
  const results = (await pool(candidates, CONCURRENCY, harvest)).filter(
    (r): r is HarvestResult => r !== null,
  );

  // Deduplicate by slug (a slug is the stable page identifier).
  const bySlug = new Map<string, HarvestResult>();
  for (const r of results) if (!bySlug.has(r.slug)) bySlug.set(r.slug, r);
  const routes = [...bySlug.values()].sort((a, b) => a.slug.localeCompare(b.slug));

  const file = `// AUTO-GENERATED by scripts/harvest-flight-routes.ts — do not edit by hand.
// Every route below returned real, bookable offers from the Duffel API when
// harvested. Volatile data (prices, availability) is intentionally NOT stored.
// Regenerate with: bunx tsx scripts/harvest-flight-routes.ts

export interface FlightRouteCatalogEntry {
  /** Stable URL segment for /flights/{slug} */
  slug: string;
  /** Slug of the reverse direction (may or may not exist in this catalog). */
  reverseSlug: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  /** Carriers observed on this route in Duffel results. */
  airlines: string[];
  /** Whether Duffel returned round-trip offers for this route. */
  roundTripAvailable: boolean;
  /** Fastest observed one-way duration, in minutes. */
  minDurationMinutes?: number;
}

export const FLIGHT_ROUTES_VALIDATED_AT = ${JSON.stringify(new Date().toISOString().slice(0, 10))};

export const flightRouteCatalog: FlightRouteCatalogEntry[] = ${JSON.stringify(
    routes.map(({ offerCount: _offerCount, ...rest }) => rest),
    null,
    2,
  )};

const bySlug = new Map(flightRouteCatalog.map((r) => [r.slug, r]));

export function getFlightRoute(slug?: string): FlightRouteCatalogEntry | undefined {
  return slug ? bySlug.get(slug) : undefined;
}

/** Routes sharing an origin or destination with the given route. */
export function relatedFlightRoutes(
  route: FlightRouteCatalogEntry,
  limit = 6,
): FlightRouteCatalogEntry[] {
  const reverse = bySlug.get(route.reverseSlug);
  const others = flightRouteCatalog.filter(
    (r) =>
      r.slug !== route.slug &&
      r.slug !== route.reverseSlug &&
      (r.originCode === route.originCode ||
        r.destinationCode === route.destinationCode ||
        r.destinationCode === route.originCode),
  );
  return [...(reverse ? [reverse] : []), ...others].slice(0, limit);
}

/** All indexable flight SEO paths (one-way + round-trip variants). */
export function indexableFlightRoutePaths(): string[] {
  const paths: string[] = [];
  for (const r of flightRouteCatalog) {
    paths.push(\`/flights/\${r.slug}\`);
    if (r.roundTripAvailable) paths.push(\`/flights/\${r.slug}/round-trip\`);
  }
  return paths;
}
`;

  writeFileSync(resolve("src/data/flightRouteCatalog.ts"), file);
  console.log(
    `flightRouteCatalog.ts written — ${routes.length} validated routes (${
      routes.filter((r) => r.roundTripAvailable).length
    } with round-trip offers)`,
  );
})();
