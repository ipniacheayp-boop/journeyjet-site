import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check feature flag
    const enableFxSmartSave = Deno.env.get("ENABLE_FX_SMARTSAVE") !== "false";
    if (!enableFxSmartSave) {
      return new Response(
        JSON.stringify({ error: "FX-SmartSave is disabled" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const travelDate = url.searchParams.get("travelDate");
    const currency = url.searchParams.get("currency") || "USD";

    if (!travelDate) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter: travelDate" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const travel = new Date(travelDate);
    const today = new Date();
    const daysUntilTravel = Math.ceil((travel.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Only show hedging suggestion for travel >= 180 days away
    if (daysUntilTravel < 180) {
      return new Response(
        JSON.stringify({
          showHedgingSuggestion: false,
          daysUntilTravel,
          message: null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Estimate volatility based on currency (informational only)
    const volatilityEstimates: Record<string, string> = {
      EUR: "moderate (typically 5-10% annual)",
      GBP: "moderate to high (6-12% annual)",
      JPY: "moderate (5-8% annual)",
      AUD: "higher (8-15% annual)",
      CAD: "moderate (5-9% annual)",
      CHF: "low (3-6% annual)",
      INR: "higher (8-12% annual)",
      default: "varies (5-12% annual)",
    };

    const volatility = volatilityEstimates[currency] || volatilityEstimates.default;

    const result = {
      showHedgingSuggestion: true,
      daysUntilTravel,
      currency,
      message: `Your travel date is ${daysUntilTravel} days away. Exchange rates for ${currency} may fluctuate significantly over this period. Historical volatility for ${currency}/USD is ${volatility}. Consider monitoring rates or exploring rate-lock options if your bank offers them.`,
      tips: [
        "Set up rate alerts for your target currency",
        "Consider booking when rates are favorable",
        "Some credit cards offer no foreign transaction fees",
        "Travel-focused credit cards may offer better exchange rates",
      ],
      disclaimer: "This is informational only and not financial advice. CheapFlights does not offer currency hedging products.",
    };

    console.log(`[fx-hedge-suggestion] Suggestion shown for ${daysUntilTravel} days ahead, currency: ${currency}`);
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[fx-hedge-suggestion] Error:", error);
    return new Response(
      JSON.stringify({ error: "Hedge suggestion unavailable" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
