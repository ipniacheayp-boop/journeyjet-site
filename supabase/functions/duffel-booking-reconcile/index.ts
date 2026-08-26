/// <reference path="../flights-search/deno-shim.d.ts" />
// Reconciles an uncertain Tripile flight booking against Duffel's authoritative order state.
// @ts-expect-error Deno remote import.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-expect-error Deno remote import.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders, duffelFetch, json } from "../_shared/duffel.ts";
import { amountsMatch, getDuffelBookingState } from "../_shared/duffelBookingState.ts";

type Any = Record<string, any>;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function summary(order: Any) {
  return {
    id: order?.id ?? null,
    booking_reference: order?.booking_reference ?? null,
    total_amount: order?.total_amount ?? null,
    total_currency: order?.total_currency ?? null,
    live_mode: order?.live_mode ?? null,
    created_at: order?.created_at ?? null,
    owner: order?.owner ? { name: order.owner.name ?? null, iata_code: order.owner.iata_code ?? null } : null,
    passengers: (Array.isArray(order?.passengers) ? order.passengers : []).map((p: Any) => ({
      id: p?.id ?? null, given_name: p?.given_name ?? null, family_name: p?.family_name ?? null,
    })),
    documents: (Array.isArray(order?.documents) ? order.documents : []).map((d: Any) => ({
      type: d?.type ?? null, unique_identifier: d?.unique_identifier ?? null,
    })),
    slices: (Array.isArray(order?.slices) ? order.slices : []).map((slice: Any) => ({
      origin: slice?.origin?.iata_code ?? null,
      destination: slice?.destination?.iata_code ?? null,
      segments: (Array.isArray(slice?.segments) ? slice.segments : []).map((segment: Any) => ({
        departing_at: segment?.departing_at ?? null,
        arriving_at: segment?.arriving_at ?? null,
        origin: segment?.origin?.iata_code ?? null,
        destination: segment?.destination?.iata_code ?? null,
        marketing_carrier: segment?.marketing_carrier?.iata_code ?? null,
        flight_number: segment?.marketing_carrier_flight_number ?? null,
      })),
    })),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

  const body = (await req.json().catch(() => ({}))) as Any;
  const bookingId = String(body.bookingId ?? "");
  const attemptId = String(body.attemptId ?? "");
  if (!UUID.test(bookingId) || (attemptId && !UUID.test(attemptId))) {
    return json({ ok: false, error: "Invalid reconciliation request" }, 400);
  }

  const admin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
  const { data: booking } = await admin.from("bookings").select(
    "id,user_id,status,payment_status,payment_provider,amount,currency,duffel_attempt_id,duffel_order_id,duffel_offer_id,duffel_booking_reference,booking_details",
  ).eq("id", bookingId).eq("booking_type", "flight").maybeSingle();

  if (!booking || !String(booking.payment_provider ?? "").startsWith("duffel_")) {
    return json({ ok: false, error: "Booking not found" }, 404);
  }

  let authorised = Boolean(attemptId && booking.duffel_attempt_id === attemptId);
  const authHeader = req.headers.get("Authorization");
  if (!authorised && authHeader?.startsWith("Bearer ")) {
    const { data } = await admin.auth.getUser(authHeader.slice(7));
    authorised = Boolean(data.user?.id && data.user.id === booking.user_id);
    if (!authorised && data.user?.id) {
      const { data: isAdmin } = await admin.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
      authorised = isAdmin === true;
    }
  }
  if (!authorised) return json({ ok: false, error: "Not authorised" }, 403);

  let order: Any | null = null;
  if (booking.duffel_order_id) {
    const result = await duffelFetch<Any>(`/air/orders/${encodeURIComponent(booking.duffel_order_id)}`, { timeoutMs: 45_000 });
    if (result.ok) order = result.data;
    else if (result.status >= 500 || result.status === 429) {
      return json({ ok: true, bookingId, state: "unknown", pending: true, message: "We are still verifying the airline booking." }, 202);
    }
  } else {
    // Recover a lost create-order response by locating the order via metadata.booking_id.
    const result = await duffelFetch<Any[]>("/air/orders?limit=100", { timeoutMs: 45_000 });
    const orders = Array.isArray(result.data) ? result.data : [];
    order = orders.find((item: Any) => String(item?.metadata?.booking_id ?? "") === bookingId) ?? null;
  }

  if (!order?.id) {
    await admin.from("bookings").update({ payment_status: "unknown" }).eq("id", bookingId)
      .in("payment_status", ["processing", "payment_pending", "unknown"]);
    return json({ ok: true, bookingId, state: "unknown", pending: true, message: "We are still verifying the airline booking." }, 202);
  }

  if (!amountsMatch(order, booking.amount, booking.currency)) {
    await admin.from("bookings").update({ payment_status: "amount_mismatch" }).eq("id", bookingId);
    return json({ ok: false, bookingId, state: "amount_mismatch", error: "The airline order amount requires manual review." }, 409);
  }

  const state = getDuffelBookingState(order);
  const existingDetails = (booking.booking_details ?? {}) as Any;
  const patch: Any = {
    status: state.bookingStatus,
    payment_status: state.paymentStatus,
    duffel_order_id: order.id,
    duffel_booking_reference: order.booking_reference ?? booking.duffel_booking_reference,
    transaction_id: order.id,
    booking_details: { ...existingDetails, duffel_order: summary(order), reconciliation: { checked_at: new Date().toISOString() } },
  };
  if (state.confirmed) {
    patch.confirmed_at = booking.status === "confirmed" ? undefined : new Date().toISOString();
    patch.ticket_issued_at = Array.isArray(order.documents) && order.documents.length > 0 ? new Date().toISOString() : null;
  }

  // Never revive terminal local states without an explicit operations review.
  if (["cancelled", "refunded"].includes(String(booking.status)) && state.confirmed) {
    return json({ ok: true, bookingId, state: "manual_review", pending: true, message: "This booking requires manual review." }, 202);
  }

  await admin.from("bookings").update(patch).eq("id", bookingId);
  return json({
    ok: true,
    bookingId,
    state: state.paymentStatus,
    pending: !state.terminal,
    confirmed: state.confirmed,
    bookingReference: order.booking_reference ?? null,
    order: summary(order),
  }, state.terminal ? 200 : 202);
});