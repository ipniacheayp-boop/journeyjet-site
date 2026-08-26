import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// UPI payments are NOT a supported payment method (US billing scope).
// This endpoint previously auto-confirmed any booking after 20 seconds with a
// random success rate, creating free "confirmed" bookings. It now reports the
// real booking state and never confirms — only the Stripe webhook or the
// verified payments-confirm endpoint may do that.
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
      .select("status, payment_status")
      .eq("id", bookingId)
      .maybeSingle();

    if (!booking) throw new Error("Booking not found");

    const confirmed = booking.status === "confirmed" && booking.payment_status === "succeeded";

    return new Response(
      JSON.stringify({
        bookingId,
        status: confirmed ? "confirmed" : "pending",
        message: confirmed
          ? "Payment confirmed!"
          : "UPI payments are not supported. Please complete payment securely by card.",
        booking,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("UPI confirm error:", error);
    return new Response(
      JSON.stringify({ error: "Unable to check payment status." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
