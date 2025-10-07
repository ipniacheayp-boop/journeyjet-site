import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FlightSearchParams {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  travelClass?: string;
  currencyCode?: string;
}

export const useFlightSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchFlights = async (params: FlightSearchParams) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('flights-search', {
        body: params,
      });

      if (functionError) throw functionError;
      
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to search flights');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { searchFlights, loading, error };
};
