import { beforeEach, describe, expect, it, vi } from "vitest";
const invoke = vi.hoisted(() => vi.fn());
vi.mock("@/lib/invokeSupabaseFunction", () => ({ invokeSupabaseFunction: invoke }));
vi.mock("@/lib/flightSearchPerf", () => ({ markFlightSearch: vi.fn() }));
import { getDuffelOffer, searchDuffelFlights } from "./duffelFlights";
import { clearFlightSearchCache } from "@/lib/flightSearchCache";
const payload = { origin: "JFK", destination: "LAX", departureDate: "2026-12-03", returnDate: null, adults: 1, children: 0, infants: 0, cabinClass: "economy" as const };
beforeEach(() => { invoke.mockReset(); clearFlightSearchCache(); });
describe("live flight request reliability", () => {
  it("shares duplicate offer requests but never caches a settled checkout price", async () => {
    invoke.mockResolvedValue({ data: { offer: { id: "off_test", total_amount: "125.50" } }, error: null });
    const [first, second] = await Promise.all([getDuffelOffer("off_test"), getDuffelOffer("off_test")]);
    expect(invoke).toHaveBeenCalledTimes(1);
    expect(first).toEqual(second);
    await getDuffelOffer("off_test");
    expect(invoke).toHaveBeenCalledTimes(2);
  });
  it("retains the actual expired-offer recovery signal", async () => {
    invoke.mockResolvedValue({ data: { error: "Fare expired", expired: true }, error: "Fare expired" });
    expect(await getDuffelOffer("off_expired")).toEqual({ offer: null, error: "Fare expired", expired: true });
  });
  it("does not let an old caller's cancellation destroy the shared search", async () => {
    const controller = new AbortController();
    invoke.mockResolvedValue({ data: { offers: [{ id: "off_live", expires_at: null }] }, error: null });
    const first = searchDuffelFlights(payload, { signal: controller.signal });
    controller.abort();
    const second = searchDuffelFlights(payload);
    expect((await first).offers.length).toBe(1);
    expect((await second).offers.length).toBe(1);
    expect(invoke).toHaveBeenCalledTimes(1);
    expect(invoke.mock.calls[0][2].signal).toBeUndefined();
  });
});