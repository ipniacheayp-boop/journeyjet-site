import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate a confirmation number
function generateConfirmationNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'CAR-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { carOffer, userDetails, agentId } = await req.json();

    console.log('🚗 Car booking request received');
    console.log('📋 User details:', { 
      name: userDetails?.firstName + ' ' + userDetails?.lastName,
      email: userDetails?.email 
    });

    if (!carOffer || !userDetails) {
      return new Response(
        JSON.stringify({ error: 'Car offer and user details are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userDetails.acceptedTerms) {
      return new Response(
        JSON.stringify({ error: 'You must accept the Terms & Conditions to complete this booking.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate required user details
    if (!userDetails.email || !userDetails.firstName || !userDetails.lastName) {
      return new Response(
        JSON.stringify({ error: 'Please provide your full name and email address.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user ID from auth header if present
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseClient.auth.getUser(token);
      userId = user?.id || null;
    }

    // Extract price and currency from the offer
    const price = parseFloat(carOffer.price?.total || carOffer.originalOffer?.price?.total || '0');
    const currency = carOffer.price?.currency || carOffer.originalOffer?.price?.currency || 'USD';

    if (price <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid price. Please try selecting a different vehicle.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create booking details object
    const bookingDetails = {
      vehicle: carOffer.vehicle || {},
      provider: carOffer.provider || {},
      pickUp: carOffer.pickUp || {},
      dropOff: carOffer.dropOff || {},
      price: {
        base: price,
        currency: currency,
        total: price,
      },
      confirmationNumber: generateConfirmationNumber(),
    };

    console.log('💰 Booking price:', price, currency);
    console.log('🎫 Confirmation number:', bookingDetails.confirmationNumber);

    // Create booking record in database
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .insert({
        user_id: userId,
        agent_id: agentId || null,
        booking_type: 'car',
        status: 'pending_payment',
        booking_details: bookingDetails,
        amount: price,
        currency: currency,
        contact_email: userDetails.email,
        contact_name: `${userDetails.firstName} ${userDetails.lastName}`,
        contact_phone: userDetails.phone || null,
      })
      .select()
      .single();

    if (bookingError) {
      console.error('❌ Database error:', bookingError);
      throw new Error('Failed to create booking record');
    }

    console.log('✅ Booking created:', booking.id);

    // Initialize Stripe
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe configuration error');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2025-08-27.basil',
    });

    // Build product description
    const vehicleName = carOffer.vehicle?.make && carOffer.vehicle?.model
      ? `${carOffer.vehicle.make} ${carOffer.vehicle.model}`
      : carOffer.vehicle?.category || 'Car Rental';
    
    const providerName = carOffer.provider?.name || 'Car Rental Provider';
    const productDescription = `${vehicleName} - ${carOffer.vehicle?.category || 'Standard'} | ${carOffer.vehicle?.transmission || 'Automatic'}`;

    console.log('💳 Creating Stripe checkout session...');

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'link'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: Math.round(price * 100), // Stripe expects cents
            product_data: {
              name: `Car Rental: ${vehicleName}`,
              description: productDescription,
              metadata: {
                provider: providerName,
                category: carOffer.vehicle?.category || 'Standard',
                confirmation_number: bookingDetails.confirmationNumber,
              },
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/payment-cancel`,
      customer_email: userDetails.email,
      metadata: {
        booking_id: booking.id,
        booking_type: 'car',
        confirmation_number: bookingDetails.confirmationNumber,
      },
    });

    // Update booking with Stripe session ID
    await supabaseClient
      .from('bookings')
      .update({ stripe_session_id: session.id })
      .eq('id', booking.id);

    console.log('✅ Stripe session created:', session.id);

    return new Response(
      JSON.stringify({ 
        checkoutUrl: session.url,
        bookingId: booking.id,
        confirmationNumber: bookingDetails.confirmationNumber,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Car booking error:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred processing your booking. Please try again.',
        code: 'BOOKING_ERROR'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
