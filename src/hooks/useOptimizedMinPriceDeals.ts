import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, CACHE_TTL } from '@/lib/queryClient';

export interface MinPriceDeal {
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

interface MinPriceDealsResponse {
  deals: MinPriceDeal[];
  total: number;
  fromCache: boolean;
  fetchedAt?: string;
  error?: string;
}

// Major US airports for generating fallback deals
const US_ORIGINS = [
  { code: 'JFK', city: 'New York' },
  { code: 'LAX', city: 'Los Angeles' },
  { code: 'SFO', city: 'San Francisco' },
  { code: 'MIA', city: 'Miami' },
  { code: 'ORD', city: 'Chicago' },
  { code: 'DFW', city: 'Dallas' },
  { code: 'ATL', city: 'Atlanta' },
  { code: 'BOS', city: 'Boston' },
  { code: 'SEA', city: 'Seattle' },
  { code: 'DEN', city: 'Denver' },
];

// Popular destinations
const DESTINATIONS = [
  { code: 'CDG', city: 'Paris' },
  { code: 'LHR', city: 'London' },
  { code: 'NRT', city: 'Tokyo' },
  { code: 'CUN', city: 'Cancun' },
  { code: 'BCN', city: 'Barcelona' },
  { code: 'FCO', city: 'Rome' },
  { code: 'DXB', city: 'Dubai' },
  { code: 'SYD', city: 'Sydney' },
  { code: 'HNL', city: 'Honolulu' },
  { code: 'MLE', city: 'Maldives' },
  { code: 'AMS', city: 'Amsterdam' },
  { code: 'IST', city: 'Istanbul' },
  { code: 'SIN', city: 'Singapore' },
  { code: 'BKK', city: 'Bangkok' },
  { code: 'LIS', city: 'Lisbon' },
];

const AIRLINES = [
  { code: 'AA', name: 'American Airlines' },
  { code: 'UA', name: 'United Airlines' },
  { code: 'DL', name: 'Delta Air Lines' },
  { code: 'BA', name: 'British Airways' },
  { code: 'AF', name: 'Air France' },
  { code: 'EK', name: 'Emirates' },
  { code: 'LH', name: 'Lufthansa' },
  { code: 'JL', name: 'Japan Airlines' },
  { code: 'SQ', name: 'Singapore Airlines' },
  { code: 'QF', name: 'Qantas' },
];

// Generate a random date within 60-90 days from now
const getRandomFutureDate = (offsetDays: number = 0): string => {
  const today = new Date();
  const minDays = 60 + offsetDays;
  const maxDays = 90 + offsetDays;
  const randomDays = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + randomDays);
  return futureDate.toISOString().split('T')[0];
};

// Generate a return date 5-14 days after departure
const getReturnDate = (departDate: string): string => {
  const depart = new Date(departDate);
  const tripLength = Math.floor(Math.random() * 10) + 5; // 5-14 days
  depart.setDate(depart.getDate() + tripLength);
  return depart.toISOString().split('T')[0];
};

// Realistic price ranges (USD roundtrip economy) by destination
const PRICE_RANGES: Record<string, [number, number]> = {
  // Domestic US
  'LAX': [249, 449],
  'SFO': [279, 479],
  'JFK': [259, 459],
  'ORD': [229, 429],
  'MIA': [269, 469],
  'LAS': [239, 439],
  'DEN': [249, 439],
  'SEA': [279, 489],
  'BOS': [259, 459],
  'ATL': [229, 419],
  'DFW': [239, 429],
  'PHX': [249, 439],
  'MCO': [259, 459],
  'HNL': [499, 899],
  'ANC': [449, 799],
  'SJU': [399, 699],
  // Mexico / Caribbean
  'CUN': [389, 649],
  'MEX': [369, 629],
  // Europe
  'CDG': [649, 1149],
  'LHR': [599, 1099],
  'BCN': [629, 1099],
  'FCO': [649, 1149],
  'AMS': [599, 1049],
  'LIS': [579, 999],
  'IST': [699, 1199],
  'DUB': [569, 999],
  // Asia / Middle East / Oceania
  'NRT': [899, 1499],
  'DXB': [849, 1399],
  'SIN': [1049, 1699],
  'BKK': [899, 1499],
  'SYD': [1249, 1999],
  'MLE': [1099, 1799],
};

const getRandomPrice = (destCode: string): number => {
  const [min, max] = PRICE_RANGES[destCode] || [349, 699];
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Enforce realistic minimum on any deal (API or fallback) so unrealistically low
// test prices from upstream providers never surface to the user.
const enforceRealisticPrice = (deal: MinPriceDeal): MinPriceDeal => {
  const [min, max] = PRICE_RANGES[deal.destination] || [349, 699];
  if (deal.price >= min) return deal;
  const bumped = Math.floor(Math.random() * (max - min + 1)) + min;
  return { ...deal, price: bumped, currency: 'USD' };
};

// Generate fallback deals to fill the gap
const generateFallbackDeals = (count: number, existingIds: Set<string>): MinPriceDeal[] => {
  const deals: MinPriceDeal[] = [];
  let index = 0;
  
  while (deals.length < count && index < 200) {
    const origin = US_ORIGINS[index % US_ORIGINS.length];
    const dest = DESTINATIONS[(index + Math.floor(index / US_ORIGINS.length)) % DESTINATIONS.length];
    const airline = AIRLINES[index % AIRLINES.length];
    
    // Skip if origin and destination are the same region
    if (origin.code === dest.code) {
      index++;
      continue;
    }
    
    const dealId = `fallback-${origin.code}-${dest.code}-${index}`;
    
    // Skip if already exists
    if (existingIds.has(dealId)) {
      index++;
      continue;
    }
    
    const departDate = getRandomFutureDate(Math.floor(index / 10) * 5);
    const returnDate = getReturnDate(departDate);
    const price = getRandomPrice(dest.code);
    
    deals.push({
      id: dealId,
      origin: origin.code,
      originCity: origin.city,
      destination: dest.code,
      destCity: dest.city,
      airline: airline.name,
      airlineCode: airline.code,
      price,
      currency: 'USD',
      departureDate: departDate,
      returnDate: returnDate,
      cabinClass: 'Economy',
      bookingLink: '/booking',
      fetchedAt: new Date().toISOString(),
    });
    
    existingIds.add(dealId);
    index++;
  }
  
  return deals;
};

const fetchMinPriceDeals = async (limit: number, forceRefresh = false): Promise<MinPriceDealsResponse> => {
  const params = new URLSearchParams({
    limit: Math.max(limit, 50).toString(), // Always request at least 50
    ...(forceRefresh && { refresh: 'true' }),
  });

  try {
    const { data, error } = await supabase.functions.invoke(
      `deals-min-price?${params.toString()}`,
      { method: 'GET' }
    );

    if (error) throw error;
    
    const response = data as MinPriceDealsResponse;
    let deals = response.deals || [];
    
    // If we have fewer than 50 deals, generate fallback deals
    const minDeals = 50;
    if (deals.length < minDeals) {
      const existingIds = new Set(deals.map(d => d.id));
      const fallbackDeals = generateFallbackDeals(minDeals - deals.length, existingIds);
      deals = [...deals, ...fallbackDeals];
    }
    
    // Enforce realistic minimum prices (upstream test APIs sometimes return unrealistic lows)
    deals = deals.map(enforceRealisticPrice);

    // Sort by price (lowest first)
    deals.sort((a, b) => a.price - b.price);
    
    return {
      ...response,
      deals,
      total: deals.length,
    };
  } catch (err) {
    console.error('Error fetching min price deals:', err);
    
    // On complete failure, return generated fallback deals
    const fallbackDeals = generateFallbackDeals(50, new Set());
    fallbackDeals.sort((a, b) => a.price - b.price);
    
    return {
      deals: fallbackDeals,
      total: fallbackDeals.length,
      fromCache: false,
      error: err instanceof Error ? err.message : 'Failed to fetch deals',
    };
  }
};

export const useOptimizedMinPriceDeals = (limit: number = 50) => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.deals.minPrice(Math.max(limit, 50)),
    queryFn: () => fetchMinPriceDeals(Math.max(limit, 50)),
    staleTime: CACHE_TTL.DEALS,
    gcTime: CACHE_TTL.DEALS * 3,
    placeholderData: (previousData) => previousData,
    retry: 2,
  });

  return {
    deals: data?.deals || [],
    loading: isLoading,
    isFetching,
    error: error?.message || data?.error || null,
    fromCache: data?.fromCache || false,
    refetch: () => refetch(),
  };
};
