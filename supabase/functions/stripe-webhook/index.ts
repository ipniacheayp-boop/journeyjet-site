import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      return new Response('No signature', { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;
    
    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error('Webhook signature verification failed:', err instanceof Error ? err.message : 'Unknown error');
        return new Response('Invalid signature', { status: 400 });
      }
    } else {
      event = JSON.parse(body);
    }

    console.log('Received event:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const bookingId = session.metadata?.booking_id;
      const bookingType = session.metadata?.booking_type;

      if (!bookingId) {
        console.error('No booking ID in session metadata');
        return new Response('No booking ID', { status: 400 });
      }

      console.log('Processing completed checkout for booking:', bookingId);

      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Update booking status to confirmed
      const { error: updateError } = await supabaseClient
        .from('bookings')
        .update({
          status: 'confirmed',
          stripe_payment_intent_id: session.payment_intent as string,
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (updateError) {
        console.error('Error updating booking:', updateError);
        throw updateError;
      }

      console.log(`Booking ${bookingId} confirmed successfully`);

      // TODO: Send confirmation email here
      // You can use Resend or another email service
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});