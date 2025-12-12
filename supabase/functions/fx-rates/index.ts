import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// In-memory cache for rates (5 minute TTL)
let ratesCache: { rates: Record<string, number>; timestamp: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

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

    // Check in-memory cache first
    const now = Date.now();
    if (ratesCache && (now - ratesCache.timestamp) < CACHE_TTL_MS) {
      console.log("[fx-rates] Returning cached rates from memory");
      return new Response(
        JSON.stringify({ rates: ratesCache.rates, timestamp: ratesCache.timestamp, cached: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client to check DB cache
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check DB cache
    const { data: dbRates } = await supabase
      .from("fx_rates_cache")
      .select("currency, rate, updated_at")
      .order("updated_at", { ascending: false })
      .limit(1);

    if (dbRates && dbRates.length > 0) {
      const dbCacheTime = new Date(dbRates[0].updated_at).getTime();
      if ((now - dbCacheTime) < CACHE_TTL_MS) {
        // Build rates object from DB
        const { data: allRates } = await supabase
          .from("fx_rates_cache")
          .select("currency, rate");
        
        if (allRates) {
          const ratesObj: Record<string, number> = {};
          allRates.forEach(r => { ratesObj[r.currency] = Number(r.rate); });
          
          // Update memory cache
          ratesCache = { rates: ratesObj, timestamp: dbCacheTime };
          
          console.log("[fx-rates] Returning cached rates from DB");
          return new Response(
            JSON.stringify({ rates: ratesObj, timestamp: dbCacheTime, cached: true }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // Fetch fresh rates from API (using free tier exchangerate-api.com)
    console.log("[fx-rates] Fetching fresh rates from API");
    const apiResponse = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
    
    if (!apiResponse.ok) {
      throw new Error(`FX API error: ${apiResponse.status}`);
    }

    const apiData = await apiResponse.json();
    const rates = apiData.rates as Record<string, number>;
    const timestamp = Date.now();

    // Update memory cache
    ratesCache = { rates, timestamp };

    // Update DB cache (upsert each currency)
    const upsertData = Object.entries(rates).map(([currency, rate]) => ({
      currency,
      rate,
      updated_at: new Date().toISOString(),
    }));

    // Batch upsert in chunks of 50
    for (let i = 0; i < upsertData.length; i += 50) {
      const chunk = upsertData.slice(i, i + 50);
      await supabase
        .from("fx_rates_cache")
        .upsert(chunk, { onConflict: "currency" });
    }

    console.log("[fx-rates] Fresh rates cached successfully");
    return new Response(
      JSON.stringify({ rates, timestamp, cached: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[fx-rates] Error:", error);
    return new Response(
      JSON.stringify({ error: "FX rates unavailable" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
