import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TokenCache {
  token: string;
  expiresAt: number;
}

let cachedToken: TokenCache | null = null;

const getAmadeusToken = async (): Promise<string> => {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const apiKey = Deno.env.get('AMADEUS_API_KEY');
  const apiSecret = Deno.env.get('AMADEUS_API_SECRET');

  const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${apiKey}&client_secret=${apiSecret}`,
  });

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
  };

  return cachedToken.token;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { flightOffer } = await req.json();

    if (!flightOffer) {
      throw new Error('Flight offer is required');
    }

    console.log('[PRICE-VALIDATE] Validating flight offer');

    const token = await getAmadeusToken();

    const priceResponse = await fetch('https://test.api.amadeus.com/v1/shopping/flight-offers/pricing', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          type: 'flight-offers-pricing',
          flightOffers: [flightOffer],
        },
      }),
    });

    if (!priceResponse.ok) {
      const errorData = await priceResponse.json();
      console.error('[PRICE-VALIDATE] Amadeus error:', errorData);
      throw new Error(errorData.errors?.[0]?.detail || 'Price validation failed');
    }

    const priceData = await priceResponse.json();
    const validatedOffer = priceData.data?.flightOffers?.[0];

    if (!validatedOffer) {
      throw new Error('No validated offer returned');
    }

    console.log('[PRICE-VALIDATE] ✓ Price validated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        data: validatedOffer,
        priceChanged: validatedOffer.price.total !== flightOffer.price.total,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[PRICE-VALIDATE] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});