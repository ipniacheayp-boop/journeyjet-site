import type { CheckoutContact, CheckoutPassenger } from "@/components/duffel/DuffelPassengerForm";

export const CHECKOUT_DRAFT_TTL = 30 * 60 * 1000;
export interface FlightCheckoutDraft {
  offerId: string;
  attemptId: string;
  step: number;
  passengers: CheckoutPassenger[];
  contact: CheckoutContact;
  acceptedTerms: boolean;
  pendingBookingId: string | null;
  paymentStarted: boolean;
  savedAt: number;
}
export const checkoutDraftKey = (offerId: string) => `duffelCheckoutDraft:${offerId}`;

export function readCheckoutDraft(storage: Storage, offerId: string, now = Date.now()): FlightCheckoutDraft | null {
  try {
    const raw = storage.getItem(checkoutDraftKey(offerId));
    const draft = raw ? JSON.parse(raw) as FlightCheckoutDraft : null;
    if (!draft || draft.offerId !== offerId || !Number.isFinite(draft.savedAt)
      || now - draft.savedAt >= CHECKOUT_DRAFT_TTL || draft.savedAt > now
      || !/^[0-9a-f-]{36}$/i.test(draft.attemptId)
      || !Array.isArray(draft.passengers) || typeof draft.contact?.email !== "string"
      || typeof draft.contact?.phone !== "string") {
      storage.removeItem(checkoutDraftKey(offerId));
      return null;
    }
    return draft;
  } catch { return null; }
}

export function saveCheckoutDraft(storage: Storage, draft: FlightCheckoutDraft): boolean {
  try { storage.setItem(checkoutDraftKey(draft.offerId), JSON.stringify(draft)); return true; }
  catch { return false; }
}

export function clearCheckoutDraft(storage: Storage, offerId: string) {
  try { storage.removeItem(checkoutDraftKey(offerId)); } catch { /* storage blocked */ }
}

/** Restore details by passenger position but always bind IDs/types to the fresh offer. */
export function bindCheckoutPassengers(saved: CheckoutPassenger[], fresh: CheckoutPassenger[]): CheckoutPassenger[] {
  return fresh.map((passenger, index) => {
    const existing = saved[index];
    return existing && existing.type === passenger.type
      ? { ...passenger, ...existing, id: passenger.id, type: passenger.type }
      : passenger;
  });
}