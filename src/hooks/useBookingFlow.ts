import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PrebookingResult {
  ok: boolean;
  code?: string;
  message?: string;
  price?: number;
  currency?: string;
  originalPrice?: number;
  newPrice?: number;
  validatedOffer?: any;
  expiresAt?: string;
  existingBooking?: boolean;
  bookingId?: string;
}

interface ProvisionalBookingResult {
  ok: boolean;
  code?: string;
  message?: string;
  bookingId?: string;
  checkoutUrl?: string;
  bookingReference?: string;
}

interface BookingStatusResult {
  ok: boolean;
  bookingId?: string;
  status?: string;
  paymentStatus?: string;
  stage?: string;
  confirmedAt?: string;
}

export const useBookingFlow = () => {
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceChangeData, setPriceChangeData] = useState<{
    originalPrice: number;
    newPrice: number;
    currency: string;
    validatedOffer: any;
  } | null>(null);

  // Generate a unique client request ID for idempotency
  const generateClientRequestId = useCallback(() => {
    return crypto.randomUUID();
  }, []);

  // Step 1: Pre-validate the booking with provider
  const validatePrebooking = useCallback(async (
    productType: 'flight' | 'hotel' | 'car' | 'flights' | 'hotels' | 'cars',
    offer: any,
    clientRequestId: string
  ): Promise<PrebookingResult> => {
    setValidating(true);
    setError(null);
    setPriceChangeData(null);

    // Normalize product type
    const normalizedType = productType === 'flights' ? 'flight' : productType === 'hotels' ? 'hotel' : productType === 'cars' ? 'car' : productType;

    try {
      const { data, error: fnError } = await supabase.functions.invoke('prebooking-validate', {
        body: {
          productType: normalizedType,
          offer,
          clientRequestId,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Validation failed');
      }

      if (!data.ok && data.code === 'PRICE_CHANGED') {
        setPriceChangeData({
          originalPrice: data.originalPrice,
          newPrice: data.newPrice,
          currency: data.currency,
          validatedOffer: data.validatedOffer,
        });
      }

      return data;
    } catch (err: any) {
      const message = err.message || 'Failed to validate booking';
      setError(message);
      return { ok: false, code: 'ERROR', message };
    } finally {
      setValidating(false);
    }
  }, []);

  // Step 2: Create provisional booking and get checkout URL
  const createProvisionalBooking = useCallback(async (
    productType: string,
    offer: any,
    validatedOffer: any,
    price: number,
    currency: string,
    clientRequestId: string,
    userDetails: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      acceptedTerms: boolean;
    },
    agentId?: string,
    expiresAt?: string
  ): Promise<ProvisionalBookingResult> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('bookings-provisional', {
        body: {
          productType,
          offer,
          validatedOffer,
          price,
          currency,
          clientRequestId,
          userDetails: {
            ...userDetails,
            name: `${userDetails.firstName} ${userDetails.lastName}`.trim(),
          },
          agentId,
          expiresAt,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to create booking');
      }

      if (!data.ok) {
        throw new Error(data.message || 'Booking creation failed');
      }

      return data;
    } catch (err: any) {
      const message = err.message || 'Failed to create booking';
      setError(message);
      toast.error(message);
      return { ok: false, code: 'ERROR', message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Step 3: Poll booking status after payment
  const checkBookingStatus = useCallback(async (bookingId: string): Promise<BookingStatusResult> => {
    try {
      // First try the new payments-checkout-status endpoint
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payments-checkout-status?booking_id=${bookingId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );

      if (!response.ok) {
        console.error('Booking status check failed:', response.status);
        // Fallback to bookings-status endpoint
        const fallbackResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bookings-status?bookingId=${bookingId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
          }
        );
        
        if (!fallbackResponse.ok) {
          return { ok: false };
        }
        
        const fallbackData = await fallbackResponse.json();
        return {
          ok: true,
          bookingId: fallbackData.id,
          status: fallbackData.status,
          paymentStatus: fallbackData.payment_status,
          stage: fallbackData.stage,
          confirmedAt: fallbackData.confirmed_at,
        };
      }

      const data = await response.json();
      return {
        ok: true,
        bookingId: data.bookingId,
        status: data.status,
        paymentStatus: data.paymentStatus,
        stage: data.stripeSessionStatus === 'complete' ? 'payment_complete' : 'pending',
        confirmedAt: data.confirmedAt,
      };
    } catch (err: any) {
      console.error('Error checking booking status:', err);
      return { ok: false };
    }
  }, []);

  // Clear price change modal
  const clearPriceChange = useCallback(() => {
    setPriceChangeData(null);
  }, []);

  return {
    loading,
    validating,
    error,
    priceChangeData,
    generateClientRequestId,
    validatePrebooking,
    createProvisionalBooking,
    checkBookingStatus,
    clearPriceChange,
  };
};
