/// <reference path="../flights-search/deno-shim.d.ts" />
// Mints a short-lived Duffel component client key so the browser can render the
// secure card form (and run 3DS) without ever seeing the Duffel API key.
// @ts-expect-error TS2307 — Supabase Edge Functions run on Deno, not Vite.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders, duffelFetch, isLiveMode, json } from "../_shared/duffel.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const cardId = typeof (body as any)?.cardId === "string" ? (body as any).cardId : undefined;

    // Scoping the key to a card id is required for the "use saved card" intent.
    const payload =
      cardId && /^tcd_[A-Za-z0-9_-]{5,80}$/.test(cardId) ? { card_id: cardId } : {};

    const result = await duffelFetch<{ component_client_key: string }>(
      "/identity/component_client_keys",
      { method: "POST", body: payload },
    );

    if (!result.ok || !result.data?.component_client_key) {
      console.error("duffel-client-key error", result.status, JSON.stringify(result.errors).slice(0, 300));
      return json({ error: "Card payments are temporarily unavailable. Please try again shortly." }, 200);
    }

    return json({ clientKey: result.data.component_client_key, liveMode: isLiveMode() });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("duffel-client-key failure:", msg);
    return json({ error: "Card payments are temporarily unavailable. Please try again shortly." }, 200);
  }
});
