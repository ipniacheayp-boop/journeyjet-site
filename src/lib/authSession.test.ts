import { describe, expect, it, vi } from "vitest";
import type { Session, User } from "@supabase/supabase-js";
import { isDuplicateRegistration, isEmailVerified, safeAuthNext, validateStoredSession } from "./authSession";

const user = { id: "test-user", email_confirmed_at: "2026-11-10T00:00:00Z" } as User;
const session = { user, access_token: "test-only", expires_at: 1 } as Session;
const client = (verified: User | null, error: unknown = null) => ({
  getSession: vi.fn(async () => ({ data: { session }, error: null })),
  getUser: vi.fn(async () => ({ data: { user: verified }, error })),
  signOut: vi.fn(async () => ({})),
});

describe("authentication session rules", () => {
  it("retains a stored session after the server verifies its user", async () => {
    const auth = client(user);
    expect((await validateStoredSession(auth))?.user.id).toBe("test-user");
    expect(auth.getUser).toHaveBeenCalledOnce();
    expect(auth.signOut).not.toHaveBeenCalled();
  });
  it("clears invalid or expired unrefreshable credentials locally", async () => {
    const auth = client(null, new Error("invalid token"));
    expect(await validateStoredSession(auth)).toBeNull();
    expect(auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });
  it("rejects a stored session belonging to a different user", async () => {
    expect(await validateStoredSession(client({ ...user, id: "other-user" }))).toBeNull();
  });
  it("does not authenticate a signed-out visitor", async () => {
    const auth = client(user);
    auth.getSession.mockResolvedValueOnce({ data: { session: null as unknown as Session }, error: null });
    expect(await validateStoredSession(auth)).toBeNull();
    expect(auth.getUser).not.toHaveBeenCalled();
  });
  it("recognizes Auth-confirmed email even when the profile flag is stale", () => {
    expect(isEmailVerified(user, false)).toBe(true);
    expect(isEmailVerified({ email_confirmed_at: undefined }, false)).toBe(false);
  });
  it("handles the provider's duplicate signup response without creating a signed-in account", () => {
    expect(isDuplicateRegistration({ identities: [] }, null)).toBe(true);
    expect(isDuplicateRegistration({ identities: [{ id: "new" }] }, null)).toBe(false);
  });
  it("rejects external destinations and authentication redirect loops", () => {
    for (const value of ["https://example.com", "//example.com", "/\\example.com", "/auth/verify-email?next=/account", "/auth/signin"]) expect(safeAuthNext(value)).toBe("/account");
    expect(safeAuthNext("/my-bookings?tab=upcoming")).toBe("/my-bookings?tab=upcoming");
  });
});