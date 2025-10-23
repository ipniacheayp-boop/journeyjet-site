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

    const { rating, title, body, displayName, allowAnonymous } = await req.json();

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return new Response(
        JSON.stringify({ error: 'Rating must be between 1 and 5' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!body || body.length < 20 || body.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Review body must be between 20 and 1000 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for recent reviews from same user (24 hour limit)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentReview } = await supabase
      .from('site_reviews')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', twentyFourHoursAgo)
      .eq('is_deleted', false)
      .single();

    if (recentReview) {
      return new Response(
        JSON.stringify({ error: 'You can only submit one review per 24 hours' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile for display name
    let finalDisplayName = displayName;
    if (!allowAnonymous && !displayName) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();
      
      finalDisplayName = profile?.name?.split(' ')[0] || 'Anonymous';
    }

    // Insert review
    const { data: review, error: insertError } = await supabase
      .from('site_reviews')
      .insert({
        user_id: allowAnonymous ? null : user.id,
        display_name: finalDisplayName || 'Anonymous',
        title: title || null,
        body,
        rating,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log('Site review created:', review);

    return new Response(
      JSON.stringify({ data: review }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating site review:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
