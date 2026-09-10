import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AUTOCOMPLETE_ENDPOINT = "https://places.googleapis.com/v1/places:autocomplete";

/** Enough to render suggestion rows; avoids requesting unnecessary nested fields. */
const AUTOCOMPLETE_FIELD_MASK =
  "suggestions.placePrediction.place,suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { input } = await req.json();
    const q = typeof input === "string" ? input.trim() : "";
    if (q.length < 2) {
      return new Response(JSON.stringify({ suggestions: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY") || Deno.env.get("VITE_GOOGLE_PLACES_API_KEY");
    if (!apiKey) {
      throw new Error("Google Places API key is not configured");
    }

    const body = (mode: "geo" | "any") =>
      JSON.stringify({
        input: q,
        languageCode: "en",
        ...(mode === "geo"
          ? {
            // Geographic-style results: cities, states, countries (see Place Types “Table A”).
            includedPrimaryTypes: ["(cities)", "(regions)"],
          }
          : {}),
      });

    const fetchSuggestions = (mode: "geo" | "any") =>
      fetch(AUTOCOMPLETE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": AUTOCOMPLETE_FIELD_MASK,
        },
        body: body(mode),
      });

    let res = await fetchSuggestions("geo");
    if (!res.ok) {
      const errText = await res.text();
      console.warn("places:autocomplete (geo) failed, retrying broad:", res.status, errText);
      res = await fetchSuggestions("any");
    }

    if (!res.ok) {
      const errText = await res.text();
      console.error("places:autocomplete error:", res.status, errText);
      return new Response(
        JSON.stringify({ error: "Autocomplete failed", details: errText }),
        { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let data = await res.json();
    let raw = Array.isArray(data.suggestions) ? data.suggestions : [];

    if (raw.length === 0) {
      res = await fetchSuggestions("any");
      if (res.ok) {
        data = await res.json();
        raw = Array.isArray(data.suggestions) ? data.suggestions : [];
      }
    }

    const suggestions = raw
      .map((s: { placePrediction?: {
        place?: string;
        placeId?: string;
        text?: { text?: string };
        structuredFormat?: {
          mainText?: { text?: string };
          secondaryText?: { text?: string };
        };
      } }) => {
        const p = s.placePrediction;
        if (!p) return null;
        const text =
          p.text?.text ||
          [p.structuredFormat?.mainText?.text, p.structuredFormat?.secondaryText?.text]
            .filter(Boolean)
            .join(", ");
        if (!text) return null;
        const fromResource = typeof p.place === "string" ? p.place.split("/").pop() : "";
        return { placeId: p.placeId || fromResource || "", description: text };
      })
      .filter(Boolean);

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("places-autocomplete:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
