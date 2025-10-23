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

    const url = new URL(req.url);
    const filter = url.searchParams.get('filter') || 'recent';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('site_reviews')
      .select('*', { count: 'exact' })
      .eq('is_deleted', false);

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
    const { data: allReviews } = await supabase
      .from('site_reviews')
      .select('rating')
      .eq('is_deleted', false);

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
