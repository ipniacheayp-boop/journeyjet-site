import { useState, useCallback } from 'react';
import { invokeSupabaseFunction } from '@/lib/invokeSupabaseFunction';

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

type FlightSearchApiPayload = {
  data?: unknown[];
  dictionaries?: unknown;
  meta?: { provider?: string; environment?: string };
  error?: string;
  details?: string;
  hint?: string;
};

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isRateLimitError = (payload: unknown): boolean => {
  const text =
    typeof payload === "string"
      ? payload
      : JSON.stringify(payload ?? "");
  return (
    text.includes("429") ||
    text.includes("Quota limit exceeded") ||
    text.includes("rate limit")
  );
};

export const useFlightSearch = () => {
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
  ): Promise<FlightSearchApiPayload & { isRateLimited?: boolean }> => {
    console.log(`🚀 Flight search attempt ${attempt + 1}/${MAX_RETRIES + 1}`, params);

    const { data, error: invokeErr } = await invokeSupabaseFunction<FlightSearchApiPayload>(
      "flights-search",
      params,
    );

    console.log('📡 Backend response:', { data, error: invokeErr });

    if (invokeErr) {
      if (attempt < MAX_RETRIES && isRateLimitError(invokeErr)) {
        const delay = INITIAL_DELAY_MS * Math.pow(2, attempt);
        console.log(`⏳ Rate limited. Retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);

        setRetryState({
          isRetrying: true,
          currentAttempt: attempt + 2,
          maxAttempts: MAX_RETRIES + 1,
        });

        await sleep(delay);
        return searchFlightsWithRetry(params, attempt + 1);
      }

      setRetryState({ isRetrying: false, currentAttempt: 0, maxAttempts: MAX_RETRIES + 1 });

      if (isRateLimitError(invokeErr)) {
        const rateLimitError =
          'Flight search is temporarily unavailable due to high demand. Please try again in a few minutes.';
        return { data: [], error: rateLimitError, isRateLimited: true };
      }

      throw new Error(invokeErr);
    }

    if (data?.error && isRateLimitError(data)) {
      if (attempt < MAX_RETRIES) {
        const delay = INITIAL_DELAY_MS * Math.pow(2, attempt);
        console.log(`⏳ Rate limited. Retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);

        setRetryState({
          isRetrying: true,
          currentAttempt: attempt + 2,
          maxAttempts: MAX_RETRIES + 1,
        });

        await sleep(delay);
        return searchFlightsWithRetry(params, attempt + 1);
      }

      setRetryState({ isRetrying: false, currentAttempt: 0, maxAttempts: MAX_RETRIES + 1 });
      const rateLimitError =
        'Flight search is temporarily unavailable due to high demand. Please try again in a few minutes.';
      return { data: [], error: rateLimitError, isRateLimited: true };
    }

    if (data?.error) {
      throw new Error(
        data.error +
          (data.details ? ': ' + data.details : '') +
          (data.hint ? ' - ' + data.hint : ''),
      );
    }

    return data ?? {};
  }, []);

  const searchFlights = async (params: FlightSearchParams) => {
    setLoading(true);
    setError(null);
    setRetryState({ isRetrying: false, currentAttempt: 1, maxAttempts: MAX_RETRIES + 1 });

    try {
      const result = await searchFlightsWithRetry(params);

      setRetryState({ isRetrying: false, currentAttempt: 0, maxAttempts: MAX_RETRIES + 1 });

      if (result.isRateLimited) {
        setError(result.error ?? null);
        return result;
      }

      const count = Array.isArray(result.data) ? result.data.length : 0;
      console.log('✅ Flight search successful:', count, 'results');
      return result;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search flights';
      console.error('❌ Search error:', errorMessage);
      setError(errorMessage);
      setRetryState({ isRetrying: false, currentAttempt: 0, maxAttempts: MAX_RETRIES + 1 });
      throw err instanceof Error ? err : new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { searchFlights, loading, error, retryState };
};
