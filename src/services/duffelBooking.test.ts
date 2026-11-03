import { beforeEach, describe, expect, it, vi } from "vitest";
const invoke = vi.hoisted(() => vi.fn());
vi.mock("@/lib/invokeSupabaseFunction", () => ({ invokeSupabaseFunction: invoke }));
import { createDuffelOrder, reconcileDuffelBooking } from "./duffelBooking";
const payload = { offerId: "off_test", passengers: [], contact: { email: "audit@example.test", phone: "+14155550123" }, paymentType: "card" as const, expectedAmount: "125.50", expectedCurrency: "USD", acceptedTerms: true, attemptId: "e0e98cba-5f03-4b7c-bb57-947157721afd" };
beforeEach(() => invoke.mockReset());
describe("payment recovery transport", () => {
  it("never automatically repeats money-moving requests on network failure", async () => {
    invoke.mockResolvedValue({ data: null, error: "timeout" });
    expect((await createDuffelOrder(payload)).code).toBe("NETWORK");
    expect(invoke).toHaveBeenCalledTimes(1);
    expect(invoke.mock.calls[0][2].noNetworkRetry).toBe(true);
  });
  it("preserves pending booking IDs for delayed airline confirmation", async () => {
    invoke.mockResolvedValue({ data: { ok: false, pending: true, bookingId: "booking-test" }, error: null });
    expect((await createDuffelOrder(payload)).bookingId).toBe("booking-test");
  });
  it("keeps amount mismatch in manual review instead of losing the response", async () => {
    invoke.mockResolvedValue({ data: { ok: false, state: "amount_mismatch", pending: true }, error: "Manual review" });
    expect((await reconcileDuffelBooking({ attemptId: payload.attemptId })).state).toBe("amount_mismatch");
  });
  it("recovers by attempt when the original order response was lost", async () => {
    invoke.mockResolvedValue({ data: { ok: true, confirmed: false, pending: true }, error: null });
    await reconcileDuffelBooking({ attemptId: payload.attemptId });
    expect(invoke.mock.calls[0][1]).toEqual({ attemptId: payload.attemptId });
  });
});