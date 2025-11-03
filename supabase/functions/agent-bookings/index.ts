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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Get agent profile
    const { data: agentProfile, error: profileError } = await supabaseClient
      .from('agent_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !agentProfile) {
      return new Response(JSON.stringify({ error: 'Agent profile not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

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
      throw bookingsError;
    }

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
    console.error('Error in agent-bookings:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
