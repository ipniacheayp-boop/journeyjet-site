/**
 * Hotel rate helpers shared by hotels-search, prebooking-validate and
 * bookings-agent-assisted. Pure functions only (no Deno globals) so they can be
 * unit-tested with Vitest.
 *
 * Price sources:
 *  - SerpApi google_hotels  → ESTIMATED display prices (never charged directly)
 *  - Amadeus hotel offers   → CONFIRMED bookable price (the only chargeable amount)
 * No price is ever generated locally.
 */

const STOP_WORDS = new Set([
  "hotel", "hotels", "the", "a", "an", "and", "by", "at", "of", "in", "on", "&", "-",
  "resort", "spa", "suites", "suite", "boutique", "collection",
]);

export function normalizeHotelName(name: string | undefined | null): string[] {
  if (!name) return [];
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 0 && !STOP_WORDS.has(t));
}

/** Dice coefficient on normalized name tokens (0..1). */
export function nameSimilarity(a: string | undefined | null, b: string | undefined | null): number {
  const ta = new Set(normalizeHotelName(a));
  const tb = new Set(normalizeHotelName(b));
  if (ta.size === 0 || tb.size === 0) return 0;
  let common = 0;
  for (const t of ta) if (tb.has(t)) common++;
  return (2 * common) / (ta.size + tb.size);
}

export type LatLng = { lat?: number | null; lng?: number | null };

export function distanceKm(a: LatLng, b: LatLng): number | null {
  if (![a.lat, a.lng, b.lat, b.lng].every((v) => typeof v === "number" && Number.isFinite(v))) return null;
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad((b.lat as number) - (a.lat as number));
  const dLng = toRad((b.lng as number) - (a.lng as number));
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat as number)) * Math.cos(toRad(b.lat as number)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Match score (0..1) or 0 when the two records are not the same property.
 * Rules: close + similar names, or very similar names nearby; never coords alone.
 */
export function matchScore(
  a: { name?: string | null } & LatLng,
  b: { name?: string | null } & LatLng,
): number {
  const sim = nameSimilarity(a.name, b.name);
  const d = distanceKm(a, b);
  if (d === null) return sim >= 0.9 ? sim : 0;
  if (d <= 0.3 && sim >= 0.4) return sim + (0.3 - d);
  if (d <= 1.5 && sim >= 0.75) return sim;
  return 0;
}

export interface SerpHotelRate {
  name: string;
  lat: number | null;
  lng: number | null;
  propertyToken: string | null;
  currency: string;
  nightly: number | null;
  nightlyBeforeTaxes: number | null;
  total: number | null;
  totalBeforeTaxes: number | null;
  source: string | null;
  link: string | null;
}

function num(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v.replace(/[^0-9.]/g, "")) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Normalize a SerpApi google_hotels response (list or single-property form). */
export function parseSerpHotels(json: unknown, currency: string): SerpHotelRate[] {
  if (!json || typeof json !== "object") return [];
  const j = json as Record<string, unknown>;
  const list = Array.isArray(j.properties) ? (j.properties as Record<string, unknown>[]) : j.name ? [j] : [];
  const out: SerpHotelRate[] = [];
  for (const p of list) {
    const rpn = (p.rate_per_night ?? {}) as Record<string, unknown>;
    const tr = (p.total_rate ?? {}) as Record<string, unknown>;
    const gps = (p.gps_coordinates ?? {}) as Record<string, unknown>;
    const firstPrice = Array.isArray(p.prices) ? (p.prices[0] as Record<string, unknown>) : undefined;
    const nightly = num(rpn.extracted_lowest) ?? num(rpn.lowest);
    const total = num(tr.extracted_lowest) ?? num(tr.lowest);
    if (nightly === null && total === null) continue; // no real rate → skip, never invent
    out.push({
      name: String(p.name ?? ""),
      lat: typeof gps.latitude === "number" && Number.isFinite(gps.latitude) ? gps.latitude : null,
      lng: typeof gps.longitude === "number" && Number.isFinite(gps.longitude) ? gps.longitude : null,
      propertyToken: typeof p.property_token === "string" ? p.property_token : null,
      currency,
      nightly,
      nightlyBeforeTaxes: num(rpn.extracted_before_taxes_fees) ?? num(rpn.before_taxes_fees),
      total,
      totalBeforeTaxes: num(tr.extracted_before_taxes_fees) ?? num(tr.before_taxes_fees),
      source: firstPrice && typeof firstPrice.source === "string" ? firstPrice.source : null,
      link: typeof p.link === "string" ? p.link : null,
    });
  }
  return out;
}

/** One-to-one greedy matching of Places records to SerpApi rates. */
export function matchRatesToPlaces<P extends { key: string; name?: string | null } & LatLng>(
  places: P[],
  rates: SerpHotelRate[],
): Map<string, SerpHotelRate> {
  const pairs: { key: string; idx: number; score: number }[] = [];
  places.forEach((p) =>
    rates.forEach((r, idx) => {
      const score = matchScore(p, { name: r.name, lat: r.lat, lng: r.lng });
      if (score > 0) pairs.push({ key: p.key, idx, score });
    }),
  );
  pairs.sort((a, b) => b.score - a.score);
  const usedP = new Set<string>();
  const usedR = new Set<number>();
  const out = new Map<string, SerpHotelRate>();
  for (const pr of pairs) {
    if (usedP.has(pr.key) || usedR.has(pr.idx)) continue;
    usedP.add(pr.key);
    usedR.add(pr.idx);
    out.set(pr.key, rates[pr.idx]);
  }
  return out;
}

export function nightsBetween(checkIn: string, checkOut: string): number | null {
  const a = new Date(`${checkIn}T12:00:00Z`).getTime();
  const b = new Date(`${checkOut}T12:00:00Z`).getTime();
  const n = Math.round((b - a) / 86_400_000);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Build the display (estimated) price block from a SerpApi rate. Returns null when unusable. */
export function buildEstimatedPrice(rate: SerpHotelRate, nights: number, rooms: number) {
  // SerpApi rates are per room; total_rate covers the whole stay for one room.
  const stayPerRoom = rate.total ?? (rate.nightly !== null ? rate.nightly * nights : null);
  if (stayPerRoom === null) return null;
  const total = Math.ceil(stayPerRoom * rooms);
  const before = rate.totalBeforeTaxes ?? (rate.nightlyBeforeTaxes !== null ? rate.nightlyBeforeTaxes * nights : null);
  const base = before !== null ? Math.ceil(before * rooms) : null;
  const taxes = base !== null && total >= base ? total - base : null;
  return {
    currency: rate.currency,
    total: String(total),
    ...(base !== null ? { base: String(base) } : {}),
    ...(taxes !== null ? { taxes: [{ code: "TAXES_AND_FEES", amount: String(taxes), currency: rate.currency, included: true }] } : {}),
    variations: { average: { total: rate.nightly !== null ? String(Math.ceil(rate.nightly)) : String(Math.ceil(stayPerRoom / nights)) } },
    priceType: "estimated" as const,
    priceSource: "serpapi_google_hotels" as const,
    taxesIncluded: taxes !== null,
  };
}

// ---------- Confirmed-rate token (HMAC) ----------

export function rateTokenPayload(c: { clientRequestId: string; total: number; currency: string; amadeusOfferId: string; expiresAt: string }) {
  return [c.clientRequestId, c.total.toFixed(2), c.currency.toUpperCase(), c.amadeusOfferId, c.expiresAt].join("|");
}

export async function hmacHex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export interface PriceConfirmation {
  source: "amadeus";
  amadeusOfferId: string;
  total: number;
  currency: string;
  expiresAt: string;
  token: string;
}

/** Verify a confirmation from prebooking-validate. Returns an error code or null. */
export async function verifyPriceConfirmation(
  secret: string,
  clientRequestId: string,
  conf: Partial<PriceConfirmation> | undefined | null,
  now = Date.now(),
): Promise<string | null> {
  if (!conf || conf.source !== "amadeus" || !conf.token || !conf.amadeusOfferId || !conf.expiresAt) return "RATE_NOT_CONFIRMED";
  const total = Number(conf.total);
  if (!Number.isFinite(total) || total <= 0 || !conf.currency) return "RATE_NOT_CONFIRMED";
  if (new Date(conf.expiresAt).getTime() < now) return "RATE_EXPIRED";
  const expected = await hmacHex(secret, rateTokenPayload({ clientRequestId, total, currency: conf.currency, amadeusOfferId: conf.amadeusOfferId, expiresAt: conf.expiresAt }));
  return expected === conf.token ? null : "RATE_NOT_CONFIRMED";
}
