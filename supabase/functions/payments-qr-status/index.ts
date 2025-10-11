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
    const { transactionId } = await req.json();

    if (!transactionId) {
      throw new Error("Transaction ID is required");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Find booking by transaction ID
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .select("*")
      .eq("transaction_id", transactionId)
      .single();

    if (bookingError || !booking) {
      return new Response(
        JSON.stringify({ status: "pending", message: "Payment not yet received" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If already confirmed, return success
    if (booking.payment_status === "succeeded") {
      return new Response(
        JSON.stringify({ 
          status: "succeeded", 
          bookingId: booking.id,
          message: "Payment confirmed" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Simulate payment confirmation after 20 seconds (demo mode)
    const createdAt = new Date(booking.created_at).getTime();
    const now = Date.now();
    const elapsedSeconds = (now - createdAt) / 1000;

    // Auto-confirm after 20 seconds for demo
    if (elapsedSeconds > 20 && booking.payment_status === "pending") {
      // Simulate 95% success rate
      const paymentSucceeds = Math.random() > 0.05;
      
      if (paymentSucceeds) {
        await supabaseClient
          .from("bookings")
          .update({
            status: "confirmed",
            payment_status: "succeeded",
            confirmed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", booking.id);

        console.log(`QR payment auto-confirmed for booking ${booking.id}`);

        return new Response(
          JSON.stringify({ 
            status: "succeeded", 
            bookingId: booking.id,
            message: "Payment confirmed successfully" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        await supabaseClient
          .from("bookings")
          .update({
            payment_status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", booking.id);

        console.log(`QR payment failed for booking ${booking.id}`);

        return new Response(
          JSON.stringify({ 
            status: "failed", 
            bookingId: booking.id,
            message: "Payment failed. Please try again." 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        status: "pending", 
        message: "Waiting for payment confirmation",
        elapsedSeconds 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("QR status check error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});