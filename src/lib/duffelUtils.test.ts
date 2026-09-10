import { describe, expect, it } from "vitest";
import { airportLocalHour, formatAirportDateTime, formatDateShort, formatTime } from "./duffelUtils";

describe("Duffel airport-local timestamp formatting", () => {
  it("preserves the wall-clock time from a timestamp with no offset", () => {
    expect(formatTime("2026-09-10T06:58:00")).toBe("06:58");
    expect(airportLocalHour("2026-09-10T06:58:00")).toBe(6);
  });

  it("does not shift an offset timestamp into the browser timezone", () => {
    expect(formatTime("2026-09-10T23:15:00+05:30")).toBe("23:15");
    expect(formatAirportDateTime("2026-09-10T23:15:00+05:30")).toBe("Thu, Sep 10, 23:15");
  });

  it("formats calendar dates consistently", () => {
    expect(formatDateShort("2026-01-02T00:15:00-08:00")).toBe("Fri, Jan 2");
  });

  it("does not guess malformed timestamps", () => {
    expect(formatTime("not-a-timestamp")).toBe("—");
    expect(airportLocalHour("not-a-timestamp")).toBeNull();
  });
});