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

    console.log('📥 Hotel search request:', { cityCode, checkInDate, checkOutDate, adults, roomQuantity });

    if (!cityCode || !checkInDate || !checkOutDate || !adults) {
      console.error('❌ Missing required parameters');
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: cityCode, checkInDate, checkOutDate, adults' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = await getAmadeusToken();
    console.log('✅ Amadeus token obtained');

    // Step 1: Search for hotels by city using Hotel List API
    const listParams = new URLSearchParams({
      cityCode,
    });

    console.log('🔍 Step 1: Fetching hotel list for city:', cityCode);

    const listResponse = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city?${listParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!listResponse.ok) {
      const error = await listResponse.text();
      console.error('❌ Amadeus hotel list error (status:', listResponse.status, '):', error);
      return new Response(
        JSON.stringify({ error: 'Failed to search hotels by city', details: error }),
        { status: listResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const listData = await listResponse.json();
    console.log('✅ Hotel list response:', listData.data?.length || 0, 'hotels found');

    if (!listData.data || listData.data.length === 0) {
      console.log('⚠️ No hotels found in city:', cityCode);
      return new Response(
        JSON.stringify({ data: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Get offers for the first 50 hotels
    const hotelIds = listData.data.slice(0, 50).map((hotel: any) => hotel.hotelId).join(',');
    console.log('🔍 Step 2: Fetching offers for', hotelIds.split(',').length, 'hotels');

    const offersParams = new URLSearchParams({
      hotelIds,
      checkInDate,
      checkOutDate,
      adults: adults.toString(),
      roomQuantity: (roomQuantity || 1).toString(),
    });

    const offersResponse = await fetch(
      `https://test.api.amadeus.com/v3/shopping/hotel-offers?${offersParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!offersResponse.ok) {
      const error = await offersResponse.text();
      console.error('❌ Amadeus hotel offers error (status:', offersResponse.status, '):', error);
      return new Response(
        JSON.stringify({ error: 'Failed to get hotel offers', details: error }),
        { status: offersResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const offersData = await offersResponse.json();
    console.log('✅ Hotel offers response:', offersData.data?.length || 0, 'offers found');

    // Sort hotels by price (ascending) to show cheapest first
    if (offersData.data && Array.isArray(offersData.data)) {
      offersData.data.sort((a: any, b: any) => {
        const priceA = parseFloat(a.offers?.[0]?.price?.total || '999999');
        const priceB = parseFloat(b.offers?.[0]?.price?.total || '999999');
        return priceA - priceB;
      });
    }

    return new Response(
      JSON.stringify(offersData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error in hotels-search:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});