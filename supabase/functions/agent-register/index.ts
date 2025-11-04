import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, companyName, contactPerson, phone, gstNumber } = await req.json();

    // Validate required fields
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'MISSING_FIELD', field: 'userId', message: 'User ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    if (!companyName) {
      return new Response(
        JSON.stringify({ error: 'MISSING_FIELD', field: 'companyName', message: 'Company name is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    if (!contactPerson) {
      return new Response(
        JSON.stringify({ error: 'MISSING_FIELD', field: 'contactPerson', message: 'Contact person is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    if (!phone) {
      return new Response(
        JSON.stringify({ error: 'MISSING_FIELD', field: 'phone', message: 'Phone is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('[AGENT-REGISTER] Creating/updating agent profile for user:', userId);

    // Check if agent profile already exists
    const { data: existingProfile } = await supabaseClient
      .from('agent_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    let agentProfile;
    let created = false;

    if (existingProfile) {
      // Update existing profile
      console.log('[AGENT-REGISTER] Profile exists, updating...');
      const { data: updated, error: updateError } = await supabaseClient
        .from('agent_profiles')
        .update({
          company_name: companyName,
          contact_person: contactPerson,
          phone: phone,
          gst_number: gstNumber,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('[AGENT-REGISTER] Update error:', updateError);
        return new Response(
          JSON.stringify({ error: 'DB_WRITE_FAILED', message: 'Failed to update agent profile' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      agentProfile = updated;
    } else {
      // Create new profile
      created = true;
      const agentCode = `AGT${Date.now().toString().slice(-8)}`;
      
      const { data: newProfile, error: profileError } = await supabaseClient
        .from('agent_profiles')
        .insert({
          user_id: userId,
          agent_code: agentCode,
          company_name: companyName,
          contact_person: contactPerson,
          phone: phone,
          gst_number: gstNumber,
          commission_rate: 5.0,
          is_verified: true,
          status: 'active'
        })
        .select()
        .single();

      if (profileError) {
        console.error('[AGENT-REGISTER] Insert error:', profileError);
        if (profileError.code === '23505') {
          return new Response(
            JSON.stringify({ error: 'ALREADY_EXISTS', message: 'Agent profile already exists' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 }
          );
        }
        return new Response(
          JSON.stringify({ error: 'CREATE_AGENT_FAILED', message: 'Failed to create agent profile' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      agentProfile = newProfile;
      console.log('[AGENT-REGISTER] ✓ Agent profile created:', agentProfile.id);

      // Create agent role (only if new)
      const { error: roleError } = await supabaseClient
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'agent'
        });

      if (roleError && roleError.code !== '23505') {
        console.error('[AGENT-REGISTER] Role error:', roleError);
      } else {
        console.log('[AGENT-REGISTER] ✓ Agent role assigned');
      }

      // Initialize wallet (only if new)
      const { error: walletError } = await supabaseClient
        .from('agent_wallet')
        .insert({
          agent_id: agentProfile.id,
          balance: 0,
          currency: 'USD'
        });

      if (walletError && walletError.code !== '23505') {
        console.error('[AGENT-REGISTER] Wallet error:', walletError);
      } else {
        console.log('[AGENT-REGISTER] ✓ Wallet initialized');
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        created: created,
        profile: {
          id: agentProfile.id,
          agentCode: agentProfile.agent_code,
          companyName: agentProfile.company_name,
          contactPerson: agentProfile.contact_person,
          phone: agentProfile.phone
        },
        message: created ? 'Agent registered successfully' : 'Agent profile updated'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AGENT-REGISTER] Unexpected error:', errorMessage, error);
    return new Response(
      JSON.stringify({ 
        error: 'RETRYABLE_ERROR',
        message: 'An unexpected error occurred. Please try again.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
