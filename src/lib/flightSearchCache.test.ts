import { afterEach, describe, expect, it, vi } from "vitest";
import { clearFlightSearchCache, getCachedFlightSearch, setCachedFlightSearch } from "./flightSearchCache";
import type { DuffelOffer } from "@/types/duffel";
afterEach(() => { clearFlightSearchCache(); vi.restoreAllMocks(); });
describe("cached search availability", () => {
  it("removes offers that expired after they were cached", () => {
    vi.spyOn(Date, "now").mockReturnValue(1000);
    setCachedFlightSearch("route", { offers: [{ id: "off_live", expires_at: new Date(11000).toISOString() } as DuffelOffer], error: null });
    expect(getCachedFlightSearch("route")?.offers.length).toBe(1);
    vi.spyOn(Date, "now").mockReturnValue(12000);
    expect(getCachedFlightSearch("route")).toBeNull();
  });
});