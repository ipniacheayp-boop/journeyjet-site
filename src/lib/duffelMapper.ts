import type { DuffelCarrier, DuffelOffer, DuffelSegment, DuffelSlice } from "@/types/duffel";
import {
  cabinLabel,
  formatDuration,
  formatMinutes,
  isoDurationToMinutes,
  layoverMinutes,
  offerTotalMinutes,
  sliceStopAirports,
  sliceStops,
} from "@/lib/duffelUtils";

/**
 * Single normalization layer for the Duffel offer shape. The UI consumes only
 * `NormalizedFlight` so no component has to know Duffel's field names, and every
 * value is null-safe (missing data is simply omitted rather than rendered empty).
 */

export interface NormalizedAirline {
  name: string | null;
  code: string | null;
  logo: string | null;
  logoLockup: string | null;
}

export interface NormalizedBaggage {
  checked: number;
  carryOn: number;
  available: boolean;
}

export interface NormalizedSegment {
  id: string;
  airline: NormalizedAirline;
  operatingAirline: NormalizedAirline | null;
  flightNumber: string | null;
  departure: {
    time: string | null;
    iso: string | null;
    iata: string | null;
    city: string | null;
    airport: string | null;
    terminal: string | null;
  };
  arrival: {
    time: string | null;
    iso: string | null;
    iata: string | null;
    city: string | null;
    airport: string | null;
    terminal: string | null;
  };
  duration: string | null;
  aircraft: string | null;
  cabin: string | null;
  fareBasis: string | null;
  baggage: NormalizedBaggage;
  amenities: string[];
  technicalStops: Array<{ label: string; duration: string | null }>;
  layoverAfter: { label: string; place: string | null } | null;
}

export interface NormalizedSlice {
  id: string;
  label: string;
  originIata: string | null;
  destinationIata: string | null;
  originCity: string | null;
  destinationCity: string | null;
  departureDateIso: string | null;
  duration: string | null;
  stops: number;
  stopsLabel: string;
  stopAirports: string[];
  fareBrand: string | null;
  segments: NormalizedSegment[];
  conditions: { refund: string | null; change: string | null };
}

export interface NormalizedFlight {
  id: string;
  airline: NormalizedAirline;
  airlines: NormalizedAirline[];
  flightNumber: string | null;
  slices: NormalizedSlice[];
  segments: NormalizedSegment[];
  duration: string | null;
  stops: number;
  cabin: string | null;
  fareBrand: string | null;
  baggage: NormalizedBaggage;
  amenities: string[];
  aircraft: string | null;
  price: number | null;
  priceAmount: string | null;
  currency: string | null;
  baseAmount: string | null;
  baseCurrency: string | null;
  taxAmount: string | null;
  taxCurrency: string | null;
  passengerCount: number;
  conditions: { refundable: boolean | null; changeable: boolean | null };
  expiresAt: string | null;
  paymentRequiredBy: string | null;
  priceGuaranteeExpiresAt: string | null;
  identityDocumentsRequired: boolean | null;
}

const clean = (v?: string | null) => {
  const s = (v ?? "").trim();
  return s.length ? s : null;
};

function normalizeCarrier(c?: DuffelCarrier | null): NormalizedAirline | null {
  if (!c) return null;
  const name = clean(c.name);
  const code = clean(c.iata_code);
  if (!name && !code) return null;
  return {
    name: name || code,
    code,
    logo: clean(c.logo_symbol_url),
    logoLockup: clean(c.logo_lockup_url),
  };
}

const emptyAirline: NormalizedAirline = { name: null, code: null, logo: null, logoLockup: null };

function segmentAirlines(segment: DuffelSegment) {
  const marketing = normalizeCarrier(segment.marketing_carrier);
  const operating = normalizeCarrier(segment.operating_carrier);
  // Prefer the operating carrier for branding (that is who actually flies you).
  const primary = operating || marketing || emptyAirline;
  const secondary =
    operating && marketing && operating.code !== marketing.code ? marketing : null;
  return { primary, secondary };
}

function segmentFlightNo(segment: DuffelSegment, airline: NormalizedAirline): string | null {
  const num = clean(segment.marketing_carrier_flight_number) ||
    clean(segment.operating_carrier_flight_number);
  if (!num) return null;
  return airline.code ? `${airline.code} ${num}` : num;
}

function timeOf(iso?: string | null): string | null {
  if (!iso) return null;
  const m = /T(\d{2}):(\d{2})/.exec(iso);
  if (m) return `${m[1]}:${m[2]}`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toTimeString().slice(0, 5);
}

function baggageOf(segments: DuffelSegment[]): NormalizedBaggage {
  let checked = 0;
  let carryOn = 0;
  let available = false;
  segments.forEach((seg) => {
    (seg.baggages || []).forEach((b) => {
      available = true;
      const qty = Number(b.quantity) || 0;
      if (b.type === "checked") checked = Math.max(checked, qty);
      if (b.type === "carry_on") carryOn = Math.max(carryOn, qty);
    });
  });
  return { checked, carryOn, available };
}

function amenitiesOf(segment: DuffelSegment): string[] {
  const list: string[] = [];
  if (segment.amenities?.wifi) list.push("Wi-Fi");
  if (segment.amenities?.power) list.push("Power");
  const pitch = clean(segment.amenities?.seat_pitch);
  if (pitch) list.push(`${pitch}" pitch`);
  const legroom = clean(segment.amenities?.legroom);
  if (legroom && !/^n\/?a$/i.test(legroom)) list.push(`${cabinLabel(legroom)} legroom`);
  return list;
}

function aircraftOf(segment: DuffelSegment): string | null {
  const name = clean(segment.aircraft?.name);
  const code = clean(segment.aircraft?.iata_code);
  if (name && code) return `${name} (${code})`;
  return name || code || null;
}

function cabinOf(segment: DuffelSegment): string | null {
  // Prefer the human cabin class; airline marketing names are often raw codes (e.g. "ECO").
  const cls = segment.cabin_class ? cabinLabel(segment.cabin_class) : null;
  return cls || clean(segment.cabin) || clean(segment.cabin_class_marketing_name);
}

function conditionText(
  condition?: { allowed?: boolean; penalty_amount?: string | null; penalty_currency?: string | null } | null,
  kind: "Refund" | "Change" = "Refund",
): string | null {
  if (!condition || condition.allowed == null) return null;
  if (!condition.allowed) return kind === "Refund" ? "Non-refundable" : "No changes allowed";
  const fee = clean(condition.penalty_amount);
  const feeText = fee ? ` (fee ${fee} ${condition.penalty_currency || ""})`.trimEnd() : " (no fee)";
  return `${kind === "Refund" ? "Refundable" : "Changes allowed"}${feeText}`;
}

function normalizeSlice(slice: DuffelSlice, index: number, total: number): NormalizedSlice {
  const segments = Array.isArray(slice.segments) ? slice.segments : [];

  const normSegments: NormalizedSegment[] = segments.map((seg, i) => {
    const { primary, secondary } = segmentAirlines(seg);
    const mins = layoverMinutes(slice, i);
    return {
      id: seg.id || `${slice.id || index}-${i}`,
      airline: primary,
      operatingAirline: secondary,
      flightNumber: segmentFlightNo(seg, primary),
      departure: {
        time: timeOf(seg.departing_at),
        iso: seg.departing_at ?? null,
        iata: clean(seg.origin?.iata_code),
        city: clean(seg.origin?.city_name),
        airport: clean(seg.origin?.name),
        terminal: clean(seg.origin_terminal),
      },
      arrival: {
        time: timeOf(seg.arriving_at),
        iso: seg.arriving_at ?? null,
        iata: clean(seg.destination?.iata_code),
        city: clean(seg.destination?.city_name),
        airport: clean(seg.destination?.name),
        terminal: clean(seg.destination_terminal),
      },
      duration: seg.duration ? formatDuration(seg.duration) : null,
      aircraft: aircraftOf(seg),
      cabin: cabinOf(seg),
      fareBasis: clean(seg.fare_basis_code),
      baggage: baggageOf([seg]),
      amenities: amenitiesOf(seg),
      technicalStops: (seg.stops || [])
        .map((s) => ({
          label: clean(s.airport?.city_name) || clean(s.airport?.iata_code) || clean(s.airport?.name) || "",
          duration: s.duration ? formatDuration(s.duration) : null,
        }))
        .filter((s) => s.label),
      layoverAfter:
        mins > 0
          ? {
              label: `${formatMinutes(mins)} layover`,
              place:
                clean(seg.destination?.city_name) || clean(seg.destination?.iata_code) || null,
            }
          : null,
    };
  });

  const stops = sliceStops(slice);
  const stopAirports = sliceStopAirports(slice);
  const durationIso = slice.duration;
  const fallbackMins = (() => {
    const first = segments[0]?.departing_at;
    const last = segments[segments.length - 1]?.arriving_at;
    if (!first || !last) return 0;
    const diff = (new Date(last).getTime() - new Date(first).getTime()) / 60000;
    return Number.isFinite(diff) && diff > 0 ? Math.round(diff) : 0;
  })();

  return {
    id: slice.id || `slice-${index}`,
    label: total > 1 ? (index === 0 ? "Outbound" : index === 1 ? "Return" : `Flight ${index + 1}`) : "Itinerary",
    originIata: clean(slice.origin?.iata_code) || normSegments[0]?.departure.iata || null,
    destinationIata:
      clean(slice.destination?.iata_code) ||
      normSegments[normSegments.length - 1]?.arrival.iata ||
      null,
    originCity: clean(slice.origin?.city_name) || normSegments[0]?.departure.city || null,
    destinationCity:
      clean(slice.destination?.city_name) ||
      normSegments[normSegments.length - 1]?.arrival.city ||
      null,
    departureDateIso: segments[0]?.departing_at ?? null,
    duration: isoDurationToMinutes(durationIso)
      ? formatDuration(durationIso)
      : fallbackMins
        ? formatMinutes(fallbackMins)
        : null,
    stops,
    stopsLabel:
      stops === 0
        ? "Non-stop"
        : `${stops} stop${stops > 1 ? "s" : ""}${stopAirports.length ? ` • ${stopAirports.join(", ")}` : ""}`,
    stopAirports,
    fareBrand: clean(slice.fare_brand_name),
    segments: normSegments,
    conditions: {
      refund: conditionText(slice.conditions?.refund_before_departure, "Refund"),
      change: conditionText(slice.conditions?.change_before_departure, "Change"),
    },
  };
}

export function mapDuffelOfferToFlight(offer: DuffelOffer): NormalizedFlight {
  const rawSlices = Array.isArray(offer.slices) ? offer.slices : [];
  const slices = rawSlices.map((s, i) => normalizeSlice(s, i, rawSlices.length));
  const segments = slices.flatMap((s) => s.segments);
  const allSegments = rawSlices.flatMap((s) => s.segments || []);

  const airlineMap = new Map<string, NormalizedAirline>();
  segments.forEach((seg) => {
    const key = seg.airline.code || seg.airline.name || "";
    if (key && !airlineMap.has(key)) airlineMap.set(key, seg.airline);
  });
  const owner = normalizeCarrier(offer.owner);
  const airlines = [...airlineMap.values()];
  const primaryAirline = segments[0]?.airline || owner || emptyAirline;

  const amenities = [...new Set(segments.flatMap((s) => s.amenities))];
  const cabins = [...new Set(segments.map((s) => s.cabin).filter(Boolean))] as string[];
  const aircraft = [...new Set(segments.map((s) => s.aircraft).filter(Boolean))] as string[];
  const totalMins = offerTotalMinutes(offer);
  const price = Number(offer.total_amount);

  return {
    id: offer.id,
    airline: primaryAirline,
    airlines: airlines.length ? airlines : owner ? [owner] : [],
    flightNumber: segments[0]?.flightNumber ?? null,
    slices,
    segments,
    duration: totalMins ? formatMinutes(totalMins) : null,
    stops: slices.reduce((max, s) => Math.max(max, s.stops), 0),
    cabin: cabins.length ? cabins.join(" · ") : null,
    fareBrand: slices.map((s) => s.fareBrand).find(Boolean) ?? null,
    baggage: baggageOf(allSegments),
    amenities,
    aircraft: aircraft.length ? aircraft.join(" · ") : null,
    price: Number.isFinite(price) ? price : null,
    priceAmount: clean(offer.total_amount),
    currency: clean(offer.total_currency),
    baseAmount: clean(offer.base_amount),
    baseCurrency: clean(offer.base_currency) || clean(offer.total_currency),
    taxAmount: clean(offer.tax_amount),
    taxCurrency: clean(offer.tax_currency) || clean(offer.total_currency),
    passengerCount: Array.isArray(offer.passengers) ? offer.passengers.length || 1 : 1,
    conditions: {
      refundable: offer.conditions?.refund_before_departure?.allowed ?? null,
      changeable: offer.conditions?.change_before_departure?.allowed ?? null,
    },
    expiresAt: offer.expires_at ?? null,
    paymentRequiredBy: offer.payment_requirements?.payment_required_by ?? null,
    priceGuaranteeExpiresAt: offer.payment_requirements?.price_guarantee_expires_at ?? null,
    identityDocumentsRequired: offer.passenger_identity_documents_required ?? null,
  };
}
