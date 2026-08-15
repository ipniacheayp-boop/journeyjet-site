import type { DuffelOffer, DuffelSegment, DuffelSlice } from "@/types/duffel";

/** "PT16H15M" → 975 minutes. Returns 0 when Duffel omitted the duration. */
export function isoDurationToMinutes(iso?: string | null): number {
  if (!iso) return 0;
  const m = /^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/.exec(iso);
  if (!m) return 0;
  return Number(m[1] || 0) * 1440 + Number(m[2] || 0) * 60 + Number(m[3] || 0);
}

export function formatMinutes(mins: number): string {
  if (!mins || mins <= 0) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return [h ? `${h}h` : "", m ? `${m}m` : ""].filter(Boolean).join(" ");
}

export function formatDuration(iso?: string | null): string {
  return formatMinutes(isoDurationToMinutes(iso));
}

/** Duffel returns local times without an offset (e.g. "2026-09-10T06:58:00"). Render as-is. */
export function formatTime(value?: string | null): string {
  if (!value) return "—";
  const m = /T(\d{2}):(\d{2})/.exec(value);
  if (m) return `${m[1]}:${m[2]}`;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toTimeString().slice(0, 5);
}

export function formatDateShort(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value.length <= 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function formatMoney(amount?: string | null, currency?: string | null): string {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency || ""} ${value.toFixed(2)}`.trim();
  }
}

export function segmentCarrier(segment: DuffelSegment) {
  return segment.marketing_carrier || segment.operating_carrier || null;
}

export function segmentFlightNumber(segment: DuffelSegment): string {
  const carrier = segmentCarrier(segment);
  const num =
    segment.marketing_carrier_flight_number || segment.operating_carrier_flight_number || null;
  if (!num) return "";
  return `${carrier?.iata_code ? `${carrier.iata_code} ` : ""}${num}`;
}

/** Layovers = connections between segments plus any technical stops within a segment. */
export function sliceStops(slice: DuffelSlice): number {
  const connections = Math.max((slice.segments?.length || 1) - 1, 0);
  const technical = (slice.segments || []).reduce((sum, s) => sum + (s.stops?.length || 0), 0);
  return connections + technical;
}

export function sliceStopAirports(slice: DuffelSlice): string[] {
  const codes: string[] = [];
  (slice.segments || []).forEach((segment, i) => {
    (segment.stops || []).forEach((stop) => {
      if (stop.airport?.iata_code) codes.push(stop.airport.iata_code);
    });
    if (i < (slice.segments?.length || 0) - 1 && segment.destination?.iata_code) {
      codes.push(segment.destination.iata_code);
    }
  });
  return codes;
}

export function stopsLabel(slice: DuffelSlice): string {
  const stops = sliceStops(slice);
  if (stops === 0) return "Non-stop";
  const cities = sliceStopAirports(slice);
  return `${stops} stop${stops > 1 ? "s" : ""}${cities.length ? ` • ${cities.join(", ")}` : ""}`;
}

/** Layover minutes between segment i and i+1. */
export function layoverMinutes(slice: DuffelSlice, index: number): number {
  const current = slice.segments?.[index];
  const next = slice.segments?.[index + 1];
  if (!current?.arriving_at || !next?.departing_at) return 0;
  const a = new Date(current.arriving_at).getTime();
  const b = new Date(next.departing_at).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b <= a) return 0;
  return Math.round((b - a) / 60000);
}

export function offerTotalMinutes(offer: DuffelOffer): number {
  return (offer.slices || []).reduce((sum, s) => {
    const explicit = isoDurationToMinutes(s.duration);
    if (explicit) return sum + explicit;
    const first = s.segments?.[0]?.departing_at;
    const last = s.segments?.[s.segments.length - 1]?.arriving_at;
    if (first && last) {
      const diff = (new Date(last).getTime() - new Date(first).getTime()) / 60000;
      if (Number.isFinite(diff) && diff > 0) return sum + Math.round(diff);
    }
    return sum;
  }, 0);
}

export function offerPrice(offer: DuffelOffer): number {
  const n = Number(offer.total_amount);
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
}

export function offerMaxStops(offer: DuffelOffer): number {
  return (offer.slices || []).reduce((max, s) => Math.max(max, sliceStops(s)), 0);
}

export function offerAirlines(offer: DuffelOffer): Array<{ code: string; name: string }> {
  const map = new Map<string, string>();
  if (offer.owner?.iata_code) map.set(offer.owner.iata_code, offer.owner.name || offer.owner.iata_code);
  (offer.slices || []).forEach((s) =>
    (s.segments || []).forEach((seg) => {
      const c = segmentCarrier(seg);
      if (c?.iata_code) map.set(c.iata_code, c.name || c.iata_code);
    }),
  );
  return [...map.entries()].map(([code, name]) => ({ code, name }));
}

export function offerCabins(offer: DuffelOffer): string[] {
  const set = new Set<string>();
  (offer.slices || []).forEach((s) =>
    (s.segments || []).forEach((seg) => {
      if (seg.cabin_class) set.add(seg.cabin_class);
    }),
  );
  return [...set];
}

export function offerBaggage(offer: DuffelOffer): { checked: number; carryOn: number } {
  let checked = 0;
  let carryOn = 0;
  (offer.slices || []).forEach((s) =>
    (s.segments || []).forEach((seg) => {
      (seg.baggages || []).forEach((b) => {
        if (b.type === "checked") checked = Math.max(checked, b.quantity || 0);
        if (b.type === "carry_on") carryOn = Math.max(carryOn, b.quantity || 0);
      });
    }),
  );
  return { checked, carryOn };
}

export function offerDepartureMinutes(offer: DuffelOffer): number {
  const at = offer.slices?.[0]?.segments?.[0]?.departing_at;
  if (!at) return 0;
  const m = /T(\d{2}):(\d{2})/.exec(at);
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0;
}

export function offerArrivalMinutes(offer: DuffelOffer): number {
  const segments = offer.slices?.[0]?.segments || [];
  const at = segments[segments.length - 1]?.arriving_at;
  if (!at) return 0;
  const m = /T(\d{2}):(\d{2})/.exec(at);
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0;
}

export function cabinLabel(value?: string | null): string {
  if (!value) return "";
  return value
    .split("_")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export function conditionLabel(
  condition?: { allowed?: boolean; penalty_amount?: string | null; penalty_currency?: string | null } | null,
  kind: "Refund" | "Change" = "Refund",
): string {
  if (!condition || condition.allowed == null) return `${kind} conditions: check with airline`;
  if (!condition.allowed) return `Non-${kind.toLowerCase()}able before departure`;
  const fee = condition.penalty_amount
    ? ` (fee ${formatMoney(condition.penalty_amount, condition.penalty_currency)})`
    : " (no fee)";
  return `${kind} allowed before departure${fee}`;
}
