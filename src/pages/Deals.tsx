import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DealCardEnhanced from "@/components/DealCardEnhanced";
import DealQuickView from "@/components/DealQuickView";
import DealsSkeleton from "@/components/DealsSkeleton";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOptimizedMinPriceDeals, type MinPriceDeal } from "@/hooks/useOptimizedMinPriceDeals";
import { useLanguage } from "@/hooks/useLanguage";
import { Badge } from "@/components/ui/badge";
import { Plane, Filter, TrendingDown, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { mockDeals, type Deal } from "@/data/mockDeals";

// Adapter to convert MinPriceDeal to component deal format
const adaptMinPriceDeal = (deal: MinPriceDeal): Deal => ({
  id: deal.id,
  title: `${deal.originCity} to ${deal.destCity}`,
  image: getDestinationImage(deal.destination),
  origin: `${deal.originCity} (${deal.origin})`,
  destination: `${deal.destCity} (${deal.destination})`,
  airline: deal.airline,
  departDate: deal.departureDate,
  returnDate: deal.returnDate,
  price: deal.price,
  originalPrice: Math.round(deal.price * 1.3), // Estimate original price
  cabinClass: deal.cabinClass,
  link: deal.bookingLink,
});

// Get image based on destination
const getDestinationImage = (destCode: string): string => {
  const imageMap: Record<string, string> = {
    'LAX': '/deal-beach.jpg',
    'SFO': '/deal-nyc.jpg',
    'MIA': '/deal-beach.jpg',
    'LAS': '/deal-tokyo.jpg',
    'DEN': '/deal-nyc.jpg',
    'PHX': '/deal-beach.jpg',
    'ORD': '/deal-nyc.jpg',
    'LHR': '/deal-paris.jpg',
    'NRT': '/deal-tokyo.jpg',
    'CDG': '/deal-paris.jpg',
    'CUN': '/deal-beach.jpg',
    'FCO': '/deal-paris.jpg',
    'HNL': '/deal-beach.jpg',
    'MEX': '/deal-tokyo.jpg',
    'SJU': '/deal-beach.jpg',
    'ANC': '/deal-nyc.jpg',
    'DUB': '/deal-paris.jpg',
    'BCN': '/deal-paris.jpg',
    'SYD': '/deal-beach.jpg',
  };
  return imageMap[destCode] || '/deal-beach.jpg';
};

const Deals = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedAirline, setSelectedAirline] = useState<string>("all");
  const [selectedDestination, setSelectedDestination] = useState<string>("all");
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('price_asc'); // Default to lowest price first
  const [showFilters, setShowFilters] = useState(false);

  // Fetch minimum price deals from API with React Query caching (guaranteed 50+ deals)
  const { deals: minPriceDeals, loading, isFetching, error, fromCache, refetch } = useOptimizedMinPriceDeals(50);

  // Hook guarantees 50+ deals by combining API + fallback deals
  // Only show fallback notice if error occurred and deals are all fallback
  const usingFallback = error !== null && minPriceDeals.every(d => d.id.startsWith('fallback-'));
  
  // Always use minPriceDeals (hook guarantees 50+ deals with fallback)
  const rawDeals: Deal[] = minPriceDeals.length > 0 
    ? minPriceDeals.map(adaptMinPriceDeal)
    : mockDeals;

  // Apply client-side filtering
  let filteredDeals = rawDeals.filter(deal => {
    const priceMatch = deal.price >= priceRange[0] && deal.price <= priceRange[1];
    const airlineMatch = selectedAirline === "all" || deal.airline === selectedAirline;
    const destMatch = selectedDestination === "all" || deal.destination.toLowerCase().includes(selectedDestination.toLowerCase());
    return priceMatch && airlineMatch && destMatch;
  });

  // Apply client-side sorting
  switch (sort) {
    case 'price_asc':
      filteredDeals = [...filteredDeals].sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      filteredDeals = [...filteredDeals].sort((a, b) => b.price - a.price);
      break;
    case 'popularity':
      filteredDeals = [...filteredDeals].sort((a, b) => (b.originalPrice - b.price) - (a.originalPrice - a.price));
      break;
    case 'date':
      filteredDeals = [...filteredDeals].sort((a, b) => new Date(a.departDate).getTime() - new Date(b.departDate).getTime());
      break;
    default:
      // Featured - keep original order (already sorted by price from API)
      break;
  }

  // Paginate
  const itemsPerPage = 12;
  const paginatedDeals = filteredDeals.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const displayTotal = filteredDeals.length;
  const displayTotalPages = Math.ceil(filteredDeals.length / itemsPerPage);
  
  // Get unique airlines and destinations for filters
  const airlines: string[] = [...new Set(rawDeals.map(deal => deal.airline))].filter(Boolean).sort();
  const destinations: string[] = [...new Set(rawDeals.map(deal => {
    const match = deal.destination.match(/^([^(]+)/);
    return match ? match[1].trim() : deal.destination;
  }))].filter(Boolean).sort();

  const handleQuickView = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsQuickViewOpen(true);
  };

  const handleDealClick = (deal: Deal) => {
    if (deal.link) {
      navigate(deal.link);
    }
  };

  const handleBookDeal = () => {
    if (selectedDeal?.link) {
      navigate(selectedDeal.link);
      setIsQuickViewOpen(false);
    }
  };

  const resetFilters = () => {
    setPriceRange([0, 2000]);
    setSelectedAirline("all");
    setSelectedDestination("all");
    setPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      <Helmet>
        <title>Exclusive Flight Deals & Travel Offers | CheapFlights USA</title>
        <meta name="description" content="Discover exclusive flight deals and travel offers across the USA. Save up to 50% on roundtrip flights with CheapFlights' best price guarantee." />
        <meta name="keywords" content="flight deals USA, cheap airline tickets, travel offers, discounted flights, last minute deals, best flight prices" />
        <meta property="og:title" content="Exclusive Flight Deals & Travel Offers | CheapFlights" />
        <meta property="og:description" content="Discover exclusive travel deals on flights across the USA. Save up to 50% on roundtrip flights." />
        <link rel="canonical" href="https://cheapflights.com/deals" />
      </Helmet>

      {/* Animated Background Shapes */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 -left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 -right-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 space-y-4"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Plane className="w-12 h-12 text-primary" />
            </motion.div>
            <Badge variant="secondary" className="px-4 py-2 text-sm font-bold animate-pulse">
              <Sparkles className="w-4 h-4 mr-1" />
              {displayTotal}+ Live Deals
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text text-transparent font-display">
            Today's Best Flight Deals
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Exclusive offers handpicked for you. Save up to <span className="text-primary font-bold">50%</span> on flights worldwide
          </p>
        </motion.div>

        {/* Error/Fallback Notice */}
        {usingFallback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Unable to fetch live deals. Showing curated featured deals instead.
            </p>
          </motion.div>
        )}

        {/* Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <h2 className="font-bold text-lg">Filter Deals</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                {showFilters ? "Hide" : "Show"}
              </Button>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 ${!showFilters && 'hidden lg:grid'}`}>
              {/* Price Range */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  Price Range
                </Label>
                <Slider
                  min={0}
                  max={2000}
                  step={50}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="mt-2"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>

              {/* Airline */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Airline</Label>
                <Select value={selectedAirline} onValueChange={setSelectedAirline}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="All Airlines" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="all">All Airlines</SelectItem>
                    {airlines.map((airline) => (
                      <SelectItem key={airline} value={airline}>
                        {airline}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Destination */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Destination</Label>
                <Select value={selectedDestination} onValueChange={setSelectedDestination}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="All Destinations" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50 max-h-60">
                    <SelectItem value="all">All Destinations</SelectItem>
                    {destinations.map((dest) => (
                      <SelectItem key={dest} value={dest}>
                        {dest}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Sort By</Label>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price_asc">Price: Low → High</SelectItem>
                    <SelectItem value="price_desc">Price: High → Low</SelectItem>
                    <SelectItem value="date">Travel Date</SelectItem>
                    <SelectItem value="popularity">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reset */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="w-full"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 flex items-center justify-between"
          >
            <p className="text-muted-foreground flex items-center gap-2">
              Showing <span className="font-bold text-foreground">{paginatedDeals.length}</span> of{" "}
              <span className="font-bold text-foreground">{displayTotal}</span> deals
              {isFetching && !loading && (
                <span className="inline-flex items-center gap-1 text-xs text-primary">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Updating...
                </span>
              )}
              {fromCache && !isFetching && (
                <span className="text-xs text-muted-foreground/70">(cached)</span>
              )}
            </p>
            {!usingFallback && (
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="gap-2">
                <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                Refresh Prices
              </Button>
            )}
          </motion.div>
        )}

        {/* Deals Grid */}
        {loading ? (
          <DealsSkeleton />
        ) : paginatedDeals.length === 0 ? (
          <div className="text-center py-12">
            <Plane className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-bold mb-2">No deals found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
            <Button onClick={resetFilters}>Reset Filters</Button>
          </div>
        ) : (
          <>
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05
                  }
                }
              }}
            >
              {paginatedDeals.map((deal, index) => (
                <motion.div
                  key={deal.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <DealCardEnhanced
                    deal={deal}
                    index={index}
                    onQuickView={() => handleQuickView(deal)}
                    onClick={() => handleDealClick(deal)}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {displayTotalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 mt-12"
              >
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  {[...Array(Math.min(5, displayTotalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        onClick={() => setPage(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(displayTotalPages, p + 1))}
                  disabled={page === displayTotalPages}
                >
                  Next
                </Button>
              </motion.div>
            )}
          </>
        )}
      </main>

      <Footer />

      {/* Quick View Modal */}
      <DealQuickView
        deal={selectedDeal}
        open={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onBook={handleBookDeal}
      />
    </div>
  );
};

export default Deals;
