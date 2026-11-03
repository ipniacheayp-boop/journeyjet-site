type Any = Record<string, any>;

export type DuffelBookingState = {
  bookingStatus: "pending_payment" | "confirmed" | "cancelled" | "refunded";
  paymentStatus: "processing" | "payment_pending" | "unknown" | "paid" | "failed" | "cancelled" | "refunded";
  terminal: boolean;
  confirmed: boolean;
};

const PAID = new Set(["paid", "succeeded", "successful", "completed", "captured"]);
const FAILED = new Set(["failed", "declined", "rejected"]);
const PENDING = new Set(["pending", "processing", "requires_action", "requires_confirmation", "authorising", "authorized"]);
const CANCELLED = new Set(["cancelled", "canceled", "voided"]);
const REFUNDED = new Set(["refunded"]);

function values(order: Any): string[] {
  const result = [order?.payment_status, order?.payment?.status];
  for (const payment of Array.isArray(order?.payments) ? order.payments : []) {
    result.push(payment?.status);
  }
  return result.filter((value): value is string => typeof value === "string").map((value) => value.toLowerCase());
}

export function getDuffelBookingState(order: Any | null | undefined): DuffelBookingState {
  if (!order) {
    return { bookingStatus: "pending_payment", paymentStatus: "unknown", terminal: false, confirmed: false };
  }

  const states = values(order);
  const cancelled = Boolean(order.cancelled_at) || CANCELLED.has(String(order.status ?? "").toLowerCase()) || states.some((state) => CANCELLED.has(state));
  const refunded = states.some((state) => REFUNDED.has(state));
  const failed = states.some((state) => FAILED.has(state));
  const pending = states.some((state) => PENDING.has(state));
  const paid = states.some((state) => PAID.has(state));

  if (refunded) return { bookingStatus: "refunded", paymentStatus: "refunded", terminal: true, confirmed: false };
  if (cancelled) return { bookingStatus: "cancelled", paymentStatus: "cancelled", terminal: true, confirmed: false };
  if (failed && !paid) return { bookingStatus: "pending_payment", paymentStatus: "failed", terminal: true, confirmed: false };
  const hasBookingReference = typeof order.booking_reference === "string" && order.booking_reference.length > 0;
  if (paid && hasBookingReference && !pending && !failed) return { bookingStatus: "confirmed", paymentStatus: "paid", terminal: true, confirmed: true };

  // Some Duffel Order responses do not include a payment status. For an instant
  // order, a booking reference plus issued documents is authoritative evidence
  // that the airline accepted and ticketed the paid order.
  const hasDocuments = Array.isArray(order.documents) && order.documents.some((document: Any) => document?.type === "electronic_ticket" && document?.unique_identifier);
  if (hasBookingReference && hasDocuments && !pending && !failed && order.payment_status !== "unpaid" && order.payment?.status !== "unpaid") {
    return { bookingStatus: "confirmed", paymentStatus: "paid", terminal: true, confirmed: true };
  }

  if (pending || hasBookingReference) {
    return { bookingStatus: "pending_payment", paymentStatus: "payment_pending", terminal: false, confirmed: false };
  }

  return { bookingStatus: "pending_payment", paymentStatus: "unknown", terminal: false, confirmed: false };
}

export function validateExpectedFare(expectedAmount: unknown, expectedCurrency: unknown, offer: Any): "invalid" | "changed" | "match" {
  if ((typeof expectedAmount !== "string" && typeof expectedAmount !== "number")
    || !/^\d+(\.\d{1,2})?$/.test(String(expectedAmount)) || Number(expectedAmount) <= 0
    || !/^[A-Z]{3}$/.test(String(expectedCurrency ?? ""))) return "invalid";
  return amountsMatch(offer, expectedAmount, expectedCurrency) ? "match" : "changed";
}

export function amountsMatch(order: Any, expectedAmount: unknown, expectedCurrency: unknown): boolean {
  const actualAmount = Number(order?.total_amount);
  const wantedAmount = Number(expectedAmount);
  const actualCurrency = String(order?.total_currency ?? "").toUpperCase();
  const wantedCurrency = String(expectedCurrency ?? "").toUpperCase();
  return Number.isFinite(actualAmount) && Number.isFinite(wantedAmount)
    && Math.abs(actualAmount - wantedAmount) < 0.005
    && actualCurrency.length === 3
    && actualCurrency === wantedCurrency;
}