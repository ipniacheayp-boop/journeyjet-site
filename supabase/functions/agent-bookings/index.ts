import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    
    // Check if Authorization header exists
    if (!authHeader) {
      console.error('[agent-bookings] No Authorization header provided');
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    console.log('[agent-bookings] Auth header present, creating client...');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError) {
      console.error('[agent-bookings] Auth error:', authError.message);
      return new Response(JSON.stringify({ error: 'Unauthorized', details: authError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    if (!user) {
      console.error('[agent-bookings] No user found');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    console.log('[agent-bookings] User authenticated:', user.id);

    // Get agent profile
    const { data: agentProfile, error: profileError } = await supabaseClient
      .from('agent_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !agentProfile) {
      console.error('[agent-bookings] Agent profile not found:', profileError?.message);
      return new Response(JSON.stringify({ error: 'Agent profile not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    console.log('[agent-bookings] Agent profile found:', agentProfile.id);

    // Fetch bookings with commission data
    const { data: bookings, error: bookingsError } = await supabaseClient
      .from('bookings')
      .select(`
        id,
        booking_type,
        amount,
        currency,
        status,
        created_at,
        contact_name,
        contact_email,
        contact_phone,
        agent_commissions (
          commission_amount
        )
      `)
      .eq('agent_id', agentProfile.id)
      .order('created_at', { ascending: false });

    if (bookingsError) {
      console.error('[agent-bookings] Error fetching bookings:', bookingsError.message);
      throw bookingsError;
    }

    console.log('[agent-bookings] Found', bookings?.length || 0, 'bookings');

    const formattedBookings = bookings?.map(booking => ({
      booking_reference: booking.id.slice(0, 8),
      booking_type: booking.booking_type,
      amount: booking.amount,
      currency: booking.currency,
      status: booking.status,
      created_at: booking.created_at,
      user: {
        name: booking.contact_name,
        email: booking.contact_email,
        contact: booking.contact_phone,
      },
      commission: booking.agent_commissions?.[0]?.commission_amount || 0,
    })) || [];

    return new Response(
      JSON.stringify({ bookings: formattedBookings }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[agent-bookings] Unexpected error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
