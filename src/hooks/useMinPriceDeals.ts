import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useMinPriceDeals = (limit: number = 20) => {
  const [deals, setDeals] = useState<MinPriceDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const fetchDeals = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(forceRefresh && { refresh: 'true' }),
      });

      const { data, error: fetchError } = await supabase.functions.invoke(
        `deals-min-price?${params.toString()}`,
        { method: 'GET' }
      );

      if (fetchError) throw fetchError;

      const response: MinPriceDealsResponse = data;
      
      if (response.error && response.deals.length === 0) {
        throw new Error(response.error);
      }

      setDeals(response.deals || []);
      setFromCache(response.fromCache || false);
    } catch (err: any) {
      console.error('Error fetching min price deals:', err);
      setError(err.message || 'Failed to fetch deals');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  return {
    deals,
    loading,
    error,
    fromCache,
    refetch: () => fetchDeals(true),
  };
};
