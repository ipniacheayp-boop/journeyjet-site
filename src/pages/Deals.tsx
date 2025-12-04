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
import { useDeals, type Deal as ApiDeal } from "@/hooks/useDeals";
import { useLanguage } from "@/hooks/useLanguage";
import { Badge } from "@/components/ui/badge";
import { Plane, Filter, TrendingDown, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { mockDeals, type Deal } from "@/data/mockDeals";

// Adapter to convert API deal to component deal format
const adaptDeal = (apiDeal: ApiDeal): Deal => ({
  id: apiDeal.id,
  title: apiDeal.title,
  image: Array.isArray(apiDeal.images) ? apiDeal.images[0] : apiDeal.images || '/deal-beach.jpg',
  origin: `${apiDeal.origin_city} (${apiDeal.origin_code})`,
  destination: `${apiDeal.dest_city} (${apiDeal.dest_code})`,
  airline: apiDeal.airline,
  departDate: apiDeal.date_from,
  returnDate: apiDeal.date_to,
  price: apiDeal.price_usd,
  originalPrice: apiDeal.original_price_usd,
  cabinClass: apiDeal.class,
  link: `/deals/${apiDeal.slug}`,
});

const Deals = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedAirline, setSelectedAirline] = useState<string>("all");
  const [selectedDestination, setSelectedDestination] = useState<string>("all");
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  const { deals: apiDeals, loading, error, total, totalPages } = useDeals({
    min_price: priceRange[0],
    max_price: priceRange[1],
    airline: selectedAirline !== "all" ? selectedAirline : undefined,
    page,
    limit: 12,
    sort,
  });

  // Use API deals or fallback to mock deals
  const rawDeals = error || apiDeals.length === 0 ? mockDeals : apiDeals.map(adaptDeal);
  
  useEffect(() => {
    setUsingFallback(error !== null || (apiDeals.length === 0 && !loading));
  }, [error, apiDeals.length, loading]);

  // Apply client-side filtering for fallback deals
  let filteredDeals = rawDeals.filter(deal => {
    const priceMatch = deal.price >= priceRange[0] && deal.price <= priceRange[1];
    const airlineMatch = selectedAirline === "all" || deal.airline === selectedAirline;
    const destMatch = selectedDestination === "all" || deal.destination.toLowerCase().includes(selectedDestination.toLowerCase());
    return priceMatch && airlineMatch && destMatch;
  });

  // Apply client-side sorting for fallback deals
  if (usingFallback) {
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
      default:
        break;
    }
  }

  const deals = filteredDeals;
  const displayTotal = usingFallback ? mockDeals.length : total;
  const displayTotalPages = usingFallback ? Math.ceil(deals.length / 12) : totalPages;
  
  // Get unique airlines and destinations for filters
  const airlines = [...new Set(rawDeals.map(deal => deal.airline))].sort();
  const destinations = [...new Set(rawDeals.map(deal => {
    const match = deal.destination.match(/^([^(]+)/);
    return match ? match[1].trim() : deal.destination;
  }))].sort();

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
        <title>Exclusive Travel Deals - Best Flight Offers | Tripile</title>
        <meta name="description" content="Discover exclusive travel deals on flights worldwide. Save up to 50% on roundtrip flights with Tripile's best offers." />
        <meta property="og:title" content="Exclusive Travel Deals - Best Flight Offers" />
        <meta property="og:description" content="Discover exclusive travel deals on flights worldwide. Save up to 50% on roundtrip flights." />
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
            <p className="text-muted-foreground">
              Showing <span className="font-bold text-foreground">{deals.length}</span> of{" "}
              <span className="font-bold text-foreground">{displayTotal}</span> deals
            </p>
          </motion.div>
        )}

        {/* Deals Grid */}
        {loading ? (
          <DealsSkeleton />
        ) : deals.length === 0 ? (
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
              {deals.map((deal, index) => (
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
