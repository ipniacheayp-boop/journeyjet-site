import { useCallback, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import FlightSearchForm from "@/components/duffel/FlightSearchForm";
import FlightFilters, { type FlightFilterState, type SortKey } from "@/components/duffel/FlightFilters";
import FlightResults from "@/components/duffel/FlightResults";
import FlightDetailsDialog from "@/components/duffel/FlightDetailsDialog";
import { searchDuffelFlights } from "@/services/duffelFlights";
import type { DuffelOffer, DuffelSearchRequest } from "@/types/duffel";
import {
  offerAirlines,
  offerArrivalMinutes,
  offerBaggage,
  offerCabins,
  offerDepartureMinutes,
  offerMaxStops,
  offerPrice,
  offerTotalMinutes,
} from "@/lib/duffelUtils";
import { toast } from "@/hooks/use-toast";

const defaultFilters = (maxPrice: number): FlightFilterState => ({
  stops: [],
  airlines: [],
  cabins: [],
  maxPrice,
  departureWindow: [0, 1439],
  arrivalWindow: [0, 1439],
  checkedBagOnly: false,
});

export default function FlightSearchLive() {
  const [searchParams] = useSearchParams();
  const formRef = useRef<HTMLDivElement>(null);

  const [offers, setOffers] = useState<DuffelOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [sort, setSort] = useState<SortKey>("recommended");
  const [filters, setFilters] = useState<FlightFilterState>(defaultFilters(100000));
  const [selected, setSelected] = useState<DuffelOffer | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const priceBounds = useMemo(() => {
    const prices = offers.map(offerPrice).filter((p) => Number.isFinite(p));
    if (prices.length === 0) return { min: 0, max: 100000 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [offers]);

  const airlineFacets = useMemo(() => {
    const counts = new Map<string, { code: string; name: string; count: number }>();
    offers.forEach((offer) =>
      offerAirlines(offer).forEach(({ code, name }) => {
        const existing = counts.get(code);
        counts.set(code, { code, name, count: (existing?.count || 0) + 1 });
      }),
    );
    return [...counts.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [offers]);

  const cabinFacets = useMemo(() => {
    const set = new Set<string>();
    offers.forEach((o) => offerCabins(o).forEach((c) => set.add(c)));
    return [...set];
  }, [offers]);

  const currency = offers[0]?.total_currency || "USD";

  const runSearch = useCallback(async (payload: DuffelSearchRequest) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);

    const { offers: result, error: searchError } = await searchDuffelFlights(payload);

    setLoading(false);
    setOffers(result);

    const prices = result.map(offerPrice).filter((p) => Number.isFinite(p));
    setFilters(defaultFilters(prices.length ? Math.ceil(Math.max(...prices)) : 100000));
    setSort("recommended");

    if (searchError) {
      setError(searchError);
      toast({ title: "Flight search", description: searchError, variant: "destructive" });
    }
  }, []);

  const filtered = useMemo(() => {
    const list = offers.filter((offer) => {
      const price = offerPrice(offer);
      if (Number.isFinite(price) && price > filters.maxPrice) return false;

      if (filters.stops.length > 0) {
        const stops = offerMaxStops(offer);
        const bucket = stops >= 2 ? 2 : stops;
        if (!filters.stops.includes(bucket)) return false;
      }

      if (filters.airlines.length > 0) {
        const codes = offerAirlines(offer).map((a) => a.code);
        if (!codes.some((c) => filters.airlines.includes(c))) return false;
      }

      if (filters.cabins.length > 0) {
        const cabins = offerCabins(offer);
        if (!cabins.some((c) => filters.cabins.includes(c))) return false;
      }

      const dep = offerDepartureMinutes(offer);
      if (dep < filters.departureWindow[0] || dep > filters.departureWindow[1]) return false;

      const arr = offerArrivalMinutes(offer);
      if (arr < filters.arrivalWindow[0] || arr > filters.arrivalWindow[1]) return false;

      if (filters.checkedBagOnly && offerBaggage(offer).checked < 1) return false;

      return true;
    });

    const byPrice = (a: DuffelOffer, b: DuffelOffer) => offerPrice(a) - offerPrice(b);
    const byDuration = (a: DuffelOffer, b: DuffelOffer) => offerTotalMinutes(a) - offerTotalMinutes(b);

    const sorted = [...list];
    switch (sort) {
      case "cheapest":
        sorted.sort(byPrice);
        break;
      case "fastest":
        sorted.sort(byDuration);
        break;
      case "earliest_departure":
        sorted.sort((a, b) => offerDepartureMinutes(a) - offerDepartureMinutes(b));
        break;
      case "latest_departure":
        sorted.sort((a, b) => offerDepartureMinutes(b) - offerDepartureMinutes(a));
        break;
      default: {
        // Recommended = best balance of price and duration.
        const maxP = Math.max(...sorted.map(offerPrice).filter(Number.isFinite), 1);
        const maxD = Math.max(...sorted.map(offerTotalMinutes), 1);
        sorted.sort(
          (a, b) =>
            offerPrice(a) / maxP + offerTotalMinutes(a) / maxD -
            (offerPrice(b) / maxP + offerTotalMinutes(b) / maxD),
        );
      }
    }
    return sorted;
  }, [offers, filters, sort]);

  const cheapestId = useMemo(
    () => (filtered.length ? [...filtered].sort((a, b) => offerPrice(a) - offerPrice(b))[0].id : null),
    [filtered],
  );
  const fastestId = useMemo(
    () =>
      filtered.length
        ? [...filtered].sort((a, b) => offerTotalMinutes(a) - offerTotalMinutes(b))[0].id
        : null,
    [filtered],
  );

  const handleSelect = (offer: DuffelOffer) => {
    setSelected(offer);
    setDetailsOpen(true);
  };

  const handleContinue = (offer: DuffelOffer) => {
    // Persist the Duffel offer id — required for offer reconfirmation and order creation.
    try {
      sessionStorage.setItem(
        "duffel.selectedOffer",
        JSON.stringify({ offerId: offer.id, offer, selectedAt: new Date().toISOString() }),
      );
    } catch {
      /* storage unavailable — the offer id stays in memory only */
    }
    toast({
      title: "Fare selected",
      description:
        "Your fare is held. Passenger details and payment are the next step in the booking flow.",
    });
    setDetailsOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Live Flight Search — Real-Time Airline Fares | Tripile</title>
        <meta
          name="description"
          content="Search live airline availability and real-time fares. Compare non-stop and connecting flights, baggage, cabins and fare conditions before you book with Tripile."
        />
        <link rel="canonical" href="https://tripile.com/flights/search" />
        <meta property="og:title" content="Live Flight Search — Real-Time Airline Fares | Tripile" />
        <meta
          property="og:description"
          content="Compare live airline fares, baggage and fare rules in real time on Tripile."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:description"
          content="Compare live airline fares, baggage and fare rules in real time on Tripile."
        />
      </Helmet>

      <Header />

      <main className="flex-1">
        <section className="bg-muted/40 border-b border-border">
          <div className="container mx-auto px-4 py-8" ref={formRef}>
            <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-3">
              <Link to="/" className="hover:text-primary">
                Home
              </Link>{" "}
              /{" "}
              <Link to="/flights" className="hover:text-primary">
                Flights
              </Link>{" "}
              / <span className="text-foreground">Live search</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">Live Flight Search</h1>
            <p className="text-sm text-muted-foreground mb-5">
              Real-time airline availability, fares, baggage and fare rules.
            </p>
            <FlightSearchForm
              loading={loading}
              initial={{
                origin: (searchParams.get("from") || "").toUpperCase() || undefined,
                destination: (searchParams.get("to") || "").toUpperCase() || undefined,
                departureDate: searchParams.get("date") || undefined,
              }}
              onSearch={(payload) => runSearch(payload)}
            />
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            <aside className={offers.length === 0 ? "hidden lg:block" : ""}>
              {offers.length > 0 && (
                <FlightFilters
                  filters={filters}
                  onChange={setFilters}
                  airlines={airlineFacets}
                  cabins={cabinFacets}
                  priceBounds={priceBounds}
                  currency={currency}
                  resultCount={filtered.length}
                  onReset={() => setFilters(defaultFilters(Math.ceil(priceBounds.max)))}
                />
              )}
            </aside>

            <div>
              <FlightResults
                offers={filtered}
                loading={loading}
                sort={sort}
                onSortChange={setSort}
                onSelect={handleSelect}
                onModifySearch={() =>
                  formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                cheapestId={cheapestId}
                fastestId={fastestId}
                hasSearched={hasSearched}
              />
            </div>
          </div>
        </section>
      </main>

      <FlightDetailsDialog
        offer={selected}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onContinue={handleContinue}
      />

      <Footer />
    </div>
  );
}
