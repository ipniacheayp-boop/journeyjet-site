import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Popular routes for fetching minimum prices
const POPULAR_ROUTES = [
  { origin: 'JFK', destination: 'LAX', originCity: 'New York', destCity: 'Los Angeles' },
  { origin: 'LAX', destination: 'SFO', originCity: 'Los Angeles', destCity: 'San Francisco' },
  { origin: 'ORD', destination: 'MIA', originCity: 'Chicago', destCity: 'Miami' },
  { origin: 'DFW', destination: 'LAS', originCity: 'Dallas', destCity: 'Las Vegas' },
  { origin: 'ATL', destination: 'DEN', originCity: 'Atlanta', destCity: 'Denver' },
  { origin: 'SEA', destination: 'PHX', originCity: 'Seattle', destCity: 'Phoenix' },
  { origin: 'BOS', destination: 'ORD', originCity: 'Boston', destCity: 'Chicago' },
  { origin: 'JFK', destination: 'LHR', originCity: 'New York', destCity: 'London' },
  { origin: 'LAX', destination: 'NRT', originCity: 'Los Angeles', destCity: 'Tokyo' },
  { origin: 'SFO', destination: 'CDG', originCity: 'San Francisco', destCity: 'Paris' },
  { origin: 'MIA', destination: 'CUN', originCity: 'Miami', destCity: 'Cancun' },
  { origin: 'JFK', destination: 'FCO', originCity: 'New York', destCity: 'Rome' },
  { origin: 'LAX', destination: 'HNL', originCity: 'Los Angeles', destCity: 'Honolulu' },
  { origin: 'ORD', destination: 'LHR', originCity: 'Chicago', destCity: 'London' },
  { origin: 'DFW', destination: 'MEX', originCity: 'Dallas', destCity: 'Mexico City' },
  { origin: 'ATL', destination: 'SJU', originCity: 'Atlanta', destCity: 'San Juan' },
  { origin: 'SEA', destination: 'ANC', originCity: 'Seattle', destCity: 'Anchorage' },
  { origin: 'BOS', destination: 'DUB', originCity: 'Boston', destCity: 'Dublin' },
  { origin: 'NYC', destination: 'BCN', originCity: 'New York', destCity: 'Barcelona' },
  { origin: 'LAX', destination: 'SYD', originCity: 'Los Angeles', destCity: 'Sydney' },
];

interface TokenCache {
  token: string;
  expiresAt: number;
}

let cachedToken: TokenCache | null = null;

async function getAmadeusToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return cachedToken.token;
  }

  const apiKey = Deno.env.get('AMADEUS_API_KEY');
  const apiSecret = Deno.env.get('AMADEUS_API_SECRET');
  const useProduction = Deno.env.get('USE_PROD_APIS') === 'true';
  const baseUrl = useProduction ? 'https://api.amadeus.com' : 'https://test.api.amadeus.com';

  if (!apiKey || !apiSecret) {
    throw new Error('Amadeus credentials not configured');
  }

  console.log(`🔑 Authenticating with Amadeus (${useProduction ? 'PROD' : 'TEST'})...`);

  const response = await fetch(`${baseUrl}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: apiKey,
      client_secret: apiSecret,
    }),
  });

  if (!response.ok) {
    throw new Error(`Amadeus auth failed: ${response.status}`);
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: now + (data.expires_in * 1000),
  };

  return cachedToken.token;
}

interface MinPriceDeal {
  id: string;
  origin: string;
  originCity: string;
  destination: string;
  destCity: string;
  airline: string;
  airlineCode: string;
  price: number;
  currency: string;
  departureDate: string;
  returnDate: string;
  cabinClass: string;
  bookingLink: string;
  fetchedAt: string;
}

async function fetchMinPriceForRoute(
  token: string,
  origin: string,
  destination: string,
  originCity: string,
  destCity: string
): Promise<MinPriceDeal | null> {
  const useProduction = Deno.env.get('USE_PROD_APIS') === 'true';
  const baseUrl = useProduction ? 'https://api.amadeus.com' : 'https://test.api.amadeus.com';

  // Search for flights 7-30 days from now
  const departureDate = new Date();
  departureDate.setDate(departureDate.getDate() + 14);
  const returnDate = new Date(departureDate);
  returnDate.setDate(returnDate.getDate() + 7);

  const params = new URLSearchParams({
    originLocationCode: origin,
    destinationLocationCode: destination,
    departureDate: departureDate.toISOString().split('T')[0],
    returnDate: returnDate.toISOString().split('T')[0],
    adults: '1',
    max: '1', // Only get the cheapest option
    currencyCode: 'USD',
  });

  try {
    const response = await fetch(
      `${baseUrl}/v2/shopping/flight-offers?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.log(`⚠️ No flights for ${origin}-${destination}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      return null;
    }

    const offer = data.data[0];
    const segments = offer.itineraries[0].segments;
    const carrierCode = segments[0].carrierCode;
    
    // Get airline name from dictionaries
    const airlineName = data.dictionaries?.carriers?.[carrierCode] || carrierCode;

    return {
      id: `live-${origin}-${destination}-${Date.now()}`,
      origin,
      originCity,
      destination,
      destCity,
      airline: airlineName,
      airlineCode: carrierCode,
      price: parseFloat(offer.price.total),
      currency: offer.price.currency || 'USD',
      departureDate: departureDate.toISOString().split('T')[0],
      returnDate: returnDate.toISOString().split('T')[0],
      cabinClass: offer.travelerPricings[0]?.fareDetailsBySegment?.[0]?.cabin || 'ECONOMY',
      bookingLink: `/booking?type=flight&origin=${origin}&dest=${destination}&date=${departureDate.toISOString().split('T')[0]}&return=${returnDate.toISOString().split('T')[0]}`,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching ${origin}-${destination}:`, error);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📊 Fetching minimum price deals...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const forceRefresh = url.searchParams.get('refresh') === 'true';

    let deals: MinPriceDeal[] = [];
    let fromCache = false;

    // Try to get cached deals first (from database)
    if (!forceRefresh) {
      const { data: cachedDeals } = await supabase
        .from('deals')
        .select('*')
        .eq('published', true)
        .eq('source', 'amadeus-live')
        .order('price_usd', { ascending: true })
        .limit(limit);

      if (cachedDeals && cachedDeals.length > 0) {
        console.log(`📦 Using ${cachedDeals.length} cached deals`);
        deals = cachedDeals.map(d => ({
          id: d.id,
          origin: d.origin_code,
          originCity: d.origin_city,
          destination: d.dest_code,
          destCity: d.dest_city,
          airline: d.airline,
          airlineCode: d.airline_code || '',
          price: d.price_usd,
          currency: d.currency || 'USD',
          departureDate: d.date_from,
          returnDate: d.date_to,
          cabinClass: d.class,
          bookingLink: `/deals/${d.slug}`,
          fetchedAt: d.updated_at || d.created_at,
        }));
        fromCache = true;
      }
    }

    // If no cached deals or force refresh, fetch from Amadeus
    if (deals.length === 0) {
      try {
        const token = await getAmadeusToken();
        console.log('✅ Amadeus authenticated, fetching routes...');

        // Fetch prices for all routes in parallel (limited batches)
        const batchSize = 5;
        const allDeals: MinPriceDeal[] = [];

        for (let i = 0; i < POPULAR_ROUTES.length; i += batchSize) {
          const batch = POPULAR_ROUTES.slice(i, i + batchSize);
          const results = await Promise.all(
            batch.map(route =>
              fetchMinPriceForRoute(
                token,
                route.origin,
                route.destination,
                route.originCity,
                route.destCity
              )
            )
          );

          allDeals.push(...results.filter((d): d is MinPriceDeal => d !== null));
          
          // Small delay between batches to avoid rate limiting
          if (i + batchSize < POPULAR_ROUTES.length) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }

        // Sort by price and take top deals
        deals = allDeals.sort((a, b) => a.price - b.price).slice(0, limit);
        console.log(`✅ Fetched ${deals.length} live deals from Amadeus`);

      } catch (amadeusError) {
        console.error('❌ Amadeus API error:', amadeusError);
        
        // Fall back to database deals if Amadeus fails
        const { data: fallbackDeals } = await supabase
          .from('deals')
          .select('*')
          .eq('published', true)
          .order('price_usd', { ascending: true })
          .limit(limit);

        if (fallbackDeals && fallbackDeals.length > 0) {
          console.log(`📦 Falling back to ${fallbackDeals.length} database deals`);
          deals = fallbackDeals.map(d => ({
            id: d.id,
            origin: d.origin_code,
            originCity: d.origin_city,
            destination: d.dest_code,
            destCity: d.dest_city,
            airline: d.airline,
            airlineCode: d.airline_code || '',
            price: d.price_usd,
            currency: d.currency || 'USD',
            departureDate: d.date_from,
            returnDate: d.date_to,
            cabinClass: d.class,
            bookingLink: `/deals/${d.slug}`,
            fetchedAt: d.updated_at || d.created_at,
          }));
          fromCache = true;
        }
      }
    }

    // If still no deals, return empty with error
    if (deals.length === 0) {
      return new Response(
        JSON.stringify({
          deals: [],
          total: 0,
          fromCache: false,
          error: 'No deals available',
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({
        deals,
        total: deals.length,
        fromCache,
        fetchedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', deals: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
