import { supabase } from "@/integrations/supabase/client";
import { getEdgeFunctionHeaders } from "@/lib/edgeFunctionHeaders";

/**
 * URLs to try for Edge Functions, in order:
 * 1. Same-origin `/supabase-functions/...` on localhost (Vite proxies → Supabase) — avoids CORS failures.
 * 2. Direct `https://<project>.supabase.co/functions/v1/...` — works on production and when proxy isn’t needed.
 */
function getEdgeFunctionRequestUrlCandidates(functionName: string): string[] {
  const baseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, "");
  const remote =
    baseUrl?.startsWith("http") ? `${baseUrl}/functions/v1/${encodeURIComponent(functionName)}` : "";

  const urls: string[] = [];

  if (typeof window !== "undefined" && remote) {
    const h = window.location.hostname;
    if (h === "localhost" || h === "127.0.0.1" || h === "::1") {
      urls.push(`${window.location.origin}/supabase-functions/${encodeURIComponent(functionName)}`);
    }
  }

  if (remote) urls.push(remote);

  return urls;
}

function normalizeInvokePayload<T>(
  payload: unknown,
  invokeErr: { message: string; name?: string } | null,
  functionName: string,
): { data: T | null; error: string | null } {
  const obj = payload as { error?: string; details?: string; data?: unknown } | null;

  if (invokeErr) {
    let msg =
      obj?.error != null ? String(obj.error) + (obj.details ? `: ${obj.details}` : "") : invokeErr.message;

    if (
      invokeErr.message === "Failed to send a request to the Edge Function" ||
      invokeErr.name === "FunctionsFetchError"
    ) {
      msg =
        `Could not reach Edge Function "${functionName}". ` +
        `Deploy: supabase functions deploy ${functionName}. ` +
        `Confirm VITE_SUPABASE_URL and anon JWT in .env, restart the dev server, and use http://localhost:8080 so the Vite proxy can forward requests.`;
    } else if (
      invokeErr.message === "Edge Function returned a non-2xx status code" ||
      invokeErr.name === "FunctionsHttpError"
    ) {
      msg =
        `Edge Function "${functionName}" returned an error (e.g. 401/404/503). ` +
        `Deploy: supabase functions deploy ${functionName}. ` +
        `For flights-search, set AMADEUS_API_KEY and AMADEUS_API_SECRET in Supabase → Edge Function secrets.`;
      if (obj?.error) msg = `${msg} Response: ${obj.error}${obj.details ? ` — ${obj.details}` : ""}.`;
    }

    return { data: null, error: msg };
  }

  if (obj?.error && obj.data === undefined) {
    return { data: null, error: obj.details ? `${obj.error}: ${obj.details}` : String(obj.error) };
  }

  return { data: payload as T, error: null };
}

/**
 * Calls Edge Functions: tries fetch for each URL candidate (localhost proxy first), then
 * `supabase.functions.invoke` if every fetch throws (network/CORS).
 */
export async function invokeSupabaseFunction<T = unknown>(
  functionName: string,
  /** Plain JSON body (flight/hotel search params, etc.). Use `object` so typed interfaces stay assignable. */
  body: object,
): Promise<{ data: T | null; error: string | null }> {
  const baseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, "");
  const headers = getEdgeFunctionHeaders();

  if (!baseUrl?.startsWith("http")) {
    return { data: null, error: "VITE_SUPABASE_URL is missing or invalid." };
  }
  if (!headers.Authorization) {
    return {
      data: null,
      error: "Missing anon JWT: add VITE_SUPABASE_ANON_KEY (eyJ…) from Supabase → Settings → API.",
    };
  }

  const urlCandidates = getEdgeFunctionRequestUrlCandidates(functionName);
  if (urlCandidates.length === 0) {
    return { data: null, error: "VITE_SUPABASE_URL is missing or invalid." };
  }

  const parseHttpResponse = async (res: Response): Promise<{ data: T | null; error: string | null }> => {
    const text = await res.text();
    let parsed: unknown = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      if (res.status === 404) {
        return {
          data: null,
          error: `Edge Function "${functionName}" not found (404). Deploy it: supabase functions deploy ${functionName} — https://supabase.com/docs/guides/functions/deploy`,
        };
      }
      return { data: null, error: text?.slice(0, 240) || `HTTP ${res.status}` };
    }

    if (!res.ok) {
      if (res.status === 404) {
        return {
          data: null,
          error: `Edge Function "${functionName}" not found (404). Deploy it: supabase functions deploy ${functionName} — https://supabase.com/docs/guides/functions/deploy`,
        };
      }
      const errObj = parsed as { error?: string; details?: string } | null;
      const msg = errObj?.error || `Request failed (${res.status})`;
      const details = errObj?.details ? `: ${errObj.details}` : "";
      return { data: null, error: msg + details };
    }

    const errObj = parsed as {
      error?: string;
      details?: string;
      data?: unknown;
    } | null;
    if (errObj && typeof errObj.error === "string" && errObj.data === undefined && !("data" in (errObj as object))) {
      return { data: null, error: errObj.details ? `${errObj.error}: ${errObj.details}` : errObj.error };
    }

    return { data: parsed as T, error: null };
  };

  const init: RequestInit = {
    method: "POST",
    mode: "cors",
    credentials: "omit",
    cache: "no-store",
    headers: {
      ...headers,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  };

  let usedInvokeFallback = false;

  for (const url of urlCandidates) {
    try {
      const res = await fetch(url, init);
      return await parseHttpResponse(res);
    } catch {
      continue;
    }
  }

  usedInvokeFallback = true;

  const { data, error: invokeErr } = await supabase.functions.invoke(functionName, {
    body,
    headers: getEdgeFunctionHeaders(),
  });

  const result = normalizeInvokePayload<T>(data, invokeErr, functionName);

  if (result.error && usedInvokeFallback && import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn(
      "[invokeSupabaseFunction] All fetch URLs failed; used supabase.functions.invoke fallback.",
      urlCandidates,
    );
  }

  return result;
}
