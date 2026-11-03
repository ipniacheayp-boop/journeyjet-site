import { describe, it, expect } from "vitest";
import { combinedCheckoutTotal, hotelGuestsFromFlight, readHotelContinuation } from "./flightHotelCheckout";
import { CHECKOUT_DRAFT_TTL } from "./flightCheckoutDraft";
import { emptyPassenger } from "@/components/duffel/DuffelPassengerForm";

describe("flight and hotel checkout", () => {
  it("itemizes hotel totals without multiplying them by flight passengers", () => {
    expect(combinedCheckoutTotal(400, "USD", 125.50, "USD")).toBe(525.50);
  });
  it("never combines different currencies as if they were the same", () => {
    expect(combinedCheckoutTotal(400, "GBP", 125.50, "USD")).toBeNull();
  });
  it("carries only the adult lead guest and excludes passport data from hotel payment", () => {
    const guest = { ...emptyPassenger("pas_1", "adult"), givenName: "Jane", familyName: "Smith", passportNumber: "ABC123456" };
    const child = { ...emptyPassenger("pas_2", "child"), givenName: "Alex" };
    expect(hotelGuestsFromFlight([child, guest])).toEqual([expect.objectContaining({ firstName: "Jane", lastName: "Smith", passportNumber: "" })]);
  });
  it("expires hotel continuation details after the passenger privacy window", () => {
    const values = new Map<string, string>([["flightHotel:off_1", JSON.stringify({ savedAt: 1000, hotelUpsellData: { selectedHotel: {} }, passengers: [], contact: { email: "guest@example.com", phone: "+14155550123" } })]]);
    const storage: Storage = {
      get length() { return values.size; },
      getItem: k => values.get(k) ?? null,
      removeItem: k => { values.delete(k); },
      setItem: (k, v) => { values.set(k, v); },
      clear: () => { values.clear(); },
      key: i => [...values.keys()][i] ?? null,
    };
    expect(readHotelContinuation(storage, "off_1", 1000 + CHECKOUT_DRAFT_TTL)).toBeNull();
    expect(values.has("flightHotel:off_1")).toBe(false);
  });
});