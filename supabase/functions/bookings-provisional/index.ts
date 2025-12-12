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
  if (safeDetails?.phone) safeDetails.phone = '***';
  console.log(`[BOOKINGS-PROVISIONAL] ${step}`, safeDetails ? JSON.stringify(safeDetails) : '');
};

// Fail early if required env vars are missing
const validateEnvVars = () => {
  const required = ['STRIPE_SECRET_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missing = required.filter(key => !Deno.env.get(key));
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}. Set them in Project Settings → Environment.`);
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    validateEnvVars();

    const {
      productType,
      offer,
      validatedOffer,
      price,
      currency,
      clientRequestId,
      userDetails,
      agentId,
      expiresAt,
    } = await req.json();

    // Validate required fields
    if (!productType || !offer || !price || !clientRequestId) {
      return new Response(
        JSON.stringify({ ok: false, code: 'INVALID_REQUEST', message: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userDetails?.acceptedTerms) {
      return new Response(
        JSON.stringify({ ok: false, code: 'TERMS_NOT_ACCEPTED', message: 'You must accept the Terms & Conditions' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep('Creating provisional booking', { productType, clientRequestId, price, currency });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get authenticated user if available
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseClient.auth.getUser(token);
      userId = user?.id || null;
    }

    // Check for existing booking with this clientRequestId (idempotency)
    const { data: existingBooking } = await supabaseClient
      .from('bookings')
      .select('id, status, stripe_session_id')
      .eq('transaction_id', clientRequestId)
      .maybeSingle();

    if (existingBooking) {
      logStep('Found existing booking', { bookingId: existingBooking.id, status: existingBooking.status });
      
      // If there's already a Stripe session, return the checkout URL
      if (existingBooking.stripe_session_id) {
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
          apiVersion: '2025-08-27.basil',
        });
        
        try {
          const session = await stripe.checkout.sessions.retrieve(existingBooking.stripe_session_id);
          if (session.url && session.status === 'open') {
            return new Response(
              JSON.stringify({
                ok: true,
                bookingId: existingBooking.id,
                checkoutUrl: session.url,
                existingBooking: true,
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } catch (e) {
          logStep('Could not retrieve existing session, creating new one');
        }
      }
      
      // Create new checkout session for existing booking
      const checkoutUrl = await createStripeCheckout(
        existingBooking.id,
        productType,
        offer,
        price,
        currency,
        userDetails,
        req.headers.get('origin') || ''
      );
      
      await supabaseClient
        .from('bookings')
        .update({ stripe_session_id: checkoutUrl.sessionId })
        .eq('id', existingBooking.id);

      return new Response(
        JSON.stringify({
          ok: true,
          bookingId: existingBooking.id,
          checkoutUrl: checkoutUrl.url,
          existingBooking: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map productType to booking_type enum
    const bookingTypeMap: Record<string, string> = {
      'flight': 'flight',
      'flights': 'flight',
      'hotel': 'hotel',
      'hotels': 'hotel',
      'car': 'car',
      'cars': 'car',
    };
    const bookingType = bookingTypeMap[productType] || productType;

    // Create new provisional booking
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .insert({
        user_id: userId,
        agent_id: agentId || null,
        booking_type: bookingType,
        status: 'pending_payment',
        booking_details: validatedOffer || offer,
        amount: price,
        currency: currency || 'USD',
        contact_email: userDetails.email,
        contact_name: `${userDetails.firstName || ''} ${userDetails.lastName || ''}`.trim() || userDetails.name,
        contact_phone: userDetails.phone,
        transaction_id: clientRequestId,
        hold_expiry: expiresAt || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        fare_validated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (bookingError) {
      logStep('Failed to create booking', { error: bookingError.message });
      throw new Error('Failed to create booking');
    }

    logStep('Booking created', { bookingId: booking.id });

    // Create Stripe Checkout session
    const checkoutResult = await createStripeCheckout(
      booking.id,
      bookingType,
      validatedOffer || offer,
      price,
      currency || 'USD',
      userDetails,
      req.headers.get('origin') || ''
    );

    // Update booking with Stripe session ID
    await supabaseClient
      .from('bookings')
      .update({ stripe_session_id: checkoutResult.sessionId })
      .eq('id', booking.id);

    logStep('Checkout session created', { sessionId: checkoutResult.sessionId });

    return new Response(
      JSON.stringify({
        ok: true,
        bookingId: booking.id,
        checkoutUrl: checkoutResult.url,
        bookingReference: booking.id.slice(0, 8).toUpperCase(),
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
        message: 'An unexpected error occurred while creating your booking',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function createStripeCheckout(
  bookingId: string,
  bookingType: string,
  offer: any,
  price: number,
  currency: string,
  userDetails: any,
  origin: string
): Promise<{ url: string; sessionId: string }> {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2025-08-27.basil',
  });

  let productName = '';
  let productDescription = '';

  if (bookingType === 'flight') {
    const firstSeg = offer.itineraries?.[0]?.segments?.[0];
    const lastSeg = offer.itineraries?.[0]?.segments?.slice(-1)[0];
    productName = `Flight: ${firstSeg?.departure?.iataCode || 'DEP'} → ${lastSeg?.arrival?.iataCode || 'ARR'}`;
    productDescription = `${offer.itineraries?.[0]?.segments?.length || 1} segment(s)`;
  } else if (bookingType === 'hotel') {
    productName = `Hotel: ${offer.hotel?.name || 'Hotel Booking'}`;
    productDescription = offer.hotel?.address?.cityName || 'City';
  } else if (bookingType === 'car') {
    productName = `Car Rental: ${offer.vehicle?.make || ''} ${offer.vehicle?.model || offer.vehicle?.category || 'Vehicle'}`;
    productDescription = offer.provider?.name || 'Car Rental';
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'link'],
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: Math.round(price * 100),
          product_data: {
            name: productName,
            description: productDescription,
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
    cancel_url: `${origin}/payment-cancel?booking_id=${bookingId}`,
    customer_email: userDetails.email,
    metadata: {
      booking_id: bookingId,
      booking_type: bookingType,
    },
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 min expiry
  });

  return { url: session.url || '', sessionId: session.id };
}
