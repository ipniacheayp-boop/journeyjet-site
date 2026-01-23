import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isRateLimitError = (data: any): boolean => {
  return data?.details?.includes('429') || 
         data?.details?.includes('Quota limit exceeded') ||
         data?.error?.includes('rate limit');
};

export const useFlightSearch = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchFlightsWithRetry = async (
    params: FlightSearchParams,
    attempt: number = 0
  ): Promise<any> => {
    console.log(`🚀 Flight search attempt ${attempt + 1}/${MAX_RETRIES + 1}`, params);

    const { data, error: functionError } = await supabase.functions.invoke('flights-search', {
      body: params,
    });

    console.log('📡 Backend response:', { data, error: functionError });

    if (functionError) {
      throw functionError;
    }

    // Check for rate limit error
    if (data?.error && isRateLimitError(data)) {
      if (attempt < MAX_RETRIES) {
        const delay = INITIAL_DELAY_MS * Math.pow(2, attempt);
        console.log(`⏳ Rate limited. Retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
        await sleep(delay);
        return searchFlightsWithRetry(params, attempt + 1);
      }
      
      // All retries exhausted
      const rateLimitError = 'Flight search is temporarily unavailable due to high demand. Please try again in a few minutes.';
      return { data: [], error: rateLimitError, isRateLimited: true };
    }

    if (data?.error) {
      throw new Error(data.error + (data.details ? ': ' + data.details : '') + (data.hint ? ' - ' + data.hint : ''));
    }

    return data;
  };

  const searchFlights = async (params: FlightSearchParams) => {
    setLoading(true);
    setError(null);

    try {
      const result = await searchFlightsWithRetry(params);
      
      if (result.isRateLimited) {
        setError(result.error);
        return result;
      }
      
      console.log('✅ Flight search successful:', result.data?.length || 0, 'results');
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to search flights';
      console.error('❌ Search error:', errorMessage);
      setError(errorMessage);
      if (!errorMessage.includes('temporarily unavailable')) {
        navigate('/error');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { searchFlights, loading, error };
};
