import { describe, it, expect } from "vitest";
import { isDealActive, activeDeals, formatDealRange } from "./dealExpiry";
import { mockDeals } from "@/data/mockDeals";

const now = new Date("2026-11-15T12:00:00Z");

describe("featured deal expiry", () => {
  it("hides deals whose travel ended", () => {
    expect(isDealActive({ departDate: "2025-11-15", returnDate: "2025-11-25" }, now)).toBe(false);
  });
  it("keeps deals whose travel ends today", () => {
    expect(isDealActive({ departDate: "2026-11-10", returnDate: "2026-11-15" }, now)).toBe(true);
  });
  it("keeps future travel deals", () => {
    expect(isDealActive({ departDate: "2026-12-01", returnDate: "2026-12-08" }, now)).toBe(true);
  });
  it("hides deals with a past offer expiry even if travel is future", () => {
    expect(isDealActive({ departDate: "2027-01-01", returnDate: "2027-01-08", expiresAt: "2026-11-14" }, now)).toBe(false);
  });
  it("uses UTC dates regardless of visitor timezone", () => {
    // 23:30 on Nov 15 in New York is already Nov 16 in UTC
    expect(isDealActive({ departDate: "2026-11-10", returnDate: "2026-11-15" }, new Date("2026-11-16T04:30:00Z"))).toBe(false);
  });
  it("sorts multiple active deals by departure and drops expired", () => {
    const list = activeDeals(
      [
        { departDate: "2027-02-01", returnDate: "2027-02-05" },
        { departDate: "2025-01-01", returnDate: "2025-01-05" },
        { departDate: "2026-12-01", returnDate: "2026-12-05" },
      ],
      now,
    );
    expect(list.map((d) => d.departDate)).toEqual(["2026-12-01", "2027-02-01"]);
  });
  it("returns no deals when the static list is all expired", () => {
    expect(activeDeals(mockDeals, now)).toHaveLength(0);
  });
  it("always shows the year on both dates", () => {
    expect(formatDealRange("2026-11-15", "2026-11-22")).toBe("15 Nov 2026 – 22 Nov 2026");
  });
});
