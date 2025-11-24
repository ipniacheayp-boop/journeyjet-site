import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Check if user is admin
    const authHeader = req.headers.get('authorization');
    let isAdmin = false;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        const { data: adminCheck } = await supabase.rpc('is_admin');
        isAdmin = adminCheck || false;
      }
    }

    // Get admin setting for demo reviews
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'show_demo_reviews')
      .single();
    
    const showDemoReviews = settings?.value?.enabled || false;

    // Support both GET (query params) and POST (body) requests
    let filter = 'recent';
    let page = 1;
    let limit = 10;
    let includeDemo = false;

    if (req.method === 'GET') {
      const url = new URL(req.url);
      filter = url.searchParams.get('filter') || 'recent';
      page = parseInt(url.searchParams.get('page') || '1');
      limit = parseInt(url.searchParams.get('limit') || '10');
      includeDemo = url.searchParams.get('include_demo') === 'true';
    } else if (req.method === 'POST') {
      const body = await req.json();
      filter = body.filter || 'recent';
      page = body.page || 1;
      limit = body.limit || 10;
      includeDemo = body.include_demo || false;
    }

    const offset = (page - 1) * limit;

    // Determine if we should show demo reviews
    const shouldShowDemo = showDemoReviews || (includeDemo && isAdmin);

    let query = supabase
      .from('site_reviews')
      .select('*', { count: 'exact' })
      .eq('is_deleted', false);
    
    // Filter demo reviews unless explicitly requested
    if (!shouldShowDemo) {
      query = query.eq('demo', false);
    }

    // Apply sorting based on filter
    switch (filter) {
      case 'highest':
        query = query.order('rating', { ascending: false }).order('created_at', { ascending: false });
        break;
      case 'lowest':
        query = query.order('rating', { ascending: true }).order('created_at', { ascending: false });
        break;
      case 'top':
        query = query.order('helpful_count', { ascending: false }).order('created_at', { ascending: false });
        break;
      case 'recent':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    const { data: reviews, error, count } = await query.range(offset, offset + limit - 1);

    if (error) throw error;

    // Calculate average rating and distribution
    let allReviewsQuery = supabase
      .from('site_reviews')
      .select('rating')
      .eq('is_deleted', false);
    
    // Apply same demo filter for stats
    if (!shouldShowDemo) {
      allReviewsQuery = allReviewsQuery.eq('demo', false);
    }
    
    const { data: allReviews } = await allReviewsQuery;

    let averageRating = 0;
    let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    if (allReviews && allReviews.length > 0) {
      const sum = allReviews.reduce((acc, review) => acc + review.rating, 0);
      averageRating = sum / allReviews.length;

      allReviews.forEach((review) => {
        ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
      });
    }

    console.log(`Fetched ${reviews?.length} site reviews`);

    return new Response(
      JSON.stringify({
        data: reviews,
        count,
        averageRating: parseFloat(averageRating.toFixed(1)),
        ratingDistribution,
        totalReviews: allReviews?.length || 0,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching site reviews:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
