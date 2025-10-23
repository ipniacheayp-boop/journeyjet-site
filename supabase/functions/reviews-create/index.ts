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

    const { bookingId, rating, comment } = await req.json();

    // Validate input
    if (!bookingId || !rating || rating < 1 || rating > 5) {
      return new Response(
        JSON.stringify({ error: 'Invalid input. Rating must be between 1 and 5.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify booking exists and belongs to user
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, user_id, status')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return new Response(
        JSON.stringify({ error: 'Booking not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (booking.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'You can only review your own bookings' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if booking is confirmed
    if (booking.status !== 'confirmed') {
      return new Response(
        JSON.stringify({ error: 'You can only review confirmed bookings' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert review
    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        booking_id: bookingId,
        rating,
        comment: comment || null,
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') { // Unique constraint violation
        return new Response(
          JSON.stringify({ error: 'You have already reviewed this booking' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw insertError;
    }

    console.log('Review created:', review);

    return new Response(
      JSON.stringify({ data: review }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating review:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
