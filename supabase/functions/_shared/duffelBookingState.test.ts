import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { amountsMatch, getDuffelBookingState } from "./duffelBookingState.ts";

Deno.test("maps a paid Duffel order to confirmed", () => {
  assertEquals(getDuffelBookingState({ payment_status: "paid", booking_reference: "ABC123" }), {
    bookingStatus: "confirmed", paymentStatus: "paid", terminal: true, confirmed: true,
  });
});

Deno.test("keeps pending Duffel orders indeterminate", () => {
  assertEquals(getDuffelBookingState({ status: "pending" }), {
    bookingStatus: "pending_payment", paymentStatus: "payment_pending", terminal: false, confirmed: false,
  });
});

Deno.test("does not revive cancelled Duffel orders", () => {
  assertEquals(getDuffelBookingState({ payment_status: "paid", cancelled_at: "2026-08-26T00:00:00Z" }), {
    bookingStatus: "cancelled", paymentStatus: "cancelled", terminal: true, confirmed: false,
  });
});

Deno.test("requires both amount and currency to match", () => {
  assertEquals(amountsMatch({ total_amount: "125.50", total_currency: "USD" }, 125.5, "usd"), true);
  assertEquals(amountsMatch({ total_amount: "125.50", total_currency: "EUR" }, 125.5, "USD"), false);
  assertEquals(amountsMatch({ total_amount: "125.51", total_currency: "USD" }, 125.5, "USD"), false);
});