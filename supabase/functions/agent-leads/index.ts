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

    // Get abandoned bookings (pending_payment status and older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: leads, error: leadsError } = await supabaseClient
      .from('bookings')
      .select('id, contact_name, contact_email, contact_phone, booking_type, amount, created_at, booking_details')
      .eq('agent_id', agentProfile.id)
      .eq('status', 'pending_payment')
      .lt('created_at', oneHourAgo)
      .order('created_at', { ascending: false });

    if (leadsError) {
      throw leadsError;
    }

    const formattedLeads = leads?.map(lead => {
      let destination = 'Unknown';
      try {
        const details = lead.booking_details;
        if (details?.destination) {
          destination = details.destination;
        } else if (details?.itineraries?.[0]?.segments) {
          const lastSegment = details.itineraries[0].segments.slice(-1)[0];
          destination = lastSegment?.arrival?.iataCode || 'Unknown';
        } else if (details?.hotel?.address?.cityName) {
          destination = details.hotel.address.cityName;
        }
      } catch (e) {
        console.error('Error parsing destination:', e);
      }

      return {
        id: lead.id,
        name: lead.contact_name || 'Unknown',
        email: lead.contact_email || 'N/A',
        phone: lead.contact_phone || 'N/A',
        bookingType: lead.booking_type,
        amount: lead.amount,
        destination,
        lastActivity: lead.created_at,
      };
    }) || [];

    return new Response(
      JSON.stringify({ leads: formattedLeads }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in agent-leads:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
