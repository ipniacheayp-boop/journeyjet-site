import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Confirms a booking ONLY after verifying with Stripe that the payment really
// succeeded. Previously this endpoint trusted the client blindly, which allowed
// anyone to confirm any booking for free by POSTing a bookingId.
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId, transactionId, paymentMethod } = await req.json();

    if (!bookingId || typeof bookingId !== "string" || bookingId.length > 64) {
      throw new Error("Missing required fields");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: booking } = await supabaseClient
      .from("bookings")
      .select("id, status, payment_status, amount, stripe_payment_intent_id")
      .eq("id", bookingId)
      .maybeSingle();

    if (!booking) throw new Error("Booking not found");

    if (booking.status === "confirmed" && booking.payment_status === "succeeded") {
      return new Response(JSON.stringify({ success: true, bookingId, alreadyConfirmed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
      });
    }

    // Verification: the payment must be proven by Stripe, not asserted by the client.
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });

    let verified = false;
    if (booking.stripe_payment_intent_id) {
      const pi = await stripe.paymentIntents.retrieve(booking.stripe_payment_intent_id);
      verified = pi.status === "succeeded" && Math.abs(pi.amount_received / 100 - Number(booking.amount)) <= 0.01;
    } else if (transactionId && transactionId.startsWith("pi_")) {
      const pi = await stripe.paymentIntents.retrieve(transactionId);
      const metaBooking = (pi.metadata as any)?.bookingId;
      verified = pi.status === "succeeded"
        && (!metaBooking || metaBooking === bookingId)
        && Math.abs(pi.amount_received / 100 - Number(booking.amount)) <= 0.01;
    }

    if (!verified) {
      return new Response(JSON.stringify({ error: "Payment could not be verified. Confirmation happens automatically once the payment clears." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 402,
      });
    }

    const { error: updateError } = await supabaseClient
      .from("bookings")
      .update({
        status: "confirmed",
        payment_status: "succeeded",
        transaction_id: transactionId ?? booking.stripe_payment_intent_id,
        payment_method: paymentMethod || "card",
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .eq("status", "pending_payment");

    if (updateError) throw updateError;

    console.log(`Booking ${bookingId} confirmed after Stripe verification`);

    return new Response(
      JSON.stringify({ success: true, bookingId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("Payment confirmation error:", error);
    return new Response(
      JSON.stringify({ error: "Unable to confirm payment." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
