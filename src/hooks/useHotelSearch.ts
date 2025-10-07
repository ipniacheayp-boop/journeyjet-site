import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HotelSearchParams {
  cityCode: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  roomQuantity?: number;
  currency?: string;
}

export const useHotelSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchHotels = async (params: HotelSearchParams) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('hotels-search', {
        body: params,
      });

      if (functionError) throw functionError;
      
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to search hotels');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { searchHotels, loading, error };
};
