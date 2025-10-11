import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const sanitizeForLog = (obj: any) => {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = { ...obj };
  delete sanitized.email;
  delete sanitized.token;
  delete sanitized.authorization;
  delete sanitized.Authorization;
  return sanitized;
};

const logStep = (step: string, details?: any) => {
  const safeDetails = details ? sanitizeForLog(details) : undefined;
  const detailsStr = safeDetails ? ` - ${JSON.stringify(safeDetails)}` : '';
  console.log(`[ADMIN-PAYMENTS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  logStep("Request received", { method: req.method, headers: Object.fromEntries(req.headers.entries()) });

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify admin role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header");
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user");
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      logStep("ERROR: User authentication failed", { error: userError });
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("User authenticated", { userId: user.id });

    // Check if user is admin - CRITICAL: Pass user ID to RPC
    const { data: isAdmin, error: adminError } = await supabaseClient.rpc('is_admin', {});
    
    logStep("Admin check result", { isAdmin, adminError });
    
    if (adminError || !isAdmin) {
      logStep("ERROR: Admin access denied", { isAdmin, error: adminError });
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Admin verified, fetching Stripe data");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: Stripe key not configured");
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    logStep("Fetching Stripe checkout sessions");

    // Fetch recent checkout sessions (more relevant than payment intents)
    const sessions = await stripe.checkout.sessions.list({
      limit: 50,
    });

    logStep("Stripe sessions fetched", { count: sessions.data.length });

    // Get all bookings
    const { data: bookings, error: bookingsError } = await supabaseClient
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (bookingsError) {
      logStep("ERROR: Failed to fetch bookings", { error: bookingsError });
      throw new Error(`Failed to fetch bookings: ${bookingsError.message}`);
    }

    logStep("Bookings fetched", { count: bookings?.length || 0 });

    // Map sessions to bookings
    const paymentsWithBookings = sessions.data.map((session: any) => {
      const bookingId = session.metadata?.booking_id;
      const booking = bookings?.find(b => b.id === bookingId || b.stripe_session_id === session.id);
      
      return {
        payment_id: session.id,
        booking_reference: booking?.id || bookingId || 'unlinked',
        amount: (session.amount_total || 0) / 100,
        currency: (session.currency || 'usd').toUpperCase(),
        status: session.payment_status || session.status,
        created_at: new Date((session.created || 0) * 1000).toISOString(),
        booking_type: booking?.booking_type || session.metadata?.booking_type || null,
        contact_email: booking?.contact_email || session.customer_email || session.customer_details?.email,
      };
    });

    logStep("Payments mapped to bookings", { total: paymentsWithBookings.length });

    return new Response(JSON.stringify({ 
      payments: paymentsWithBookings,
      total_count: paymentsWithBookings.length 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logStep("ERROR: Exception in admin-payments", { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined 
    });
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isStripeError = errorMessage.includes('Stripe') || errorMessage.includes('API key');
    
    return new Response(JSON.stringify({ 
      error: 'An error occurred processing your request',
      code: 'INTERNAL_ERROR'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});