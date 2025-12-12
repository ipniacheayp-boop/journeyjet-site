import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LogRequest {
  bookingId?: string;
  productType: "flight" | "hotel" | "car";
  originalCurrency: string;
  originalAmount: number;
  recommendedCurrency: string;
  recommendedAmount: number;
  savingsUsd: number;
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

    const body: LogRequest = await req.json();
    const { bookingId, productType, originalCurrency, originalAmount, recommendedCurrency, recommendedAmount, savingsUsd } = body;

    if (!productType || !originalCurrency || !recommendedCurrency) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from("fx_smart_save_logs")
      .insert({
        booking_id: bookingId || null,
        product_type: productType,
        original_currency: originalCurrency,
        original_amount: originalAmount,
        recommended_currency: recommendedCurrency,
        recommended_amount: recommendedAmount,
        savings_usd: savingsUsd,
      })
      .select()
      .single();

    if (error) {
      console.error("[fx-smart-save-log] Insert error:", error);
      throw error;
    }

    console.log(`[fx-smart-save-log] Logged SmartSave decision: $${savingsUsd} savings`);
    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[fx-smart-save-log] Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to log SmartSave decision" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
