import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  logStep("Webhook received", { headers: Object.fromEntries(req.headers.entries()) });
  
  try {
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      logStep("ERROR: No signature header");
      return new Response('No signature', { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    const body = await req.text();
    logStep("Body received", { bodyLength: body.length });
    
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;
    
    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        logStep("Signature verified successfully");
      } catch (err) {
        logStep("ERROR: Signature verification failed", { error: err instanceof Error ? err.message : 'Unknown error' });
        return new Response('Invalid signature', { status: 400 });
      }
    } else {
      logStep("WARNING: No webhook secret, parsing without verification");
      event = JSON.parse(body);
    }

    logStep('Event received', { type: event.type, id: event.id });

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      logStep('Processing checkout.session.completed', { 
        sessionId: session.id,
        metadata: session.metadata,
        paymentStatus: session.payment_status 
      });
      
      const bookingId = session.metadata?.booking_id;
      const bookingType = session.metadata?.booking_type;

      if (!bookingId) {
        logStep('ERROR: No booking ID in session metadata', { metadata: session.metadata });
        return new Response('No booking ID', { status: 400 });
      }

      logStep('Processing completed checkout for booking', { bookingId, bookingType });

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
        logStep('ERROR: Failed to update booking', { bookingId, error: updateError });
        throw updateError;
      }

      logStep('Booking confirmed successfully', { bookingId });
    }

    logStep('Webhook processed successfully');
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    logStep('ERROR: Webhook processing failed', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});