import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useBooking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bookFlight = async (flightOffer: any, userDetails: any) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('flights-book', {
        body: { flightOffer, userDetails },
      });

      if (functionError) throw functionError;
      
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bookHotel = async (hotelOffer: any, userDetails: any) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('hotels-book', {
        body: { hotelOffer, userDetails },
      });

      if (functionError) throw functionError;
      
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to create hotel booking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bookCar = async (carOffer: any, userDetails: any) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('cars-book', {
        body: { carOffer, userDetails },
      });

      if (functionError) throw functionError;
      
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to create car booking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { bookFlight, bookHotel, bookCar, loading, error };
};
