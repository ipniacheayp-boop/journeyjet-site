import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RAPIDAPI_HOST = 'booking-com15.p.rapidapi.com';
const RAPIDAPI_BASE = `https://${RAPIDAPI_HOST}/api/v1`;
const UBER_AUTH_URLS = [
  'https://login.uber.com/oauth/v2/token',
  'https://auth.uber.com/oauth/v2/token',
];
const UBER_API_BASE = 'https://api.uber.com/v1.2';

// Well-known city coordinates for fast fallback
const CITY_COORDS: Record<string, { lat: number; lon: number; name: string }> = {
  'NYC': { lat: 40.6397, lon: -73.7789, name: 'New York' },
  'JFK': { lat: 40.6397, lon: -73.7789, name: 'New York JFK' },
  'LAX': { lat: 33.9425, lon: -118.4081, name: 'Los Angeles' },
  'SFO': { lat: 37.6213, lon: -122.3790, name: 'San Francisco' },
  'ORD': { lat: 41.9742, lon: -87.9073, name: 'Chicago' },
  'MIA': { lat: 25.7959, lon: -80.2870, name: 'Miami' },
  'LHR': { lat: 51.4700, lon: -0.4543, name: 'London Heathrow' },
  'CDG': { lat: 49.0097, lon: 2.5479, name: 'Paris CDG' },
  'DXB': { lat: 25.2532, lon: 55.3657, name: 'Dubai' },
  'NRT': { lat: 35.7720, lon: 140.3929, name: 'Tokyo Narita' },
  'HND': { lat: 35.5494, lon: 139.7798, name: 'Tokyo Haneda' },
  'SIN': { lat: 1.3644, lon: 103.9915, name: 'Singapore' },
  'BOM': { lat: 19.0896, lon: 72.8656, name: 'Mumbai' },
  'DEL': { lat: 28.5562, lon: 77.1000, name: 'Delhi' },
  'BLR': { lat: 13.1986, lon: 77.7066, name: 'Bangalore' },
  'HYD': { lat: 17.2403, lon: 78.4294, name: 'Hyderabad' },
  'MAA': { lat: 12.9941, lon: 80.1709, name: 'Chennai' },
  'SYD': { lat: -33.9461, lon: 151.1772, name: 'Sydney' },
  'ATL': { lat: 33.6407, lon: -84.4277, name: 'Atlanta' },
  'DFW': { lat: 32.8998, lon: -97.0403, name: 'Dallas' },
  'DEN': { lat: 39.8561, lon: -104.6737, name: 'Denver' },
  'SEA': { lat: 47.4502, lon: -122.3088, name: 'Seattle' },
  'LAS': { lat: 36.0840, lon: -115.1537, name: 'Las Vegas' },
  'MCO': { lat: 28.4312, lon: -81.3081, name: 'Orlando' },
  'BOS': { lat: 42.3656, lon: -71.0096, name: 'Boston' },
  'FCO': { lat: 41.8003, lon: 12.2389, name: 'Rome' },
  'BCN': { lat: 41.2971, lon: 2.0785, name: 'Barcelona' },
  'AMS': { lat: 52.3105, lon: 4.7683, name: 'Amsterdam' },
  'FRA': { lat: 50.0379, lon: 8.5622, name: 'Frankfurt' },
  'IST': { lat: 41.2753, lon: 28.7519, name: 'Istanbul' },
  'BKK': { lat: 13.6900, lon: 100.7501, name: 'Bangkok' },
  'HKG': { lat: 22.3080, lon: 113.9185, name: 'Hong Kong' },
  'ICN': { lat: 37.4602, lon: 126.4407, name: 'Seoul Incheon' },
  'CAN': { lat: 23.3924, lon: 113.2988, name: 'Guangzhou' },
  'MEX': { lat: 19.4363, lon: -99.0721, name: 'Mexico City' },
  'GRU': { lat: -23.4356, lon: -46.4731, name: 'São Paulo' },
  'JNB': { lat: -26.1392, lon: 28.2460, name: 'Johannesburg' },
  'CAI': { lat: 30.1219, lon: 31.4056, name: 'Cairo' },
};

function getHeaders(): Record<string, string> {
  const apiKey = Deno.env.get('RAPIDAPI_KEY');
  if (!apiKey) throw new Error('RAPIDAPI_KEY is not configured');
  return {
    'x-rapidapi-host': RAPIDAPI_HOST,
    'x-rapidapi-key': apiKey,
    'Content-Type': 'application/json',
  };
}

// Get Uber OAuth token via client credentials flow
async function getUberToken(): Promise<string | null> {
  const clientId = Deno.env.get('UBER_CLIENT_ID');
  const clientSecret = Deno.env.get('UBER_CLIENT_SECRET');
  if (!clientId || !clientSecret) {
    console.warn('⚠️ Uber credentials not configured');
    return null;
  }

  try {
    // Try multiple auth endpoints (sandbox vs production)
    for (const authUrl of UBER_AUTH_URLS) {
      const resp = await fetch(authUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }).toString(),
      });

      if (resp.ok) {
        const data = await resp.json();
        console.log('✅ Uber auth succeeded via', authUrl);
        return data.access_token || null;
      }

      const errText = await resp.text();
      console.warn(`⚠️ Uber auth failed (${authUrl}):`, resp.status, errText);
    }
    return null;
  } catch (e) {
    console.warn('⚠️ Uber auth error:', e);
    return null;
  }
}

// Fetch Uber ride price estimates
async function getUberEstimates(
  token: string,
  startLat: number, startLon: number,
  endLat: number, endLon: number,
  pickUpDate: string, dropOffDate: string
): Promise<any[]> {
  try {
    const params = new URLSearchParams({
      start_latitude: startLat.toString(),
      start_longitude: startLon.toString(),
      end_latitude: endLat.toString(),
      end_longitude: endLon.toString(),
    });

    const resp = await fetch(`${UBER_API_BASE}/estimates/price?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept-Language': 'en_US',
        'Content-Type': 'application/json',
      },
    });

    if (!resp.ok) {
      console.warn('⚠️ Uber estimates failed:', resp.status);
      return [];
    }

    const data = await resp.json();
    const prices = data.prices || [];
    console.log(`🚕 Uber returned ${prices.length} ride estimates`);

    return prices.map((p: any, i: number) => ({
      id: `uber-${p.product_id || i}`,
      provider: {
        name: 'Uber',
        code: 'UBER',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png',
      },
      vehicle: {
        make: 'Uber',
        model: p.display_name || p.localized_display_name || 'Ride',
        category: 'Ride',
        type: 'Rideshare',
        doors: 4,
        seats: p.capacity || 4,
        bags: 2,
        transmission: 'N/A',
        airConditioning: true,
        fuelType: 'N/A',
        imageUrl: null,
      },
      pricing: {
        currency: p.currency_code || 'USD',
        dailyRate: 0,
        totalDays: 0,
        totalPrice: p.high_estimate || 0,
        lowEstimate: p.low_estimate || 0,
        highEstimate: p.high_estimate || 0,
        taxes: 0,
        grandTotal: p.high_estimate || 0,
        surgeMultiplier: p.surge_multiplier || 1,
        priceEstimate: p.estimate || '',
      },
      pickup: {
        locationCode: '',
        address: '',
        date: pickUpDate,
        time: '10:00',
      },
      dropoff: {
        locationCode: '',
        address: '',
        date: pickUpDate,
        time: '',
      },
      features: [
        `${p.duration ? Math.round(p.duration / 60) + ' min trip' : 'On-demand'}`,
        `${p.distance ? p.distance.toFixed(1) + ' mi' : ''}`,
        p.surge_multiplier > 1 ? `Surge ${p.surge_multiplier}x` : 'No surge',
      ].filter(Boolean),
      bookingUrl: null,
      rating: null,
      isMockData: false,
      isRideshare: true,
    }));
  } catch (e) {
    console.warn('⚠️ Uber estimates error:', e);
    return [];
  }
}

// Resolve a city name or IATA code to lat/lon
async function resolveLocation(input: string): Promise<{ lat: number; lon: number; name: string } | null> {
  const upper = input.trim().toUpperCase();

  if (CITY_COORDS[upper]) {
    console.log(`📍 Known location: ${upper} → ${CITY_COORDS[upper].name}`);
    return CITY_COORDS[upper];
  }

  try {
    const params = new URLSearchParams({ query: input.trim() });
    const resp = await fetch(`${RAPIDAPI_BASE}/cars/getLocation?${params}`, { headers: getHeaders() });
    if (resp.ok) {
      const json = await resp.json();
      const results = json?.data || json?.result || [];
      if (Array.isArray(results) && results.length > 0) {
        const loc = results[0];
        const lat = loc.latitude || loc.lat;
        const lon = loc.longitude || loc.lon || loc.lng;
        if (lat && lon) {
          console.log(`📍 Resolved "${input}" → ${lat}, ${lon}`);
          return { lat, lon, name: loc.name || loc.city_name || input };
        }
      }
    }
  } catch (e) {
    console.warn('⚠️ Location API fallback:', e);
  }

  // Amadeus geocoding fallback
  try {
    const amadeusKey = Deno.env.get('AMADEUS_API_KEY');
    const amadeusSecret = Deno.env.get('AMADEUS_API_SECRET');
    if (amadeusKey && amadeusSecret) {
      const useProd = Deno.env.get('USE_PROD_APIS') === 'true';
      const base = useProd ? 'https://api.amadeus.com' : 'https://test.api.amadeus.com';
      const authResp = await fetch(`${base}/v1/security/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=client_credentials&client_id=${amadeusKey}&client_secret=${amadeusSecret}`,
      });
      if (authResp.ok) {
        const authData = await authResp.json();
        const locResp = await fetch(
          `${base}/v1/reference-data/locations?keyword=${encodeURIComponent(input)}&subType=CITY,AIRPORT&page[limit]=1`,
          { headers: { Authorization: `Bearer ${authData.access_token}` } }
        );
        if (locResp.ok) {
          const locData = await locResp.json();
          const loc = locData.data?.[0];
          if (loc?.geoCode) {
            return { lat: loc.geoCode.latitude, lon: loc.geoCode.longitude, name: loc.name || input };
          }
        }
      }
    }
  } catch (e) {
    console.warn('⚠️ Amadeus geocoding fallback error:', e);
  }

  return null;
}

// Transform RapidAPI car result to our frontend format
function transformCarResult(car: any, index: number, pickUpDate: string, dropOffDate: string): any {
  const vehicle = car.vehicle || car;
  const price = car.price || car.pricing || {};
  const supplier = car.supplier || car.provider || {};
  const pickup = car.pickupLocation || car.pickup || {};
  const dropoff = car.dropoffLocation || car.dropoff || {};

  const start = new Date(pickUpDate);
  const end = new Date(dropOffDate);
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  const totalPrice = parseFloat(price.total || price.amount || price.price || car.price_all_days || '0');
  const dailyRate = totalPrice > 0 ? Math.round((totalPrice / days) * 100) / 100 : 0;

  return {
    id: car.vehicle_id || car.id || `car-${index}`,
    provider: {
      name: supplier.name || car.supplier_name || car.company || 'Car Rental Provider',
      code: supplier.code || '',
      logo: supplier.logo || supplier.logoUrl || car.supplier_logo || null,
    },
    vehicle: {
      make: vehicle.make || vehicle.brand || car.group || '',
      model: vehicle.model || car.vehicle_info || '',
      category: vehicle.category || vehicle.type || car.group || 'Standard',
      type: vehicle.type || car.group || 'Car',
      doors: vehicle.doors || car.doors || 4,
      seats: vehicle.seats || car.seats || 5,
      bags: vehicle.bags || vehicle.bagQuantity || car.large_suitcase || 2,
      transmission: vehicle.transmission || car.transmission || 'Automatic',
      airConditioning: vehicle.airConditioning !== false && car.aircon !== false,
      fuelType: vehicle.fuelType || car.fuel_type || 'Petrol',
      imageUrl: vehicle.imageUrl || car.image_url || car.vehicle_image || null,
    },
    pricing: {
      currency: price.currency || car.currency_code || 'USD',
      dailyRate,
      totalDays: days,
      totalPrice,
      taxes: 0,
      grandTotal: totalPrice,
    },
    pickup: {
      locationCode: pickup.code || '',
      address: pickup.address || pickup.name || car.pick_up_location || '',
      date: pickUpDate,
      time: '10:00',
    },
    dropoff: {
      locationCode: dropoff.code || '',
      address: dropoff.address || dropoff.name || car.drop_off_location || '',
      date: dropOffDate,
      time: '10:00',
    },
    features: extractFeatures(car),
    bookingUrl: car.deeplink || car.url?.web || car.booking_url || null,
    rating: car.rating || car.review_score || null,
    isMockData: false,
    isRideshare: false,
  };
}

function extractFeatures(car: any): string[] {
  const features: string[] = [];
  if (car.free_cancellation || car.policies?.cancellation?.type === 'free_cancellation') {
    features.push('Free Cancellation');
  }
  if (car.mileage_unlimited || car.unlimited_mileage) features.push('Unlimited Mileage');
  if (car.aircon !== false) features.push('Air Conditioning');
  if (car.insurance_included) features.push('Insurance Included');
  if (features.length === 0) features.push('Standard Coverage');
  return features;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { pickUpLocationCode, pickUpCity, pickUpDate, dropOffDate, dropOffCity, driverAge } = body;
    const locationInput = pickUpCity || pickUpLocationCode;

    console.log('📥 Car search request:', { locationInput, pickUpDate, dropOffDate, driverAge });

    if (!locationInput || !pickUpDate || !dropOffDate) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters', details: 'Please provide pickup location, dates' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Resolve location to coordinates
    const location = await resolveLocation(locationInput);
    if (!location) {
      return new Response(
        JSON.stringify({
          error: 'Unable to find location',
          details: `No results found for "${locationInput}". Try a different city or airport code.`,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Resolve drop-off location if different
    let dropOffCoords = location;
    if (dropOffCity && dropOffCity !== locationInput) {
      const resolved = await resolveLocation(dropOffCity);
      if (resolved) dropOffCoords = resolved;
    }

    // Step 2: Fetch car rentals AND Uber estimates in parallel
    const uberTokenPromise = getUberToken();

    const carParams = new URLSearchParams({
      pick_up_latitude: location.lat.toString(),
      pick_up_longitude: location.lon.toString(),
      drop_off_latitude: dropOffCoords.lat.toString(),
      drop_off_longitude: dropOffCoords.lon.toString(),
      pick_up_time: `${pickUpDate}T10:00:00`,
      drop_off_time: `${dropOffDate}T10:00:00`,
      driver_age: (driverAge || 30).toString(),
      currency_code: 'USD',
    });

    console.log('🚗 Calling Booking.com car search + Uber estimates');

    const [carResponse, uberToken] = await Promise.all([
      fetch(`${RAPIDAPI_BASE}/cars/searchCarRentals?${carParams.toString()}`, { headers: getHeaders() }),
      uberTokenPromise,
    ]);

    // Process car rental results
    let carResults: any[] = [];
    if (carResponse.ok) {
      const carData = await carResponse.json();
      console.log('📦 Booking.com raw response:', JSON.stringify(carData).substring(0, 500));
      const rawResults = carData.data?.search_results
        || carData.data?.cars
        || carData.data
        || carData.search_results
        || carData.result
        || [];
      const results = Array.isArray(rawResults) ? rawResults : [];
      console.log('✅ Found', results.length, 'car rental results');
      carResults = results.map((car: any, i: number) => transformCarResult(car, i, pickUpDate, dropOffDate));
    } else {
      const errBody = await carResponse.text();
      console.warn('⚠️ Car rental search failed:', carResponse.status, errBody.substring(0, 300));
    }

    // Process Uber estimates
    let uberResults: any[] = [];
    if (uberToken) {
      uberResults = await getUberEstimates(
        uberToken,
        location.lat, location.lon,
        dropOffCoords.lat, dropOffCoords.lon,
        pickUpDate, dropOffDate
      );
      console.log('✅ Found', uberResults.length, 'Uber ride estimates');
    }

    // Combine: car rentals first (sorted by price), then Uber rides
    carResults.sort((a: any, b: any) => a.pricing.grandTotal - b.pricing.grandTotal);
    const allResults = [...carResults, ...uberResults];

    return new Response(
      JSON.stringify({
        data: allResults,
        meta: {
          count: allResults.length,
          carRentals: carResults.length,
          rideEstimates: uberResults.length,
          location: { iataCode: locationInput.toUpperCase(), name: location.name },
          environment: 'production',
          source: 'booking.com+uber',
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error in cars-search:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'An unexpected error occurred while searching for car rentals.',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
