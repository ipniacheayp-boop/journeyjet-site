/// <reference path="../flights-search/deno-shim.d.ts" />
// Receives Duffel order webhooks (order.created / order.updated / order.cancelled /
// airline-initiated changes) and keeps the local booking in sync.
// @ts-expect-error TS2307 — Supabase Edge Functions run on Deno, not Vite.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-expect-error TS2307 — Deno remote import.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, x-duffel-signature",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

type Any = Record<string, any>;

/** Duffel signs webhooks as `t=<unix>,v1=<hex hmac sha256 of "t.body">`. */
async function signatureValid(header: string | null, rawBody: string, secret: string): Promise<boolean> {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((kv) => {
      const [k, v] = kv.split("=");
      return [k?.trim(), v?.trim()];
    }),
  ) as Record<string, string>;

  const t = parts["t"];
  const v1 = parts["v1"];
  if (!t || !v1) return false;

  // Reject replays older than 5 minutes.
  const ts = Number(t) * 1000;
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > 5 * 60 * 1000) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${t}.${rawBody}`));
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (expected.length !== v1.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ v1.charCodeAt(i);
  return diff === 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const rawBody = await req.text();
  const secret = Deno.env.get("DUFFEL_WEBHOOK_SECRET");

  if (secret) {
    const valid = await signatureValid(req.headers.get("x-duffel-signature"), rawBody, secret);
    if (!valid) {
      console.error("duffel-webhook rejected: invalid signature");
      return json({ error: "Invalid signature" }, 401);
    }
  } else {
    console.warn("duffel-webhook: DUFFEL_WEBHOOK_SECRET not set — signature not verified");
  }

  let event: Any = {};
  try {
    event = JSON.parse(rawBody);
  } catch {
    return json({ error: "Invalid payload" }, 400);
  }

  const eventId = String(event?.id ?? "");
  const eventType = String(event?.type ?? "");
  const order = (event?.data?.object ?? event?.data ?? {}) as Any;

  if (!eventId || !eventType) return json({ error: "Invalid payload" }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  try {
    // Idempotency — ignore replays of an event we already handled.
    const { data: seen } = await supabase
      .from("webhook_events")
      .select("id, processed")
      .eq("event_id", eventId)
      .maybeSingle();

    if (seen?.processed) return json({ received: true, duplicate: true });

    if (!seen) {
      await supabase.from("webhook_events").insert({
        event_id: eventId,
        event_type: eventType,
        provider: "duffel",
        payload: event,
        processed: false,
      });
    }

    const orderId = String(order?.id ?? "");

    if (orderId.startsWith("ord_")) {
      const patch: Any = {};

      if (eventType === "order.created" || eventType === "order.updated") {
        patch.status = "confirmed";
        patch.payment_status = "paid";
        patch.duffel_booking_reference = order.booking_reference ?? null;
        patch.amadeus_pnr = order.booking_reference ?? null;
        if (order.cancelled_at) {
          patch.status = "cancelled";
          patch.refund_status = "pending";
        }
      } else if (eventType === "order.cancelled") {
        patch.status = "cancelled";
        patch.refund_status = "pending";
        patch.refund_reason = "Cancelled by airline or traveller";
      } else if (eventType.startsWith("order.airline_initiated_change")) {
        patch.status = "confirmed";
        patch.refund_reason = null;
      }

      if (Object.keys(patch).length > 0) {
        const { error } = await supabase.from("bookings").update(patch).eq("duffel_order_id", orderId);
        if (error) console.error("[Internal Error] webhook booking update failed", error.message);
      }
    }

    await supabase
      .from("webhook_events")
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq("event_id", eventId);

    return json({ received: true });
  } catch (err) {
    console.error("duffel-webhook failure:", err instanceof Error ? err.message : err);
    return json({ error: "Webhook processing failed" }, 500);
  }
});
