import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify admin role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is admin
    const { data: isAdmin } = await supabaseClient.rpc('is_admin');
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Fetch recent payment intents
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100,
    });

    // Get bookings with payment info
    const { data: bookings } = await supabaseClient
      .from('bookings')
      .select('*')
      .not('stripe_payment_intent_id', 'is', null)
      .order('created_at', { ascending: false });

    const paymentsWithBookings = paymentIntents.data.map((pi: any) => {
      const booking = bookings?.find(b => b.stripe_payment_intent_id === pi.id);
      return {
        id: pi.id,
        amount: pi.amount / 100,
        currency: pi.currency.toUpperCase(),
        status: pi.status,
        created: new Date(pi.created * 1000).toISOString(),
        booking_id: booking?.id,
        booking_type: booking?.booking_type,
        contact_email: booking?.contact_email,
      };
    });

    return new Response(JSON.stringify({ payments: paymentsWithBookings }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Admin payments error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});