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
    const bookingId = url.searchParams.get('bookingId');
    const sortBy = url.searchParams.get('sortBy') || 'recent'; // recent, highest, lowest
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = supabase
      .from('reviews')
      .select(`
        *,
        profiles:user_id (
          name,
          profile_image
        )
      `, { count: 'exact' });

    if (bookingId) {
      query = query.eq('booking_id', bookingId);
    }

    // Apply sorting
    switch (sortBy) {
      case 'highest':
        query = query.order('rating', { ascending: false }).order('created_at', { ascending: false });
        break;
      case 'lowest':
        query = query.order('rating', { ascending: true }).order('created_at', { ascending: false });
        break;
      case 'recent':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    const { data: reviews, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Calculate average rating
    const { data: avgData } = await supabase
      .from('reviews')
      .select('rating');

    let averageRating = 0;
    let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    if (avgData && avgData.length > 0) {
      const sum = avgData.reduce((acc, review) => acc + review.rating, 0);
      averageRating = sum / avgData.length;

      avgData.forEach((review) => {
        ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
      });
    }

    console.log(`Fetched ${reviews?.length} reviews`);

    return new Response(
      JSON.stringify({
        data: reviews,
        count,
        averageRating: parseFloat(averageRating.toFixed(1)),
        ratingDistribution,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
