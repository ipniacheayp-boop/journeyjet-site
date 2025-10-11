import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const publishableKey = Deno.env.get('STRIPE_PUBLISHABLE_KEY') || '';
    
    if (!publishableKey) {
      console.error('STRIPE_PUBLISHABLE_KEY not found in environment');
      return new Response(JSON.stringify({ error: 'Stripe publishable key not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log('Stripe publishable key retrieved successfully');
    
    return new Response(JSON.stringify({ publishableKey }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Error in payments-stripe-publishable-key:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to load key' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});