import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate authorization header exists
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('[admin-booking-update] No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate JWT token and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      console.log('[admin-booking-update] Invalid token or user not found:', userError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[admin-booking-update] User authenticated:', user.id);

    // Verify admin role using the is_admin RPC function with user context
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    );

    const { data: isAdmin, error: roleError } = await userClient.rpc('is_admin');

    if (roleError) {
      console.error('[admin-booking-update] Error checking admin role:', roleError.message);
      return new Response(
        JSON.stringify({ error: 'Failed to verify permissions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isAdmin) {
      console.log('[admin-booking-update] User is not an admin:', user.id);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[admin-booking-update] Admin access verified for user:', user.id);

    // Parse request body
    const body = await req.json();
    const { booking_id, status, payment_status, payment_method, notes } = body;

    if (!booking_id) {
      return new Response(
        JSON.stringify({ error: 'booking_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[admin-booking-update] Updating booking:', { booking_id, status, payment_status, payment_method });

    // Build update object with only provided fields
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (status !== undefined) {
      updateData.status = status;
      // If confirming, set confirmed_at
      if (status === 'confirmed' || status === 'confirmed_without_payment') {
        updateData.confirmed_at = new Date().toISOString();
      }
    }

    if (payment_status !== undefined) {
      updateData.payment_status = payment_status;
    }

    if (payment_method !== undefined) {
      updateData.payment_method = payment_method;
    }

    // Notes can be stored in booking_details JSON if needed
    if (notes !== undefined) {
      // First get current booking_details
      const { data: currentBooking, error: fetchError } = await supabaseClient
        .from('bookings')
        .select('booking_details')
        .eq('id', booking_id)
        .single();

      if (!fetchError && currentBooking) {
        const currentDetails = currentBooking.booking_details || {};
        updateData.booking_details = {
          ...currentDetails,
          admin_notes: notes
        };
      }
    }

    // Update the booking using service role client
    const { data: updatedBooking, error: updateError } = await supabaseClient
      .from('bookings')
      .update(updateData)
      .eq('id', booking_id)
      .select()
      .single();

    if (updateError) {
      console.error('[admin-booking-update] Update error:', updateError);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[admin-booking-update] Successfully updated booking:', booking_id);

    return new Response(
      JSON.stringify({ success: true, booking: updatedBooking }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[admin-booking-update] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
