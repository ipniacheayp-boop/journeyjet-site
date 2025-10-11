import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchHotels = async (params: HotelSearchParams) => {
    setLoading(true);
    setError(null);

    console.log('🏨 Frontend: Searching hotels with params:', params);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('hotels-search', {
        body: params,
      });

      console.log('📡 Backend response:', { data, error: functionError });

      if (functionError) {
        console.error('❌ Function error:', functionError);
        throw functionError;
      }

      if (data?.error) {
        console.error('❌ API error:', data.error, data.details);
        throw new Error(data.error + (data.details ? ': ' + data.details : ''));
      }
      
      console.log('✅ Hotel search successful:', data.data?.length || 0, 'results');
      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to search hotels';
      console.error('❌ Search error:', errorMessage);
      setError(errorMessage);
      navigate('/error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { searchHotels, loading, error };
};
