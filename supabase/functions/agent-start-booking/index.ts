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
      
      console.log('[agent-start-booking] Auth header present:', !!authHeader);
      
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Unauthorized', details: 'No authorization header' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        });
      }

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
      
      console.log('[agent-start-booking] Auth check:', { hasUser: !!user, authError });
      
      if (authError || !user) {
        console.error('[agent-start-booking] Auth failed:', authError);
        return new Response(JSON.stringify({ error: 'Unauthorized', details: authError?.message || 'Auth session missing!' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        });
      }

    // Verify agent role
    const { data: roles, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    console.log('[agent-start-booking] Role check:', { roles, roleError });

    if (roleError) {
      console.error('[agent-start-booking] Role fetch error:', roleError);
      return new Response(JSON.stringify({ error: 'Failed to verify role' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (roles?.role !== 'agent') {
      return new Response(JSON.stringify({ error: 'Not authorized as agent' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    // Get agent profile
    const { data: agentProfile, error: profileError } = await supabaseClient
      .from('agent_profiles')
      .select('id, agent_code')
      .eq('user_id', user.id)
      .maybeSingle();

    console.log('[agent-start-booking] Profile check:', { agentProfile, profileError });

    if (profileError) {
      console.error('[agent-start-booking] Profile fetch error:', profileError);
      return new Response(JSON.stringify({ error: 'Failed to fetch agent profile' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!agentProfile) {
      return new Response(JSON.stringify({ error: 'Agent profile not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    // Return session data for agent-scoped booking
    return new Response(
      JSON.stringify({ 
        success: true,
        agentId: agentProfile.id,
        agentCode: agentProfile.agent_code,
        redirectUrl: '/search-results',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in agent-start-booking:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
