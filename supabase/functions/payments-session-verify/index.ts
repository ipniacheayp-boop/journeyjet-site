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

// Verifies a Stripe Checkout session after redirect. Authorization: the caller
// must either (a) be authenticated and own the booking, or (b) know the
// unguessable Stripe session id (cs_*) — possession of the session id is proof
// of having completed checkout. Returns a non-PII summary only.
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, bookingId } = await req.json();

    if (!bookingId || typeof bookingId !== "string" || bookingId.length > 64) {
      return json({ error: "Booking ID required" }, 400);
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: booking } = await supabaseClient
      .from("bookings")
      .select("id, status, payment_status, amount, currency, booking_type, created_at, stripe_session_id, user_id")
      .eq("id", bookingId)
      .maybeSingle();

    if (!booking) return json({ error: "Booking not found" }, 404);

    // Authorization: authenticated owner OR possession of the Stripe session id.
    let authorized = false;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabaseClient.auth.getUser(token);
      if (user && booking.user_id && user.id === booking.user_id) authorized = true;
    }

    if (!authorized) {
      const validSessionId = typeof sessionId === "string" && /^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId);
      if (!validSessionId || !booking.stripe_session_id || sessionId !== booking.stripe_session_id) {
        return json({ error: "Not authorized to view this booking" }, 403);
      }
    }

    // Verify against Stripe when we have a session id.
    let stripeVerified: boolean | null = null;
    if (booking.stripe_session_id) {
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });
      try {
        const session = await stripe.checkout.sessions.retrieve(booking.stripe_session_id);
        stripeVerified = session.payment_status === "paid";
      } catch (e) {
        console.error("Stripe session retrieve failed:", e instanceof Error ? e.message : e);
      }
    }

    const confirmed = booking.status === "confirmed" && booking.payment_status === "succeeded";

    return json({
      bookingId: booking.id,
      bookingType: booking.booking_type,
      status: booking.status,
      paymentStatus: booking.payment_status,
      amount: booking.amount,
      currency: booking.currency,
      confirmed,
      stripeVerified,
      createdAt: booking.created_at,
    });
  } catch (error: any) {
    console.error("Session verify error:", error);
    return json({ error: "Unable to verify session." }, 500);
  }
});
