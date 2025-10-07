import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAmadeusToken(): Promise<string> {
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
    throw new Error('Failed to authenticate with Amadeus API');
  }

  const authData = await authResponse.json();
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
    const { cityCode, checkInDate, checkOutDate, adults, roomQuantity } = await req.json();

    if (!cityCode || !checkInDate || !checkOutDate || !adults) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = await getAmadeusToken();

    const params = new URLSearchParams({
      cityCode,
      checkInDate,
      checkOutDate,
      adults: adults.toString(),
      roomQuantity: (roomQuantity || 1).toString(),
    });

    console.log('Searching hotels with params:', params.toString());

    const hotelResponse = await fetch(
      `https://test.api.amadeus.com/v3/shopping/hotel-offers?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!hotelResponse.ok) {
      const error = await hotelResponse.text();
      console.error('Amadeus hotel search error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to search hotels', details: error }),
        { status: hotelResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const hotelData = await hotelResponse.json();

    return new Response(
      JSON.stringify(hotelData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in hotels-search:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});