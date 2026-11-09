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

export function useDestinationFlights(destinationCode: string, originCode = "JFK") {
  const [flights, setFlights] = useState<NormalizedFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchDate, setSearchDate] = useState<string>("");

  useEffect(() => {
    if (!destinationCode) return;

    let cancelled = false;

    const fetchWithRetry = async () => {
      setLoading(true);
      setError(null);

      const today = new Date();

      for (let dayOffset = 0; dayOffset <= 2; dayOffset++) {
        if (cancelled) return;

        const date = formatDate(addDays(today, dayOffset));
        console.log(`✈️ Searching flights to ${destinationCode} on ${date} (attempt ${dayOffset + 1}/3)`);

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

          const normalized = normalizeFlights(offers);

          if (normalized.length > 0) {
            if (!cancelled) {
              setFlights(normalized.slice(0, 10));
              setSearchDate(date);
              setLoading(false);
            }
            return;
          }

          console.log(`📭 No flights on ${date}, trying next day...`);
        } catch (err) {
          console.warn(`⚠️ Fetch error for ${date}:`, err);
        }
      }

      // All attempts exhausted
      if (!cancelled) {
        setFlights([]);
        setSearchDate(formatDate(today));
        setError("No flights found for the next few days. Try a different date or route.");
        setLoading(false);
      }
    };

    fetchWithRetry();

    return () => {
      cancelled = true;
    };
  }, [destinationCode, originCode]);

  return { flights, loading, error, searchDate };
}
