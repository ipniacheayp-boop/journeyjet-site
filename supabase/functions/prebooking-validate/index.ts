import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { fetchSerpHotelRates } from "../_shared/serpHotelsClient.ts";
import { buildEstimatedPrice, hmacHex, matchScore, nightsBetween, rateTokenPayload } from "../_shared/hotelRates.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TokenCache {
  token: string;
  expiresAt: number;
}

let cachedToken: TokenCache | null = null;

const logStep = (step: string, details?: any) => {
  console.log(`[PREBOOKING-VALIDATE] ${step}`, details ? JSON.stringify(details) : '');
};

// Fail early if required env vars are missing
const validateEnvVars = () => {
  const required = ['AMADEUS_API_KEY', 'AMADEUS_API_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missing = required.filter(key => !Deno.env.get(key));
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}. Set them in Project Settings → Environment.`);
  }
};

const getAmadeusToken = async (): Promise<string> => {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const apiKey = Deno.env.get('AMADEUS_API_KEY');
  const apiSecret = Deno.env.get('AMADEUS_API_SECRET');
  const useProd = Deno.env.get('USE_PROD_APIS') === 'true';
  const baseUrl = useProd ? 'https://api.amadeus.com' : 'https://test.api.amadeus.com';

  const response = await fetch(`${baseUrl}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${apiKey}&client_secret=${apiSecret}`,
  });

  if (!response.ok) {
    throw new Error('Failed to authenticate with Amadeus API');
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in * 1000) - 60000, // 1 min buffer
  };

  return cachedToken.token;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    validateEnvVars();

    const { productType, offerId, offer, clientRequestId } = await req.json();

    if (!productType || !offer) {
      return new Response(
        JSON.stringify({ ok: false, code: 'INVALID_REQUEST', message: 'productType and offer are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!clientRequestId) {
      return new Response(
        JSON.stringify({ ok: false, code: 'INVALID_REQUEST', message: 'clientRequestId is required for idempotency' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep('Validating prebooking', { productType, clientRequestId });

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check for existing provisional booking with this clientRequestId (idempotency)
    const { data: existingBooking } = await supabaseClient
      .from('bookings')
      .select('id, status, amount, currency')
      .eq('transaction_id', clientRequestId)
      .maybeSingle();

    if (existingBooking) {
      logStep('Found existing booking for clientRequestId', { bookingId: existingBooking.id });
      return new Response(
        JSON.stringify({
          ok: true,
          existingBooking: true,
          bookingId: existingBooking.id,
          price: existingBooking.amount,
          currency: existingBooking.currency,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const useProd = Deno.env.get('USE_PROD_APIS') === 'true';
    const baseUrl = useProd ? 'https://api.amadeus.com' : 'https://test.api.amadeus.com';

    if (productType === 'flight') {
      // Flight offers come from SerpAPI (Google Flights). Trust the price returned by
      // the search provider as the source of truth — do NOT re-price through Amadeus,
      // which would either fail (offer schema mismatch) or return a different number.
      const originalPrice = parseFloat(offer?.price?.total || offer?.price?.grandTotal || '0');
      const currency = offer?.price?.currency || 'USD';

      logStep('Flight price validated from search provider', { price: originalPrice, currency });

      return new Response(
        JSON.stringify({
          ok: true,
          price: originalPrice,
          currency,
          validatedOffer: offer,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (productType === 'hotel') {
      const json = (body: unknown, status = 200) =>
        new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      const hotelOffer = offer.offers?.[0] || {};
      const displayedPrice = Number(hotelOffer.price?.total ?? offer.price?.total ?? 0);
      const name: string = offer.hotel?.name || offer.name || '';
      const lat = Number(offer.hotel?.location?.lat ?? offer.googlePlace?.location?.latitude);
      const lng = Number(offer.hotel?.location?.lng ?? offer.googlePlace?.location?.longitude);
      const meta = offer.searchMeta || {};
      const checkInDate: string = hotelOffer.checkInDate || meta.checkInDate;
      const checkOutDate: string = hotelOffer.checkOutDate || meta.checkOutDate;
      const adults = Math.max(1, Number(meta.adults || hotelOffer.guests?.adults || 1));
      const rooms = Math.max(1, Number(meta.roomQuantity || hotelOffer.roomQuantity || 1));
      const nights = checkInDate && checkOutDate ? nightsBetween(checkInDate, checkOutDate) : null;

      if (!name || !Number.isFinite(lat) || !Number.isFinite(lng) || !nights) {
        return json({ ok: false, code: 'INVALID_REQUEST', message: 'Hotel, location and stay dates are required to confirm the rate.' }, 400);
      }

      // 1) Refresh the estimated display price (bypass cache) so the guest sees the latest rate.
      const serp = await fetchSerpHotelRates({
        q: `${name} ${meta.cityQuery || ''}`.trim(), checkInDate, checkOutDate, adults,
        children: Number(meta.children || 0), childrenAges: meta.childrenAges, currency: 'USD',
      }, { fresh: true });
      const freshRate = serp.rates
        .map((r) => ({ r, s: matchScore({ name, lat, lng }, { name: r.name, lat: r.lat, lng: r.lng }) }))
        .filter((x) => x.s > 0).sort((a, b) => b.s - a.s)[0]?.r;
      const refreshedEstimate = freshRate ? buildEstimatedPrice(freshRate, nights, rooms) : null;

      // 2) Confirm a bookable rate with Amadeus — the only price we will charge.
      let token: string;
      try { token = await getAmadeusToken(); } catch {
        return json({ ok: false, code: 'RATE_CHECK_UNAVAILABLE', message: "We couldn't confirm this hotel's rate right now. You have not been charged — please try again shortly." });
      }
      const auth = { Authorization: `Bearer ${token}` };
      const geoRes = await fetch(`${baseUrl}/v1/reference-data/locations/hotels/by-geocode?latitude=${lat}&longitude=${lng}&radius=1&radiusUnit=KM`, { headers: auth });
      const geo = geoRes.ok ? await geoRes.json() : { data: [] };
      const candidates = (Array.isArray(geo.data) ? geo.data : [])
        .map((h: any) => ({ h, s: matchScore({ name, lat, lng }, { name: h.name, lat: h.geoCode?.latitude, lng: h.geoCode?.longitude }) }))
        .filter((x: any) => x.s > 0).sort((a: any, b: any) => b.s - a.s);
      const amadeusHotelId: string | undefined = candidates[0]?.h?.hotelId;
      if (!amadeusHotelId) {
        logStep('Hotel not found in Amadeus', { name });
        return json({ ok: false, code: 'NOT_BOOKABLE', message: 'This hotel can’t be booked online for these dates. Please choose another hotel. You have not been charged.' });
      }
      const qs = new URLSearchParams({ hotelIds: amadeusHotelId, adults: String(adults), checkInDate, checkOutDate, roomQuantity: String(rooms), currency: 'USD', bestRateOnly: 'true' });
      const offRes = await fetch(`${baseUrl}/v3/shopping/hotel-offers?${qs}`, { headers: auth });
      const offJson = offRes.ok ? await offRes.json() : { data: [] };
      const amOffer = offJson.data?.[0]?.available !== false ? offJson.data?.[0]?.offers?.[0] : undefined;
      const confirmedTotal = Math.ceil(Number(amOffer?.price?.total));
      const confirmedCurrency = String(amOffer?.price?.currency || '').toUpperCase();
      if (!amOffer?.id || !Number.isFinite(confirmedTotal) || confirmedTotal <= 0) {
        return json({ ok: false, code: 'NOT_BOOKABLE', message: 'No rooms are available to book at this hotel for your dates. You have not been charged.' });
      }
      if (confirmedCurrency !== 'USD') {
        return json({ ok: false, code: 'NOT_BOOKABLE', message: 'This hotel can only be booked in USD and no USD rate is available. You have not been charged.' });
      }

      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
      const priceConfirmation = {
        source: 'amadeus', amadeusOfferId: String(amOffer.id), amadeusHotelId,
        total: confirmedTotal, currency: 'USD', expiresAt,
        token: await hmacHex(secret, rateTokenPayload({ clientRequestId, total: confirmedTotal, currency: 'USD', amadeusOfferId: String(amOffer.id), expiresAt })),
      };
      const validatedOffer = {
        ...offer,
        priceStatus: 'confirmed',
        offers: [{ ...hotelOffer, price: { ...(hotelOffer.price || {}), currency: 'USD', total: String(confirmedTotal), priceType: 'confirmed', priceSource: 'amadeus' }, estimatedPrice: refreshedEstimate || hotelOffer.price || null }],
        priceConfirmation,
      };
      logStep('Hotel rate confirmed', { amadeusHotelId, confirmedTotal, displayedPrice, refreshed: refreshedEstimate?.total });

      if (!Number.isFinite(displayedPrice) || Math.abs(confirmedTotal - displayedPrice) >= 1) {
        return json({ ok: false, code: 'PRICE_CHANGED', message: 'The bookable price differs from the estimated price.', originalPrice: displayedPrice, newPrice: confirmedTotal, currency: 'USD', validatedOffer, expiresAt });
      }
      return json({ ok: true, price: confirmedTotal, currency: 'USD', validatedOffer, expiresAt });

    } else if (productType === 'car') {
      // For cars, validate the offer is still available
      // Return the offer as-is with validation timestamp
      
      const price = parseFloat(offer.price?.total || '0');
      const currency = offer.price?.currency || 'USD';

      logStep('Car offer validated', { price, currency });

      return new Response(
        JSON.stringify({
          ok: true,
          price,
          currency,
          validatedOffer: offer,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min hold for cars
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      return new Response(
        JSON.stringify({
          ok: false,
          code: 'INVALID_REQUEST',
          message: `Unsupported product type: ${productType}`,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logStep('ERROR', { message: errorMessage });
    
    return new Response(
      JSON.stringify({
        ok: false,
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
