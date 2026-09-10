import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  console.log(`[CHECKOUT-STATUS] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const bookingId = pathParts[pathParts.length - 1] || url.searchParams.get('booking_id');

    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: 'booking_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep('Checking status', { bookingId });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get booking from database
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      logStep('Booking not found', { bookingId });
      return new Response(
        JSON.stringify({ error: 'Booking not found', ok: false }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let stripeStatus = null;
    let paymentIntentStatus = null;

    // Check Stripe session if available
    if (booking.stripe_session_id) {
      const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
      if (stripeKey) {
        const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' });
        try {
          const session = await stripe.checkout.sessions.retrieve(booking.stripe_session_id);
          stripeStatus = session.status;
          paymentIntentStatus = session.payment_status;
          
          logStep('Stripe session retrieved', { 
            sessionStatus: session.status, 
            paymentStatus: session.payment_status 
          });
        } catch (e) {
          logStep('Could not retrieve Stripe session', { error: (e as Error).message });
        }
      }
    }

    // Determine overall status
    const response = {
      ok: true,
      bookingId: booking.id,
      status: booking.status,
      paymentStatus: booking.payment_status || paymentIntentStatus,
      stripeSessionStatus: stripeStatus,
      bookingType: booking.booking_type,
      amount: booking.amount,
      currency: booking.currency || 'USD',
      confirmedAt: booking.confirmed_at,
      amadeusOrderId: booking.amadeus_order_id,
      amadeusPnr: booking.amadeus_pnr,
      contactEmail: booking.contact_email,
      contactName: booking.contact_name,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
    };

    logStep('Returning status', { status: booking.status, paymentStatus: booking.payment_status });

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logStep('ERROR', { message: errorMessage });
    
    return new Response(
      JSON.stringify({ ok: false, error: 'Failed to get checkout status', message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
