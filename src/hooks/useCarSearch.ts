import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export interface CarSearchParams {
  pickUpLocationCode: string;
  pickUpDate: string;
  dropOffDate: string;
  driverAge?: number;
}

export const useCarSearch = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCars = async (params: CarSearchParams) => {
    setLoading(true);
    setError(null);

    console.log('🚗 Frontend: Searching cars with params:', params);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('cars-search', {
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
      
      console.log('✅ Car search successful:', data.data?.length || 0, 'results');
      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to search cars';
      console.error('❌ Search error:', errorMessage);
      setError(errorMessage);
      navigate('/error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { searchCars, loading, error };
};
