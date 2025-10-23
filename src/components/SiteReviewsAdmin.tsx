import { useState, useEffect } from 'react';
import { useSiteReviews } from '@/hooks/useSiteReviews';
import { SiteReviewCard } from './SiteReviewCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Search, Loader2, TrendingUp, Star, MessageSquare } from 'lucide-react';

export const SiteReviewsAdmin = () => {
  const [filter, setFilter] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    reviews, 
    loading, 
    averageRating, 
    totalReviews,
    ratingDistribution,
    updateReview,
    markHelpful,
  } = useSiteReviews(filter);

  const [filteredReviews, setFilteredReviews] = useState(reviews);

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredReviews(
        reviews.filter(review => 
          review.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.title?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredReviews(reviews);
    }
  }, [searchQuery, reviews]);

  const handleToggleFeatured = async (reviewId: string, currentStatus: boolean) => {
    await updateReview(reviewId, { isFeatured: !currentStatus });
  };

  const handleDelete = async (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      await updateReview(reviewId, { isDeleted: true });
    }
  };

  const calculateReviewsPerDay = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentReviews = reviews.filter(r => new Date(r.created_at) > thirtyDaysAgo);
    return (recentReviews.length / 30).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)} / 5.0</div>
            <p className="text-xs text-muted-foreground">
              Based on {totalReviews} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews per Day</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateReviewsPerDay()}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = ratingDistribution[rating] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-8">{rating}★</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
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
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Reviews</CardTitle>
          <CardDescription>Moderate, feature, or delete reviews</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews by name or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="top">Top</TabsTrigger>
                <TabsTrigger value="highest">Highest</TabsTrigger>
                <TabsTrigger value="lowest">Lowest</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? 'No reviews match your search' : 'No reviews yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div key={review.id} className="relative">
                  {review.is_featured && (
                    <Badge className="absolute -top-2 -right-2 z-10" variant="default">
                      Featured
                    </Badge>
                  )}
                  <SiteReviewCard
                    review={review}
                    onMarkHelpful={markHelpful}
                    onEdit={() => {}}
                    onDelete={handleDelete}
                    isAdmin={true}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant={review.is_featured ? "default" : "outline"}
                      onClick={() => handleToggleFeatured(review.id, review.is_featured)}
                    >
                      {review.is_featured ? 'Unfeature' : 'Feature'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(review.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
