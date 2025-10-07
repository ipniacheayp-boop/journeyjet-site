import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory cache for Amadeus access token
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAmadeusToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const apiKey = Deno.env.get('AMADEUS_API_KEY');
  const apiSecret = Deno.env.get('AMADEUS_API_SECRET');

  if (!apiKey || !apiSecret) {
    throw new Error('Amadeus API credentials not configured');
  }

  const authResponse = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=client_credentials&client_id=${apiKey}&client_secret=${apiSecret}`,
  });

  if (!authResponse.ok) {
    const error = await authResponse.text();
    console.error('Amadeus auth error:', error);
    throw new Error('Failed to authenticate with Amadeus API');
  }

  const authData = await authResponse.json();
  
  // Cache token for 30 minutes (Amadeus tokens typically expire in 30 min)
  cachedToken = {
    token: authData.access_token,
    expiresAt: Date.now() + (30 * 60 * 1000),
  };

  return authData.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { originLocationCode, destinationLocationCode, departureDate, returnDate, adults, cabinClass } = await req.json();

    if (!originLocationCode || !destinationLocationCode || !departureDate || !adults) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = await getAmadeusToken();

    // Build query parameters
    const params = new URLSearchParams({
      originLocationCode,
      destinationLocationCode,
      departureDate,
      adults: adults.toString(),
      max: '50',
    });

    if (returnDate) {
      params.append('returnDate', returnDate);
    }

    if (cabinClass) {
      params.append('travelClass', cabinClass);
    }

    console.log('Searching flights with params:', params.toString());

    const flightResponse = await fetch(
      `https://test.api.amadeus.com/v2/shopping/flight-offers?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!flightResponse.ok) {
      const error = await flightResponse.text();
      console.error('Amadeus flight search error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to search flights', details: error }),
        { status: flightResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const flightData = await flightResponse.json();

    return new Response(
      JSON.stringify(flightData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in flights-search:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});