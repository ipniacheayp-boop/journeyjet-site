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
    const { pickUpLocationCode, pickUpDate, dropOffDate, driverAge } = await req.json();

    console.log('📥 Car search request:', { pickUpLocationCode, pickUpDate, dropOffDate, driverAge });

    if (!pickUpLocationCode || !pickUpDate || !dropOffDate) {
      console.error('❌ Missing required parameters');
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: pickUpLocationCode, pickUpDate, dropOffDate' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = await getAmadeusToken();
    console.log('✅ Amadeus token obtained');

    // Step 1: Resolve location using Amadeus Locations API
    console.log('🔍 Step 1: Resolving location for:', pickUpLocationCode);
    
    const locationParams = new URLSearchParams({
      keyword: pickUpLocationCode.toUpperCase(),
      subType: 'CITY,AIRPORT',
    });

    const locationResponse = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/locations?${locationParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    console.log('📡 Location API response status:', locationResponse.status);

    if (!locationResponse.ok) {
      const error = await locationResponse.text();
      console.error('❌ Location resolution error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Unable to find location. Please enter a valid city or airport code (e.g., DEL, BOM, NYC)', 
          details: error 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const locationData = await locationResponse.json();
    
    if (!locationData.data || locationData.data.length === 0) {
      console.error('❌ No locations found for:', pickUpLocationCode);
      return new Response(
        JSON.stringify({ 
          error: 'No car rental available for this location. Try an airport or nearby city code.' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resolvedLocation = locationData.data[0];
    const resolvedCode = resolvedLocation.iataCode || resolvedLocation.id;
    console.log('✅ Location resolved:', resolvedCode, '-', resolvedLocation.name);

    // Step 2: Search for car rental offers
    console.log('🔍 Step 2: Searching for car offers at location:', resolvedCode);

    const carParams = new URLSearchParams({
      pickUpLocationCode: resolvedCode,
      pickUpDate,
      dropOffDate,
    });

    if (driverAge) {
      carParams.append('driverAge', driverAge.toString());
    }

    console.log('🚗 Fetching car offers with params:', carParams.toString());

    const carResponse = await fetch(
      `https://test.api.amadeus.com/v1/shopping/vehicle-offers?${carParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    console.log('📡 Car offers API response status:', carResponse.status);

    if (!carResponse.ok) {
      const error = await carResponse.text();
      console.error('❌ Amadeus car offers error (status:', carResponse.status, '):', error);
      return new Response(
        JSON.stringify({ 
          error: 'No car rental available for this location. Try another date or location.', 
          details: error 
        }),
        { status: carResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const carData = await carResponse.json();
    console.log('✅ Car search response:', carData.data?.length || 0, 'offers found');

    // Sort cars by price (ascending) to show cheapest first
    if (carData.data && Array.isArray(carData.data)) {
      carData.data.sort((a: any, b: any) => {
        const priceA = parseFloat(a.price?.total || '999999');
        const priceB = parseFloat(b.price?.total || '999999');
        return priceA - priceB;
      });
    }

    return new Response(
      JSON.stringify(carData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error in cars-search:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});