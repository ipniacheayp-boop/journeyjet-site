import { useState, useCallback } from 'react';
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

export interface RetryState {
  isRetrying: boolean;
  currentAttempt: number;
  maxAttempts: number;
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
  const [retryState, setRetryState] = useState<RetryState>({
    isRetrying: false,
    currentAttempt: 0,
    maxAttempts: MAX_RETRIES + 1,
  });

  const searchFlightsWithRetry = useCallback(async (
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
        
        // Update retry state for UI
        setRetryState({
          isRetrying: true,
          currentAttempt: attempt + 2, // Next attempt number (1-indexed)
          maxAttempts: MAX_RETRIES + 1,
        });
        
        await sleep(delay);
        return searchFlightsWithRetry(params, attempt + 1);
      }
      
      // All retries exhausted
      setRetryState({ isRetrying: false, currentAttempt: 0, maxAttempts: MAX_RETRIES + 1 });
      const rateLimitError = 'Flight search is temporarily unavailable due to high demand. Please try again in a few minutes.';
      return { data: [], error: rateLimitError, isRateLimited: true };
    }

    if (data?.error) {
      throw new Error(data.error + (data.details ? ': ' + data.details : '') + (data.hint ? ' - ' + data.hint : ''));
    }

    return data;
  }, []);

  const searchFlights = async (params: FlightSearchParams) => {
    setLoading(true);
    setError(null);
    setRetryState({ isRetrying: false, currentAttempt: 1, maxAttempts: MAX_RETRIES + 1 });

    try {
      const result = await searchFlightsWithRetry(params);
      
      setRetryState({ isRetrying: false, currentAttempt: 0, maxAttempts: MAX_RETRIES + 1 });
      
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
      setRetryState({ isRetrying: false, currentAttempt: 0, maxAttempts: MAX_RETRIES + 1 });
      // Don't redirect to error page - let SearchResults handle the error display
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { searchFlights, loading, error, retryState };
};
