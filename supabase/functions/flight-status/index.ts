import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Metro/city codes → comma-separated airport lists (Google Flights accepts multi-airport queries)
const METRO_TO_AIRPORTS: Record<string, string> = {
  PAR: "CDG,ORY", NYC: "JFK,LGA,EWR", LON: "LHR,LGW,STN,LTN,LCY", TYO: "HND,NRT",
  WAS: "IAD,DCA,BWI", CHI: "ORD,MDW", MIL: "MXP,LIN,BGY", ROM: "FCO,CIA",
};
const expandCode = (code: string) => METRO_TO_AIRPORTS[code.toUpperCase()] || code.toUpperCase();

function minutesToDuration(mins?: number): string {
  if (!mins || mins <= 0) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h ? `${h}h ` : ""}${m ? `${m}m` : ""}`.trim();
}

// Build a normalized flight-status result from a SerpAPI Google Flights option
function serpToStatus(opt: any) {
  const segs = opt.flights || [];
  const first = segs[0] || {};
  const last = segs[segs.length - 1] || first;
  const carrierCode = (first.flight_number || "").split(" ")[0] || "";
  return {
    airline: first.airline || carrierCode || "Unknown",
    airlineCode: carrierCode || "??",
    flightNumber: first.flight_number || "",
    departureAirport: first.departure_airport?.id || "???",
    departureTime: (first.departure_airport?.time || "").replace(" ", "T"),
    departureTerminal: undefined,
    departureGate: undefined,
    arrivalAirport: last.arrival_airport?.id || "???",
    arrivalTime: (last.arrival_airport?.time || "").replace(" ", "T"),
    arrivalTerminal: undefined,
    arrivalGate: undefined,
    status: "on-time",
    statusLabel: "Scheduled",
    duration: minutesToDuration(opt.total_duration),
    aircraft: first.airplane || "",
    stops: Math.max(0, segs.length - 1),
  };
}

async function searchSerpRoute(origin: string, destination: string, date: string) {
  const key = Deno.env.get("SERPAPI_KEY");
  if (!key) return { error: "Flight status provider not configured" };

  const sp = new URLSearchParams({
    engine: "google_flights",
    api_key: key,
    departure_id: expandCode(origin),
    arrival_id: expandCode(destination),
    outbound_date: date,
    type: "2", // one-way
    adults: "1",
    currency: "USD",
    hl: "en",
    gl: "us",
  });

  const res = await fetch(`https://serpapi.com/search.json?${sp.toString()}`);
  if (!res.ok) return { error: `Provider error (${res.status})` };
  const json = await res.json();
  if (json.error) {
    if (/hasn't returned any results|no results/i.test(String(json.error))) return { data: [] };
    return { error: String(json.error) };
  }
  const all = [...(json.best_flights || []), ...(json.other_flights || [])].slice(0, 8);
  return { data: all.map(serpToStatus) };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { searchType, flightNumber, carrierCode, date, origin, destination } = await req.json();

    if (!date) {
      return new Response(JSON.stringify({ error: "Date is required", data: [] }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Route search → real Google Flights data via SerpAPI
    if (searchType === "route") {
      if (!origin || !destination) {
        return new Response(JSON.stringify({ error: "Origin and destination required", data: [] }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const result = await searchSerpRoute(origin, destination, date);
      return new Response(
        JSON.stringify({ data: result.data || [], error: result.error, searchType: "route", source: "serpapi-google-flights" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Flight-number search: Google Flights cannot resolve an arbitrary flight number
    // (it requires a route + date). Return an honest, explicit response — never fake data.
    if (!carrierCode || !flightNumber) {
      return new Response(JSON.stringify({ error: "Carrier code and flight number required", data: [] }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        data: [],
        searchType: "flight",
        error:
          "Live status by flight number isn't available from our flight data provider. Please use the “By Route” tab to see real, up-to-date flights for your origin and destination.",
        source: "serpapi-google-flights",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error", data: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
