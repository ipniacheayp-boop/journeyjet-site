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
  console.log(`[CREATE-CHECKOUT-SESSION] ${step}`, safeDetails ? JSON.stringify(safeDetails) : '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    const { booking_temp_id, idempotency_key, return_url, cancel_url } = await req.json();

    if (!booking_temp_id) {
      return new Response(
        JSON.stringify({ error: 'booking_temp_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep('Starting checkout session creation', { booking_temp_id, idempotency_key });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Load provisional booking from DB
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('id', booking_temp_id)
      .single();

    if (bookingError || !booking) {
      logStep('Booking not found', { booking_temp_id, error: bookingError?.message });
      return new Response(
        JSON.stringify({ error: 'Booking not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (booking.status !== 'pending_payment') {
      logStep('Invalid booking status', { status: booking.status });
      return new Response(
        JSON.stringify({ error: 'Booking is not in pending_payment status', status: booking.status }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if there's an existing valid session
    if (booking.stripe_session_id) {
      const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' });
      try {
        const existingSession = await stripe.checkout.sessions.retrieve(booking.stripe_session_id);
        if (existingSession.url && existingSession.status === 'open') {
          logStep('Returning existing session', { sessionId: existingSession.id });
          return new Response(
            JSON.stringify({
              checkoutUrl: existingSession.url,
              sessionId: existingSession.id,
              amountUSD: booking.amount,
              existingSession: true,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (e) {
        logStep('Could not retrieve existing session, creating new one');
      }
    }

    // Price is already validated in prebooking-validate - use stored amount
    // ALWAYS charge in USD
    const amountUSD = parseFloat(booking.amount) || 0;
    if (amountUSD <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid booking amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' });
    const origin = req.headers.get('origin') || 'https://lovable.dev';
    
    // Build product name based on booking type
    const details = booking.booking_details || {};
    let productName = '';
    let productDescription = '';
    
    if (booking.booking_type === 'flight') {
      const firstSeg = details.itineraries?.[0]?.segments?.[0];
      const lastSeg = details.itineraries?.[0]?.segments?.slice(-1)[0];
      productName = `Flight: ${firstSeg?.departure?.iataCode || 'DEP'} → ${lastSeg?.arrival?.iataCode || 'ARR'}`;
      productDescription = `${details.itineraries?.[0]?.segments?.length || 1} segment(s)`;
    } else if (booking.booking_type === 'hotel') {
      productName = `Hotel: ${details.hotel?.name || 'Hotel Booking'}`;
      productDescription = details.hotel?.address?.cityName || 'Accommodation';
    } else if (booking.booking_type === 'car') {
      productName = `Car Rental: ${details.vehicle?.make || ''} ${details.vehicle?.model || details.vehicle?.category || 'Vehicle'}`;
      productDescription = details.provider?.name || 'Car Rental';
    } else {
      productName = `${booking.booking_type || 'Travel'} Booking`;
      productDescription = `Booking ID: ${booking_temp_id.slice(0, 8)}`;
    }

    // Create Stripe Checkout Session - ALWAYS USD
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(amountUSD * 100),
            product_data: {
              name: productName,
              description: productDescription,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: return_url || `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking_temp_id}`,
      cancel_url: cancel_url || `${origin}/payment-cancel?booking_id=${booking_temp_id}`,
      customer_email: booking.contact_email,
      metadata: {
        booking_id: booking_temp_id,
        booking_type: booking.booking_type,
        idempotency_key: idempotency_key || '',
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minute expiry
    }, {
      idempotencyKey: idempotency_key || undefined,
    });

    logStep('Stripe session created', { sessionId: session.id });

    // Update booking with session ID
    await supabaseClient
      .from('bookings')
      .update({
        stripe_session_id: session.id,
        payment_status: 'checkout_pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking_temp_id);

    return new Response(
      JSON.stringify({
        checkoutUrl: session.url,
        sessionId: session.id,
        amountUSD: amountUSD,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logStep('ERROR', { message: errorMessage });

    // Handle Stripe errors specifically
    if (errorMessage.includes('price_changed') || errorMessage.includes('No fare')) {
      return new Response(
        JSON.stringify({ error: 'price_changed', message: 'Price has changed. Please search again.' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Failed to create checkout session', message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
