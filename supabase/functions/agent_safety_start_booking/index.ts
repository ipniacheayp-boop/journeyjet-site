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

  console.log('[agent_safety_start_booking] Request received');

  try {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      console.log('[agent_safety_start_booking] Missing Authorization header');
      return new Response(
        JSON.stringify({ error: 'UNAUTHORIZED', message: 'Missing or invalid auth token' }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    console.log('[agent_safety_start_booking] Auth header present, validating...');

    // Use Service Role Key to validate the JWT properly
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Validate the JWT and get the user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser();
    
    if (authError || !user) {
      console.log('[agent_safety_start_booking] Auth validation failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'UNAUTHORIZED', message: 'Missing or invalid auth token' }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    console.log('[agent_safety_start_booking] User authenticated:', user.id);

    // Verify agent role
    const { data: roles, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (roleError) {
      console.error('[agent_safety_start_booking] Role fetch error:', roleError);
      return new Response(
        JSON.stringify({ error: 'RETRYABLE_ERROR', message: 'Failed to verify role' }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    if (roles?.role !== 'agent') {
      console.log('[agent_safety_start_booking] User is not an agent:', roles?.role);
      return new Response(
        JSON.stringify({ error: 'UNAUTHORIZED', message: 'Agent access required' }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      );
    }

    console.log('[agent_safety_start_booking] Agent role verified');

    // Get agent profile
    const { data: agentProfile, error: profileError } = await supabaseAdmin
      .from('agent_profiles')
      .select('id, agent_code')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('[agent_safety_start_booking] Profile fetch error:', profileError);
      return new Response(
        JSON.stringify({ error: 'RETRYABLE_ERROR', message: 'Failed to fetch agent profile' }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    if (!agentProfile) {
      console.log('[agent_safety_start_booking] Agent profile not found for user:', user.id);
      return new Response(
        JSON.stringify({ error: 'RETRYABLE_ERROR', message: 'Agent profile not found' }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    console.log('[agent_safety_start_booking] Success! Agent:', agentProfile.id);

    // Return success with agent context for booking flow
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
    console.error('[agent_safety_start_booking] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'RETRYABLE_ERROR', message: 'An unexpected error occurred' }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
