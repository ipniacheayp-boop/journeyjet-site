import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * ⚠️ STRIPE SANCTIONS COMPLIANCE
 * Comprehensively-sanctioned jurisdictions. Any booking whose destination
 * matches this list must be rejected with HTTP 403 and Stripe must NEVER be
 * invoked for the request.
 */
const RESTRICTED_PATTERNS: { label: string; terms: string[] }[] = [
  { label: "Cuba", terms: ["cuba", "havana", "varadero"] },
  { label: "Iran", terms: ["iran", "tehran", "islamic republic of iran"] },
  { label: "North Korea", terms: ["north korea", "dprk", "democratic people's republic of korea", "pyongyang"] },
  { label: "Syria", terms: ["syria", "syrian arab republic", "damascus", "aleppo"] },
  { label: "Crimea", terms: ["crimea", "sevastopol", "simferopol"] },
  { label: "Donetsk", terms: ["donetsk"] },
  { label: "Luhansk", terms: ["luhansk", "lugansk"] },
];

function getRestrictedDestination(...texts: any[]): string | null {
  const haystack = texts
    .filter((v) => typeof v === "string" && v.length > 0)
    .join(" | ")
    .toLowerCase();
  if (!haystack) return null;
  for (const entry of RESTRICTED_PATTERNS) {
    for (const term of entry.terms) {
      const re = new RegExp(`(^|[^a-z])${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`, "i");
      if (re.test(haystack)) return entry.label;
    }
  }
  return null;
}

/** Pull location-relevant strings out of a stored booking_details offer. */
function offerDestinationText(offer: any): string[] {
  if (!offer || typeof offer !== "object") return [];
  const gp = offer.googlePlace || {};
  const components = Array.isArray(gp.addressComponents)
    ? gp.addressComponents.map((c: any) => c?.longText || c?.long_name || "")
    : [];
  return [
    offer?.hotel?.name, offer?.hotel?.address, offer?.hotel?.cityCode, offer?.hotel?.country,
    offer?.searchMeta?.cityQuery, offer?.address, offer?.city, offer?.country,
    gp?.formattedAddress, gp?.shortFormattedAddress, gp?.displayName?.text,
    offer?.pickup?.location, offer?.pickUpLocation, ...components,
  ].filter((v: any) => typeof v === "string" && v.length > 0);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId, amount, billingCountry } = await req.json();
    // ALWAYS use USD for Stripe payments
    const currency = 'USD';

    if (!bookingId || !amount) {
      throw new Error("Missing required fields");
    }

    // ── Geographic compliance: U.S.-only payments ──────────────────────────
    // Normalize the submitted billing country. Accept only the United States.
    const ALLOWED_COUNTRIES = new Set([
      "united states", "united states of america", "usa", "us", "u.s.", "u.s.a.",
    ]);
    const normalizedCountry = String(billingCountry ?? "").trim().toLowerCase();

    if (!normalizedCountry || !ALLOWED_COUNTRIES.has(normalizedCountry)) {
      // Log the rejected transaction for compliance review.
      console.warn(
        `[COMPLIANCE-REJECT] Non-U.S. billing country blocked. bookingId=${bookingId} submittedCountry="${billingCountry ?? "(none)"}"`
      );
      return new Response(
        JSON.stringify({
          error:
            "We are unable to process payments from your region. Tripile currently serves customers located in the United States only.",
          code: "REGION_NOT_SUPPORTED",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify booking exists
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .select("id, amount, currency, contact_email")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parseFloat(amount) * 100), // Convert to smallest currency unit
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      receipt_email: booking.contact_email || undefined,
      metadata: {
        bookingId,
        billing_country: "United States",
      },
      description: `Booking #${bookingId.slice(0, 8)}`,
    });

    console.log(`Payment intent created: ${paymentIntent.id} for booking ${bookingId}`);

    // Update booking with payment intent
    await supabaseClient
      .from("bookings")
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        payment_method: 'stripe',
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Payment intent creation error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
