import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const report: any = {
      timestamp: new Date().toISOString(),
      checks: [],
      overall_status: 'healthy',
    };

    // Check 1: Validate environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!stripeSecretKey) {
      report.checks.push({
        name: 'Environment Variables',
        status: 'error',
        message: 'STRIPE_SECRET_KEY is not set',
      });
      report.overall_status = 'unhealthy';
    } else if (!stripeWebhookSecret) {
      report.checks.push({
        name: 'Environment Variables',
        status: 'warning',
        message: 'STRIPE_WEBHOOK_SECRET is not set (webhooks may not work)',
      });
      report.overall_status = 'degraded';
    } else {
      report.checks.push({
        name: 'Environment Variables',
        status: 'ok',
        message: 'All required environment variables are set',
      });
    }

    // Check 2: Test Stripe API connectivity
    if (stripeSecretKey) {
      try {
        const stripe = new Stripe(stripeSecretKey, {
          apiVersion: '2025-08-27.basil',
        });

        const paymentIntents = await stripe.paymentIntents.list({ limit: 1 });
        
        report.checks.push({
          name: 'Stripe API Connectivity',
          status: 'ok',
          message: `Successfully connected to Stripe API. Retrieved ${paymentIntents.data.length} recent payment intent(s)`,
        });
      } catch (error: any) {
        report.checks.push({
          name: 'Stripe API Connectivity',
          status: 'error',
          message: `Failed to connect to Stripe API: ${error.message}`,
        });
        report.overall_status = 'unhealthy';
      }
    }

    // Check 3: Validate Stripe account
    if (stripeSecretKey) {
      try {
        const stripe = new Stripe(stripeSecretKey, {
          apiVersion: '2025-08-27.basil',
        });

        const account = await stripe.accounts.retrieve();
        
        report.checks.push({
          name: 'Stripe Account',
          status: 'ok',
          message: `Account ID: ${account.id}, Charges enabled: ${account.charges_enabled}`,
        });
      } catch (error: any) {
        report.checks.push({
          name: 'Stripe Account',
          status: 'error',
          message: `Failed to retrieve Stripe account: ${error.message}`,
        });
        report.overall_status = 'unhealthy';
      }
    }

    // Check 4: Recent webhook events (if applicable)
    if (stripeSecretKey) {
      try {
        const stripe = new Stripe(stripeSecretKey, {
          apiVersion: '2025-08-27.basil',
        });

        const events = await stripe.events.list({ 
          limit: 10,
          types: ['checkout.session.completed'],
        });
        
        report.checks.push({
          name: 'Recent Webhook Events',
          status: 'ok',
          message: `Found ${events.data.length} recent checkout.session.completed event(s)`,
        });
      } catch (error: any) {
        report.checks.push({
          name: 'Recent Webhook Events',
          status: 'warning',
          message: `Could not retrieve webhook events: ${error.message}`,
        });
        if (report.overall_status === 'healthy') {
          report.overall_status = 'degraded';
        }
      }
    }

    // Check 5: Test refund capability (read-only check)
    if (stripeSecretKey) {
      try {
        const stripe = new Stripe(stripeSecretKey, {
          apiVersion: '2025-08-27.basil',
        });

        const refunds = await stripe.refunds.list({ limit: 1 });
        
        report.checks.push({
          name: 'Refund Capability',
          status: 'ok',
          message: `Refund API accessible. Found ${refunds.data.length} recent refund(s)`,
        });
      } catch (error: any) {
        report.checks.push({
          name: 'Refund Capability',
          status: 'warning',
          message: `Could not access refunds API: ${error.message}`,
        });
      }
    }

    console.log('Stripe health check completed:', report);

    return new Response(
      JSON.stringify(report),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('Error during Stripe health check:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        overall_status: 'unhealthy',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
