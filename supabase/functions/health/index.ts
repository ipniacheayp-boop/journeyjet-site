import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {} as Record<string, any>,
  };

  try {
    // Check database connectivity
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const { error: dbError } = await supabaseClient
      .from('bookings')
      .select('count')
      .limit(1);

    health.checks.database = {
      status: dbError ? 'unhealthy' : 'healthy',
      error: dbError?.message,
    };

    // Check Stripe API
    try {
      const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
        apiVersion: '2025-08-27.basil',
      });
      await stripe.balance.retrieve();
      health.checks.stripe = { status: 'healthy' };
    } catch (stripeError) {
      health.checks.stripe = {
        status: 'unhealthy',
        error: stripeError.message,
      };
    }

    // Check Amadeus authentication
    try {
      const apiKey = Deno.env.get('AMADEUS_API_KEY');
      const apiSecret = Deno.env.get('AMADEUS_API_SECRET');

      if (!apiKey || !apiSecret) {
        throw new Error('Amadeus credentials not configured');
      }

      const authResponse = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=client_credentials&client_id=${apiKey}&client_secret=${apiSecret}`,
      });

      if (!authResponse.ok) {
        throw new Error('Amadeus authentication failed');
      }

      health.checks.amadeus = { status: 'healthy' };
    } catch (amadeusError) {
      health.checks.amadeus = {
        status: 'unhealthy',
        error: amadeusError.message,
      };
    }

    const hasUnhealthy = Object.values(health.checks).some((check: any) => check.status === 'unhealthy');
    
    if (hasUnhealthy) {
      health.status = 'degraded';
    }

    return new Response(
      JSON.stringify(health),
      { 
        status: hasUnhealthy ? 503 : 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});