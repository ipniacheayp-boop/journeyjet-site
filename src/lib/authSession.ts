import type { Session, User } from "@supabase/supabase-js";

/** Only the Auth server, not browser storage, can establish a trusted user. */
export async function validateStoredSession(auth: {
  getSession: () => Promise<{ data: { session: Session | null }; error: unknown }>;
  getUser: () => Promise<{ data: { user: User | null }; error: unknown }>;
  signOut: (options: { scope: "local" }) => Promise<unknown>;
}): Promise<Session | null> {
  const stored = await auth.getSession();
  if (stored.error || !stored.data.session) return null;
  const verified = await auth.getUser();
  if (verified.error || !verified.data.user || verified.data.user.id !== stored.data.session.user.id) {
    await auth.signOut({ scope: "local" });
    return null;
  }
  return { ...stored.data.session, user: verified.data.user };
}

export function safeAuthNext(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020]/.test(value)) return "/account";
  const pathname = value.split(/[?#]/)[0];
  if (/^\/auth\/(signin|signup|callback|verify-email|reset-password)\/?$/.test(pathname) || ["/login", "/signup"].includes(pathname)) return "/account";
  return value;
}

export function isEmailVerified(user: Pick<User, "email_confirmed_at"> | null, profileVerified = false): boolean {
  return Boolean(user?.email_confirmed_at || profileVerified);
}

export function isDuplicateRegistration(user: { identities?: unknown[] } | null, session: unknown): boolean {
  return Boolean(user && !session && Array.isArray(user.identities) && user.identities.length === 0);
}