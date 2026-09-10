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

function normalizeFlights(data: any): NormalizedFlight[] {
  if (!data?.data || !Array.isArray(data.data)) return [];

  return data.data.map((offer: any, i: number) => {
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
          const { data, error: fnError } = await supabase.functions.invoke("flights-search", {
            body: {
              originLocationCode: originCode,
              destinationLocationCode: destinationCode,
              departureDate: date,
              adults: 1,
            },
          });

          if (fnError) {
            console.warn(`⚠️ Error on ${date}:`, fnError);
            continue;
          }

          const normalized = normalizeFlights(data);

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
