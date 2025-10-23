import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useReviews = (bookingId?: string) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [bookingId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('reviews-get', {
        body: { 
          bookingId,
          sortBy: 'recent',
          limit: 100,
        },
      });

      if (error) throw error;

      setReviews(data.data || []);
      setAverageRating(data.averageRating || 0);
      setTotalReviews(data.count || 0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  return { reviews, loading, averageRating, totalReviews, refetch: fetchReviews };
};
