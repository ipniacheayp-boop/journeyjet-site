import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  images: string | string[] | any; // JSON from Supabase
  tags: string[] | any; // JSON from Supabase
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

export const useDeals = (query: DealsQuery = {}) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchDeals();
  }, [JSON.stringify(query)]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      const { data, error: fetchError } = await supabase.functions.invoke('deals-get', {
        body: {},
        method: 'GET',
      });

      if (fetchError) throw fetchError;

      const response: DealsResponse = data;
      setDeals(response.deals || []);
      setTotal(response.total || 0);
      setTotalPages(response.total_pages || 0);
    } catch (err: any) {
      console.error('Error fetching deals:', err);
      setError(err.message || 'Failed to fetch deals');
    } finally {
      setLoading(false);
    }
  };

  return {
    deals,
    loading,
    error,
    total,
    totalPages,
    refetch: fetchDeals,
  };
};

export const useDeal = (idOrSlug: string) => {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idOrSlug) return;
    fetchDeal();
  }, [idOrSlug]);

  const fetchDeal = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase.functions.invoke(
        `deals-get-by-id/${idOrSlug}`,
        { method: 'GET' }
      );

      if (fetchError) throw fetchError;

      setDeal(data);
    } catch (err: any) {
      console.error('Error fetching deal:', err);
      setError(err.message || 'Failed to fetch deal');
    } finally {
      setLoading(false);
    }
  };

  const trackClick = async () => {
    if (!deal) return;

    try {
      await supabase
        .from('deals')
        .update({ clicks_count: (deal.clicks_count || 0) + 1 })
        .eq('id', deal.id);
    } catch (err) {
      console.error('Error tracking click:', err);
    }
  };

  return {
    deal,
    loading,
    error,
    refetch: fetchDeal,
    trackClick,
  };
};