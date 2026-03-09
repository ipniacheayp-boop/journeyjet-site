import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are FlyBot, the official AI travel assistant for Triplie.com. You help users find flights, answer travel questions, and provide booking assistance.

## Your Capabilities:
1. **Flight Search**: You can search for real flights using the search_flights tool. When a user asks about flights, extract the origin, destination, date, and other parameters, then call the tool.
2. **Travel Knowledge**: Answer questions about baggage allowance, visa requirements, airline policies, cheapest times to fly, airport info, travel tips, hotel suggestions, and refund/cancellation policies.
3. **Booking Help**: Guide users through the booking process on Tripile.com.

## Flight Search Rules:
- When a user mentions wanting to fly somewhere, ALWAYS use the search_flights tool.
- Parse natural language dates: "tomorrow" = next day, "next Friday", "in 2 weeks", etc. Use ISO format YYYY-MM-DD.
- If origin or destination is missing, ask the user.
- If the date is missing, ask or suggest searching for the nearest weekend.
- Use common IATA codes: Delhi=DEL, Mumbai=BOM, Dubai=DXB, London=LHR, New York=JFK, Paris=CDG, Tokyo=NRT, Singapore=SIN, Bangkok=BKK, Los Angeles=LAX, Chicago=ORD, San Francisco=SFO, Sydney=SYD, Hong Kong=HKG, Toronto=YYZ, Istanbul=IST, Seoul=ICN, Amsterdam=AMS, Frankfurt=FRA, Madrid=MAD, Barcelona=BCN, Miami=MIA, Boston=BOS, Atlanta=ATL, Bangalore=BLR, Chennai=MAA, Kolkata=CCU, Hyderabad=HYD, Goa=GOI, Kochi=COK, Ahmedabad=AMD, Pune=PNQ, Abu Dhabi=AUH, Accra=ACC, Athens=ATH.
- Default to 1 adult if not specified.
- Default to Economy class if not specified.

## Response Style:
- Be friendly, helpful, and concise.
- Use emoji sparingly for warmth.
- For flight results, the system will automatically format them as cards.
- When you get flight results, summarize the top options briefly.

## Contact Info:
- Phone: +1-315-625-6865 (24/7)
- Website: tripile.com

Today's date is: ${new Date().toISOString().split('T')[0]}`;

const FLIGHT_SEARCH_TOOL = {
  type: "function",
  function: {
    name: "search_flights",
    description: "Search for real flight offers between two airports on specific dates. Use this whenever a user asks about flights, airfare, or wants to book a trip.",
    parameters: {
      type: "object",
      properties: {
        originLocationCode: {
          type: "string",
          description: "3-letter IATA airport code for departure (e.g., JFK, DEL, LHR)"
        },
        destinationLocationCode: {
          type: "string",
          description: "3-letter IATA airport code for arrival (e.g., DXB, CDG, SIN)"
        },
        departureDate: {
          type: "string",
          description: "Departure date in YYYY-MM-DD format"
        },
        returnDate: {
          type: "string",
          description: "Return date in YYYY-MM-DD format (optional, for round trips)"
        },
        adults: {
          type: "number",
          description: "Number of adult passengers (default 1)"
        },
        travelClass: {
          type: "string",
          enum: ["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"],
          description: "Travel class (default ECONOMY)"
        }
      },
      required: ["originLocationCode", "destinationLocationCode", "departureDate"],
      additionalProperties: false
    }
  }
};

// In-memory Amadeus token cache
let cachedToken: { token: string; expiresAt: number } | null = null;
const USE_PROD_APIS = Deno.env.get("USE_PROD_APIS") === "true";
const AMADEUS_BASE_URL = USE_PROD_APIS ? "https://api.amadeus.com" : "https://test.api.amadeus.com";

async function getAmadeusToken(forceRefresh = false): Promise<string> {
  if (forceRefresh) cachedToken = null;
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;

  const apiKey = Deno.env.get("AMADEUS_API_KEY");
  const apiSecret = Deno.env.get("AMADEUS_API_SECRET");
  if (!apiKey || !apiSecret) throw new Error("Amadeus credentials not configured");

  const authResponse = await fetch(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=client_credentials&client_id=${encodeURIComponent(apiKey)}&client_secret=${encodeURIComponent(apiSecret)}`,
  });

  if (!authResponse.ok) throw new Error(`Amadeus auth failed: ${authResponse.status}`);
  const authData = await authResponse.json();
  cachedToken = { token: authData.access_token, expiresAt: Date.now() + 25 * 60 * 1000 };
  return authData.access_token;
}

async function searchFlights(params: any): Promise<any> {
  let token = await getAmadeusToken();

  const queryParams = new URLSearchParams({
    originLocationCode: params.originLocationCode.toUpperCase(),
    destinationLocationCode: params.destinationLocationCode.toUpperCase(),
    departureDate: params.departureDate,
    adults: (params.adults || 1).toString(),
    max: "5",
    currencyCode: "USD",
  });

  if (params.returnDate) queryParams.append("returnDate", params.returnDate);
  if (params.travelClass) queryParams.append("travelClass", params.travelClass);

  let response = await fetch(`${AMADEUS_BASE_URL}/v2/shopping/flight-offers?${queryParams}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) {
    token = await getAmadeusToken(true);
    response = await fetch(`${AMADEUS_BASE_URL}/v2/shopping/flight-offers?${queryParams}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  if (!response.ok) {
    const errText = await response.text();
    console.error("Amadeus search error:", response.status, errText);
    throw new Error(`Flight search failed (${response.status})`);
  }

  const data = await response.json();
  
  // Parse into simplified flight cards
  const flights = (data.data || []).slice(0, 5).map((offer: any) => {
    const firstSegment = offer.itineraries?.[0]?.segments?.[0];
    const lastSegment = offer.itineraries?.[0]?.segments?.slice(-1)[0];
    const segments = offer.itineraries?.[0]?.segments || [];
    const carrierCode = firstSegment?.carrierCode || "XX";
    const carrierName = data.dictionaries?.carriers?.[carrierCode] || carrierCode;

    // Calculate total duration
    const duration = offer.itineraries?.[0]?.duration || "";
    const durationFormatted = duration.replace("PT", "").replace("H", "h ").replace("M", "m");

    return {
      id: offer.id,
      airline: carrierName,
      airlineCode: carrierCode,
      departure: firstSegment?.departure?.at || "",
      arrival: lastSegment?.arrival?.at || "",
      departureAirport: firstSegment?.departure?.iataCode || "",
      arrivalAirport: lastSegment?.arrival?.iataCode || "",
      duration: durationFormatted,
      stops: segments.length - 1,
      price: parseFloat(offer.price?.total || offer.price?.grandTotal || "0"),
      currency: offer.price?.currency || "USD",
      cabin: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || "ECONOMY",
    };
  });

  return flights;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Step 1: Call AI with tools enabled (non-streaming to handle tool calls)
    const aiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m: any) => ({ role: m.role === "bot" ? "assistant" : m.role, content: m.content })),
    ];

    const firstResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
        tools: [FLIGHT_SEARCH_TOOL],
        stream: false,
      }),
    });

    if (!firstResponse.ok) {
      const status = firstResponse.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    const firstData = await firstResponse.json();
    const choice = firstData.choices?.[0];

    // Check if AI wants to call a tool
    if (choice?.finish_reason === "tool_calls" || choice?.message?.tool_calls?.length > 0) {
      const toolCall = choice.message.tool_calls[0];
      const args = JSON.parse(toolCall.function.arguments);

      console.log("🔍 AI requested flight search:", args);

      let flightResults: any[] = [];
      let searchError: string | null = null;

      try {
        flightResults = await searchFlights(args);
      } catch (e) {
        searchError = e instanceof Error ? e.message : "Flight search failed";
        console.error("Flight search error:", searchError);
      }

      // Step 2: Send results back to AI for a natural language summary
      const toolResultContent = searchError
        ? JSON.stringify({ error: searchError })
        : JSON.stringify({ flights: flightResults, searchParams: args });

      const followUpMessages = [
        ...aiMessages,
        choice.message,
        {
          role: "tool",
          tool_call_id: toolCall.id,
          content: toolResultContent,
        },
      ];

      // Stream the final response
      const finalResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: followUpMessages,
          stream: true,
        }),
      });

      if (!finalResponse.ok) throw new Error(`AI follow-up error: ${finalResponse.status}`);

      // We need to prepend flight data as a special JSON block before the stream
      const flightDataBlock = flightResults.length > 0
        ? `data: ${JSON.stringify({ type: "flight_results", flights: flightResults, searchParams: args })}\n\n`
        : "";

      // Create a combined stream
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          // Send flight results first as a special event
          if (flightDataBlock) {
            controller.enqueue(encoder.encode(flightDataBlock));
          }

          // Then pipe the AI stream
          const reader = finalResponse.body!.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
          controller.close();
        },
      });

      return new Response(readable, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // No tool call — stream a regular response
    const streamResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
        stream: true,
      }),
    });

    if (!streamResponse.ok) throw new Error(`AI stream error: ${streamResponse.status}`);

    return new Response(streamResponse.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("FlyBot chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
