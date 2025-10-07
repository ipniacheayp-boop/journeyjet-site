import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CarSearchParams {
  pickUpLocationCode: string;
  pickUpDate: string;
  dropOffDate: string;
  driverAge?: number;
}

export const useCarSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCars = async (params: CarSearchParams) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('cars-search', {
        body: params,
      });

      if (functionError) throw functionError;
      
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to search cars');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { searchCars, loading, error };
};
