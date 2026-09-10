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
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const reviewId = url.pathname.split('/').slice(-2)[0];

    // Try to insert helpful vote (will fail if already exists due to unique constraint)
    const { error: insertError } = await supabase
      .from('site_review_helpful')
      .insert({
        review_id: reviewId,
        user_id: user.id,
      });

    if (insertError) {
      if (insertError.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'You have already marked this review as helpful' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw insertError;
    }

    // Increment helpful_count on the review
    const { data: review, error: updateError } = await supabase
      .from('site_reviews')
      .update({ helpful_count: supabase.rpc('increment', { x: 1 }) })
      .eq('id', reviewId)
      .select('helpful_count')
      .single();

    if (updateError) throw updateError;

    console.log('Helpful vote added to site review:', reviewId);

    return new Response(
      JSON.stringify({ data: { helpful_count: review.helpful_count } }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error adding helpful vote:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
