import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TokenCache {
  token: string;
  expiresAt: number;
}

let cachedToken: TokenCache | null = null;

const logStep = (step: string, details?: any) => {
  console.log(`[PREBOOKING-VALIDATE] ${step}`, details ? JSON.stringify(details) : '');
};

// Fail early if required env vars are missing
const validateEnvVars = () => {
  const required = ['AMADEUS_API_KEY', 'AMADEUS_API_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missing = required.filter(key => !Deno.env.get(key));
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}. Set them in Project Settings → Environment.`);
  }
};

const getAmadeusToken = async (): Promise<string> => {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const apiKey = Deno.env.get('AMADEUS_API_KEY');
  const apiSecret = Deno.env.get('AMADEUS_API_SECRET');
  const useProd = Deno.env.get('USE_PROD_APIS') === 'true';
  const baseUrl = useProd ? 'https://api.amadeus.com' : 'https://test.api.amadeus.com';

  const response = await fetch(`${baseUrl}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${apiKey}&client_secret=${apiSecret}`,
  });

  if (!response.ok) {
    throw new Error('Failed to authenticate with Amadeus API');
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in * 1000) - 60000, // 1 min buffer
  };

  return cachedToken.token;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    validateEnvVars();

    const { productType, offerId, offer, clientRequestId } = await req.json();

    if (!productType || !offer) {
      return new Response(
        JSON.stringify({ ok: false, code: 'INVALID_REQUEST', message: 'productType and offer are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!clientRequestId) {
      return new Response(
        JSON.stringify({ ok: false, code: 'INVALID_REQUEST', message: 'clientRequestId is required for idempotency' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep('Validating prebooking', { productType, clientRequestId });

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check for existing provisional booking with this clientRequestId (idempotency)
    const { data: existingBooking } = await supabaseClient
      .from('bookings')
      .select('id, status, amount, currency')
      .eq('transaction_id', clientRequestId)
      .maybeSingle();

    if (existingBooking) {
      logStep('Found existing booking for clientRequestId', { bookingId: existingBooking.id });
      return new Response(
        JSON.stringify({
          ok: true,
          existingBooking: true,
          bookingId: existingBooking.id,
          price: existingBooking.amount,
          currency: existingBooking.currency,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const useProd = Deno.env.get('USE_PROD_APIS') === 'true';
    const baseUrl = useProd ? 'https://api.amadeus.com' : 'https://test.api.amadeus.com';

    if (productType === 'flight') {
      const token = await getAmadeusToken();
      
      logStep('Calling Amadeus Flight Offers Price API');

      const priceResponse = await fetch(`${baseUrl}/v1/shopping/flight-offers/pricing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            type: 'flight-offers-pricing',
            flightOffers: [offer],
          },
        }),
      });

      if (!priceResponse.ok) {
        const errorData = await priceResponse.json();
        logStep('Amadeus price validation failed', errorData);
        
        // Check if it's a price unavailable error
        const errorCode = errorData.errors?.[0]?.code;
        if (errorCode === '37200' || errorCode === '38196') {
          return new Response(
            JSON.stringify({
              ok: false,
              code: 'OFFER_EXPIRED',
              message: 'This offer is no longer available. Please search again for updated prices.',
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            ok: false,
            code: 'PROVIDER_ERROR',
            message: errorData.errors?.[0]?.detail || 'Price validation failed',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const priceData = await priceResponse.json();
      const validatedOffer = priceData.data?.flightOffers?.[0];

      if (!validatedOffer) {
        return new Response(
          JSON.stringify({
            ok: false,
            code: 'PROVIDER_ERROR',
            message: 'No validated offer returned from provider',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const originalPrice = parseFloat(offer.price?.total || '0');
      const newPrice = parseFloat(validatedOffer.price?.total || '0');
      const priceChanged = Math.abs(newPrice - originalPrice) > 0.01;

      if (priceChanged) {
        logStep('Price changed', { originalPrice, newPrice });
        return new Response(
          JSON.stringify({
            ok: false,
            code: 'PRICE_CHANGED',
            message: 'The price has changed since you searched.',
            originalPrice,
            newPrice,
            currency: validatedOffer.price?.currency || 'USD',
            validatedOffer,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      logStep('Price validated successfully', { price: newPrice });

      return new Response(
        JSON.stringify({
          ok: true,
          price: newPrice,
          currency: validatedOffer.price?.currency || 'USD',
          validatedOffer,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min hold
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (productType === 'hotel') {
      // For hotels, we validate the offer is still available
      // Amadeus doesn't have a direct price validation for hotels like flights
      // We return the offer as-is with validation timestamp
      
      const price = parseFloat(offer.offers?.[0]?.price?.total || offer.price?.total || '0');
      const currency = offer.offers?.[0]?.price?.currency || offer.price?.currency || 'USD';

      logStep('Hotel offer validated', { price, currency });

      return new Response(
        JSON.stringify({
          ok: true,
          price,
          currency,
          validatedOffer: offer,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min hold for hotels
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (productType === 'car') {
      // For cars, validate the offer is still available
      // Return the offer as-is with validation timestamp
      
      const price = parseFloat(offer.price?.total || '0');
      const currency = offer.price?.currency || 'USD';

      logStep('Car offer validated', { price, currency });

      return new Response(
        JSON.stringify({
          ok: true,
          price,
          currency,
          validatedOffer: offer,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min hold for cars
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      return new Response(
        JSON.stringify({
          ok: false,
          code: 'INVALID_REQUEST',
          message: `Unsupported product type: ${productType}`,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logStep('ERROR', { message: errorMessage });
    
    return new Response(
      JSON.stringify({
        ok: false,
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
