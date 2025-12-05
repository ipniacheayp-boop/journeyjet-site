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

const fetchMinPriceDeals = async (limit: number, forceRefresh = false): Promise<MinPriceDealsResponse> => {
  const params = new URLSearchParams({
    limit: limit.toString(),
    ...(forceRefresh && { refresh: 'true' }),
  });

  const { data, error } = await supabase.functions.invoke(
    `deals-min-price?${params.toString()}`,
    { method: 'GET' }
  );

  if (error) throw error;
  
  const response = data as MinPriceDealsResponse;
  if (response.error && response.deals.length === 0) {
    throw new Error(response.error);
  }

  return response;
};

export const useOptimizedMinPriceDeals = (limit: number = 20) => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.deals.minPrice(limit),
    queryFn: () => fetchMinPriceDeals(limit),
    staleTime: CACHE_TTL.DEALS,
    gcTime: CACHE_TTL.DEALS * 3,
    placeholderData: (previousData) => previousData,
  });

  return {
    deals: data?.deals || [],
    loading: isLoading,
    isFetching,
    error: error?.message || null,
    fromCache: data?.fromCache || false,
    refetch: () => refetch(),
  };
};
