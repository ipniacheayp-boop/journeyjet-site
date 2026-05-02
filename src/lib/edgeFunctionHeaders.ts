/**
 * Edge Functions receive `Authorization: Bearer <jwt>` from fetchWithAuth, which prefers
 * the **current auth session** token over the anon key. A stale or broken session then breaks
 * every `functions.invoke` call (often surfaced as FunctionsFetchError).
 *
 * Pass these headers on public Edge calls so the gateway always gets the project anon JWT +
 * api key (see Supabase docs: publishable key in `apikey`, JWT in `Authorization`).
 */
export function getEdgeFunctionHeaders(): Record<string, string> {
  const jwt = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  const apiKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    jwt ||
    '';
  if (!jwt?.startsWith('eyJ') || !apiKey) return {};
  return {
    Authorization: `Bearer ${jwt}`,
    apikey: apiKey,
  };
}
