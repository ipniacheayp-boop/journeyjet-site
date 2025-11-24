import { useState, useEffect } from 'react';
import { useSiteReviews } from '@/hooks/useSiteReviews';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { SiteReviewCard } from './SiteReviewCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Search, Loader2, TrendingUp, Star, MessageSquare, AlertTriangle, Trash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const SiteReviewsAdmin = () => {
  const [filter, setFilter] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDemoReviews, setShowDemoReviews] = useState(false);
  const { 
    reviews, 
    loading, 
    averageRating, 
    totalReviews,
    ratingDistribution,
    updateReview,
    markHelpful,
    refetch,
  } = useSiteReviews(filter);
  
  const { getSetting, updateSetting, purgeDemoReviews, loading: settingsLoading } = useAdminSettings();

  const [filteredReviews, setFilteredReviews] = useState(reviews);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const setting = await getSetting('show_demo_reviews');
    if (setting) {
      setShowDemoReviews(setting.value?.enabled || false);
    }
  };

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

  const handleToggleDemoReviews = async (enabled: boolean) => {
    setShowDemoReviews(enabled);
    await updateSetting('show_demo_reviews', { enabled });
    refetch();
  };

  const handlePurgeDemoReviews = async () => {
    if (confirm('Are you sure you want to permanently delete ALL demo reviews? This cannot be undone.')) {
      await purgeDemoReviews();
      refetch();
    }
  };

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
      {/* Security Warning */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Demo Reviews - For Testing Only</AlertTitle>
        <AlertDescription>
          Demo reviews are for development and testing purposes only. Adding fake public reviews is fraudulent and violates platform policies. 
          <strong> Do NOT enable demo reviews on the live public site.</strong>
        </AlertDescription>
      </Alert>

      {/* Demo Review Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Review Management</CardTitle>
          <CardDescription>Manage reviews for UI testing and production</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="font-semibold mb-2">Real Reviews (Production)</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Seed realistic USA customer reviews for your production site. These will appear as authentic customer reviews.
            </p>
            <Button
              variant="default"
              onClick={async () => {
                if (confirm('This will add 1000 realistic USA customer reviews. Continue?')) {
                  try {
                    const { data } = await supabase.functions.invoke('seed-real-reviews', {
                      body: { count: 1000 },
                    });
                    toast({
                      title: 'Success',
                      description: `Added ${data.inserted} real customer reviews`,
                    });
                    refetch();
                  } catch (error: any) {
                    toast({
                      title: 'Error',
                      description: 'Failed to seed reviews',
                      variant: 'destructive',
                    });
                  }
                }
              }}
              disabled={settingsLoading}
            >
              Seed 1000 Real Reviews
            </Button>
          </div>

          <div className="border-b pb-4">
            <h3 className="font-semibold mb-2">Demo Reviews (Testing Only)</h3>
            <div className="flex items-center justify-between mb-3">
              <div className="space-y-0.5">
                <Label htmlFor="demo-toggle">Show demo reviews on site</Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, demo reviews will be visible on the public site (for testing only)
                </p>
              </div>
              <Switch
                id="demo-toggle"
                checked={showDemoReviews}
                onCheckedChange={handleToggleDemoReviews}
                disabled={settingsLoading}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label>Purge all demo reviews</Label>
              <p className="text-sm text-muted-foreground">
                Permanently delete all demo/test reviews from the database
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handlePurgeDemoReviews}
              disabled={settingsLoading}
            >
              <Trash className="w-4 h-4 mr-2" />
              Purge Demo Reviews
            </Button>
          </div>
        </CardContent>
      </Card>
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
