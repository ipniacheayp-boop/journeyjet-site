import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export interface CarSearchParams {
  pickUpLocationCode: string;
  pickUpCity?: string;
  pickUpDate: string;
  dropOffDate: string;
  dropOffCity?: string;
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
        body: {
          ...params,
          // Send both city and code - backend will handle resolution
          pickUpCity: params.pickUpCity || params.pickUpLocationCode,
        },
      });

      console.log('📡 Backend response:', { data, error: functionError });

      if (functionError) {
        console.error('❌ Function error:', functionError);
        throw new Error(functionError.message || 'Car search failed');
      }

      if (data?.error) {
        console.error('❌ API error:', data.error, data.details);
        throw new Error(data.details || data.error);
      }
      
      console.log('✅ Car search successful:', data?.data?.length || 0, 'results');
      console.log('📍 Search location:', data?.meta?.location);
      
      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to search cars';
      console.error('❌ Search error:', errorMessage);
      setError(errorMessage);
      // Don't navigate to error page for search errors, let the UI handle it
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { searchCars, loading, error };
};
