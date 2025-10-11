import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const sanitizeForLog = (obj: any) => {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = { ...obj };
  delete sanitized.authorization;
  delete sanitized.Authorization;
  delete sanitized['stripe-signature'];
  if (sanitized.metadata) {
    const meta = { ...sanitized.metadata };
    delete meta.email;
    delete meta.phone;
    sanitized.metadata = meta;
  }
  return sanitized;
};

const logStep = (step: string, details?: any) => {
  const safeDetails = details ? sanitizeForLog(details) : undefined;
  const detailsStr = safeDetails ? ` - ${JSON.stringify(safeDetails)}` : '';
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

    if (!webhookSecret) {
      logStep("ERROR: STRIPE_WEBHOOK_SECRET not configured");
      return new Response('Webhook secret not configured', { status: 500 });
    }

    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Signature verified successfully");
    } catch (err) {
      logStep("ERROR: Signature verification failed", { error: err instanceof Error ? err.message : 'Unknown error' });
      return new Response('Invalid signature', { status: 400 });
    }

    logStep('Event received', { type: event.type, id: event.id });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check for duplicate event (idempotency)
    const { data: existingEvent } = await supabaseClient
      .from('webhook_events')
      .select('id')
      .eq('event_id', event.id)
      .single();

    if (existingEvent) {
      logStep("Duplicate event detected, skipping");
      return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });
    }

    // Store webhook event for idempotency
    await supabaseClient.from('webhook_events').insert({
      event_id: event.id,
      event_type: event.type,
      provider: 'stripe',
      payload: event,
      processed: false,
    });

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      logStep('Processing checkout.session.completed', { 
        sessionId: session.id,
        metadata: session.metadata,
        paymentStatus: session.payment_status 
      });
      
      const bookingId = session.metadata?.booking_id;
      const bookingType = session.metadata?.booking_type;
      const walletTopup = session.metadata?.type === 'wallet_topup';

      // Handle wallet top-up
      if (walletTopup) {
        const agentId = session.metadata?.agent_id;
        const topupAmount = parseFloat(session.metadata?.topup_amount || '0');
        const currency = session.metadata?.currency || 'USD';

        if (agentId && topupAmount > 0) {
          const { data: wallet } = await supabaseClient
            .from('agent_wallet')
            .select('balance')
            .eq('agent_id', agentId)
            .single();

          const currentBalance = wallet?.balance || 0;
          const newBalance = currentBalance + topupAmount;

          await supabaseClient.from('agent_wallet').upsert({
            agent_id: agentId,
            balance: newBalance,
            currency,
            last_topup_at: new Date().toISOString(),
          });

          await supabaseClient.from('wallet_transactions').insert({
            agent_id: agentId,
            type: 'topup',
            amount: topupAmount,
            currency,
            stripe_payment_intent_id: session.payment_intent as string,
            description: 'Wallet top-up via Stripe',
            balance_after: newBalance,
          });

          logStep("Wallet topped up", { agentId, amount: topupAmount });
        }

        await supabaseClient
          .from('webhook_events')
          .update({ processed: true, processed_at: new Date().toISOString() })
          .eq('event_id', event.id);

        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      if (!bookingId) {
        logStep('ERROR: No booking ID in session metadata', { metadata: session.metadata });
        return new Response('No booking ID', { status: 400 });
      }

      logStep('Processing completed checkout for booking', { bookingId, bookingType });

      // Update booking status to confirmed
      const { data: booking, error: updateError } = await supabaseClient
        .from('bookings')
        .update({
          status: 'confirmed',
          stripe_payment_intent_id: session.payment_intent as string,
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (updateError) {
        logStep('ERROR: Failed to update booking', { bookingId, error: updateError });
        throw updateError;
      }

      logStep('Booking confirmed successfully', { bookingId });

      // Calculate and record commission if booking has an agent
      if (booking?.agent_id) {
        const { data: agentProfile } = await supabaseClient
          .from('agent_profiles')
          .select('commission_rate, stripe_connect_account_id')
          .eq('id', booking.agent_id)
          .single();

        if (agentProfile) {
          const baseFare = parseFloat(booking.amount || '0');
          const commissionRate = agentProfile.commission_rate || 10;
          const commissionAmount = (baseFare * commissionRate) / 100;

          await supabaseClient.from('agent_commissions').insert({
            agent_id: booking.agent_id,
            booking_id: booking.id,
            base_fare: baseFare,
            commission_rate: commissionRate,
            commission_amount: commissionAmount,
            currency: booking.currency || 'USD',
            payout_status: 'pending',
          });

          logStep("Commission recorded", { agentId: booking.agent_id, amount: commissionAmount });
        }
      }
    }

    // Handle direct PaymentIntent success/failure (Elements flow)
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent;
      logStep('Processing payment_intent.succeeded', { id: pi.id, metadata: pi.metadata });

      const bookingId = (pi.metadata as any)?.bookingId;

      if (bookingId) {
        await supabaseClient
          .from('bookings')
          .update({
            status: 'confirmed',
            payment_status: 'succeeded',
            payment_method: 'stripe',
            stripe_payment_intent_id: pi.id,
            confirmed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', bookingId);

        logStep('Booking updated from PI metadata', { bookingId });
      } else {
        // Fallback: find by stored payment_intent_id
        const { data: found } = await supabaseClient
          .from('bookings')
          .select('id')
          .eq('stripe_payment_intent_id', pi.id)
          .maybeSingle();
        if (found?.id) {
          await supabaseClient
            .from('bookings')
            .update({
              status: 'confirmed',
              payment_status: 'succeeded',
              payment_method: 'stripe',
              confirmed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', found.id);
          logStep('Booking updated by PI id', { bookingId: found.id });
        }
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object as Stripe.PaymentIntent;
      const bookingId = (pi.metadata as any)?.bookingId;
      if (bookingId) {
        await supabaseClient
          .from('bookings')
          .update({ payment_status: 'failed', updated_at: new Date().toISOString() })
          .eq('id', bookingId);
        logStep('Marked booking as failed', { bookingId });
      }
    }

    // Mark webhook event as processed
    await supabaseClient
      .from('webhook_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('event_id', event.id);

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
      JSON.stringify({ 
        error: 'An error occurred processing the webhook',
        code: 'WEBHOOK_ERROR'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});