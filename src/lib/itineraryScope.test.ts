import { describe, it, expect } from "vitest";
import { getItineraryScope } from "./itineraryScope";
import type { DuffelOffer, DuffelSlice } from "@/types/duffel";

const place = (country: string | null) => ({
  iata_code: "XXX",
  iata_country_code: country,
  name: "Airport",
  city_name: "City",
});

const slice = (countries: Array<string | null>): DuffelSlice => ({
  id: "sli_1",
  duration: null,
  origin: place(countries[0]),
  destination: place(countries[countries.length - 1]),
  fare_brand_name: null,
  conditions: { refund_before_departure: null, change_before_departure: null },
  segments: countries.slice(0, -1).map((c, i) => ({
    id: `seg_${i}`,
    departing_at: null,
    arriving_at: null,
    duration: null,
    origin: place(c),
    destination: place(countries[i + 1]),
    origin_terminal: null,
    destination_terminal: null,
    marketing_carrier: null,
    operating_carrier: null,
    marketing_carrier_flight_number: null,
    operating_carrier_flight_number: null,
    aircraft: null,
    cabin: null,
    cabin_class: null,
    cabin_class_marketing_name: null,
    fare_basis_code: null,
    baggages: [],
    amenities: { wifi: null, power: null, seat_pitch: null },
    stops: [],
  })),
});

const offer = (slices: DuffelSlice[]): DuffelOffer => ({
  id: "off_test",
  total_amount: "100.00",
  total_currency: "INR",
  base_amount: null,
  tax_amount: null,
  expires_at: null,
  owner: null,
  passenger_identity_documents_required: null,
  conditions: slices[0].conditions,
  passengers: [],
  slices,
});

describe("getItineraryScope", () => {
  it("Delhi → Mumbai one-way is domestic, no passport", () => {
    const r = getItineraryScope(offer([slice(["IN", "IN"])]));
    expect(r).toEqual({ isDomestic: true, countryCode: "IN", resolved: true });
  });

  it("Delhi → Mumbai → Delhi round trip is domestic", () => {
    const r = getItineraryScope(offer([slice(["IN", "IN"]), slice(["IN", "IN"])]));
    expect(r.isDomestic).toBe(true);
  });

  it("Delhi → Dubai one-way is international", () => {
    const r = getItineraryScope(offer([slice(["IN", "AE"])]));
    expect(r.isDomestic).toBe(false);
  });

  it("Delhi → Dubai → Delhi round trip is international", () => {
    const r = getItineraryScope(offer([slice(["IN", "AE"]), slice(["AE", "IN"])]));
    expect(r.isDomestic).toBe(false);
  });

  it("Delhi → Bangkok → Delhi is international", () => {
    const r = getItineraryScope(offer([slice(["IN", "TH"]), slice(["TH", "IN"])]));
    expect(r.isDomestic).toBe(false);
  });

  it("multi-city with one foreign segment is international", () => {
    const r = getItineraryScope(offer([slice(["IN", "IN"]), slice(["IN", "GB"])]));
    expect(r.isDomestic).toBe(false);
  });

  it("missing country data falls back to international (stricter flow)", () => {
    const r = getItineraryScope(offer([slice(["IN", null])]));
    expect(r).toEqual({ isDomestic: false, countryCode: null, resolved: false });
  });

  it("a technical stop abroad makes the trip international", () => {
    const s = slice(["IN", "IN"]);
    s.segments[0].stops = [{ airport: place("AE"), duration: null }];
    const r = getItineraryScope(offer([s]));
    expect(r.isDomestic).toBe(false);
  });
});
