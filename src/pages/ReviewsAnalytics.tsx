import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useSiteReviewsAnalytics } from '@/hooks/useSiteReviewsAnalytics';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Star, TrendingUp, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const ReviewsAnalytics = () => {
  const { analytics, loading } = useSiteReviewsAnalytics();

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!analytics) return null;

  const ratingDistributionData = Object.entries(analytics.ratingDistribution).map(([rating, count]) => ({
    rating: `${rating} ⭐`,
    count,
  }));

  const chartConfig = {
    averageRating: {
      label: 'Avg Rating',
      color: 'hsl(var(--primary))',
    },
    reviewCount: {
      label: 'Reviews',
      color: 'hsl(var(--secondary))',
    },
    count: {
      label: 'Count',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <div className="container mx-auto p-6 space-y-6 ">
      <div>
        <h1 className="text-4xl font-bold">Reviews Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Insights and trends from customer reviews
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.realReviews} real, {analytics.demoReviews} demo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageRating.toFixed(2)} ⭐</div>
            <p className="text-xs text-muted-foreground">
              Across all reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Reviewers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.topReviewers.length}</div>
            <p className="text-xs text-muted-foreground">
              Most helpful contributors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Review Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Review Trends (Last 90 Days)</CardTitle>
          <CardDescription>
            Weekly average ratings and review volume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.reviewTrends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="week" 
                  className="text-xs"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis yAxisId="left" className="text-xs" />
                <YAxis yAxisId="right" orientation="right" className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="averageRating"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Avg Rating"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="reviewCount"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Review Count"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
          <CardDescription>
            Breakdown of reviews by star rating
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingDistributionData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="rating" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Top Reviewers */}
      <Card>
        <CardHeader>
          <CardTitle>Most Helpful Reviewers</CardTitle>
          <CardDescription>
            Top 10 reviewers by helpful votes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topReviewers.map((reviewer, index) => (
              <div key={reviewer.name} className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{reviewer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {reviewer.reviewCount} reviews · {reviewer.avgRating.toFixed(1)} ⭐ avg
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{reviewer.totalHelpful}</p>
                  <p className="text-xs text-muted-foreground">helpful votes</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsAnalytics;
