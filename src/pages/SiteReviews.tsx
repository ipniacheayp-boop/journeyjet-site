import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/StarRating';
import { SiteReviewCard } from '@/components/SiteReviewCard';
import { useSiteReviews, SiteReview } from '@/hooks/useSiteReviews';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function SiteReviews() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('recent');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<SiteReview | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const { 
    reviews, 
    loading, 
    averageRating, 
    totalReviews, 
    ratingDistribution,
    createReview,
    updateReview,
    markHelpful,
  } = useSiteReviews(filter);

  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    body: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit a review',
        variant: 'destructive',
      });
      return;
    }

    if (formData.body.length < 20) {
      toast({
        title: 'Error',
        description: 'Review must be at least 20 characters long',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      if (editingReview) {
        await updateReview(editingReview.id, formData);
      } else {
        await createReview(formData);
      }
      setIsDialogOpen(false);
      setFormData({ rating: 5, title: '', body: '' });
      setEditingReview(null);
    } catch (error) {
      // Error already handled in hook
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (review: SiteReview) => {
    setEditingReview(review);
    setFormData({
      rating: review.rating,
      title: review.title || '',
      body: review.body,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      await updateReview(reviewId, { isDeleted: true });
    }
  };

  const ratingPercentages = Object.entries(ratingDistribution).map(([rating, count]) => ({
    rating: parseInt(rating),
    count,
    percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0,
  })).reverse();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-background py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Customer Reviews
              </h1>
              <p className="text-xl text-muted-foreground">
                See what travelers are saying about our service
              </p>
              
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="flex items-center gap-4">
                  <span className="text-5xl font-bold text-foreground">{averageRating.toFixed(1)}</span>
                  <div>
                    <StarRating rating={averageRating} readonly size="lg" />
                    <p className="text-sm text-muted-foreground mt-1">
                      Based on {totalReviews} reviews
                    </p>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="w-full max-w-md space-y-2">
                  {ratingPercentages.map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-8">{rating}★</span>
                      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="mt-4" disabled={!user}>
                    {user ? 'Write a Review' : 'Login to Write a Review'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingReview ? 'Edit Your Review' : 'Write a Review'}
                    </DialogTitle>
                    <DialogDescription>
                      Share your experience with our travel booking service
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label>Rating *</Label>
                      <StarRating
                        rating={formData.rating}
                        onRatingChange={(rating) => setFormData({ ...formData, rating })}
                        size="lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Title (optional)</Label>
                      <Input
                        id="title"
                        placeholder="Sum up your experience"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        maxLength={100}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="body">Review *</Label>
                      <Textarea
                        id="body"
                        placeholder="Tell us about your experience (minimum 20 characters)"
                        value={formData.body}
                        onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                        rows={6}
                        maxLength={1000}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        {formData.body.length}/1000 characters
                      </p>
                    </div>

                    <div className="flex gap-3 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setFormData({ rating: 5, title: '', body: '' });
                          setEditingReview(null);
                        }}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {editingReview ? 'Update Review' : 'Submit Review'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <Tabs value={filter} onValueChange={setFilter}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="recent">Most Recent</TabsTrigger>
                    <TabsTrigger value="top">Most Helpful</TabsTrigger>
                    <TabsTrigger value="highest">Highest Rated</TabsTrigger>
                    <TabsTrigger value="lowest">Lowest Rated</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <SiteReviewCard
                      key={review.id}
                      review={review}
                      onMarkHelpful={markHelpful}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SEO Content Columns */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {/* Top Reviews */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Top Reviews</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Excellent service</li>
                  <li>Great prices</li>
                  <li>Easy booking</li>
                  <li>Reliable support</li>
                  <li>Quick response</li>
                </ul>
              </div>

              {/* Travel by Interest */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Travel by Interest</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Beach vacations</li>
                  <li>City breaks</li>
                  <li>Adventure travel</li>
                  <li>Luxury getaways</li>
                  <li>Family trips</li>
                </ul>
              </div>

              {/* Travel by Price */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Travel by Price</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Budget deals</li>
                  <li>Mid-range options</li>
                  <li>Premium packages</li>
                  <li>Last minute offers</li>
                  <li>Early bird specials</li>
                </ul>
              </div>

              {/* US Destinations */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">US Destinations</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>New York</li>
                  <li>Los Angeles</li>
                  <li>Miami</li>
                  <li>Las Vegas</li>
                  <li>San Francisco</li>
                </ul>
              </div>

              {/* International Destinations */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">International</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Paris</li>
                  <li>London</li>
                  <li>Tokyo</li>
                  <li>Dubai</li>
                  <li>Barcelona</li>
                </ul>
              </div>

              {/* Popular Routes */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Popular Routes</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>NYC to LA</li>
                  <li>London to Paris</li>
                  <li>Dubai to Mumbai</li>
                  <li>SF to Tokyo</li>
                  <li>Miami to Cancun</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
