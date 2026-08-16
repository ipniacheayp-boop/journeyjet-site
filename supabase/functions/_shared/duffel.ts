/// <reference path="../flights-search/deno-shim.d.ts" />
// Shared Duffel API helpers for Edge Functions.
// The API key never leaves the server — it is read from the DUFFEL_API_KEY secret.

export const DUFFEL_BASE_URL = "https://api.duffel.com";
export const DUFFEL_VERSION = "v2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

export function getDuffelKey(): string {
  const key = Deno.env.get("DUFFEL_API_KEY");
  if (!key) throw new Error("DUFFEL_API_KEY_MISSING");
  return key;
}

/** true when the configured key is a production (live) key. */
export function isLiveMode(): boolean {
  try {
    return getDuffelKey().startsWith("duffel_live");
  } catch {
    return false;
  }
}

export interface DuffelResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  errors: Array<{ type?: string; title?: string; message?: string; code?: string }>;
}

export async function duffelFetch<T = Record<string, unknown>>(
  path: string,
  init: RequestInit & { body?: unknown } = {},
): Promise<DuffelResult<T>> {
  const { body, headers, ...rest } = init;

  const res = await fetch(`${DUFFEL_BASE_URL}${path}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${getDuffelKey()}`,
      "Duffel-Version": DUFFEL_VERSION,
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(headers as Record<string, string> | undefined),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  let payload: Record<string, any> | null = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  return {
    ok: res.ok,
    status: res.status,
    data: (payload?.data ?? null) as T | null,
    errors: Array.isArray(payload?.errors) ? payload!.errors : [],
  };
}

/**
 * Maps a Duffel error list to a message that is safe (and useful) to show a traveller.
 * Anything unrecognised falls back to a generic message so internals never leak.
 */
export function travellerFacingError(
  errors: DuffelResult<unknown>["errors"],
  fallback = "We couldn't complete your booking. No payment was taken — please try again.",
): { message: string; code: string } {
  const first = errors[0];
  const code = String(first?.code ?? "unknown");

  const safeCodes: Record<string, string> = {
    offer_no_longer_available:
      "This fare is no longer available. Please search again to see current prices.",
    offer_expired: "This fare has expired. Please search again to see current prices.",
    price_changed: "The price for this flight has changed. Please review the new price.",
    airline_error:
      "The airline could not confirm this booking. No payment was taken — please try another flight.",
    payment_declined:
      "Your card was declined. No payment was taken — please try a different card.",
    payment_required: "The payment could not be authorised. Please try again.",
    three_d_secure_failed:
      "We couldn't verify your card with your bank. Please try again or use another card.",
    invalid_state: "This booking can no longer be completed. Please start a new search.",
    validation_error: first?.message ?? fallback,
  };

  return { message: safeCodes[code] ?? fallback, code };
}
