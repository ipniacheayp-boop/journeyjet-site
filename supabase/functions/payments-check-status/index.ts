import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Checks a booking's payment status. Authorization: authenticated owner, or
// possession of the booking's Stripe session id (cs_*). Previously open to
// anyone with a booking UUID (IDOR / information disclosure).
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId, transactionId, sessionId } = await req.json();

    if (!bookingId && !transactionId) {
      return json({ error: "Booking ID or Transaction ID required" }, 400);
    }
    if (bookingId && (typeof bookingId !== "string" || bookingId.length > 64)) {
      return json({ error: "Invalid booking ID" }, 400);
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let query = supabaseClient
      .from("bookings")
      .select("id, status, payment_status, amount, currency, booking_type, user_id, stripe_session_id, stripe_payment_intent_id");

    if (bookingId) query = query.eq("id", bookingId);
    else if (transactionId) query = query.eq("transaction_id", transactionId);

    const { data: booking } = await query.maybeSingle();
    if (!booking) return json({ error: "Booking not found" }, 404);

    let authorized = false;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabaseClient.auth.getUser(token);
      if (user && booking.user_id && user.id === booking.user_id) authorized = true;
    }

    if (!authorized) {
      const validSessionId = typeof sessionId === "string" && /^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId);
      if (validSessionId && booking.stripe_session_id && sessionId === booking.stripe_session_id) {
        authorized = true;
      }
    }

    if (!authorized) return json({ error: "Not authorized to view this booking" }, 403);

    // Cross-check with Stripe when we have a payment intent.
    let stripeStatus: string | null = null;
    if (booking.stripe_payment_intent_id) {
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });
      try {
        const pi = await stripe.paymentIntents.retrieve(booking.stripe_payment_intent_id);
        stripeStatus = pi.status;
      } catch (e) {
        console.error("Stripe PI retrieve failed:", e instanceof Error ? e.message : e);
      }
    }

    return json({
      bookingId: booking.id,
      bookingType: booking.booking_type,
      status: booking.status,
      paymentStatus: booking.payment_status,
      stripeStatus,
      confirmed: booking.status === "confirmed" && booking.payment_status === "succeeded",
    });
  } catch (error: any) {
    console.error("Status check error:", error);
    return json({ error: "Unable to check payment status." }, 500);
  }
});
