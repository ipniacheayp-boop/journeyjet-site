import { getResolvedSupabaseAnonKey } from "@/integrations/supabase/client";

/**
 * Edge Functions gateway expects `Authorization: Bearer <anon JWT>` and matching `apikey`.
 * `supabase.functions.invoke()` without these headers uses fetchWithAuth and may send a **user**
 * session JWT instead; a stale session breaks calls with non-2xx / "Invalid JWT".
 *
 * Always pass these headers on public Edge calls (same resolved key as `createClient`).
 */
export function getEdgeFunctionHeaders(): Record<string, string> {
  const jwt = getResolvedSupabaseAnonKey().trim();
  if (!jwt.startsWith("eyJ")) return {};
  return {
    Authorization: `Bearer ${jwt}`,
    apikey: jwt,
  };
}
