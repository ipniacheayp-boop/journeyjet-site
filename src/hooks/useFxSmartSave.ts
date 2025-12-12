import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SmartSaveResult {
  recommendedCurrency: string;
  recommendedAmountLocal: number;
  recommendedAmountUSD: number;
  effectiveCostUSD: number;
  savingsUSD: number;
  breakdown: Array<{
    currency: string;
    localAmount: number;
    convertedUSD: number;
    effectiveCostUSD: number;
    rate: number;
    feePercent: number;
  }>;
  productType: string;
}

interface PriceOption {
  currency: string;
  amount: number;
}

interface UseFxSmartSaveOptions {
  productType: 'flight' | 'hotel' | 'car';
  prices: PriceOption[];
  origin?: string;
  destination?: string;
  travelDate?: string;
  enabled?: boolean;
}

export function useFxSmartSave({ 
  productType, 
  prices, 
  origin, 
  destination, 
  travelDate,
  enabled = true 
}: UseFxSmartSaveOptions) {
  const [data, setData] = useState<SmartSaveResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || prices.length === 0) {
      setData(null);
      return;
    }

    const fetchSmartSave = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data: result, error: invokeError } = await supabase.functions.invoke('fx-smart-save', {
          body: {
            productType,
            prices,
            origin,
            destination,
            travelDate,
          },
        });

        if (invokeError) {
          throw new Error(invokeError.message);
        }

        if (result.error) {
          throw new Error(result.error);
        }

        setData(result);
      } catch (err) {
        console.error('[useFxSmartSave] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to calculate smart save');
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce to avoid excessive API calls
    const timeoutId = setTimeout(fetchSmartSave, 300);
    return () => clearTimeout(timeoutId);
  }, [productType, JSON.stringify(prices), origin, destination, travelDate, enabled]);

  const showBadge = data && data.savingsUSD >= 10;

  return {
    data,
    isLoading,
    error,
    showBadge,
  };
}

export function useFxHedgeSuggestion(travelDate?: string, currency: string = 'USD') {
  const [data, setData] = useState<{
    showHedgingSuggestion: boolean;
    daysUntilTravel: number;
    message: string | null;
    tips?: string[];
    disclaimer?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!travelDate) {
      setData(null);
      return;
    }

    const fetchHedgeSuggestion = async () => {
      setIsLoading(true);

      try {
        const { data: result, error } = await supabase.functions.invoke('fx-hedge-suggestion', {
          body: {},
          headers: {},
        });

        // Since it's a GET endpoint with query params, we need to call it differently
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fx-hedge-suggestion?travelDate=${travelDate}&currency=${currency}`,
          {
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch hedge suggestion');
        }

        const json = await response.json();
        setData(json);
      } catch (err) {
        console.error('[useFxHedgeSuggestion] Error:', err);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHedgeSuggestion();
  }, [travelDate, currency]);

  return { data, isLoading };
}

export async function logFxSmartSaveDecision(params: {
  bookingId?: string;
  productType: 'flight' | 'hotel' | 'car';
  originalCurrency: string;
  originalAmount: number;
  recommendedCurrency: string;
  recommendedAmount: number;
  savingsUsd: number;
}) {
  try {
    await supabase.functions.invoke('fx-smart-save-log', {
      body: params,
    });
  } catch (err) {
    console.error('[logFxSmartSaveDecision] Error:', err);
    // Non-blocking - don't throw
  }
}
