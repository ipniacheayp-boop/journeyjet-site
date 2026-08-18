/// <reference path="../flights-search/deno-shim.d.ts" />
// Production flight order creation.
// 1. Revalidates the selected Duffel offer (price + availability + expiry)
// 2. Records a provisional booking row
// 3. Creates the Duffel order with a card / 3DS-authenticated payment (or balance)
// 4. Stores the airline PNR and triggers the confirmation email
// @ts-expect-error TS2307 — Supabase Edge Functions run on Deno, not Vite.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-expect-error TS2307 — Deno remote import.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders, duffelFetch, isLiveMode, json, travellerFacingError } from "../_shared/duffel.ts";

type Any = Record<string, any>;

const OFFER_ID = /^off_[A-Za-z0-9_-]{5,80}$/;
const PASSENGER_ID = /^pas_[A-Za-z0-9_-]{5,80}$/;
const CARD_ID = /^tcd_[A-Za-z0-9_-]{5,80}$/;
const TDS_ID = /^3ds_[A-Za-z0-9_-]{5,80}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+[1-9]\d{6,14}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const NAME = /^[A-Za-z][A-Za-z\s'’-]{0,49}$/;

const TITLES = ["mr", "ms", "mrs", "miss", "dr"];
const GENDERS = ["m", "f"];

interface PassengerInput {
  id: string;
  title: string;
  given_name: string;
  family_name: string;
  born_on: string;
  gender: string;
  email: string;
  phone_number: string;
  identity_document?: {
    unique_identifier: string;
    expires_on: string;
    issuing_country_code: string;
    nationality: string;
  };
}

function validatePassengers(raw: unknown, requireDocs: boolean): { ok: true; passengers: PassengerInput[] } | { ok: false; message: string } {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 9) {
    return { ok: false, message: "Please provide details for between 1 and 9 travellers." };
  }

  const passengers: PassengerInput[] = [];

  for (const [i, p] of (raw as Any[]).entries()) {
    const label = `Traveller ${i + 1}`;
    if (!PASSENGER_ID.test(String(p?.id ?? ""))) {
      return { ok: false, message: "That flight selection is no longer valid. Please search again." };
    }
    if (!TITLES.includes(String(p?.title ?? "").toLowerCase())) {
      return { ok: false, message: `${label}: please select a title.` };
    }
    if (!NAME.test(String(p?.given_name ?? "").trim())) {
      return { ok: false, message: `${label}: please enter a valid first name as shown on the passport.` };
    }
    if (!NAME.test(String(p?.family_name ?? "").trim())) {
      return { ok: false, message: `${label}: please enter a valid last name as shown on the passport.` };
    }
    if (!DATE.test(String(p?.born_on ?? "")) || new Date(p.born_on) > new Date()) {
      return { ok: false, message: `${label}: please enter a valid date of birth.` };
    }
    if (!GENDERS.includes(String(p?.gender ?? "").toLowerCase())) {
      return { ok: false, message: `${label}: please select a gender as shown on the passport.` };
    }
    if (!EMAIL.test(String(p?.email ?? "")) || String(p.email).length > 254) {
      return { ok: false, message: `${label}: please enter a valid email address.` };
    }
    if (!PHONE.test(String(p?.phone_number ?? ""))) {
      return { ok: false, message: `${label}: please enter a phone number in international format, e.g. +14155550123.` };
    }

    const doc = p?.identity_document as Any | undefined;
    if (requireDocs) {
      if (!doc || !/^[A-Za-z0-9]{5,20}$/.test(String(doc.unique_identifier ?? ""))) {
        return { ok: false, message: `${label}: please enter a valid passport number.` };
      }
      if (!DATE.test(String(doc.expires_on ?? "")) || new Date(doc.expires_on) < new Date()) {
        return { ok: false, message: `${label}: the passport expiry date must be in the future.` };
      }
      if (!/^[A-Z]{2}$/.test(String(doc.issuing_country_code ?? ""))) {
        return { ok: false, message: `${label}: please select the passport issuing country.` };
      }
      if (!/^[A-Z]{2}$/.test(String(doc.nationality ?? ""))) {
        return { ok: false, message: `${label}: please select a nationality.` };
      }
    }

    passengers.push({
      id: String(p.id),
      title: String(p.title).toLowerCase(),
      given_name: String(p.given_name).trim(),
      family_name: String(p.family_name).trim(),
      born_on: String(p.born_on),
      gender: String(p.gender).toLowerCase(),
      email: String(p.email).trim(),
      phone_number: String(p.phone_number).trim(),
      ...(doc && doc.unique_identifier
        ? {
            identity_document: {
              unique_identifier: String(doc.unique_identifier).toUpperCase(),
              expires_on: String(doc.expires_on),
              issuing_country_code: String(doc.issuing_country_code).toUpperCase(),
              nationality: String(doc.nationality).toUpperCase(),
            },
          }
        : {}),
    });
  }

  return { ok: true, passengers };
}

function summariseOrder(order: Any) {
  const slices = Array.isArray(order?.slices) ? order.slices : [];
  return {
    id: order?.id ?? null,
    booking_reference: order?.booking_reference ?? null,
    total_amount: order?.total_amount ?? null,
    total_currency: order?.total_currency ?? null,
    live_mode: order?.live_mode ?? null,
    created_at: order?.created_at ?? null,
    owner: order?.owner ? { name: order.owner.name ?? null, iata_code: order.owner.iata_code ?? null } : null,
    passengers: (Array.isArray(order?.passengers) ? order.passengers : []).map((p: Any) => ({
      id: p?.id ?? null,
      given_name: p?.given_name ?? null,
      family_name: p?.family_name ?? null,
    })),
    documents: (Array.isArray(order?.documents) ? order.documents : []).map((d: Any) => ({
      type: d?.type ?? null,
      unique_identifier: d?.unique_identifier ?? null,
    })),
    slices: slices.map((s: Any) => ({
      origin: s?.origin?.iata_code ?? null,
      destination: s?.destination?.iata_code ?? null,
      segments: (Array.isArray(s?.segments) ? s.segments : []).map((seg: Any) => ({
        departing_at: seg?.departing_at ?? null,
        arriving_at: seg?.arriving_at ?? null,
        origin: seg?.origin?.iata_code ?? null,
        destination: seg?.destination?.iata_code ?? null,
        marketing_carrier: seg?.marketing_carrier?.iata_code ?? null,
        flight_number: seg?.marketing_carrier_flight_number ?? null,
      })),
    })),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  let bookingId: string | null = null;

  try {
    const body = (await req.json().catch(() => ({}))) as Any;
    const offerId = String(body?.offerId ?? "").trim();

    if (!OFFER_ID.test(offerId)) {
      return json({ ok: false, code: "INVALID_OFFER", message: "That flight selection is no longer valid. Please search again." }, 200);
    }
    if (body?.acceptedTerms !== true) {
      return json({ ok: false, code: "TERMS_REQUIRED", message: "Please accept the Terms & Conditions and fare rules to continue." }, 200);
    }

    const contactEmail = String(body?.contact?.email ?? "").trim();
    const contactPhone = String(body?.contact?.phone ?? "").trim();
    if (!EMAIL.test(contactEmail)) {
      return json({ ok: false, code: "INVALID_CONTACT", message: "Please enter a valid contact email address." }, 200);
    }
    if (!PHONE.test(contactPhone)) {
      return json({ ok: false, code: "INVALID_CONTACT", message: "Please enter a contact phone number in international format, e.g. +14155550123." }, 200);
    }

    const paymentType = body?.paymentType === "balance" ? "balance" : "card";
    const cardId = String(body?.cardId ?? "");
    const tdsId = String(body?.threeDSecureSessionId ?? "");

    if (paymentType === "card" && !TDS_ID.test(tdsId) && !CARD_ID.test(cardId)) {
      return json({ ok: false, code: "PAYMENT_REQUIRED", message: "Please enter your card details to complete the booking." }, 200);
    }

    // ── 1. Revalidate the offer straight from Duffel (price, availability, expiry) ──
    const offerRes = await duffelFetch<Any>(`/air/offers/${encodeURIComponent(offerId)}?return_available_services=false`);

    if (!offerRes.ok || !offerRes.data) {
      const expired = offerRes.status === 404 || offerRes.status === 410;
      console.error("duffel-order-create revalidate failed", offerRes.status, JSON.stringify(offerRes.errors).slice(0, 300));
      return json(
        {
          ok: false,
          code: expired ? "OFFER_EXPIRED" : "OFFER_UNAVAILABLE",
          message: expired
            ? "This fare has expired. Please search again to see current prices."
            : "This fare is no longer available. Please search again to see current prices.",
        },
        200,
      );
    }

    const offer = offerRes.data;
    const amount = String(offer.total_amount);
    const currency = String(offer.total_currency);
    const expiresAt = offer.expires_at ? new Date(offer.expires_at) : null;

    if (expiresAt && expiresAt.getTime() <= Date.now()) {
      return json({ ok: false, code: "OFFER_EXPIRED", message: "This fare has expired. Please search again to see current prices." }, 200);
    }

    // Price change guard — the traveller must re-confirm before we charge anything.
    const expected = body?.expectedAmount !== undefined ? String(body.expectedAmount) : null;
    if (expected && Number(expected) !== Number(amount)) {
      return json(
        {
          ok: false,
          code: "PRICE_CHANGED",
          message: "The price of this flight has changed. Please review and confirm the new price.",
          originalPrice: Number(expected),
          newPrice: Number(amount),
          currency,
        },
        200,
      );
    }

    // Domestic itineraries (every airport in one country) don't collect passport data.
    const countries = new Set<string>();
    let missingCountry = false;
    for (const slice of (Array.isArray(offer.slices) ? offer.slices : []) as Any[]) {
      const places: Any[] = [slice?.origin, slice?.destination];
      for (const seg of (Array.isArray(slice?.segments) ? slice.segments : []) as Any[]) {
        places.push(seg?.origin, seg?.destination);
      }
      for (const pl of places) {
        const c = String(pl?.iata_country_code ?? "").toUpperCase();
        if (/^[A-Z]{2}$/.test(c)) countries.add(c);
        else missingCountry = true;
      }
    }
    const isDomestic = !missingCountry && countries.size === 1;

    const requireDocs = offer.passenger_identity_documents_required === true && !isDomestic;
    const offerPassengerIds = (Array.isArray(offer.passengers) ? offer.passengers : []).map((p: Any) => p.id);

    const validated = validatePassengers(body?.passengers, requireDocs);
    if (!validated.ok) {
      return json({ ok: false, code: "VALIDATION_ERROR", message: validated.message }, 200);
    }
    const passengers = validated.passengers;

    if (passengers.length !== offerPassengerIds.length ||
        passengers.some((p) => !offerPassengerIds.includes(p.id))) {
      return json({ ok: false, code: "INVALID_OFFER", message: "Traveller details don't match this fare. Please search again." }, 200);
    }

    // ── 2. Identify the user (guest checkout allowed) ──
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const { data } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = data?.user?.id ?? null;
    }

    // ── 3. Provisional booking row (idempotent per offer) ──
    const { data: existing } = await supabase
      .from("bookings")
      .select("id, status, duffel_order_id, duffel_booking_reference, booking_details")
      .eq("duffel_offer_id", offerId)
      .eq("status", "confirmed")
      .maybeSingle();

    if (existing?.duffel_order_id) {
      return json({
        ok: true,
        alreadyBooked: true,
        bookingId: existing.id,
        orderId: existing.duffel_order_id,
        bookingReference: existing.duffel_booking_reference,
        order: (existing.booking_details as Any)?.duffel_order ?? null,
      });
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        user_id: userId,
        agent_id: typeof body?.agentId === "string" ? body.agentId : null,
        booking_type: "flight",
        status: "pending_payment",
        payment_status: "processing",
        payment_provider: paymentType === "balance" ? "duffel_balance" : "duffel_card",
        duffel_offer_id: offerId,
        live_mode: isLiveMode(),
        booking_details: { provider: "duffel", offer, passengers: passengers.map((p) => ({ ...p, identity_document: undefined })) },
        amount: Number(amount),
        currency,
        contact_email: contactEmail,
        contact_name: `${passengers[0].given_name} ${passengers[0].family_name}`.trim(),
        contact_phone: contactPhone,
      })
      .select("id")
      .single();

    if (bookingError || !booking) {
      console.error("[Internal Error] provisional booking insert failed", bookingError?.message);
      return json({ ok: false, code: "BOOKING_ERROR", message: "We couldn't start your booking. Please try again." }, 200);
    }
    bookingId = booking.id;

    // ── 4. Create the order with payment ──
    const payment: Any =
      paymentType === "balance"
        ? { type: "balance", amount, currency }
        : TDS_ID.test(tdsId)
          ? { type: "card", amount, currency, three_d_secure_session_id: tdsId }
          : { type: "card", amount, currency, card_id: cardId };

    const orderRes = await duffelFetch<Any>("/air/orders", {
      method: "POST",
      body: {
        data: {
          type: "instant",
          selected_offers: [offerId],
          passengers,
          payments: [payment],
          metadata: { booking_id: bookingId, source: "tripile.com" },
        },
      },
    });

    if (!orderRes.ok || !orderRes.data) {
      const { message, code } = travellerFacingError(orderRes.errors);
      console.error("duffel order create failed", orderRes.status, code, JSON.stringify(orderRes.errors).slice(0, 400));

      await supabase
        .from("bookings")
        .update({ status: "cancelled", payment_status: "failed" })
        .eq("id", bookingId);

      return json({ ok: false, code: code.toUpperCase(), message, bookingId }, 200);
    }

    const order = orderRes.data;
    const summary = summariseOrder(order);

    // ── 5. Persist confirmation ──
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        payment_status: "paid",
        payment_method: paymentType === "balance" ? "duffel_balance" : "card",
        duffel_order_id: order.id,
        duffel_booking_reference: order.booking_reference,
        amadeus_pnr: order.booking_reference,
        transaction_id: order.id,
        amount: Number(order.total_amount ?? amount),
        currency: String(order.total_currency ?? currency),
        confirmed_at: new Date().toISOString(),
        ticket_issued_at: new Date().toISOString(),
        booking_details: { provider: "duffel", offer, duffel_order: summary },
      })
      .eq("id", bookingId);

    if (updateError) {
      // The order exists at the airline — never fail the response over a write error.
      console.error("[Internal Error] booking confirm update failed", updateError.message, "order", order.id);
    }

    // ── 6. Confirmation email (best effort) ──
    try {
      await supabase.functions.invoke("send-booking-confirmation", {
        body: {
          bookingId,
          email: contactEmail,
          bookingReference: order.booking_reference,
          orderId: order.id,
        },
      });
    } catch (mailErr) {
      console.error("confirmation email failed", mailErr instanceof Error ? mailErr.message : mailErr);
    }

    return json({
      ok: true,
      bookingId,
      orderId: order.id,
      bookingReference: order.booking_reference,
      liveMode: order.live_mode ?? isLiveMode(),
      order: summary,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("duffel-order-create failure:", msg);

    if (bookingId) {
      await supabase.from("bookings").update({ status: "cancelled", payment_status: "failed" }).eq("id", bookingId).then(
        () => undefined,
        () => undefined,
      );
    }

    if (msg === "DUFFEL_API_KEY_MISSING") {
      return json({ ok: false, code: "UNAVAILABLE", message: "Flight booking is temporarily unavailable. Please try again shortly." }, 200);
    }

    return json(
      { ok: false, code: "BOOKING_ERROR", message: "We couldn't complete your booking. No payment was taken — please try again." },
      200,
    );
  }
});
