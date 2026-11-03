import { describe, expect, it } from "vitest";
import { bindCheckoutPassengers, CHECKOUT_DRAFT_TTL, clearCheckoutDraft, readCheckoutDraft, saveCheckoutDraft, type FlightCheckoutDraft } from "./flightCheckoutDraft";

function storage(): Storage {
  const data = new Map<string, string>();
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => { data.set(key, value); }, removeItem: key => { data.delete(key); }, clear: () => data.clear(), key: index => [...data.keys()][index] ?? null, get length() { return data.size; } };
}
const draft: FlightCheckoutDraft = { offerId: "off_test", attemptId: "e0e98cba-5f03-4b7c-bb57-947157721afd", step: 1, savedAt: 1000, acceptedTerms: true, pendingBookingId: null, paymentStarted: false, contact: { email: "traveller@example.test", phone: "+919876543210" }, passengers: [{ id: "pas_old", type: "adult", title: "mr", givenName: "Test", familyName: "Traveller", bornOn: "1990-01-02", gender: "m", passportNumber: "A1234567", passportExpiry: "2030-01-01", issuingCountry: "IN", nationality: "IN" }] };
describe("temporary checkout data", () => {
  it("preserves all passenger and contact fields across reload and steps", () => {
    const store = storage(); saveCheckoutDraft(store, draft);
    expect(readCheckoutDraft(store, draft.offerId, 1001)).toEqual(draft);
    saveCheckoutDraft(store, { ...draft, step: 0 });
    expect(readCheckoutDraft(store, draft.offerId, 1001)?.passengers).toEqual(draft.passengers);
  });
  it("clears passenger details at session expiry", () => {
    const store = storage(); saveCheckoutDraft(store, draft);
    expect(readCheckoutDraft(store, draft.offerId, draft.savedAt + CHECKOUT_DRAFT_TTL)).toBeNull();
    expect(store.length).toBe(0);
  });
  it("clears data after confirmation or explicit cancellation", () => {
    const store = storage(); saveCheckoutDraft(store, draft); clearCheckoutDraft(store, draft.offerId);
    expect(readCheckoutDraft(store, draft.offerId, 1001)).toBeNull();
  });
  it("rebinds saved passenger data to authoritative fresh IDs", () => {
    expect(bindCheckoutPassengers(draft.passengers, [{ ...draft.passengers[0], id: "pas_fresh", givenName: "" }])[0]).toEqual({ ...draft.passengers[0], id: "pas_fresh" });
  });
  it("does not throw when browser storage is blocked", () => {
    const store = storage(); store.setItem = () => { throw new Error("blocked"); };
    expect(saveCheckoutDraft(store, draft)).toBe(false);
  });
});