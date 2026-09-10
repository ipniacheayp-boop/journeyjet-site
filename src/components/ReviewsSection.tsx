import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from './StarRating';
import { ReviewCard } from './ReviewCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ReviewsSectionProps {
  bookingId?: string;
  showSubmitForm?: boolean;
}

export const ReviewsSection = ({ bookingId, showSubmitForm = false }: ReviewsSectionProps) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({});
  const [sortBy, setSortBy] = useState('recent');
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
    fetchReviews();
  }, [bookingId, sortBy]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    if (user) {
      const { data: roleData } = await supabase.rpc('is_admin');
      setIsAdmin(roleData || false);

      if (bookingId) {
        const { data: existingReview } = await supabase
          .from('reviews')
          .select('id')
          .eq('user_id', user.id)
          .eq('booking_id', bookingId)
          .single();
        
        setHasReviewed(!!existingReview);
      }
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sortBy,
        limit: '100',
      });
      
      if (bookingId) {
        params.append('bookingId', bookingId);
      }

      const { data, error } = await supabase.functions.invoke('reviews-get', {
        body: { 
          bookingId,
          sortBy,
          limit: 100,
        },
      });

      if (error) throw error;

      setReviews(data.data || []);
      setAverageRating(data.averageRating || 0);
      setTotalReviews(data.count || 0);
      setRatingDistribution(data.ratingDistribution || {});
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reviews',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to submit a review',
        variant: 'destructive',
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please select a star rating',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('reviews-create', {
        body: {
          bookingId,
          rating,
          comment: comment.trim() || null,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Review submitted successfully!',
      });

      setRating(0);
      setComment('');
      setHasReviewed(true);
      fetchReviews();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit review',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center justify-center p-6 bg-muted rounded-lg">
              <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
              <StarRating rating={Math.round(averageRating)} readonly size="lg" />
              <p className="text-sm text-muted-foreground mt-2">
                {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingDistribution[stars] || 0;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-sm w-8">{stars}★</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Form */}
      {showSubmitForm && bookingId && currentUser && !hasReviewed && (
        <Card>
          <CardHeader>
            <CardTitle>Leave a Review</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Rating</label>
                <StarRating rating={rating} onRatingChange={setRating} size="lg" />
              </div>

              <div>
                <label htmlFor="comment" className="block text-sm font-medium mb-2">
                  Your Review (Optional)
                </label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..."
                  maxLength={300}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {comment.length}/300 characters
                </p>
              </div>

              <Button type="submit" disabled={submitting || rating === 0}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit Review
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {hasReviewed && showSubmitForm && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              You have already reviewed this booking. You can edit or delete your review below.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Reviews ({totalReviews})</CardTitle>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="highest">Highest Rated</SelectItem>
                <SelectItem value="lowest">Lowest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No reviews yet. Be the first to review!
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  currentUserId={currentUser?.id}
                  isAdmin={isAdmin}
                  onUpdate={fetchReviews}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
