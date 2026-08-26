import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// QR/UPI payments are informational only (US billing scope). This function
// reports booking status but NEVER confirms payment — only the Stripe webhook
// or the verified payments-confirm endpoint may do that. The previous version
// auto-confirmed bookings after 20s with a 95% random success rate, which
// created free "confirmed" bookings; those are flagged below.
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId } = await req.json();

    if (!bookingId || typeof bookingId !== "string" || bookingId.length > 64) {
      throw new Error("Booking ID required");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: booking } = await supabaseClient
      .from("bookings")
      .select("status, payment_status, amount, currency")
      .eq("id", bookingId)
      .maybeSingle();

    if (!booking) throw new Error("Booking not found");

    if (booking.status === "confirmed" && booking.payment_status === "succeeded") {
      return new Response(
        JSON.stringify({
          bookingId,
          status: "succeeded",
          message: "Payment confirmed!",
          booking: { status: booking.status, payment_status: booking.payment_status },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({
        bookingId,
        status: "pending",
        message: "QR/UPI payments are not supported. Please pay securely by card.",
        booking: { status: booking.status, payment_status: booking.payment_status },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("QR status check error:", error);
    return new Response(
      JSON.stringify({ error: "Unable to check payment status." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
