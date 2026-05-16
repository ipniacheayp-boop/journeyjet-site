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
  // United Kingdom & Ireland
  'LCY': { lat: 51.5053, lon: 0.0553, name: 'London City' },
  'LGW': { lat: 51.1537, lon: -0.1821, name: 'London Gatwick' },
  'STN': { lat: 51.8860, lon: 0.2389, name: 'London Stansted' },
  'LTN': { lat: 51.8747, lon: -0.3683, name: 'London Luton' },
  'MAN': { lat: 53.3537, lon: -2.2750, name: 'Manchester' },
  'EDI': { lat: 55.9500, lon: -3.3725, name: 'Edinburgh' },
  'GLA': { lat: 55.8642, lon: -4.4332, name: 'Glasgow' },
  'BHX': { lat: 52.4539, lon: -1.7480, name: 'Birmingham' },
  'BRS': { lat: 51.3827, lon: -2.7191, name: 'Bristol' },
  'NCL': { lat: 55.0375, lon: -1.6917, name: 'Newcastle' },
  'DUB': { lat: 53.4213, lon: -6.2701, name: 'Dublin' },
  // Europe
  'MUC': { lat: 48.3537, lon: 11.7750, name: 'Munich' },
  'BER': { lat: 52.3667, lon: 13.5033, name: 'Berlin Brandenburg' },
  'HAM': { lat: 53.6304, lon: 9.9882, name: 'Hamburg' },
  'DUS': { lat: 51.2895, lon: 6.7668, name: 'Düsseldorf' },
  'ZRH': { lat: 47.4647, lon: 8.5492, name: 'Zurich' },
  'GVA': { lat: 46.2381, lon: 6.1090, name: 'Geneva' },
  'VIE': { lat: 48.1103, lon: 16.5697, name: 'Vienna' },
  'CPH': { lat: 55.6180, lon: 12.6508, name: 'Copenhagen' },
  'ARN': { lat: 59.6519, lon: 17.9186, name: 'Stockholm Arlanda' },
  'OSL': { lat: 60.1939, lon: 11.1004, name: 'Oslo' },
  'HEL': { lat: 60.3172, lon: 24.9633, name: 'Helsinki' },
  'ATH': { lat: 37.9364, lon: 23.9445, name: 'Athens' },
  'LIS': { lat: 38.7813, lon: -9.1359, name: 'Lisbon' },
  'OPO': { lat: 41.2481, lon: -8.6814, name: 'Porto' },
  'MAD': { lat: 40.4983, lon: -3.5676, name: 'Madrid' },
  'AGP': { lat: 36.6749, lon: -4.4991, name: 'Málaga' },
  'PMI': { lat: 39.5517, lon: 2.7388, name: 'Palma de Mallorca' },
  'MXP': { lat: 45.6306, lon: 8.7281, name: 'Milan Malpensa' },
  'LIN': { lat: 45.4451, lon: 9.2767, name: 'Milan Linate' },
  'VCE': { lat: 45.5053, lon: 12.3519, name: 'Venice' },
  'NAP': { lat: 40.8860, lon: 14.2908, name: 'Naples' },
  'NCE': { lat: 43.6584, lon: 7.2159, name: 'Nice' },
  'LYS': { lat: 45.7256, lon: 5.0811, name: 'Lyon' },
  'MRS': { lat: 43.4393, lon: 5.2214, name: 'Marseille' },
  'BRU': { lat: 50.9014, lon: 4.4844, name: 'Brussels' },
  'LUX': { lat: 49.6233, lon: 6.2044, name: 'Luxembourg' },
  'WAW': { lat: 52.1657, lon: 20.9671, name: 'Warsaw' },
  'KRK': { lat: 50.0777, lon: 19.7848, name: 'Kraków' },
  'PRG': { lat: 50.1008, lon: 14.2632, name: 'Prague' },
  'BUD': { lat: 47.4369, lon: 19.2556, name: 'Budapest' },
  'OTP': { lat: 44.5711, lon: 26.0858, name: 'Bucharest' },
  'SOF': { lat: 42.6952, lon: 23.4114, name: 'Sofia' },
  'KEF': { lat: 63.9850, lon: -22.6056, name: 'Reykjavík' },
  'SVO': { lat: 55.9728, lon: 37.4147, name: 'Moscow Sheremetyevo' },
  // North America
  'YYZ': { lat: 43.6777, lon: -79.6248, name: 'Toronto Pearson' },
  'YVR': { lat: 49.1967, lon: -123.1815, name: 'Vancouver' },
  'YUL': { lat: 45.4706, lon: -73.7408, name: 'Montréal' },
  'YYC': { lat: 51.1215, lon: -114.0076, name: 'Calgary' },
  'YOW': { lat: 45.3225, lon: -75.6692, name: 'Ottawa' },
  // US additions
  'EWR': { lat: 40.6895, lon: -74.1745, name: 'Newark' },
  'LGA': { lat: 40.7769, lon: -73.8740, name: 'New York LaGuardia' },
  'IAD': { lat: 38.9531, lon: -77.4565, name: 'Washington Dulles' },
  'DCA': { lat: 38.8512, lon: -77.0402, name: 'Washington Reagan' },
  'BWI': { lat: 39.1754, lon: -76.6683, name: 'Baltimore' },
  'PHL': { lat: 39.8744, lon: -75.2424, name: 'Philadelphia' },
  'CLT': { lat: 35.2140, lon: -80.9431, name: 'Charlotte' },
  'IAH': { lat: 29.9902, lon: -95.3368, name: 'Houston' },
  'HOU': { lat: 29.6454, lon: -95.2789, name: 'Houston Hobby' },
  'PHX': { lat: 33.4342, lon: -112.0116, name: 'Phoenix' },
  'SLC': { lat: 40.7899, lon: -111.9791, name: 'Salt Lake City' },
  'MSP': { lat: 44.8848, lon: -93.2223, name: 'Minneapolis' },
  'DTW': { lat: 42.2162, lon: -83.3554, name: 'Detroit' },
  'PDX': { lat: 45.5887, lon: -122.5975, name: 'Portland' },
  'SAN': { lat: 32.7338, lon: -117.1933, name: 'San Diego' },
  'TPA': { lat: 27.9755, lon: -82.5332, name: 'Tampa' },
  'FLL': { lat: 26.0726, lon: -80.1527, name: 'Fort Lauderdale' },
  'RDU': { lat: 35.8776, lon: -78.7875, name: 'Raleigh-Durham' },
  'AVL': { lat: 35.4362, lon: -82.5418, name: 'Asheville' },
  'STL': { lat: 38.7487, lon: -90.3700, name: 'St. Louis' },
  'CLE': { lat: 41.4117, lon: -81.8498, name: 'Cleveland' },
  'PIT': { lat: 40.4915, lon: -80.2329, name: 'Pittsburgh' },
  'CVG': { lat: 39.0488, lon: -84.6678, name: 'Cincinnati' },
  'MCI': { lat: 39.2976, lon: -94.7139, name: 'Kansas City' },
  'AUS': { lat: 30.1975, lon: -97.6664, name: 'Austin' },
  'SJC': { lat: 37.3639, lon: -121.9289, name: 'San Jose' },
  'OAK': { lat: 37.7213, lon: -122.2208, name: 'Oakland' },
  'HNL': { lat: 21.3187, lon: -157.9225, name: 'Honolulu' },
  'ACY': { lat: 39.4576, lon: -74.5772, name: 'Atlantic City' },
  // Asia / Oceania
  'PEK': { lat: 40.0801, lon: 116.5846, name: 'Beijing Capital' },
  'PKX': { lat: 39.5098, lon: 116.4106, name: 'Beijing Daxing' },
  'PVG': { lat: 31.1443, lon: 121.8083, name: 'Shanghai Pudong' },
  'SHA': { lat: 31.1979, lon: 121.3363, name: 'Shanghai Hongqiao' },
  'TPE': { lat: 25.0797, lon: 121.2342, name: 'Taipei Taoyuan' },
  'KUL': { lat: 2.7456, lon: 101.7099, name: 'Kuala Lumpur' },
  'CGK': { lat: -6.1256, lon: 106.6559, name: 'Jakarta' },
  'MNL': { lat: 14.5086, lon: 121.0194, name: 'Manila' },
  'SGN': { lat: 10.8188, lon: 106.6519, name: 'Ho Chi Minh City' },
  'HAN': { lat: 21.2187, lon: 105.8061, name: 'Hanoi' },
  'CCU': { lat: 22.6547, lon: 88.4467, name: 'Kolkata' },
  'COK': { lat: 10.1520, lon: 76.4019, name: 'Kochi' },
  'GOI': { lat: 15.3808, lon: 73.8314, name: 'Goa' },
  'AMD': { lat: 23.0772, lon: 72.6347, name: 'Ahmedabad' },
  'MEL': { lat: -37.6690, lon: 144.8410, name: 'Melbourne' },
  'BNE': { lat: -27.3942, lon: 153.1218, name: 'Brisbane' },
  'PER': { lat: -31.9403, lon: 115.9670, name: 'Perth' },
  'AKL': { lat: -37.0082, lon: 174.7850, name: 'Auckland' },
  // Middle East / Africa / LatAm
  'DOH': { lat: 25.2731, lon: 51.6080, name: 'Doha' },
  'AUH': { lat: 24.4330, lon: 54.6511, name: 'Abu Dhabi' },
  'RUH': { lat: 24.9576, lon: 46.6988, name: 'Riyadh' },
  'JED': { lat: 21.6796, lon: 39.1565, name: 'Jeddah' },
  'TLV': { lat: 32.0114, lon: 34.8867, name: 'Tel Aviv' },
  'AMM': { lat: 31.7226, lon: 35.9933, name: 'Amman' },
  'CMN': { lat: 33.3675, lon: -7.5898, name: 'Casablanca' },
  'NBO': { lat: -1.3192, lon: 36.9278, name: 'Nairobi' },
  'ADD': { lat: 8.9779, lon: 38.7993, name: 'Addis Ababa' },
  'LOS': { lat: 6.5774, lon: 3.3212, name: 'Lagos' },
  'CPT': { lat: -33.9648, lon: 18.6017, name: 'Cape Town' },
  'EZE': { lat: -34.8222, lon: -58.5358, name: 'Buenos Aires' },
  'SCL': { lat: -33.3928, lon: -70.7858, name: 'Santiago' },
  'LIM': { lat: -12.0219, lon: -77.1143, name: 'Lima' },
  'BOG': { lat: 4.7016, lon: -74.1469, name: 'Bogotá' },
  'GIG': { lat: -22.8100, lon: -43.2506, name: 'Rio de Janeiro' },
  'PTY': { lat: 9.0714, lon: -79.3835, name: 'Panama City' },
  'SJU': { lat: 18.4394, lon: -66.0018, name: 'San Juan' },
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
      pick_up_date: pickUpDate,
      pick_up_time: '10:00',
      drop_off_date: dropOffDate,
      drop_off_time: '10:00',
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
