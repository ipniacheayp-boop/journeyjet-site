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

    let from = url.searchParams.get('from') || 'USD';
    let to = url.searchParams.get('to') || 'INR';
    let amount = parseFloat(url.searchParams.get('amount') || '0');

    try {
      if ((!from || !to || !amount) && req.headers.get('content-type')?.includes('application/json')) {
        const body = await req.json();
        from = (body?.from || from || 'USD').toUpperCase();
        to = (body?.to || to || 'INR').toUpperCase();
        amount = parseFloat(body?.amount ?? amount ?? 0);
      }
    } catch (_) {
      // ignore body parse errors and rely on query params
    }

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    // Use exchangerate-api.com for reliable conversion (no API key required)
    const apiUrl = `https://api.exchangerate-api.com/v4/latest/${encodeURIComponent(from)}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    const rate = data?.rates?.[to];
    if (!rate) {
      throw new Error(`Exchange rate not found for ${to}`);
    }

    const convertedAmount = parseFloat((amount * rate).toFixed(2));

    return new Response(
      JSON.stringify({
        from,
        to,
        originalAmount: amount,
        convertedAmount: parseFloat(Number(convertedAmount).toFixed(2)),
        rate: parseFloat(Number(rate).toFixed(4)),
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
