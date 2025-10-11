import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const from = url.searchParams.get('from') || 'USD';
    const to = url.searchParams.get('to') || 'INR';
    const amount = parseFloat(url.searchParams.get('amount') || '0');

    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }

    // Use exchangerate API for live conversion
    const apiUrl = `https://api.exchangerate-api.com/v4/latest/${from}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error("Failed to fetch exchange rates");
    }

    const data = await response.json();
    const rate = data.rates[to];

    if (!rate) {
      throw new Error(`Exchange rate not found for ${to}`);
    }

    const convertedAmount = amount * rate;

    return new Response(
      JSON.stringify({
        from,
        to,
        originalAmount: amount,
        convertedAmount: parseFloat(convertedAmount.toFixed(2)),
        rate: parseFloat(rate.toFixed(4)),
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Currency conversion error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
