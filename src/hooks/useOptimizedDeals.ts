import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, CACHE_TTL } from '@/lib/queryClient';

export interface Deal {
  id: string;
  slug: string;
  title: string;
  origin_city: string;
  origin_code: string;
  dest_city: string;
  dest_code: string;
  airline: string;
  airline_code?: string | null;
  class: string;
  date_from: string;
  date_to: string;
  price_usd: number;
  original_price_usd: number;
  currency: string;
  images: string | string[] | any;
  tags: string[] | any;
  featured: boolean;
  published: boolean;
  description?: string | null;
  short_description?: string | null;
  views_count?: number;
  clicks_count?: number;
  bookings_count?: number;
  created_at?: string;
  updated_at?: string;
  source?: string | null;
  notes?: string | null;
}

export interface DealsResponse {
  deals: Deal[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  fromCache?: boolean;
}

export interface DealsQuery {
  origin?: string;
  dest?: string;
  min_price?: number;
  max_price?: number;
  date_from?: string;
  date_to?: string;
  airline?: string;
  tags?: string;
  page?: number;
  limit?: number;
  sort?: string;
  featured?: boolean;
}

const fetchDeals = async (query: DealsQuery): Promise<DealsResponse> => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const queryString = params.toString();
  const functionPath = queryString ? `deals-get?${queryString}` : 'deals-get';

  const { data, error } = await supabase.functions.invoke(functionPath, {
    method: 'GET',
  });

  if (error) throw error;
  return data as DealsResponse;
};

export const useOptimizedDeals = (query: DealsQuery = {}) => {
  const queryKey = queryKeys.deals.list(query as Record<string, unknown>);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey,
    queryFn: () => fetchDeals(query),
    staleTime: CACHE_TTL.DEALS,
    gcTime: CACHE_TTL.DEALS * 3,
    placeholderData: (previousData) => previousData, // Keep showing old data while fetching
  });

  return {
    deals: data?.deals || [],
    loading: isLoading,
    isFetching,
    error: error?.message || null,
    total: data?.total || 0,
    totalPages: data?.total_pages || 0,
    fromCache: data?.fromCache || false,
    refetch,
  };
};

// Hook for fetching a single deal with caching
export const useOptimizedDeal = (idOrSlug: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.deals.detail(idOrSlug),
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke(
        `deals-get-by-id/${idOrSlug}`,
        { method: 'GET' }
      );
      if (error) throw error;
      return data as Deal;
    },
    enabled: !!idOrSlug,
    staleTime: CACHE_TTL.DEALS,
    gcTime: CACHE_TTL.DEALS * 3,
  });

  const trackClick = async () => {
    if (!data) return;
    try {
      await supabase
        .from('deals')
        .update({ clicks_count: (data.clicks_count || 0) + 1 })
        .eq('id', data.id);
    } catch (err) {
      console.error('Error tracking click:', err);
    }
  };

  return {
    deal: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch,
    trackClick,
  };
};
