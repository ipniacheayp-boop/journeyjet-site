import type { CheckoutContact, CheckoutPassenger } from "@/components/duffel/DuffelPassengerForm";
import type { Passenger } from "@/components/booking/PassengerForm";
import type { HotelUpsellData } from "@/components/booking/HotelUpsellStep";
import { CHECKOUT_DRAFT_TTL } from "@/lib/flightCheckoutDraft";

export function hotelGuestsFromFlight(passengers: CheckoutPassenger[]): Passenger[] {
  return passengers.filter(p => p.type === "adult").slice(0, 1).map(p => ({
    firstName: p.givenName, lastName: p.familyName, dateOfBirth: p.bornOn,
    gender: p.gender, nationality: p.nationality || "United States",
    passportNumber: "", passportExpiry: "", passportCountry: "",
    seatPreference: "", mealPreference: "",
  }));
}

export function combinedCheckoutTotal(flight: number, flightCurrency: string, hotel: number, hotelCurrency: string): number | null {
  if (flightCurrency !== hotelCurrency || !Number.isFinite(flight) || !Number.isFinite(hotel) || flight <= 0 || hotel <= 0) return null;
  return Math.round((flight + hotel) * 100) / 100;
}

export interface HotelContinuation {
  hotelUpsellData: HotelUpsellData;
  passengers: Passenger[];
  contact: CheckoutContact;
  savedAt: number;
}

export function readHotelContinuation(storage: Storage, offerId: string, now = Date.now()): HotelContinuation | null {
  try {
    const raw = storage.getItem(`flightHotel:${offerId}`);
    const value = raw ? JSON.parse(raw) as HotelContinuation : null;
    if (!value || !Number.isFinite(value.savedAt) || now - value.savedAt >= CHECKOUT_DRAFT_TTL || value.savedAt > now
      || !value.hotelUpsellData?.selectedHotel || !Array.isArray(value.passengers)
      || typeof value.contact?.email !== "string" || typeof value.contact?.phone !== "string") {
      storage.removeItem(`flightHotel:${offerId}`);
      return null;
    }
    return value;
  } catch { return null; }
}