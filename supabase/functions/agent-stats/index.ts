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

    // Get total bookings count
    const { count: totalBookings } = await supabaseClient
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', agentProfile.id);

    // Get confirmed bookings for revenue calculation
    const { data: confirmedBookings } = await supabaseClient
      .from('bookings')
      .select('amount, currency, booking_details')
      .eq('agent_id', agentProfile.id)
      .eq('status', 'confirmed');

    const totalRevenue = confirmedBookings?.reduce((sum, b) => sum + Number(b.amount), 0) || 0;

    // Get unique users count
    const { data: uniqueUsers } = await supabaseClient
      .from('bookings')
      .select('user_id')
      .eq('agent_id', agentProfile.id)
      .not('user_id', 'is', null);

    const activeUsers = new Set(uniqueUsers?.map(u => u.user_id)).size;

    // Get top destinations from booking details
    const destinationMap: { [key: string]: number } = {};
    confirmedBookings?.forEach(booking => {
      try {
        const details = booking.booking_details;
        let destination = 'Unknown';
        
        if (details?.destination) {
          destination = details.destination;
        } else if (details?.itineraries?.[0]?.segments) {
          const lastSegment = details.itineraries[0].segments.slice(-1)[0];
          destination = lastSegment?.arrival?.iataCode || 'Unknown';
        } else if (details?.hotel?.address?.cityName) {
          destination = details.hotel.address.cityName;
        }
        
        destinationMap[destination] = (destinationMap[destination] || 0) + 1;
      } catch (e) {
        console.error('Error parsing destination:', e);
      }
    });

    const topDestinations = Object.entries(destinationMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Get monthly bookings for chart
    const { data: monthlyData } = await supabaseClient
      .from('bookings')
      .select('created_at, amount')
      .eq('agent_id', agentProfile.id)
      .gte('created_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString());

    const monthlyBookings: { [key: string]: { count: number; revenue: number } } = {};
    monthlyData?.forEach(booking => {
      const month = new Date(booking.created_at).toISOString().slice(0, 7);
      if (!monthlyBookings[month]) {
        monthlyBookings[month] = { count: 0, revenue: 0 };
      }
      monthlyBookings[month].count++;
      monthlyBookings[month].revenue += Number(booking.amount);
    });

    const monthlyChart = Object.entries(monthlyBookings)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        bookings: data.count,
        revenue: data.revenue,
      }));

    // Get bookings by type
    const { data: typeData } = await supabaseClient
      .from('bookings')
      .select('booking_type, amount')
      .eq('agent_id', agentProfile.id)
      .eq('status', 'confirmed');

    const revenueByType: { [key: string]: number } = {};
    typeData?.forEach(booking => {
      const type = booking.booking_type || 'other';
      revenueByType[type] = (revenueByType[type] || 0) + Number(booking.amount);
    });

    return new Response(
      JSON.stringify({
        totalBookings: totalBookings || 0,
        totalRevenue,
        activeUsers,
        topDestinations,
        monthlyChart,
        revenueByType,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in agent-stats:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
