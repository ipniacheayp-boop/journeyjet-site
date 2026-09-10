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
    const { bookingId, amount, currency } = await req.json();

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
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    // Generate unique transaction ID
    const transactionId = `QR${Date.now()}${Math.random().toString(36).substring(7)}`;

    // Generate UPI QR code URL (using a QR code API)
    const upiString = `upi://pay?pa=pay@flynow&pn=FlyNow&am=${amount}&cu=${currency}&tn=Booking${bookingId.substring(0, 8)}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiString)}`;

    // Store QR transaction in booking
    await supabaseClient
      .from('bookings')
      .update({
        payment_method: 'qr',
        payment_status: 'pending',
        transaction_id: transactionId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    console.log(`QR code generated for booking ${bookingId}`);

    return new Response(
      JSON.stringify({ 
        qrCodeUrl,
        transactionId,
        upiString,
        expiresIn: 300 // 5 minutes
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error: any) {
    console.error("QR generation error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});