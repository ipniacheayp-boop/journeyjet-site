import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";

/**
 * Booking-side Duffel calls. The Duffel API key stays in Edge Function secrets —
 * the browser only ever receives a short-lived component client key.
 */

export interface DuffelPassengerPayload {
  id: string;
  title: string;
  given_name: string;
  family_name: string;
  born_on: string;
  gender: string;
  email: string;
  phone_number: string;
  identity_document?: {
    unique_identifier: string;
    expires_on: string;
    issuing_country_code: string;
    nationality: string;
  };
}

export interface DuffelOrderSummary {
  id: string | null;
  booking_reference: string | null;
  total_amount: string | null;
  total_currency: string | null;
  live_mode: boolean | null;
  created_at: string | null;
  owner: { name: string | null; iata_code: string | null } | null;
  passengers: Array<{ id: string | null; given_name: string | null; family_name: string | null }>;
  documents: Array<{ type: string | null; unique_identifier: string | null }>;
  slices: Array<{
    origin: string | null;
    destination: string | null;
    segments: Array<{
      departing_at: string | null;
      arriving_at: string | null;
      origin: string | null;
      destination: string | null;
      marketing_carrier: string | null;
      flight_number: string | null;
    }>;
  }>;
}

export interface CreateOrderResult {
  ok: boolean;
  code?: string;
  message?: string;
  bookingId?: string;
  orderId?: string;
  bookingReference?: string;
  liveMode?: boolean;
  alreadyBooked?: boolean;
  order?: DuffelOrderSummary | null;
  originalPrice?: number;
  newPrice?: number;
  currency?: string;
}

export async function getDuffelClientKey(
  cardId?: string,
): Promise<{ clientKey: string | null; error: string | null }> {
  const { data, error } = await invokeSupabaseFunction<{ clientKey?: string; error?: string }>(
    "duffel-client-key",
    cardId ? { cardId } : {},
  );

  if (error) return { clientKey: null, error: "Card payments are temporarily unavailable. Please try again shortly." };
  if (data?.error) return { clientKey: null, error: data.error };

  return { clientKey: data?.clientKey ?? null, error: null };
}

export async function createDuffelOrder(payload: {
  offerId: string;
  passengers: DuffelPassengerPayload[];
  contact: { email: string; phone: string };
  paymentType: "card" | "balance";
  cardId?: string;
  threeDSecureSessionId?: string;
  expectedAmount?: string | number;
  acceptedTerms: boolean;
  agentId?: string | null;
}): Promise<CreateOrderResult> {
  const { data, error } = await invokeSupabaseFunction<CreateOrderResult>("duffel-order-create", payload);

  if (error) {
    return {
      ok: false,
      code: "NETWORK",
      message:
        "We couldn't reach the booking service. If you were charged, contact support at Support@Tripile.com before retrying.",
    };
  }

  return data ?? { ok: false, code: "BOOKING_ERROR", message: "We couldn't complete your booking. Please try again." };
}
