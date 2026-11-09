import type { NormalizedFlight } from "@/components/flights/FlightCardSimple";
import type { DuffelOffer } from "@/types/duffel";

/** Map live Duffel offers to the compact card shape; prices are Duffel's total_amount. */
export function duffelOffersToNormalized(offers: DuffelOffer[]): NormalizedFlight[] {
  return (offers || [])
    .map((offer) => {
      const slice = offer.slices?.[0];
      const segs = slice?.segments || [];
      const first = segs[0];
      const last = segs[segs.length - 1];
      const carrier = first?.marketing_carrier || offer.owner;
      const code = carrier?.iata_code || "";
      return {
        id: offer.id,
        airline: carrier?.name || code || "Unknown",
        airlineCode: code,
        flightNumber: `${code}${first?.marketing_carrier_flight_number || ""}`,
        from: first?.origin?.iata_code || slice?.origin?.iata_code || "",
        to: last?.destination?.iata_code || slice?.destination?.iata_code || "",
        departureDate: first?.departing_at?.split("T")[0] || "",
        departureTime: first?.departing_at?.split("T")[1]?.slice(0, 5) || "",
        arrivalTime: last?.arriving_at?.split("T")[1]?.slice(0, 5) || "",
        duration: slice?.duration || "",
        price: parseFloat(offer.total_amount || "0"),
        currency: offer.total_currency || "USD",
        cabin: (first?.cabin_class || "economy").toUpperCase(),
        stops: Math.max(segs.length - 1, 0),
      } as NormalizedFlight;
    })
    .filter((f) => f.price > 0);
}
