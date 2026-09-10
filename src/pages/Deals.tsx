import { useCallback, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DuffelDealCard from "@/components/deals/DuffelDealCard";
import DealsSkeleton from "@/components/DealsSkeleton";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plane, Filter, TrendingDown, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useDuffelDeals } from "@/hooks/useDuffelDeals";
import type { DuffelDeal } from "@/services/duffelDeals";
import { SavingsRevealButton } from "@/components/SavingsRevealDialog";

const ITEMS_PER_PAGE = 12;

const Deals = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  // Filter/query variants (?sort=…, ?page=…) must not be indexed separately —
  // they consolidate on the /deals canonical.
  const hasQuery = search.length > 0;

  const { deals, loading, isFetching, error, fromCache, refetch } = useDuffelDeals();

  const [priceCeiling, setPriceCeiling] = useState<number | null>(null);
  const [selectedAirline, setSelectedAirline] = useState("all");
  const [selectedDestination, setSelectedDestination] = useState("all");
  const [sort, setSort] = useState("price_asc");
  const [stopsFilter, setStopsFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const maxPrice = useMemo(
    () => (deals.length ? Math.ceil(Math.max(...deals.map((d) => d.price)) / 50) * 50 : 2000),
    [deals],
  );
  const currency = deals[0]?.currency ?? "USD";
  const effectiveCeiling = priceCeiling ?? maxPrice;

  const airlines = useMemo(
    () => [...new Set(deals.map((d) => d.airline).filter(Boolean))].sort(),
    [deals],
  );
  const destinations = useMemo(
    () => [...new Set(deals.map((d) => d.destCity).filter(Boolean))].sort(),
    [deals],
  );

  const visibleDeals = useMemo(() => {
    const filtered = deals.filter((deal) => {
      if (deal.price > effectiveCeiling) return false;
      if (selectedAirline !== "all" && deal.airline !== selectedAirline) return false;
      if (selectedDestination !== "all" && deal.destCity !== selectedDestination) return false;
      if (stopsFilter === "nonstop" && deal.stops !== 0) return false;
      return true;
    });

    const sorted = [...filtered];
    switch (sort) {
      case "price_desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "date":
        sorted.sort((a, b) => a.departureDate.localeCompare(b.departureDate));
        break;
      case "duration":
        sorted.sort((a, b) => (a.durationMinutes ?? Infinity) - (b.durationMinutes ?? Infinity));
        break;
      case "savings":
        sorted.sort((a, b) => (b.savings ?? 0) - (a.savings ?? 0));
        break;
      default:
        sorted.sort((a, b) => a.price - b.price);
    }
    return sorted;
  }, [deals, effectiveCeiling, selectedAirline, selectedDestination, stopsFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(visibleDeals.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedDeals = useMemo(
    () => visibleDeals.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [visibleDeals, currentPage],
  );

  const resetFilters = useCallback(() => {
    setPriceCeiling(null);
    setSelectedAirline("all");
    setSelectedDestination("all");
    setStopsFilter("all");
    setSort("price_asc");
    setPage(1);
  }, []);

  // The exact Duffel offer id is carried into the existing checkout flow, which
  // revalidates it with Duffel before showing a price or taking payment.
  const handleSelectDeal = useCallback(
    (deal: DuffelDeal) => {
      const payload = JSON.stringify({
        type: "flights",
        provider: "duffel",
        offerId: deal.offerId,
        pricing: {
          total_amount: String(deal.price),
          total_currency: deal.currency,
        },
      });
      try {
        sessionStorage.setItem("selectedOffer", payload);
        localStorage.setItem("selectedOffer", payload);
      } catch {
        /* storage unavailable — checkout re-fetches the offer from Duffel anyway */
      }
      navigate(`/flight/checkout?offer=${encodeURIComponent(deal.offerId)}`);
    },
    [navigate],
  );

  const showEmptyState = !loading && !error && deals.length === 0;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background pt-16">
      <Helmet>
        <title>Live Flight Deals & Lowest Fares | Tripile</title>
        <meta name="robots" content={hasQuery ? "noindex, follow" : "index, follow"} />
        <meta
          name="description"
          content="Compare live flight fares from real airline inventory and book the lowest available price on popular routes with Tripile."
        />
        <meta
          name="keywords"
          content="flight deals USA, cheap airline tickets, live flight fares, lowest flight prices, Tripile deals"
        />
        <meta property="og:title" content="Live Flight Deals & Lowest Fares | Tripile" />
        <meta
          property="og:description"
          content="Compare live flight fares from real airline inventory and book the lowest available price on popular routes."
        />
        <meta property="og:url" content="https://tripile.com/deals" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Tripile.com" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@tripile" />
        <meta name="twitter:title" content="Live Flight Deals & Lowest Fares | Tripile" />
        <meta
          name="twitter:description"
          content="Compare live flight fares from real airline inventory and book the lowest available price on popular routes."
        />
        <link rel="canonical" href="https://tripile.com/deals" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Live Flight Deals & Lowest Fares | Tripile.com USA",
            description:
              "Compare live flight fares from real airline inventory and book the lowest available price on popular US and international routes.",
            url: "https://tripile.com/deals",
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://tripile.com/" },
                { "@type": "ListItem", position: 2, name: "Deals", item: "https://tripile.com/deals" },
              ],
            },
          })}
        </script>
      </Helmet>

      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10 space-y-4 py-6"
        >
          <div className="flex items-center justify-center gap-3">
            <Plane className="w-10 h-10 text-primary" />
            {deals.length > 0 && (
              <Badge variant="secondary" className="px-4 py-2 text-sm font-bold">
                <Sparkles className="w-4 h-4 mr-1" />
                {deals.length} live fares
              </Badge>
            )}
          </div>

          <h1 className="text-4xl md:text-6xl font-black font-display">Live Flight Fares</h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time airline inventory on popular routes. Every fare below is a bookable live offer,
            priced exactly as the airline is selling it right now.
          </p>

          <div className="flex justify-center pt-2">
            <SavingsRevealButton ctaHref="/deals#deals-grid" />
          </div>
        </motion.div>

        {/* Filters */}
        {deals.length > 0 && (
          <div className="mb-8">
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4 gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-muted-foreground" />
                  <h2 className="font-bold text-lg">Filter Fares</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters((prev) => !prev)}
                  className="lg:hidden"
                >
                  {showFilters ? "Hide" : "Show"}
                </Button>
              </div>

              <div
                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 ${
                  !showFilters && "hidden lg:grid"
                }`}
              >
                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Max price
                  </Label>
                  <Slider
                    min={0}
                    max={maxPrice}
                    step={25}
                    value={[effectiveCeiling]}
                    onValueChange={(value) => {
                      setPriceCeiling(value[0]);
                      setPage(1);
                    }}
                  />
                  <div className="text-sm text-muted-foreground">
                    Up to {Math.ceil(effectiveCeiling)} {currency}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Airline</Label>
                  <Select
                    value={selectedAirline}
                    onValueChange={(value) => {
                      setSelectedAirline(value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="All airlines" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="all">All airlines</SelectItem>
                      {airlines.map((airline) => (
                        <SelectItem key={airline} value={airline}>
                          {airline}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Destination</Label>
                  <Select
                    value={selectedDestination}
                    onValueChange={(value) => {
                      setSelectedDestination(value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="All destinations" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50 max-h-60">
                      <SelectItem value="all">All destinations</SelectItem>
                      {destinations.map((dest) => (
                        <SelectItem key={dest} value={dest}>
                          {dest}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Sort by</Label>
                  <Select
                    value={sort}
                    onValueChange={(value) => {
                      setSort(value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="price_asc">Price: Low → High</SelectItem>
                      <SelectItem value="price_desc">Price: High → Low</SelectItem>
                      <SelectItem value="date">Departure date</SelectItem>
                      <SelectItem value="duration">Shortest flight</SelectItem>
                      <SelectItem value="savings">Biggest saving</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Stops</Label>
                  <Select
                    value={stopsFilter}
                    onValueChange={(value) => {
                      setStopsFilter(value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="nonstop">Nonstop only</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={resetFilters} className="w-full">
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Result count / refresh */}
        {deals.length > 0 && (
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-muted-foreground flex items-center gap-2">
              Showing <span className="font-bold text-foreground">{paginatedDeals.length}</span> of{" "}
              <span className="font-bold text-foreground">{visibleDeals.length}</span> live fares
              {isFetching && (
                <span className="inline-flex items-center gap-1 text-xs text-primary">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Updating…
                </span>
              )}
              {fromCache && !isFetching && (
                <span className="text-xs text-muted-foreground/70">(cached)</span>
              )}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
              Refresh prices
            </Button>
          </div>
        )}

        {/* States */}
        {loading ? (
          <DealsSkeleton />
        ) : error ? (
          <div className="text-center py-16 max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
            <h2 className="text-xl font-bold mb-2">Unable to load flight deals</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => refetch()} disabled={isFetching} className="gap-2">
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
              Try again
            </Button>
          </div>
        ) : showEmptyState ? (
          <div className="text-center py-16">
            <Plane className="w-14 h-14 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">No flight deals available right now.</h2>
            <p className="text-muted-foreground mb-6">
              Live airline inventory changes constantly — please check back shortly.
            </p>
            <Button onClick={() => refetch()} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Try again
            </Button>
          </div>
        ) : paginatedDeals.length === 0 ? (
          <div className="text-center py-12">
            <Plane className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">No fares match your filters</h2>
            <p className="text-muted-foreground mb-4">Try widening your search</p>
            <Button onClick={resetFilters}>Reset filters</Button>
          </div>
        ) : (
          <>
            <div
              id="deals-grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
            >
              {paginatedDeals.map((deal, index) => (
                <DuffelDealCard
                  key={deal.offerId}
                  deal={deal}
                  index={index}
                  onSelect={handleSelectDeal}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => setPage(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Deals;
