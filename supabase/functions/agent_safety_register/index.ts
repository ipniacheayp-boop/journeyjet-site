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

    // Only userId is required; other fields are optional
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'MISSING_FIELD', field: 'userId', message: 'User ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('[AGENT-SAFETY-REGISTER] Upsert agent profile for user:', userId);

    // Check existing profile
    const { data: existingProfile, error: existingErr } = await supabaseClient
      .from('agent_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingErr) {
      console.error('[AGENT-SAFETY-REGISTER] Read error:', existingErr);
      return new Response(
        JSON.stringify({ error: 'RETRYABLE_ERROR', message: 'Temporary read error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    let profile: any;
    let created = false;

    if (existingProfile) {
      // Update only provided fields
      const updateFields: Record<string, any> = { updated_at: new Date().toISOString() };
      if (companyName !== undefined) updateFields.company_name = companyName;
      if (contactPerson !== undefined) updateFields.contact_person = contactPerson;
      if (phone !== undefined) updateFields.phone = phone;
      if (gstNumber !== undefined) updateFields.gst_number = gstNumber;

      console.log('[AGENT-SAFETY-REGISTER] Profile exists, updating partial fields');
      const { data: updated, error: updateErr } = await supabaseClient
        .from('agent_profiles')
        .update(updateFields)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateErr) {
        console.error('[AGENT-SAFETY-REGISTER] Update error:', updateErr);
        return new Response(
          JSON.stringify({ error: 'DB_WRITE_FAILED', message: 'Failed to update agent profile' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      profile = updated;
    } else {
      // Create new profile with minimal required fields; avoid setting status to satisfy CHECK
      created = true;
      const agentCode = `AGT${Date.now().toString().slice(-8)}`;
      const insertFields: Record<string, any> = {
        user_id: userId,
        agent_code: agentCode,
      };
      if (companyName !== undefined) insertFields.company_name = companyName;
      if (contactPerson !== undefined) insertFields.contact_person = contactPerson;
      if (phone !== undefined) insertFields.phone = phone;
      if (gstNumber !== undefined) insertFields.gst_number = gstNumber;

      const { data: inserted, error: insertErr } = await supabaseClient
        .from('agent_profiles')
        .insert(insertFields)
        .select()
        .single();

      if (insertErr) {
        console.error('[AGENT-SAFETY-REGISTER] Insert error:', insertErr);
        if ((insertErr as any).code === '23505') {
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

      profile = inserted;
      console.log('[AGENT-SAFETY-REGISTER] ✓ Agent profile created:', profile.id);
    }

    // Ensure role
    const { error: roleErr } = await supabaseClient
      .from('user_roles')
      .insert({ user_id: userId, role: 'agent' })
      .select();

    if (roleErr && (roleErr as any).code !== '23505') {
      console.warn('[AGENT-SAFETY-REGISTER] Role ensure warning:', roleErr);
    } else {
      console.log('[AGENT-SAFETY-REGISTER] ✓ Agent role ensured');
    }

    // Ensure wallet
    const { data: existingWallet } = await supabaseClient
      .from('agent_wallet')
      .select('id')
      .eq('agent_id', profile.id)
      .maybeSingle();

    if (!existingWallet) {
      const { error: walletErr } = await supabaseClient
        .from('agent_wallet')
        .insert({ agent_id: profile.id, balance: 0, currency: 'USD' });
      if (walletErr && (walletErr as any).code !== '23505') {
        console.warn('[AGENT-SAFETY-REGISTER] Wallet ensure warning:', walletErr);
      } else {
        console.log('[AGENT-SAFETY-REGISTER] ✓ Wallet ensured');
      }
    }

    // Response
    return new Response(
      JSON.stringify({
        success: true,
        created,
        profile: {
          id: profile.id,
          agentCode: profile.agent_code,
          companyName: profile.company_name,
          contactPerson: profile.contact_person,
          phone: profile.phone,
        },
        message: created ? 'Agent registered successfully' : 'Agent profile updated'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AGENT-SAFETY-REGISTER] Unexpected error:', message);
    return new Response(
      JSON.stringify({ error: 'RETRYABLE_ERROR', message: 'An unexpected error occurred. Please try again.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});