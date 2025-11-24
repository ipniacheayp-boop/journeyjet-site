import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: isAdmin } = await supabase.rpc('is_admin');
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch all non-deleted reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('site_reviews')
      .select('rating, helpful_count, created_at, display_name, demo')
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (reviewsError) throw reviewsError;

    // Calculate rating distribution over time (last 90 days, weekly buckets)
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    
    const weeklyData: Record<string, { week: string; ratings: number[]; count: number }> = {};
    
    reviews?.forEach(review => {
      const reviewDate = new Date(review.created_at);
      if (reviewDate < ninetyDaysAgo) return;
      
      // Get week start (Sunday)
      const weekStart = new Date(reviewDate);
      weekStart.setDate(reviewDate.getDate() - reviewDate.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { week: weekKey, ratings: [], count: 0 };
      }
      
      weeklyData[weekKey].ratings.push(review.rating);
      weeklyData[weekKey].count++;
    });

    // Convert to array and calculate averages
    const reviewTrends = Object.values(weeklyData).map(data => ({
      week: data.week,
      averageRating: data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length,
      reviewCount: data.count,
    })).sort((a, b) => a.week.localeCompare(b.week));

    // Calculate overall rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews?.forEach(review => {
      const roundedRating = Math.round(review.rating);
      ratingDistribution[roundedRating as keyof typeof ratingDistribution]++;
    });

    // Get top 10 most helpful reviewers
    const reviewerStats: Record<string, { name: string; totalHelpful: number; reviewCount: number; avgRating: number }> = {};
    
    reviews?.forEach(review => {
      const name = review.display_name;
      if (!reviewerStats[name]) {
        reviewerStats[name] = { name, totalHelpful: 0, reviewCount: 0, avgRating: 0 };
      }
      reviewerStats[name].totalHelpful += review.helpful_count;
      reviewerStats[name].reviewCount++;
      reviewerStats[name].avgRating += review.rating;
    });

    const topReviewers = Object.values(reviewerStats)
      .map(stats => ({
        ...stats,
        avgRating: stats.avgRating / stats.reviewCount,
      }))
      .sort((a, b) => b.totalHelpful - a.totalHelpful)
      .slice(0, 10);

    // Overall stats
    const totalReviews = reviews?.length || 0;
    const demoReviews = reviews?.filter(r => r.demo).length || 0;
    const realReviews = totalReviews - demoReviews;
    const averageRating = reviews?.length 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          totalReviews,
          demoReviews,
          realReviews,
          averageRating,
          reviewTrends,
          ratingDistribution,
          topReviewers,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in site-reviews-analytics:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
