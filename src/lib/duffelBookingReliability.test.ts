import { describe, it, expect } from "vitest";
import { getDuffelBookingState, validateExpectedFare } from "../../supabase/functions/_shared/duffelBookingState";

describe("authoritative Duffel payment status", () => {
  it("never confirms a generic completed order", () => {
    expect(getDuffelBookingState({ status: "completed", booking_reference: "ABC123" }).confirmed).toBe(false);
  });
  it("does not confirm paid funds without an airline reference", () => {
    expect(getDuffelBookingState({ payment_status: "paid" }).confirmed).toBe(false);
  });
  it("keeps interrupted 3DS pending even with documents", () => {
    expect(getDuffelBookingState({ payment_status: "requires_action", booking_reference: "ABC123", documents: [{ type: "electronic_ticket", unique_identifier: "123" }] }).confirmed).toBe(false);
  });
  it("never treats unrelated documents as tickets", () => {
    expect(getDuffelBookingState({ booking_reference: "ABC123", documents: [{ type: "receipt" }] }).confirmed).toBe(false);
  });
  it("confirms authoritative issued tickets when no payment status is supplied", () => {
    expect(getDuffelBookingState({ booking_reference: "ABC123", documents: [{ type: "electronic_ticket", unique_identifier: "123" }] }).confirmed).toBe(true);
  });
  it("confirms explicit paid bookings only with a reference", () => {
    expect(getDuffelBookingState({ payment_status: "paid", booking_reference: "ABC123" }).confirmed).toBe(true);
  });
  it("does not revive cancelled bookings", () => {
    expect(getDuffelBookingState({ payment_status: "paid", booking_reference: "ABC123", cancelled_at: "2026-11-03" }).confirmed).toBe(false);
  });
});
describe("price rechecking before payment", () => {
  const offer = { total_amount: "125.50", total_currency: "USD" };
  it("rejects omitted or malformed expected prices", () => {
    for (const amount of [undefined, null, "", "garbage", 0, -1]) expect(validateExpectedFare(amount, "USD", offer)).toBe("invalid");
  });
  it("requires the reviewed currency", () => {
    expect(validateExpectedFare("125.50", undefined, offer)).toBe("invalid");
    expect(validateExpectedFare("125.50", "EUR", offer)).toBe("changed");
  });
  it("requires a new confirmation after a price change", () => {
    expect(validateExpectedFare("124.50", "USD", offer)).toBe("changed");
  });
  it("accepts only the exact reviewed Duffel fare", () => {
    expect(validateExpectedFare("125.50", "USD", offer)).toBe("match");
  });
});