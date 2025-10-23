import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface SiteReview {
  id: string;
  user_id: string | null;
  display_name: string;
  title: string | null;
  body: string;
  rating: number;
  helpful_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export const useSiteReviews = (filter: string = 'recent') => {
  const [reviews, setReviews] = useState<SiteReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({});

  const fetchReviews = async (page: number = 1, limit: number = 10) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('site-reviews-get', {
        body: { 
          filter,
          page,
          limit,
        },
      });

      if (error) throw error;

      setReviews(data.data || []);
      setAverageRating(data.averageRating || 0);
      setTotalReviews(data.totalReviews || 0);
      setRatingDistribution(data.ratingDistribution || {});
    } catch (error) {
      console.error('Error fetching site reviews:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch reviews. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (reviewData: {
    rating: number;
    title?: string;
    body: string;
    displayName?: string;
    allowAnonymous?: boolean;
  }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to submit a review');
      }

      const { data, error } = await supabase.functions.invoke('site-reviews-create', {
        body: reviewData,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Review submitted — thank you!',
      });

      fetchReviews();
      return data;
    } catch (error: any) {
      console.error('Error creating site review:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit review. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateReview = async (reviewId: string, updateData: {
    rating?: number;
    title?: string;
    body?: string;
    isFeatured?: boolean;
    isDeleted?: boolean;
  }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to update a review');
      }

      const { data, error } = await supabase.functions.invoke('site-reviews-update', {
        body: { ...updateData, reviewId },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Review updated successfully',
      });

      fetchReviews();
      return data;
    } catch (error: any) {
      console.error('Error updating site review:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update review. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const markHelpful = async (reviewId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to mark reviews as helpful');
      }

      const { data, error } = await supabase.functions.invoke('site-reviews-helpful', {
        body: { reviewId },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Thank you for your feedback!',
      });

      fetchReviews();
      return data;
    } catch (error: any) {
      console.error('Error marking review as helpful:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark review as helpful.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  return { 
    reviews, 
    loading, 
    averageRating, 
    totalReviews,
    ratingDistribution,
    refetch: fetchReviews,
    createReview,
    updateReview,
    markHelpful,
  };
};
