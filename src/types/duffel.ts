/**
 * Shapes returned by the `duffel-flights-search` / `duffel-offer-get` Edge Functions.
 * Everything is nullable on purpose — Duffel omits fields depending on the airline.
 */
export interface DuffelPlace {
  iata_code: string | null;
  /** ISO 3166-1 alpha-2 country of the airport (used to detect domestic itineraries). */
  iata_country_code?: string | null;
  name: string | null;
  city_name: string | null;
  time_zone?: string | null;
}


export interface DuffelCarrier {
  name: string | null;
  iata_code: string | null;
  logo_symbol_url: string | null;
  logo_lockup_url: string | null;
}

export interface DuffelBaggage {
  type: string | null;
  quantity: number;
}

export interface DuffelSegment {
  id: string | null;
  departing_at: string | null;
  arriving_at: string | null;
  duration: string | null;
  origin: DuffelPlace;
  destination: DuffelPlace;
  origin_terminal: string | null;
  destination_terminal: string | null;
  marketing_carrier: DuffelCarrier | null;
  operating_carrier: DuffelCarrier | null;
  marketing_carrier_flight_number: string | null;
  operating_carrier_flight_number: string | null;
  aircraft: { name: string | null; iata_code: string | null } | null;
  cabin: string | null;
  cabin_class: string | null;
  cabin_class_marketing_name: string | null;
  fare_basis_code: string | null;
  baggages: DuffelBaggage[];
  amenities: {
    wifi: boolean | null;
    power: boolean | null;
    seat_pitch: string | null;
    legroom?: string | null;
  };
  stops: Array<{ airport: DuffelPlace; duration: string | null }>;
}

export interface DuffelSlice {
  id: string | null;
  duration: string | null;
  origin: DuffelPlace;
  destination: DuffelPlace;
  fare_brand_name: string | null;
  conditions: {
    refund_before_departure: { allowed?: boolean; penalty_amount?: string | null; penalty_currency?: string | null } | null;
    change_before_departure: { allowed?: boolean; penalty_amount?: string | null; penalty_currency?: string | null } | null;
  };
  segments: DuffelSegment[];
}

export interface DuffelOffer {
  id: string;
  total_amount: string | null;
  total_currency: string | null;
  base_amount: string | null;
  base_currency?: string | null;
  tax_amount: string | null;
  tax_currency?: string | null;
  total_emissions_kg?: string | null;
  payment_requirements?: {
    requires_instant_payment?: boolean | null;
    payment_required_by?: string | null;
    price_guarantee_expires_at?: string | null;
  } | null;
  expires_at: string | null;
  owner: DuffelCarrier | null;
  passenger_identity_documents_required: boolean | null;
  conditions: DuffelSlice["conditions"];
  passengers: Array<{ id: string | null; type: string | null; age: number | null }>;
  slices: DuffelSlice[];
}

export type TripType = "round_trip" | "one_way" | "multi_city";
export type CabinClass = "economy" | "premium_economy" | "business" | "first";

export interface DuffelSearchLeg {
  origin: string;
  destination: string;
  departureDate: string;
  originLabel?: string;
  destinationLabel?: string;
}

export interface DuffelSearchRequest {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string | null;
  adults: number;
  children: number;
  infants: number;
  cabinClass: CabinClass;
  slices?: Array<{ origin: string; destination: string; departureDate: string }>;
}

export interface DuffelSearchResponse {
  offers?: DuffelOffer[];
  offer_request_id?: string | null;
  meta?: { provider?: string; live_mode?: boolean; count?: number };
  error?: string;
}
