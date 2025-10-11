import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const useBooking = () => {
  const navigate = useNavigate();
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
      navigate('/error');
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
      navigate('/error');
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
      navigate('/error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { bookFlight, bookHotel, bookCar, loading, error };
};
