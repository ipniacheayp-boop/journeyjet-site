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
    const { bookingId, upiId, amount, currency } = await req.json();

    if (!bookingId || !upiId || !amount) {
      throw new Error("Missing required fields");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify booking exists and is pending
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    if (booking.status !== "pending_payment") {
      throw new Error("Booking is not in pending payment status");
    }

    // Simulate UPI payment processing (in production, integrate with UPI gateway)
    const transactionId = `UPI${Date.now()}${Math.random().toString(36).substring(7)}`;
    
    // Simulate random success/failure (90% success rate for demo)
    const paymentSuccess = Math.random() > 0.1;

    if (!paymentSuccess) {
      // Update booking with failed status
      await supabaseClient
        .from("bookings")
        .update({
          payment_status: "failed",
          payment_method: "upi",
          transaction_id: transactionId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId);

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Payment failed. Please try again." 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // Update booking to confirmed
    const { error: updateError } = await supabaseClient
      .from("bookings")
      .update({
        status: "confirmed",
        payment_status: "succeeded",
        payment_method: "upi",
        transaction_id: transactionId,
        payment_reference: upiId,
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (updateError) {
      throw updateError;
    }

    console.log(`UPI payment confirmed for booking ${bookingId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        transactionId,
        message: "Payment successful" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error: any) {
    console.error("UPI payment error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});