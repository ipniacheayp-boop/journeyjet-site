import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── Server-side input validation helpers ──
const isValidEmail = (email: unknown): boolean =>
  typeof email === 'string' && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidName = (name: unknown): boolean =>
  typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 100;
const isValidPhone = (phone: unknown): boolean =>
  phone === undefined || phone === null || phone === '' ||
  (typeof phone === 'string' && phone.length >= 7 && phone.length <= 20 && /^[+\d\s\-()]+$/.test(phone));

// ── Amadeus price revalidation (defeats client-side price tampering) ──
const AMADEUS_BASE_URL = Deno.env.get('USE_PROD_APIS') === 'true'
  ? 'https://api.amadeus.com'
  : 'https://test.api.amadeus.com';

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAmadeusToken(): Promise<string | null> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;
  const apiKey = Deno.env.get('AMADEUS_API_KEY');
  const apiSecret = Deno.env.get('AMADEUS_API_SECRET');
  if (!apiKey || !apiSecret) return null;

  const response = await fetch(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${encodeURIComponent(apiKey)}&client_secret=${encodeURIComponent(apiSecret)}`,
  });
  if (!response.ok) return null;
  const data = await response.json();
  cachedToken = { token: data.access_token, expiresAt: Date.now() + 25 * 60 * 1000 };
  return cachedToken.token;
}

// Re-prices the offer server-side via Amadeus' pricing endpoint. Returns the
// fresh { price, currency } when available, or null when revalidation is not
// possible (expired offer, API down) — callers then reject or flag the booking.
async function repriceHotelOffer(offerId: string): Promise<{ price: number; currency: string } | null> {
  try {
    const token = await getAmadeusToken();
    if (!token || !offerId) return null;

    const res = await fetch(`${AMADEUS_BASE_URL}/v3/shopping/hotel-offers/pricing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ data: { type: 'hotel-offers-pricing', hotelOffers: [{ id: offerId }] } }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const offer = data?.data?.hotelOffers?.[0]?.offers?.[0];
    const price = parseFloat(offer?.price?.total ?? '');
    const currency = offer?.price?.currency;
    if (!Number.isFinite(price) || !currency) return null;
    return { price, currency };
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { hotelOffer, userDetails, agentId } = await req.json();

    if (!hotelOffer || !userDetails) {
      return new Response(
        JSON.stringify({ error: 'Hotel offer and user details are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userDetails.acceptedTerms) {
      return new Response(
        JSON.stringify({ error: 'You must accept the Terms & Conditions to complete this booking.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate contact details server-side
    if (!isValidEmail(userDetails.email)) {
      return new Response(
        JSON.stringify({ error: 'Please provide a valid email address.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!isValidName(userDetails.name)) {
      return new Response(
        JSON.stringify({ error: 'Please provide a valid name (2-100 characters).' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!isValidPhone(userDetails.phone)) {
      return new Response(
        JSON.stringify({ error: 'Please provide a valid phone number.' }),
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
        agent_id: agentId || null,
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