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
    const url = new URL(req.url);
    let bookingId = url.pathname.split('/').pop() || '';

    // Also allow JSON body with bookingId when invoked via supabase.functions.invoke
    if (!bookingId || bookingId === 'payments-status') {
      try {
        const body = await req.json();
        if (body?.bookingId) bookingId = body.bookingId;
      } catch (_) {
        // ignore
      }
    }

    if (!bookingId) {
      throw new Error('Booking ID is required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get booking details
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('id, status, payment_status, payment_method, transaction_id, amount, currency, confirmed_at, created_at, updated_at')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error('Booking not found');
    }

    // Simulate auto-confirm for UPI/QR in demo mode after ~20s
    try {
      if ((booking.payment_method === 'upi' || booking.payment_method === 'qr') && booking.payment_status === 'pending') {
        const createdAt = new Date(booking.created_at || booking.updated_at || new Date()).getTime();
        const elapsed = (Date.now() - createdAt) / 1000;
        if (elapsed > 20) {
          await supabaseClient
            .from('bookings')
            .update({
              status: 'confirmed',
              payment_status: 'succeeded',
              confirmed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', bookingId);
          booking.status = 'confirmed';
          booking.payment_status = 'succeeded';
          booking.confirmed_at = new Date().toISOString();
        }
      }
    } catch (e) {
      console.error('Auto-confirm simulation error:', e);
    }

    // Currency conversion using exchangerate.host
    let amountInr = null;
    if (booking.currency === 'USD') {
      try {
        const convertResponse = await fetch(
          `https://api.exchangerate.host/convert?from=USD&to=INR&amount=${booking.amount}`
        );
        const convertData = await convertResponse.json();
        const rate = convertData?.info?.rate || 83;
        amountInr = parseFloat(Number(convertData?.result ?? booking.amount * rate).toFixed(2));
      } catch (error) {
        console.error('Currency conversion error:', error);
        amountInr = parseFloat((booking.amount * 83).toFixed(2)); // Fallback
      }
    }

    // Ensure latest values
    const { data: latest } = await supabaseClient
      .from('bookings')
      .select('payment_status, payment_method, transaction_id')
      .eq('id', bookingId)
      .maybeSingle();

    const finalStatus = latest?.payment_status ?? booking.payment_status;
    const finalMethod = latest?.payment_method ?? booking.payment_method;

    return new Response(
      JSON.stringify({
        ...booking,
        bookingId,
        payment_method: finalMethod,
        payment_status: finalStatus,
        amount_usd: booking.currency === 'USD' ? Number(booking.amount) : null,
        amount_inr: booking.currency === 'INR' ? Number(booking.amount) : amountInr,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Payment status check error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});