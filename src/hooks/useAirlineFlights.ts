import { useState, useEffect } from "react";
import { searchDuffelFlights } from "@/services/duffelFlights";
import { duffelOffersToNormalized } from "@/lib/duffelNormalize";
import { NormalizedFlight } from "@/components/flights/FlightCardSimple";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function normalizeFlights(offers: any[], airlineCode?: string): NormalizedFlight[] {
  let flights = duffelOffersToNormalized(offers);
  if (airlineCode) {
    const filtered = flights.filter((f) => f.airlineCode?.toUpperCase() === airlineCode.toUpperCase());
    if (filtered.length > 0) flights = filtered;
  }
  return flights;
}

export function useAirlineFlights(airlineCode: string, destinationCode = "LAX", originCode = "JFK") {
  const [flights, setFlights] = useState<NormalizedFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchDate, setSearchDate] = useState<string>("");

  useEffect(() => {
    if (!airlineCode) return;

    let cancelled = false;

    const fetchFlights = async () => {
      setLoading(true);
      setError(null);

      const today = new Date();

      for (let dayOffset = 0; dayOffset <= 2; dayOffset++) {
        if (cancelled) return;

        const date = formatDate(addDays(today, dayOffset));

        try {
          const { offers, error: fnError } = await searchDuffelFlights({
            origin: originCode,
            destination: destinationCode,
            departureDate: date,
            returnDate: null,
            adults: 1,
            children: 0,
            infants: 0,
            cabinClass: "economy",
          });

          if (fnError) {
            continue;
          }

          const normalized = normalizeFlights(offers, airlineCode, airlineCode);

          if (normalized.length > 0 && !cancelled) {
            setFlights(normalized.slice(0, 8));
            setSearchDate(date);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn(`⚠️ Fetch error for ${date}:`, err);
        }
      }

      if (!cancelled) {
        setFlights([]);
        setSearchDate(formatDate(today));
        setError("No flights found for this airline. Try searching with different dates.");
        setLoading(false);
      }
    };

    fetchFlights();

    return () => {
      cancelled = true;
    };
  }, [airlineCode, destinationCode, originCode]);

  return { flights, loading, error, searchDate };
}
