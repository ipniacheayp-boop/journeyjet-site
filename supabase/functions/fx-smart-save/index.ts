import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// In-memory cache for smart-save calculations (5 minute TTL)
const calculationCache = new Map<string, { result: any; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;
const CONVERSION_FEE_PERCENT = parseFloat(Deno.env.get("CURRENCY_CONVERSION_FEE_PERCENT") || "0.01");

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // requests per second per IP
const RATE_WINDOW_MS = 1000;

interface PriceOption {
  currency: string;
  amount: number;
}

interface SmartSaveRequest {
  productType: "flight" | "hotel" | "car";
  prices: PriceOption[];
  origin?: string;
  destination?: string;
  travelDate?: string;
}

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

    // Rate limiting by IP
    const clientIP = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const rateLimit = rateLimitMap.get(clientIP);
    
    if (rateLimit) {
      if (now < rateLimit.resetTime) {
        if (rateLimit.count >= RATE_LIMIT) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        rateLimit.count++;
      } else {
        rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_WINDOW_MS });
      }
    } else {
      rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_WINDOW_MS });
    }

    const body: SmartSaveRequest = await req.json();
    const { productType, prices } = body;

    if (!productType || !prices || prices.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: productType, prices" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check calculation cache
    const cacheKey = JSON.stringify(body);
    const cached = calculationCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_TTL_MS) {
      console.log("[fx-smart-save] Returning cached calculation");
      return new Response(
        JSON.stringify(cached.result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch current FX rates
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: ratesData } = await supabase
      .from("fx_rates_cache")
      .select("currency, rate");

    if (!ratesData || ratesData.length === 0) {
      // Fallback: fetch rates from fx-rates endpoint
      const ratesResponse = await fetch(`${supabaseUrl}/functions/v1/fx-rates`, {
        headers: { Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}` }
      });
      
      if (!ratesResponse.ok) {
        return new Response(
          JSON.stringify({ error: "FX rates unavailable" }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Build rates map
    const rates: Record<string, number> = { USD: 1 };
    ratesData?.forEach(r => { rates[r.currency] = Number(r.rate); });

    // Calculate effective USD cost for each price option
    const breakdown = prices.map(price => {
      const rate = rates[price.currency] || 1;
      const convertedUSD = price.amount / rate;
      const effectiveCostUSD = convertedUSD * (1 + CONVERSION_FEE_PERCENT);
      
      return {
        currency: price.currency,
        localAmount: price.amount,
        convertedUSD: Math.round(convertedUSD * 100) / 100,
        effectiveCostUSD: Math.round(effectiveCostUSD * 100) / 100,
        rate,
        feePercent: CONVERSION_FEE_PERCENT * 100,
      };
    });

    // Find USD baseline and cheapest option
    const usdOption = breakdown.find(b => b.currency === "USD");
    const baselineUSD = usdOption?.effectiveCostUSD || breakdown[0]?.effectiveCostUSD || 0;
    
    const cheapest = breakdown.reduce((min, curr) => 
      curr.effectiveCostUSD < min.effectiveCostUSD ? curr : min
    , breakdown[0]);

    const savingsUSD = Math.max(0, Math.round((baselineUSD - cheapest.effectiveCostUSD) * 100) / 100);

    const result = {
      recommendedCurrency: cheapest.currency,
      recommendedAmountLocal: cheapest.localAmount,
      recommendedAmountUSD: cheapest.convertedUSD,
      effectiveCostUSD: cheapest.effectiveCostUSD,
      savingsUSD,
      breakdown,
      productType,
    };

    // Cache the result
    calculationCache.set(cacheKey, { result, timestamp: now });

    // Clean old cache entries periodically
    if (calculationCache.size > 1000) {
      for (const [key, value] of calculationCache.entries()) {
        if (now - value.timestamp > CACHE_TTL_MS) {
          calculationCache.delete(key);
        }
      }
    }

    console.log(`[fx-smart-save] Calculated savings: $${savingsUSD} by using ${cheapest.currency}`);
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[fx-smart-save] Error:", error);
    return new Response(
      JSON.stringify({ error: "Smart save calculation unavailable" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
