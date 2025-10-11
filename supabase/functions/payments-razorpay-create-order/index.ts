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
    const { bookingId, amount, currency = 'INR' } = await req.json();

    if (!bookingId || !amount) {
      throw new Error("Missing required fields");
    }

    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error("Razorpay credentials not configured");
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

    // Create Razorpay order
    const orderAmount = Math.round(parseFloat(amount) * 100); // Convert to paise
    const orderData = {
      amount: orderAmount,
      currency: currency,
      receipt: `receipt_${bookingId.slice(0, 8)}`,
      notes: {
        booking_id: bookingId,
        customer_email: booking.contact_email,
      },
    };

    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error("Razorpay API error:", errorText);
      throw new Error(`Razorpay order creation failed: ${razorpayResponse.status}`);
    }

    const razorpayOrder = await razorpayResponse.json();

    console.log(`Razorpay order created: ${razorpayOrder.id} for booking ${bookingId}`);

    // Update booking with Razorpay order ID
    await supabaseClient
      .from("bookings")
      .update({
        payment_reference: razorpayOrder.id,
        payment_method: 'razorpay',
        payment_status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    return new Response(
      JSON.stringify({
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: razorpayKeyId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
