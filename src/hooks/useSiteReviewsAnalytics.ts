import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ReviewTrend {
  week: string;
  averageRating: number;
  reviewCount: number;
}

export interface TopReviewer {
  name: string;
  totalHelpful: number;
  reviewCount: number;
  avgRating: number;
}

export interface ReviewsAnalytics {
  totalReviews: number;
  demoReviews: number;
  realReviews: number;
  averageRating: number;
  reviewTrends: ReviewTrend[];
  ratingDistribution: Record<number, number>;
  topReviewers: TopReviewer[];
}

export const useSiteReviewsAnalytics = () => {
  const [analytics, setAnalytics] = useState<ReviewsAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('site-reviews-analytics', {
        body: {},
      });

      if (error) throw error;

      setAnalytics(data.data);
    } catch (error) {
      console.error('Error fetching reviews analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch analytics. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return { analytics, loading, refetch: fetchAnalytics };
};
