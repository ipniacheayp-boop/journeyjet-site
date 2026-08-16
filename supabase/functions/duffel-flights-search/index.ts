/// <reference path="../flights-search/deno-shim.d.ts" />
// @ts-expect-error TS2307 — Supabase Edge Functions run on Deno, not Vite.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const IATA = /^[A-Z]{3}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const CABINS = new Set(["economy", "premium_economy", "business", "first"]);

type SearchInput = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string | null;
  adults: number;
  children: number;
  infants: number;
  cabinClass: string;
  slices?: Array<{ origin: string; destination: string; departureDate: string }>;
};

function validate(body: Record<string, unknown>): { input: SearchInput } | { error: string } {
  const origin = String(body.origin ?? "").trim().toUpperCase();
  const destination = String(body.destination ?? "").trim().toUpperCase();
  const departureDate = String(body.departureDate ?? "").trim();
  const returnDateRaw = body.returnDate ? String(body.returnDate).trim() : "";
  const cabinClass = String(body.cabinClass ?? "economy").trim().toLowerCase();

  const adults = Number(body.adults ?? 1);
  const children = Number(body.children ?? 0);
  const infants = Number(body.infants ?? 0);

  const rawSlices = Array.isArray(body.slices) ? body.slices : [];
  const slices = rawSlices
    .map((s) => {
      const r = (s ?? {}) as Record<string, unknown>;
      return {
        origin: String(r.origin ?? "").trim().toUpperCase(),
        destination: String(r.destination ?? "").trim().toUpperCase(),
        departureDate: String(r.departureDate ?? "").trim(),
      };
    })
    .filter((s) => s.origin || s.destination || s.departureDate);

  const legs = slices.length > 0
    ? slices
    : [{ origin, destination, departureDate }];

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (const leg of legs) {
    if (!IATA.test(leg.origin) || !IATA.test(leg.destination)) {
      return { error: "Please choose a valid departure and arrival airport." };
    }
    if (leg.origin === leg.destination) {
      return { error: "Departure and arrival airports must be different." };
    }
    if (!ISO_DATE.test(leg.departureDate) || Number.isNaN(Date.parse(leg.departureDate))) {
      return { error: "Please select a valid travel date." };
    }
    if (new Date(`${leg.departureDate}T00:00:00Z`) < today) {
      return { error: "Departure date cannot be in the past." };
    }
  }

  if (returnDateRaw) {
    if (!ISO_DATE.test(returnDateRaw) || Number.isNaN(Date.parse(returnDateRaw))) {
      return { error: "Please select a valid return date." };
    }
    if (new Date(`${returnDateRaw}T00:00:00Z`) < new Date(`${legs[0].departureDate}T00:00:00Z`)) {
      return { error: "Return date must be on or after the departure date." };
    }
  }

  if (!Number.isInteger(adults) || adults < 1 || adults > 9) {
    return { error: "Please select between 1 and 9 adults." };
  }
  if (!Number.isInteger(children) || children < 0 || children > 8) {
    return { error: "Please check the number of children." };
  }
  if (!Number.isInteger(infants) || infants < 0 || infants > adults) {
    return { error: "Each infant must travel with an adult." };
  }
  if (adults + children + infants > 9) {
    return { error: "A maximum of 9 passengers can be searched at once." };
  }
  if (!CABINS.has(cabinClass)) {
    return { error: "Please select a valid cabin class." };
  }

  return {
    input: {
      origin: legs[0].origin,
      destination: legs[0].destination,
      departureDate: legs[0].departureDate,
      returnDate: returnDateRaw || null,
      adults,
      children,
      infants,
      cabinClass,
      slices: legs,
    },
  };
}

function buildDuffelPayload(input: SearchInput) {
  const legs = input.slices && input.slices.length > 0
    ? input.slices
    : [{ origin: input.origin, destination: input.destination, departureDate: input.departureDate }];

  const slices = legs.map((l) => ({
    origin: l.origin,
    destination: l.destination,
    departure_date: l.departureDate,
  }));

  // Round trip: append the inbound slice when only one leg was provided.
  if (input.returnDate && slices.length === 1) {
    slices.push({
      origin: input.destination,
      destination: input.origin,
      departure_date: input.returnDate,
    });
  }

  const passengers: Array<Record<string, unknown>> = [];
  for (let i = 0; i < input.adults; i++) passengers.push({ type: "adult" });
  for (let i = 0; i < input.children; i++) passengers.push({ age: 10 });
  for (let i = 0; i < input.infants; i++) passengers.push({ type: "infant_without_seat" });

  return { data: { slices, passengers, cabin_class: input.cabinClass } };
}

// ---------- Duffel → app mapping (all fields optional-safe) ----------

type Any = Record<string, any>;

const place = (p: Any | null | undefined) => ({
  iata_code: p?.iata_code ?? null,
  name: p?.name ?? null,
  city_name: p?.city_name ?? p?.city?.name ?? null,
  time_zone: p?.time_zone ?? null,
});

const carrier = (c: Any | null | undefined) =>
  c
    ? {
        name: c.name ?? null,
        iata_code: c.iata_code ?? null,
        logo_symbol_url: c.logo_symbol_url ?? null,
        logo_lockup_url: c.logo_lockup_url ?? null,
      }
    : null;

function mapSegment(seg: Any) {
  const pax = Array.isArray(seg?.passengers) ? seg.passengers : [];
  const first = pax[0] ?? {};
  const baggages = Array.isArray(first?.baggages) ? first.baggages : [];
  return {
    id: seg?.id ?? null,
    departing_at: seg?.departing_at ?? null,
    arriving_at: seg?.arriving_at ?? null,
    duration: seg?.duration ?? null,
    origin: place(seg?.origin),
    destination: place(seg?.destination),
    origin_terminal: seg?.origin_terminal ?? null,
    destination_terminal: seg?.destination_terminal ?? null,
    marketing_carrier: carrier(seg?.marketing_carrier),
    operating_carrier: carrier(seg?.operating_carrier),
    marketing_carrier_flight_number: seg?.marketing_carrier_flight_number ?? null,
    operating_carrier_flight_number: seg?.operating_carrier_flight_number ?? null,
    aircraft: seg?.aircraft
      ? { name: seg.aircraft.name ?? null, iata_code: seg.aircraft.iata_code ?? null }
      : null,
    cabin: first?.cabin?.name ?? null,
    cabin_class: first?.cabin_class ?? null,
    cabin_class_marketing_name: first?.cabin_class_marketing_name ?? null,
    fare_basis_code: first?.fare_basis_code ?? null,
    baggages: baggages.map((b: Any) => ({ type: b?.type ?? null, quantity: b?.quantity ?? 0 })),
    amenities: {
      wifi: first?.cabin?.amenities?.wifi?.available ?? null,
      power: first?.cabin?.amenities?.power?.available ?? null,
      seat_pitch: first?.cabin?.amenities?.seat?.pitch ?? null,
      legroom: first?.cabin?.amenities?.seat?.legroom ?? null,
    },
    stops: (Array.isArray(seg?.stops) ? seg.stops : []).map((s: Any) => ({
      airport: place(s?.airport),
      duration: s?.duration ?? null,
    })),
  };
}

function mapOffer(offer: Any) {
  const slices = Array.isArray(offer?.slices) ? offer.slices : [];
  return {
    id: offer?.id ?? null,
    total_amount: offer?.total_amount ?? null,
    total_currency: offer?.total_currency ?? null,
    base_amount: offer?.base_amount ?? null,
    base_currency: offer?.base_currency ?? null,
    tax_amount: offer?.tax_amount ?? null,
    tax_currency: offer?.tax_currency ?? null,
    total_emissions_kg: offer?.total_emissions_kg ?? null,
    payment_requirements: offer?.payment_requirements
      ? {
          requires_instant_payment: offer.payment_requirements.requires_instant_payment ?? null,
          payment_required_by: offer.payment_requirements.payment_required_by ?? null,
          price_guarantee_expires_at:
            offer.payment_requirements.price_guarantee_expires_at ?? null,
        }
      : null,
    expires_at: offer?.expires_at ?? null,
    owner: carrier(offer?.owner),
    passenger_identity_documents_required:
      offer?.passenger_identity_documents_required ?? null,
    conditions: {
      refund_before_departure: offer?.conditions?.refund_before_departure ?? null,
      change_before_departure: offer?.conditions?.change_before_departure ?? null,
    },
    passengers: (Array.isArray(offer?.passengers) ? offer.passengers : []).map((p: Any) => ({
      id: p?.id ?? null,
      type: p?.type ?? null,
      age: p?.age ?? null,
    })),
    slices: slices.map((s: Any) => ({
      id: s?.id ?? null,
      duration: s?.duration ?? null,
      origin: place(s?.origin),
      destination: place(s?.destination),
      fare_brand_name: s?.fare_brand_name ?? null,
      conditions: {
        refund_before_departure: s?.conditions?.refund_before_departure ?? null,
        change_before_departure: s?.conditions?.change_before_departure ?? null,
      },
      segments: (Array.isArray(s?.segments) ? s.segments : []).map(mapSegment),
    })),
  };
}

async function duffelFetch(path: string, init: RequestInit & { body?: string } = {}) {
  const key = Deno.env.get("DUFFEL_API_KEY");
  if (!key) return { status: 0, ok: false, body: null, missingKey: true };

  const res = await fetch(`https://api.duffel.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Duffel-Version": "v2",
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers as Record<string, string> | undefined),
    },
  });

  let body: any = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { status: res.status, ok: res.ok, body, missingKey: false };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const validated = validate((body ?? {}) as Record<string, unknown>);
    if ("error" in validated) return json({ error: validated.error, offers: [] }, 400);

    const payload = buildDuffelPayload(validated.input);

    const res = await duffelFetch("/air/offer_requests?return_offers=true&supplier_timeout=20000", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res.missingKey) {
      console.error("DUFFEL_API_KEY is not configured");
      return json({ error: "Flight search is temporarily unavailable.", offers: [] }, 200);
    }

    if (!res.ok) {
      const first = res.body?.errors?.[0];
      console.error("Duffel error", res.status, JSON.stringify(res.body?.errors ?? res.body ?? {}).slice(0, 800));
      const friendly =
        res.status === 422
          ? first?.title === "Invalid IATA code" || /iata/i.test(String(first?.message ?? ""))
            ? "One of the airports isn't supported for this route. Please try a different airport."
            : "We couldn't search those details. Please review your airports, dates and passengers."
          : res.status === 429
            ? "Too many searches right now. Please try again in a moment."
            : "Flight search is temporarily unavailable. Please try again.";
      return json({ error: friendly, offers: [] }, 200);
    }

    const rawOffers: Any[] = Array.isArray(res.body?.data?.offers) ? res.body.data.offers : [];
    const offers = rawOffers.map(mapOffer).filter((o) => o.id && o.slices.length > 0);

    return json({
      offers,
      offer_request_id: res.body?.data?.id ?? null,
      meta: {
        provider: "duffel",
        live_mode: res.body?.data?.live_mode ?? false,
        count: offers.length,
      },
    });
  } catch (err) {
    console.error("duffel-flights-search failure:", err instanceof Error ? err.message : err);
    return json({ error: "Something went wrong while searching flights. Please try again.", offers: [] }, 200);
  }
});
