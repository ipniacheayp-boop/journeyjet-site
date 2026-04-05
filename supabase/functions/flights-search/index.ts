import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const KAYAK_BASE_URL = "https://sandbox-en-us.kayakaffiliates.com";
const POLL_ENDPOINT = "/i/api/affiliate/search/flight/v1/poll";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("KAYAK_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "KAYAK_API_KEY is not configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { originLocationCode, destinationLocationCode, departureDate, returnDate, adults, travelClass } = await req.json();

    if (!originLocationCode || !destinationLocationCode || !departureDate || !adults) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map travel class
    const cabinMap: Record<string, string> = {
      ECONOMY: "economy", PREMIUM_ECONOMY: "premiumEconomy",
      BUSINESS: "business", FIRST: "first",
    };
    const cabin = cabinMap[travelClass || "ECONOMY"] || "economy";

    // Build passengers array
    const passengers: string[] = [];
    for (let i = 0; i < (adults || 1); i++) passengers.push("ADT");

    // Build legs
    const legs: any[] = [
      {
        origin: { locationType: "airports", airports: [originLocationCode.toUpperCase()] },
        destination: { locationType: "airports", airports: [destinationLocationCode.toUpperCase()] },
        date: departureDate,
        flex: "exact",
      },
    ];

    if (returnDate) {
      legs.push({
        origin: { locationType: "airports", airports: [destinationLocationCode.toUpperCase()] },
        destination: { locationType: "airports", airports: [originLocationCode.toUpperCase()] },
        date: returnDate,
        flex: "exact",
      });
    }

    const userTrackId = crypto.randomUUID();
    const searchBody = { searchStartParameters: { cabin, passengers, legs } };

    // Extract client IP for KAYAK required header
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || req.headers.get("x-real-ip") 
      || "0.0.0.0";

    const kayakHeaders = {
      "Content-Type": "application/json",
      "x-original-client-ip": clientIp,
    };

    console.log("🔍 Starting KAYAK flight search:", JSON.stringify(searchBody));

    // Step 1: Start the search
    const startUrl = `${KAYAK_BASE_URL}${POLL_ENDPOINT}?apiKey=${apiKey}&userTrackId=${userTrackId}`;
    const startRes = await fetch(startUrl, {
      method: "POST",
      headers: kayakHeaders,
      body: JSON.stringify(searchBody),
    });

    if (!startRes.ok) {
      const errText = await startRes.text();
      console.error("❌ KAYAK search start error:", startRes.status, errText);
      return new Response(
        JSON.stringify({ error: "Failed to start flight search", details: errText }),
        { status: startRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let pollData = await startRes.json();
    const searchId = pollData.searchId;
    const cluster = pollData.cluster;

    console.log("📡 Search started, searchId:", searchId, "cluster:", cluster, "status:", pollData.status);

    // Step 2: Poll until complete (max 15 attempts, 2s apart)
    let attempts = 0;
    const maxAttempts = 15;

    while (pollData.status !== "complete" && attempts < maxAttempts) {
      attempts++;
      await new Promise(r => setTimeout(r, 2000));

      const pollUrl = `${KAYAK_BASE_URL}${POLL_ENDPOINT}?apiKey=${apiKey}&userTrackId=${userTrackId}&cluster=${cluster}`;
      const pollRes = await fetch(pollUrl, {
        method: "POST",
        headers: kayakHeaders,
        body: JSON.stringify({ searchId }),
      });

      if (!pollRes.ok) {
        const errText = await pollRes.text();
        console.error(`❌ Poll attempt ${attempts} failed:`, pollRes.status, errText);
        continue;
      }

      pollData = await pollRes.json();
      console.log(`📡 Poll attempt ${attempts}: status=${pollData.status}, results=${pollData.results?.length || 0}`);
    }

    // Step 3: Normalize KAYAK response to Amadeus-like format for frontend compatibility
    const normalizedResults = normalizeKayakToAmadeus(pollData);

    console.log("✅ Flight search complete:", normalizedResults.length, "offers normalized");

    return new Response(
      JSON.stringify({
        data: normalizedResults,
        meta: { environment: "kayak-affiliate", provider: "kayak" },
        _raw: {
          searchId,
          cluster,
          currency: pollData.currency,
          airlines: pollData.airlines,
          airports: pollData.airports,
          providers: pollData.providers,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error in flights-search:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function normalizeKayakToAmadeus(kayakData: any): any[] {
  if (!kayakData?.results || !Array.isArray(kayakData.results)) return [];

  const legs = kayakData.legs || {};
  const segments = kayakData.segments || {};
  const airlines = kayakData.airlines || {};
  const airports = kayakData.airports || {};
  const currency = kayakData.currency || "USD";

  return kayakData.results.map((result: any) => {
    const bestOption = result.bookingOptions?.[0];
    const price = bestOption?.displayPrice?.price || 0;

    // Build itineraries from legs
    const itineraries = (result.legs || []).map((legRef: any) => {
      const leg = legs[legRef.id];
      if (!leg) return null;

      const legSegments = (leg.segments || []).map((segRef: any) => {
        const seg = segments[segRef.id];
        if (!seg) return null;

        const airlineInfo = airlines[seg.airline];
        return {
          departure: {
            iataCode: seg.origin,
            at: seg.departureTime,
            terminal: "",
          },
          arrival: {
            iataCode: seg.destination,
            at: seg.arrivalTime,
            terminal: "",
          },
          carrierCode: seg.airline,
          number: seg.flightNumber,
          aircraft: { code: seg.equipmentTypeName || "" },
          duration: `PT${Math.floor(seg.duration / 60)}H${seg.duration % 60}M`,
          operating: { carrierCode: seg.airline },
          _airlineName: airlineInfo?.displayName || seg.airline,
          _airlineLogo: airlineInfo?.logoUrl || "",
        };
      }).filter(Boolean);

      return {
        duration: `PT${Math.floor(leg.duration / 60)}H${leg.duration % 60}M`,
        segments: legSegments,
      };
    }).filter(Boolean);

    // Build fare details
    const cabin = bestOption?.segmentFares?.[0]?.cabin?.displayName || "Economy";
    const fareFamilyName = bestOption?.fareFamilies?.[0]?.displayName || "";

    // Booking URL
    const bookingUrl = bestOption?.bookingUrl || "";

    // Badges
    const badges = (bestOption?.badges || []).map((b: any) => b.displayName);

    // Baggage fees
    const fees = bestOption?.fees || {};

    return {
      id: result.id,
      price: {
        total: String(price),
        grandTotal: String(price),
        currency,
        base: String(fees.basePrice?.price || price),
      },
      itineraries,
      travelerPricings: [
        {
          fareDetailsBySegment: (bestOption?.segmentFares || []).map((sf: any) => ({
            cabin: sf.cabin?.displayName || cabin,
            class: sf.cabin?.code || "economy",
          })),
        },
      ],
      _kayak: {
        bookingUrl,
        badges,
        fareFamilyName,
        providerCode: bestOption?.providerCode || "",
        providerName: kayakData.providers?.[bestOption?.providerCode]?.displayName || "",
        providerLogo: kayakData.providers?.[bestOption?.providerCode]?.logoUrls?.imageUrl || "",
        allBookingOptions: result.bookingOptions || [],
        fees,
        amenities: bestOption?.fareFamilies?.[0]?.amenities || [],
        qualityItems: bestOption?.segmentFares?.[0]?.qualityItems || [],
      },
    };
  });
}
