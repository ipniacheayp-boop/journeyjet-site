import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId, upiId, amount, currency = 'INR' } = await req.json();

    if (!bookingId || !upiId || !amount) {
      throw new Error("Missing required fields");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Ensure booking exists
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('id, amount, currency')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error('Booking not found');
    }

    const transactionId = `UPI${Date.now()}${Math.random().toString(36).slice(2, 8)}`;

    await supabaseClient
      .from('bookings')
      .update({
        payment_method: 'upi',
        payment_status: 'pending',
        transaction_id: transactionId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    return new Response(
      JSON.stringify({ transactionId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error('UPI initiate error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});