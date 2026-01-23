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

export const useFlightSearch = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchFlights = async (params: FlightSearchParams) => {
    setLoading(true);
    setError(null);

    console.log('🚀 Frontend: Searching flights with params:', params);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('flights-search', {
        body: params,
      });

      console.log('📡 Backend response:', { data, error: functionError });

      if (functionError) {
        console.error('❌ Function error:', functionError);
        throw functionError;
      }

      if (data?.error) {
        console.error('❌ API error:', data.error, data.details);
        
        // Check for rate limit error (429)
        if (data.details?.includes('429') || data.details?.includes('Quota limit exceeded')) {
          const rateLimitError = 'Flight search is temporarily unavailable due to high demand. Please try again in a few minutes.';
          setError(rateLimitError);
          return { data: [], error: rateLimitError, isRateLimited: true };
        }
        
        throw new Error(data.error + (data.details ? ': ' + data.details : '') + (data.hint ? ' - ' + data.hint : ''));
      }
      
      console.log('✅ Flight search successful:', data.data?.length || 0, 'results');
      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to search flights';
      console.error('❌ Search error:', errorMessage);
      setError(errorMessage);
      // Don't navigate to error page for rate limits
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
