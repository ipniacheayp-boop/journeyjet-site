import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const safeDetails = details ? { ...details } : undefined;
  if (safeDetails?.email) safeDetails.email = '***';
  console.log(`[SESSION-VERIFY] ${step}`, safeDetails ? JSON.stringify(safeDetails) : '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('session_id');
    const bookingId = url.searchParams.get('booking_id');

    if (!sessionId && !bookingId) {
      return new Response(
        JSON.stringify({ error: 'session_id or booking_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep('Verifying session', { sessionId, bookingId });

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let booking = null;
    let stripeSession = null;

    // Try to get Stripe session first
    if (sessionId) {
      const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' });
      try {
        stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
        logStep('Stripe session retrieved', { 
          status: stripeSession.status, 
          paymentStatus: stripeSession.payment_status 
        });

        // Get booking from session metadata
        const metaBookingId = stripeSession.metadata?.booking_id;
        if (metaBookingId) {
          const { data } = await supabaseClient
            .from('bookings')
            .select('*')
            .eq('id', metaBookingId)
            .single();
          booking = data;
        }
      } catch (e) {
        logStep('Could not retrieve Stripe session', { error: (e as Error).message });
      }
    }

    // Fallback to booking lookup by ID
    if (!booking && bookingId) {
      const { data } = await supabaseClient
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();
      booking = data;

      // Try to get Stripe session from booking
      if (booking?.stripe_session_id && !stripeSession) {
        const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' });
        try {
          stripeSession = await stripe.checkout.sessions.retrieve(booking.stripe_session_id);
        } catch (e) {
          logStep('Could not retrieve session from booking', { error: (e as Error).message });
        }
      }
    }

    if (!booking) {
      return new Response(
        JSON.stringify({ error: 'Booking not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine overall status
    let paymentVerified = false;
    let providerBooked = false;

    if (stripeSession) {
      paymentVerified = stripeSession.payment_status === 'paid';
    }

    if (booking.status === 'confirmed') {
      providerBooked = true;
      paymentVerified = true;
    }

    const response = {
      bookingId: booking.id,
      bookingStatus: booking.status,
      paymentStatus: booking.payment_status,
      paymentVerified,
      providerBooked,
      amount: booking.amount,
      currency: booking.currency || 'USD',
      bookingType: booking.booking_type,
      bookingDetails: booking.booking_details,
      confirmedAt: booking.confirmed_at,
      providerBookingId: booking.amadeus_order_id || booking.amadeus_pnr,
      stripeSessionStatus: stripeSession?.status,
      stripePaymentStatus: stripeSession?.payment_status,
    };

    logStep('Session verified', { 
      bookingId: booking.id, 
      status: booking.status, 
      paymentVerified 
    });

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logStep('ERROR', { message: errorMessage });

    return new Response(
      JSON.stringify({ error: 'Failed to verify session', message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
