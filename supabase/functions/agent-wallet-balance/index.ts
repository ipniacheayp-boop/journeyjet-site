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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get agent profile
    const { data: agentProfile } = await supabaseClient
      .from('agent_profiles')
      .select('id, agent_code, commission_rate')
      .eq('user_id', user.id)
      .single();

    if (!agentProfile) {
      throw new Error('User is not an agent');
    }

    // Get wallet balance
    const { data: wallet } = await supabaseClient
      .from('agent_wallet')
      .select('*')
      .eq('agent_id', agentProfile.id)
      .single();

    // Get recent transactions
    const { data: transactions } = await supabaseClient
      .from('wallet_transactions')
      .select('*')
      .eq('agent_id', agentProfile.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get pending commissions
    const { data: commissions } = await supabaseClient
      .from('agent_commissions')
      .select('*, bookings(booking_type, created_at)')
      .eq('agent_id', agentProfile.id)
      .order('created_at', { ascending: false })
      .limit(20);

    return new Response(
      JSON.stringify({
        agent: agentProfile,
        wallet: wallet || { balance: 0, currency: 'USD' },
        transactions: transactions || [],
        commissions: commissions || [],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[WALLET-BALANCE] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});