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
    aircraft: seg?.aircraft?.name ?? null,
    cabin: first?.cabin?.name ?? null,
    cabin_class: first?.cabin_class ?? null,
    cabin_class_marketing_name: first?.cabin_class_marketing_name ?? null,
    fare_basis_code: first?.fare_basis_code ?? null,
    baggages: baggages.map((b: Any) => ({ type: b?.type ?? null, quantity: b?.quantity ?? 0 })),
    amenities: {
      wifi: first?.cabin?.amenities?.wifi?.available ?? null,
      power: first?.cabin?.amenities?.power?.available ?? null,
      seat_pitch: first?.cabin?.amenities?.seat?.pitch ?? null,
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
    tax_amount: offer?.tax_amount ?? null,
    expires_at: offer?.expires_at ?? null,
    owner: carrier(offer?.owner),
    passenger_identity_documents_required: offer?.passenger_identity_documents_required ?? null,
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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const offerId = String((body as Any)?.offerId ?? "").trim();

    if (!/^off_[A-Za-z0-9_-]{5,80}$/.test(offerId)) {
      return json({ error: "That flight selection is no longer valid. Please search again." }, 400);
    }

    const key = Deno.env.get("DUFFEL_API_KEY");
    if (!key) {
      console.error("DUFFEL_API_KEY is not configured");
      return json({ error: "Flight details are temporarily unavailable." }, 200);
    }

    const res = await fetch(
      `https://api.duffel.com/air/offers/${encodeURIComponent(offerId)}?return_available_services=false`,
      {
        headers: {
          Authorization: `Bearer ${key}`,
          "Duffel-Version": "v2",
          Accept: "application/json",
        },
      },
    );

    let payload: Any | null = null;
    try {
      payload = await res.json();
    } catch {
      payload = null;
    }

    if (!res.ok) {
      console.error("Duffel offer fetch error", res.status, JSON.stringify(payload?.errors ?? {}).slice(0, 500));
      const expired = res.status === 404 || res.status === 410;
      return json(
        {
          error: expired
            ? "This fare has expired. Please search again to see current prices."
            : "We couldn't load this flight right now. Please try again.",
          expired,
        },
        200,
      );
    }

    return json({ offer: mapOffer(payload?.data ?? {}) });
  } catch (err) {
    console.error("duffel-offer-get failure:", err instanceof Error ? err.message : err);
    return json({ error: "We couldn't load this flight right now. Please try again." }, 200);
  }
});
