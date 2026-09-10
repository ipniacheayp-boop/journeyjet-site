import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  console.log(`[BOOKINGS-STATUS] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const bookingId = url.searchParams.get('bookingId');

    if (!bookingId) {
      return new Response(
        JSON.stringify({ ok: false, code: 'INVALID_REQUEST', message: 'bookingId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep('Checking booking status', { bookingId });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: booking, error } = await supabaseClient
      .from('bookings')
      .select('id, status, payment_status, confirmed_at, booking_type, amount, currency, contact_email')
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      return new Response(
        JSON.stringify({ ok: false, code: 'NOT_FOUND', message: 'Booking not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine processing stage for UI
    let stage = 'pending_payment';
    if (booking.status === 'confirmed') {
      stage = 'confirmed';
    } else if (booking.payment_status === 'succeeded') {
      stage = 'processing_provider';
    } else if (booking.payment_status === 'failed') {
      stage = 'payment_failed';
    }

    logStep('Status retrieved', { bookingId, status: booking.status, stage });

    return new Response(
      JSON.stringify({
        ok: true,
        bookingId: booking.id,
        status: booking.status,
        paymentStatus: booking.payment_status,
        stage,
        confirmedAt: booking.confirmed_at,
        bookingType: booking.booking_type,
        amount: booking.amount,
        currency: booking.currency,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logStep('ERROR', { message: errorMessage });
    
    return new Response(
      JSON.stringify({
        ok: false,
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
