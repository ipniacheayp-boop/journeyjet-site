import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Issues a REAL refund through Stripe and records it. Admin-only. The previous
// version marked bookings refunded without touching Stripe, so no money moved.
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId, amount, reason } = await req.json();

    if (!bookingId || typeof bookingId !== "string") {
      throw new Error("Booking ID required");
    }
    if (reason !== undefined && (typeof reason !== "string" || reason.length > 500)) {
      throw new Error("Invalid reason");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Admin-only: refunds move real money and must never be user-callable.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    if (!user) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await supabaseClient.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: booking } = await supabaseClient
      .from("bookings")
      .select("id, status, amount, currency, payment_status, refund_status, stripe_payment_intent_id, booking_details")
      .eq("id", bookingId)
      .maybeSingle();

    if (!booking) throw new Error("Booking not found");

    if (booking.refund_status === "processed" || booking.refund_status === "completed") {
      return new Response(JSON.stringify({ error: "This booking has already been refunded." }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const refundAmount = amount !== undefined ? Number(amount) : Number(booking.amount);
    if (!Number.isFinite(refundAmount) || refundAmount <= 0 || refundAmount > Number(booking.amount)) {
      return new Response(JSON.stringify({ error: "Invalid refund amount." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let refundId: string | null = null;

    if (booking.stripe_payment_intent_id) {
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });
      const refund = await stripe.refunds.create({
        payment_intent: booking.stripe_payment_intent_id,
        amount: Math.round(refundAmount * 100),
        reason: "requested_by_customer",
        metadata: { bookingId, reason: (reason || "").slice(0, 200) },
      });
      refundId = refund.id;
    } else {
      throw new Error("No Stripe payment found for this booking — cannot refund");
    }

    const isFullRefund = refundAmount >= Number(booking.amount) - 0.01;

    await supabaseClient
      .from("bookings")
      .update({
        status: "refunded",
        refund_status: "processed",
        refund_amount: refundAmount,
        refund_reason: reason || null,
        transaction_id: refundId,
        booking_details: { ...booking.booking_details, refundId, refundedAt: new Date().toISOString(), partial: !isFullRefund },
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    console.log(`Refund ${refundId} issued for booking ${bookingId}: ${refundAmount} ${booking.currency}`);

    return new Response(
      JSON.stringify({
        success: true,
        refundId,
        amount: refundAmount,
        currency: booking.currency,
        partial: !isFullRefund,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("Refund error:", error);
    return new Response(
      JSON.stringify({ error: "Unable to process refund. Please try again." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
