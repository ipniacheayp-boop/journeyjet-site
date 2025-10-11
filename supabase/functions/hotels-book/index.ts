import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { hotelOffer, userDetails } = await req.json();

    if (!hotelOffer || !userDetails) {
      return new Response(
        JSON.stringify({ error: 'Hotel offer and user details are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseClient.auth.getUser(token);
      userId = user?.id || null;
    }

    const price = parseFloat(hotelOffer.offers[0].price.total);
    const currency = hotelOffer.offers[0].price.currency;

    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .insert({
        user_id: userId,
        booking_type: 'hotel',
        status: 'pending_payment',
        booking_details: hotelOffer,
        amount: price,
        currency: currency,
        contact_email: userDetails.email,
        contact_name: userDetails.name,
        contact_phone: userDetails.phone,
      })
      .select()
      .single();

    if (bookingError) {
      console.error('[Internal Error] Hotel booking creation failed');
      throw new Error('Failed to create booking');
    }

    console.log('Hotel booking created:', booking.id);

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'link'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: Math.round(price * 100),
            product_data: {
              name: `Hotel: ${hotelOffer.hotel.name}`,
              description: `${hotelOffer.hotel.address?.cityName || 'City'}`,
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
        booking_type: 'hotel',
      },
    });

    await supabaseClient
      .from('bookings')
      .update({ stripe_session_id: session.id })
      .eq('id', booking.id);

    return new Response(
      JSON.stringify({ 
        checkoutUrl: session.url,
        bookingId: booking.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Internal Error]', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred processing your booking',
        code: 'BOOKING_ERROR'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});