import { supabase } from '@/integrations/supabase/client';
import { getEdgeFunctionHeaders } from '@/lib/edgeFunctionHeaders';

/** Use Vite dev/proxy same-origin URL on localhost so Edge calls are not blocked by the browser. */
function getEdgeFunctionRequestUrl(functionName: string): string {
  const baseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '');
  const remote = `${baseUrl}/functions/v1/${encodeURIComponent(functionName)}`;

  if (typeof window === 'undefined') return remote;

  const h = window.location.hostname;
  if (h === 'localhost' || h === '127.0.0.1' || h === '::1') {
    return `${window.location.origin}/supabase-functions/${encodeURIComponent(functionName)}`;
  }

  return remote;
}

function normalizeInvokePayload<T>(
  payload: unknown,
  invokeErr: { message: string } | null,
): { data: T | null; error: string | null } {
  const obj = payload as { error?: string; details?: string; data?: unknown } | null;

  if (invokeErr) {
    const serverMsg =
      obj?.error != null
        ? String(obj.error) + (obj.details ? `: ${obj.details}` : '')
        : invokeErr.message;
    return { data: null, error: serverMsg };
  }

  if (obj?.error && obj.data === undefined) {
    return { data: null, error: obj.details ? `${obj.error}: ${obj.details}` : String(obj.error) };
  }

  return { data: payload as T, error: null };
}

/**
 * Calls Edge Functions: tries direct `fetch` first (works well in Chromium), then falls back to
 * `supabase.functions.invoke` when the browser throws (Safari/WebKit often reports `Load failed`
 * on cross-origin `fetch` even though the JS client's invoke path still works).
 */
export async function invokeSupabaseFunction<T = unknown>(
  functionName: string,
  body: Record<string, unknown>,
): Promise<{ data: T | null; error: string | null }> {
  const baseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '');
  const headers = getEdgeFunctionHeaders();

  if (!baseUrl?.startsWith('http')) {
    return { data: null, error: 'VITE_SUPABASE_URL is missing or invalid.' };
  }
  if (!headers.Authorization) {
    return {
      data: null,
      error:
        'Missing anon JWT: add VITE_SUPABASE_ANON_KEY (eyJ…) from Supabase → Settings → API.',
    };
  }

  const url = getEdgeFunctionRequestUrl(functionName);

  const parseHttpResponse = async (res: Response): Promise<{ data: T | null; error: string | null }> => {
    const text = await res.text();
    let parsed: unknown = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      return { data: null, error: text?.slice(0, 240) || `HTTP ${res.status}` };
    }

    if (!res.ok) {
      const errObj = parsed as { error?: string; details?: string } | null;
      const msg = errObj?.error || `Request failed (${res.status})`;
      const details = errObj?.details ? `: ${errObj.details}` : '';
      return { data: null, error: msg + details };
    }

    const errObj = parsed as { error?: string; details?: string } | null;
    if (errObj && typeof errObj.error === 'string' && errObj.data === undefined && !('data' in (errObj as object))) {
      return { data: null, error: errObj.details ? `${errObj.error}: ${errObj.details}` : errObj.error };
    }

    return { data: parsed as T, error: null };
  };

  let usedFallback = false;

  try {
    const res = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });
    return await parseHttpResponse(res);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const isNetworkFailure =
      /load failed|failed to fetch|networkerror|network request failed|aborted/i.test(msg);

    if (!isNetworkFailure) {
      return { data: null, error: msg };
    }

    usedFallback = true;
  }

  const { data, error: invokeErr } = await supabase.functions.invoke(functionName, {
    body,
    headers: getEdgeFunctionHeaders(),
  });

  const result = normalizeInvokePayload<T>(data, invokeErr);

  if (result.error && usedFallback && import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn(
      '[invokeSupabaseFunction] Direct fetch failed; used supabase.functions.invoke fallback.',
    );
  }

  return result;
}
