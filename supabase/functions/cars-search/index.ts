import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

let cachedToken: { token: string; expiresAt: number } | null = null;

// Determine API base URL based on environment
function getBaseUrl(): string {
  const useProd = Deno.env.get('USE_PROD_APIS') === 'true';
  return useProd ? 'https://api.amadeus.com' : 'https://test.api.amadeus.com';
}

function isTestEnvironment(): boolean {
  return Deno.env.get('USE_PROD_APIS') !== 'true';
}

// Generate mock car data for test environment when Amadeus has no results
function generateMockCars(locationCode: string, pickUpDate: string, dropOffDate: string): any[] {
  const providers = ['Hertz', 'Avis', 'Enterprise', 'Budget', 'National'];
  const categories = [
    { name: 'Economy', seats: 4, bags: 2, doors: 4 },
    { name: 'Compact', seats: 5, bags: 3, doors: 4 },
    { name: 'SUV', seats: 7, bags: 4, doors: 4 },
    { name: 'Luxury', seats: 5, bags: 3, doors: 4 },
    { name: 'Minivan', seats: 8, bags: 5, doors: 4 },
  ];
  const makes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes'];
  const models = {
    Economy: ['Corolla', 'Civic', 'Focus', 'Cruze'],
    Compact: ['Camry', 'Accord', 'Fusion', 'Malibu'],
    SUV: ['RAV4', 'CR-V', 'Explorer', 'Equinox'],
    Luxury: ['3 Series', 'C-Class', 'A4', 'ES'],
    Minivan: ['Sienna', 'Odyssey', 'Pacifica', 'Carnival'],
  };

  const start = new Date(pickUpDate);
  const end = new Date(dropOffDate);
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  return categories.map((cat, index) => {
    const provider = providers[index % providers.length];
    const make = makes[index % makes.length];
    const model = models[cat.name as keyof typeof models][index % models[cat.name as keyof typeof models].length];
    const dailyRate = cat.name === 'Economy' ? 35 : cat.name === 'Compact' ? 45 : cat.name === 'SUV' ? 65 : cat.name === 'Luxury' ? 95 : 75;

    return {
      id: `mock-${locationCode}-${index}-${Date.now()}`,
      provider: {
        name: provider,
        code: provider.substring(0, 2).toUpperCase(),
        logo: null,
      },
      vehicle: {
        make,
        model,
        category: cat.name,
        type: cat.name,
        doors: cat.doors,
        seats: cat.seats,
        bags: cat.bags,
        transmission: index % 2 === 0 ? 'Automatic' : 'Manual',
        airConditioning: true,
        fuelType: 'Petrol',
        imageUrl: null,
      },
      pricing: {
        currency: 'USD',
        dailyRate,
        totalDays: days,
        totalPrice: dailyRate * days,
        taxes: Math.round(dailyRate * days * 0.12),
        grandTotal: Math.round(dailyRate * days * 1.12),
      },
      pickup: {
        locationCode,
        address: `${locationCode} Airport Car Rental Center`,
        date: pickUpDate,
        time: '10:00',
      },
      dropoff: {
        locationCode,
        address: `${locationCode} Airport Car Rental Center`,
        date: dropOffDate,
        time: '10:00',
      },
      features: ['Unlimited Mileage', 'Free Cancellation', 'Insurance Included'],
      isMockData: true,
    };
  });
}

async function getAmadeusToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const apiKey = Deno.env.get('AMADEUS_API_KEY');
  const apiSecret = Deno.env.get('AMADEUS_API_SECRET');
  const baseUrl = getBaseUrl();

  if (!apiKey || !apiSecret) {
    throw new Error('Amadeus API credentials not configured');
  }

  console.log(`🔑 Authenticating with Amadeus (${baseUrl.includes('test') ? 'TEST' : 'PRODUCTION'})...`);

  const authResponse = await fetch(`${baseUrl}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=client_credentials&client_id=${apiKey}&client_secret=${apiSecret}`,
  });

  if (!authResponse.ok) {
    const errorText = await authResponse.text();
    console.error('❌ Auth failed:', errorText);
    throw new Error('Failed to authenticate with Amadeus API');
  }

  const authData = await authResponse.json();
  cachedToken = {
    token: authData.access_token,
    expiresAt: Date.now() + (25 * 60 * 1000), // 25 minutes to be safe
  };

  console.log('✅ Amadeus token obtained successfully');
  return authData.access_token;
}

// Resolve city/location name to IATA code
async function resolveLocationToIATA(token: string, locationInput: string): Promise<{ iataCode: string; name: string } | null> {
  const baseUrl = getBaseUrl();
  const keyword = locationInput.trim();
  
  console.log(`🔍 Resolving location: "${keyword}"`);

  // If it looks like an IATA code already (3 uppercase letters), try to validate it
  if (/^[A-Z]{3}$/i.test(keyword)) {
    return { iataCode: keyword.toUpperCase(), name: keyword.toUpperCase() };
  }

  const params = new URLSearchParams({
    keyword: keyword,
    subType: 'CITY,AIRPORT',
    'page[limit]': '5',
  });

  const response = await fetch(`${baseUrl}/v1/reference-data/locations?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    console.error('❌ Location API error:', response.status);
    return null;
  }

  const data = await response.json();

  if (!data.data || data.data.length === 0) {
    console.log('❌ No locations found for:', keyword);
    return null;
  }

  // Prefer city over airport, take the first match
  const cityMatch = data.data.find((loc: any) => loc.subType === 'CITY');
  const location = cityMatch || data.data[0];
  
  console.log(`✅ Resolved "${keyword}" to: ${location.iataCode} (${location.name})`);
  return { 
    iataCode: location.iataCode, 
    name: location.name || location.address?.cityName || keyword 
  };
}

// Transform Amadeus car offer to a cleaner format
function transformCarOffer(offer: any, index: number): any {
  const vehicle = offer.vehicle || {};
  const price = offer.price || {};
  const provider = offer.provider || {};
  const pickUp = offer.pickUp || {};
  const dropOff = offer.dropOff || {};
  
  // Extract vehicle details
  const category = vehicle.category || vehicle.acrissCode?.charAt(0) || 'Standard';
  const categoryMap: Record<string, string> = {
    'M': 'Mini',
    'N': 'Mini Elite',
    'E': 'Economy',
    'H': 'Economy Elite',
    'C': 'Compact',
    'D': 'Compact Elite',
    'I': 'Intermediate',
    'J': 'Intermediate Elite',
    'S': 'Standard',
    'R': 'Standard Elite',
    'F': 'Fullsize',
    'G': 'Fullsize Elite',
    'P': 'Premium',
    'U': 'Premium Elite',
    'L': 'Luxury',
    'W': 'Luxury Elite',
    'O': 'Oversize',
    'X': 'Special',
  };
  
  const transmissionCode = vehicle.acrissCode?.charAt(2) || 'A';
  const transmission = transmissionCode === 'M' ? 'Manual' : 'Automatic';
  
  const fuelAC = vehicle.acrissCode?.charAt(3) || 'R';
  const hasAC = !['N', 'X'].includes(fuelAC);

  return {
    id: offer.id || `car-${index}`,
    vehicle: {
      make: vehicle.make || 'Vehicle',
      model: vehicle.model || '',
      category: categoryMap[category] || vehicle.category || 'Standard',
      vehicleType: vehicle.type || vehicle.acrissCode || 'Car',
      acrissCode: vehicle.acrissCode || '',
      seats: vehicle.seats || vehicle.seatQuantity || 5,
      doors: vehicle.doors || 4,
      bags: vehicle.bagQuantity || vehicle.baggageQuantity || 2,
      transmission: transmission,
      hasAC: hasAC,
      fuelType: vehicle.fuelType || 'Petrol',
      imageUrl: vehicle.imageURL || null,
    },
    price: {
      total: price.total || price.amount || '0',
      currency: price.currency || 'USD',
      perDay: price.base || null,
    },
    provider: {
      name: provider.name || provider.companyName || 'Car Rental Provider',
      code: provider.code || '',
      logoUrl: provider.logoUrl || null,
    },
    pickUp: {
      locationCode: pickUp.locationCode || '',
      address: pickUp.address?.line || pickUp.address?.cityName || '',
      dateTime: pickUp.dateTime || '',
    },
    dropOff: {
      locationCode: dropOff.locationCode || '',
      address: dropOff.address?.line || dropOff.address?.cityName || '',
      dateTime: dropOff.dateTime || '',
    },
    policies: offer.policies || {},
    originalOffer: offer, // Keep original for booking
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { pickUpLocationCode, pickUpCity, pickUpDate, dropOffDate, dropOffCity, driverAge } = body;
    
    // Support both pickUpLocationCode and pickUpCity
    const locationInput = pickUpLocationCode || pickUpCity;

    console.log('📥 Car search request:', { locationInput, pickUpDate, dropOffDate, driverAge });

    if (!locationInput || !pickUpDate || !dropOffDate) {
      console.error('❌ Missing required parameters');
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters', 
          details: 'Please provide pickup location, pickup date, and drop-off date' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = await getAmadeusToken();
    const baseUrl = getBaseUrl();

    // Step 1: Resolve location to IATA code
    const resolvedLocation = await resolveLocationToIATA(token, locationInput);
    
    if (!resolvedLocation) {
      return new Response(
        JSON.stringify({ 
          error: 'Unable to find location',
          details: `No results found for "${locationInput}". Please try a different city name or use an airport code (e.g., JFK, LAX, LHR).`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resolvedCode = resolvedLocation.iataCode;
    console.log(`✅ Using location code: ${resolvedCode}`);

    // Step 2: Search for car rental offers
    const carParams = new URLSearchParams({
      pickUpLocationCode: resolvedCode,
      pickUpDate,
      dropOffDate,
    });

    // Handle drop-off location if different
    if (dropOffCity && dropOffCity !== locationInput) {
      const dropOffResolved = await resolveLocationToIATA(token, dropOffCity);
      if (dropOffResolved) {
        carParams.append('dropOffLocationCode', dropOffResolved.iataCode);
      }
    }

    if (driverAge) {
      carParams.append('driverAge', driverAge.toString());
    }

    console.log('🚗 Fetching car offers with params:', carParams.toString());

    const carResponse = await fetch(
      `${baseUrl}/v1/shopping/availability/vehicle-offers?${carParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    console.log('📡 Car offers API response status:', carResponse.status);

    if (!carResponse.ok) {
      const errorText = await carResponse.text();
      console.error('❌ Amadeus car search error:', carResponse.status, errorText);
      
      // Try alternative endpoint if first one fails
      console.log('🔄 Trying alternative endpoint...');
      
      const altResponse = await fetch(
        `${baseUrl}/v1/shopping/vehicle-offers?${carParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!altResponse.ok) {
        const altError = await altResponse.text();
        console.error('❌ Alternative endpoint also failed:', altResponse.status, altError);
        
        // In test environment, return mock data since Amadeus test has limited coverage
        if (isTestEnvironment()) {
          console.log('📦 Returning mock car data for test environment');
          const mockCars = generateMockCars(resolvedCode, pickUpDate, dropOffDate);
          return new Response(
            JSON.stringify({
              data: mockCars,
              meta: {
                count: mockCars.length,
                location: resolvedLocation,
                environment: 'test',
                isMockData: true,
                notice: 'Using demo data - Amadeus test environment has limited coverage for this location.'
              }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            error: 'No car rentals available',
            details: `No vehicles found for ${resolvedLocation.name} (${resolvedCode}) on the selected dates. Try different dates or another location.`,
            meta: { environment: 'production' }
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const altData = await altResponse.json();
      const transformedOffers = (altData.data || []).map(transformCarOffer);
      
      // Sort by price
      transformedOffers.sort((a: any, b: any) => {
        const priceA = parseFloat(a.price.total || '999999');
        const priceB = parseFloat(b.price.total || '999999');
        return priceA - priceB;
      });

      return new Response(
        JSON.stringify({
          data: transformedOffers,
          meta: {
            count: transformedOffers.length,
            location: resolvedLocation,
            environment: baseUrl.includes('test') ? 'test' : 'production',
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const carData = await carResponse.json();
    console.log('✅ Raw car offers received:', carData.data?.length || 0);

    // Transform offers to cleaner format
    const transformedOffers = (carData.data || []).map(transformCarOffer);

    // Sort by price (ascending)
    transformedOffers.sort((a: any, b: any) => {
      const priceA = parseFloat(a.price.total || '999999');
      const priceB = parseFloat(b.price.total || '999999');
      return priceA - priceB;
    });

    console.log('✅ Car search completed:', transformedOffers.length, 'offers');

    return new Response(
      JSON.stringify({
        data: transformedOffers,
        meta: {
          count: transformedOffers.length,
          location: resolvedLocation,
          environment: baseUrl.includes('test') ? 'test' : 'production',
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error in cars-search:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'An unexpected error occurred while searching for car rentals.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
