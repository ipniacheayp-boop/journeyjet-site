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

    if (!userId || !companyName || !contactPerson || !phone) {
      throw new Error('Missing required fields');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('[AGENT-REGISTER] Creating agent profile for user:', userId);

    // Generate unique agent code
    const agentCode = `AGT${Date.now().toString().slice(-8)}`;

    // Create agent profile
    const { data: agentProfile, error: profileError } = await supabaseClient
      .from('agent_profiles')
      .insert({
        user_id: userId,
        agent_code: agentCode,
        company_name: companyName,
        contact_person: contactPerson,
        phone: phone,
        gst_number: gstNumber,
        commission_rate: 5.0, // Default 5%
        is_verified: true,
        status: 'active'
      })
      .select()
      .single();

    if (profileError) throw profileError;

    console.log('[AGENT-REGISTER] ✓ Agent profile created:', agentProfile.id);

    // Create agent role
    const { error: roleError } = await supabaseClient
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'agent'
      });

    if (roleError) throw roleError;

    console.log('[AGENT-REGISTER] ✓ Agent role assigned');

    // Initialize wallet
    const { error: walletError } = await supabaseClient
      .from('agent_wallet')
      .insert({
        agent_id: agentProfile.id,
        balance: 0,
        currency: 'USD'
      });

    if (walletError) throw walletError;

    console.log('[AGENT-REGISTER] ✓ Wallet initialized');

    return new Response(
      JSON.stringify({ 
        success: true, 
        agentId: agentProfile.id,
        agentCode: agentCode,
        message: 'Agent registered successfully. You can now access your dashboard.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AGENT-REGISTER] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
