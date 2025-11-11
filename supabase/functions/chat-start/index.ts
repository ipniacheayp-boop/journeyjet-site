import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { subject } = await req.json();

    console.log('Starting chat for user:', user.id);

    // Check if user already has an active conversation
    const { data: existingConversation } = await supabaseClient
      .from('chat_conversations')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (existingConversation) {
      console.log('Found existing conversation:', existingConversation.id);
      return new Response(
        JSON.stringify({ conversation: existingConversation }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find an available agent
    const { data: availableAgents } = await supabaseClient
      .from('agent_availability')
      .select(`
        agent_id,
        agent_profiles!inner (
          id,
          user_id,
          status,
          is_verified
        )
      `)
      .eq('is_available', true)
      .eq('agent_profiles.status', 'active')
      .eq('agent_profiles.is_verified', true)
      .limit(1);

    console.log('Available agents:', availableAgents);

    let agentId = null;
    if (availableAgents && availableAgents.length > 0) {
      agentId = availableAgents[0].agent_id;
      console.log('Assigned agent:', agentId);
    }

    // Create new conversation
    const { data: conversation, error: conversationError } = await supabaseClient
      .from('chat_conversations')
      .insert({
        user_id: user.id,
        agent_id: agentId,
        status: 'active',
        subject: subject || 'Support Request',
      })
      .select()
      .single();

    if (conversationError) {
      console.error('Error creating conversation:', conversationError);
      throw conversationError;
    }

    console.log('Created conversation:', conversation.id);

    // Send initial welcome message
    const welcomeMessage = agentId
      ? 'Hello! An agent will be with you shortly.'
      : 'Hello! All our agents are currently busy. Your message has been queued and an agent will respond as soon as possible.';

    const { error: messageError } = await supabaseClient
      .from('chat_messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: user.id, // System message uses user_id but sender_type will be 'system'
        sender_type: 'system',
        message: welcomeMessage,
      });

    if (messageError) {
      console.error('Error creating welcome message:', messageError);
    }

    return new Response(
      JSON.stringify({ conversation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
