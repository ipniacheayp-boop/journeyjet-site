import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DealCard from "@/components/DealCard";
import { mockDeals } from "@/data/mockDeals";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const Deals = () => {
  const [priceRange, setPriceRange] = useState([0, 1500]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [selectedCabinClass, setSelectedCabinClass] = useState<string[]>([]);

  const airlines = [...new Set(mockDeals.map(deal => deal.airline))];
  const cabinClasses = [...new Set(mockDeals.map(deal => deal.cabinClass))];

  const filteredDeals = mockDeals.filter(deal => {
    const priceMatch = deal.price >= priceRange[0] && deal.price <= priceRange[1];
    const airlineMatch = selectedAirlines.length === 0 || selectedAirlines.includes(deal.airline);
    const cabinMatch = selectedCabinClass.length === 0 || selectedCabinClass.includes(deal.cabinClass);
    return priceMatch && airlineMatch && cabinMatch;
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
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Exclusive Travel Deals</h1>
            <p className="text-muted-foreground">Discover amazing offers on flights worldwide</p>
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
              <div className="mb-4 text-sm text-muted-foreground">
                Showing {filteredDeals.length} of {mockDeals.length} deals
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDeals.map(deal => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
              {filteredDeals.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No deals match your filters. Try adjusting your criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Deals;
