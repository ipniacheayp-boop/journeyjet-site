import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DealCard from "@/components/DealCard";
import DealModal from "@/components/DealModal";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useDeals, type Deal as ApiDeal } from "@/hooks/useDeals";
import { useLanguage } from "@/hooks/useLanguage";
import { Badge } from "@/components/ui/badge";
import { Plane, Calendar } from "lucide-react";

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

interface Deal {
  id: string;
  title: string;
  image: string;
  origin: string;
  destination: string;
  airline: string;
  departDate: string;
  returnDate: string;
  price: number;
  originalPrice: number;
  cabinClass: string;
  link?: string;
}

const Deals = () => {
  const { t } = useLanguage();
  const [priceRange, setPriceRange] = useState([0, 1500]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [selectedCabinClass, setSelectedCabinClass] = useState<string[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('featured');

  const { deals: apiDeals, loading, error, total, totalPages } = useDeals({
    min_price: priceRange[0],
    max_price: priceRange[1],
    airline: selectedAirlines.join(',') || undefined,
    page,
    limit: 12,
    sort,
  });

  const deals = apiDeals.map(adaptDeal);
  
  // Debug logging
  useEffect(() => {
    console.log('📊 Deals loaded:', {
      count: deals.length,
      total,
      loading,
      error,
      page,
      totalPages
    });
  }, [deals.length, total, loading, error, page, totalPages]);
  
  const airlines = [...new Set(deals.map(deal => deal.airline))];
  const cabinClasses = [...new Set(deals.map(deal => deal.cabinClass))];

  const filteredDeals = deals.filter(deal => {
    const cabinMatch = selectedCabinClass.length === 0 || selectedCabinClass.includes(deal.cabinClass);
    return cabinMatch;
  });

  const handleAirlineToggle = (airline: string) => {
    setSelectedAirlines(prev =>
      prev.includes(airline)
        ? prev.filter(a => a !== airline)
        : [...prev, airline]
    );
  };

  const handleCabinToggle = (cabin: string) => {
    setSelectedCabinClass(prev =>
      prev.includes(cabin)
        ? prev.filter(c => c !== cabin)
        : [...prev, cabin]
    );
  };

  const resetFilters = () => {
    setPriceRange([0, 1500]);
    setSelectedAirlines([]);
    setSelectedCabinClass([]);
    setPage(1);
  };

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Exclusive Travel Deals - Best Flight Offers | Tripile</title>
        <meta name="description" content="Discover exclusive travel deals on flights worldwide. Save up to 50% on roundtrip flights with Tripile's best offers." />
        <meta property="og:title" content="Exclusive Travel Deals - Best Flight Offers" />
        <meta property="og:description" content="Discover exclusive travel deals on flights worldwide. Save up to 50% on roundtrip flights." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://tripile.com/deals" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "OfferCatalog",
            "name": "Tripile Travel Deals",
            "description": "Exclusive flight deals and offers",
            "itemListElement": deals.slice(0, 5).map((deal, index) => ({
              "@type": "Offer",
              "position": index + 1,
              "itemOffered": {
                "@type": "Flight",
                "name": deal.title,
                "flightNumber": deal.airline,
              },
              "price": deal.price,
              "priceCurrency": "USD",
            })),
          })}
        </script>
      </Helmet>
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('deals.title') || 'Exclusive Travel Deals'}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              {t('deals.subtitle') || 'Discover amazing offers on flights worldwide'}
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Badge variant="secondary" className="text-sm py-2 px-4">
                <Plane className="w-4 h-4 mr-2" />
                {total}+ Active Deals
              </Badge>
              <Badge variant="secondary" className="text-sm py-2 px-4">
                <Calendar className="w-4 h-4 mr-2" />
                Updated Daily
              </Badge>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-64 shrink-0">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-lg">Filters</h2>
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    Reset
                  </Button>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <Label className="mb-3 block">Price Range</Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={1500}
                    step={50}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>

                {/* Airlines */}
                <div className="mb-6">
                  <Label className="mb-3 block">Airlines</Label>
                  <div className="space-y-2">
                    {airlines.map(airline => (
                      <div key={airline} className="flex items-center space-x-2">
                        <Checkbox
                          id={`airline-${airline}`}
                          checked={selectedAirlines.includes(airline)}
                          onCheckedChange={() => handleAirlineToggle(airline)}
                        />
                        <label
                          htmlFor={`airline-${airline}`}
                          className="text-sm cursor-pointer"
                        >
                          {airline}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cabin Class */}
                <div className="mb-6">
                  <Label className="mb-3 block">Cabin Class</Label>
                  <div className="space-y-2">
                    {cabinClasses.map(cabin => (
                      <div key={cabin} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cabin-${cabin}`}
                          checked={selectedCabinClass.includes(cabin)}
                          onCheckedChange={() => handleCabinToggle(cabin)}
                        />
                        <label
                          htmlFor={`cabin-${cabin}`}
                          className="text-sm cursor-pointer"
                        >
                          {cabin}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Deals Grid */}
            <div className="flex-1">
              <div className="mb-4 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {loading ? 'Loading...' : `Showing ${filteredDeals.length} of ${total} deals`}
                </div>
                <div className="flex gap-2 items-center">
                  <Label className="text-sm">Sort:</Label>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="text-sm border rounded-md px-2 py-1 bg-background"
                  >
                    <option value="featured">Featured</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="date">Departure Date</option>
                    <option value="popularity">Popularity</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-48 w-full" />
                      <CardContent className="p-5 space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-10 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-destructive">{error}</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredDeals.map(deal => (
                      <DealCard key={deal.id} deal={deal} onClick={() => handleDealClick(deal)} />
                    ))}
                  </div>
                  {filteredDeals.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No deals match your filters. Try adjusting your criteria.</p>
                    </div>
                  )}
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <span className="flex items-center px-4">
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Deal Modal */}
      <DealModal 
        deal={selectedDeal}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />

      <Footer />
    </div>
  );
};

export default Deals;
