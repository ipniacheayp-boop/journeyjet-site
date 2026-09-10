import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NormalizedFlight } from "@/components/flights/FlightCardSimple";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function normalizeFlights(data: any, airlineCode?: string): NormalizedFlight[] {
  if (!data?.data || !Array.isArray(data.data)) return [];

  let flights = data.data.map((offer: any, i: number) => {
    const seg = offer.itineraries?.[0]?.segments?.[0];
    const lastSeg = offer.itineraries?.[0]?.segments?.slice(-1)[0];
    const stops = (offer.itineraries?.[0]?.segments?.length || 1) - 1;

    return {
      id: offer.id || `flight-${i}`,
      airline: seg?.carrierCode || "Unknown",
      airlineCode: seg?.carrierCode || "",
      flightNumber: `${seg?.carrierCode || ""}${seg?.number || ""}`,
      from: seg?.departure?.iataCode || "",
      to: lastSeg?.arrival?.iataCode || "",
      departureDate: seg?.departure?.at?.split("T")[0] || "",
      departureTime: seg?.departure?.at?.split("T")[1]?.slice(0, 5) || "",
      arrivalTime: lastSeg?.arrival?.at?.split("T")[1]?.slice(0, 5) || "",
      duration: offer.itineraries?.[0]?.duration || "",
      price: parseFloat(offer.price?.total || offer.price?.grandTotal || "0"),
      currency: offer.price?.currency || "USD",
      cabin: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || "ECONOMY",
      stops,
    };
  });

  // Filter by airline code if provided
  if (airlineCode) {
    const filtered = flights.filter(
      (f: NormalizedFlight) => f.airlineCode?.toUpperCase() === airlineCode.toUpperCase()
    );
    // If we have filtered results, use them; otherwise return all (airline may not operate this route)
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
          const { data, error: fnError } = await supabase.functions.invoke("flights-search", {
            body: {
              originLocationCode: originCode,
              destinationLocationCode: destinationCode,
              departureDate: date,
              adults: 1,
            },
          });

          if (fnError) {
            console.warn(`⚠️ Airline flights error on ${date}:`, fnError);
            continue;
          }

          const normalized = normalizeFlights(data, airlineCode);

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
