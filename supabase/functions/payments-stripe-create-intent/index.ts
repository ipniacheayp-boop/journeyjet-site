import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
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
    const { bookingId, amount, currency = 'USD' } = await req.json();

    if (!bookingId || !amount) {
      throw new Error("Missing required fields");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify booking exists
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .select("id, amount, currency, contact_email")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parseFloat(amount) * 100), // Convert to smallest currency unit
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      receipt_email: booking.contact_email || undefined,
      metadata: {
        bookingId,
      },
      description: `Booking #${bookingId.slice(0, 8)}`,
    });

    console.log(`Payment intent created: ${paymentIntent.id} for booking ${bookingId}`);

    // Update booking with payment intent
    await supabaseClient
      .from("bookings")
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        payment_method: 'stripe',
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Payment intent creation error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
