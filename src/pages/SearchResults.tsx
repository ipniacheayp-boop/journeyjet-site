import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useFlightSearch } from "@/hooks/useFlightSearch";
import { useHotelSearch } from "@/hooks/useHotelSearch";
import { useCarSearch } from "@/hooks/useCarSearch";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { toast } from "sonner";
import { Plane, Hotel as HotelIcon, Car, MapPin, Calendar, Users, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "flights";
  const agentId = searchParams.get("agentId") || undefined;
  const { user } = useRequireAuth();
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { searchFlights } = useFlightSearch();
  const { searchHotels } = useHotelSearch();
  const { searchCars } = useCarSearch();

  useEffect(() => {
    performSearch();
  }, [searchParams]);

  const performSearch = async () => {
    setLoading(true);
    try {
      if (type === "flights") {
        const originLocationCode = searchParams.get("originLocationCode") || "";
        const destinationLocationCode = searchParams.get("destinationLocationCode") || "";
        const departureDate = searchParams.get("departureDate") || "";
        const returnDate = searchParams.get("returnDate") || "";
        const adults = parseInt(searchParams.get("adults") || "1");
        const travelClass = searchParams.get("travelClass") || "ECONOMY";

        // Validate required parameters
        if (!originLocationCode || !destinationLocationCode || !departureDate) {
          toast.error("Missing required search parameters. Please start a new search.");
          setResults([]);
          setLoading(false);
          return;
        }

        const data = await searchFlights({
          originLocationCode,
          destinationLocationCode,
          departureDate,
          returnDate: returnDate || undefined,
          adults,
          travelClass,
          currencyCode: "USD",
        });

        console.log('🔍 Search environment:', data?.meta?.environment || 'unknown');
        console.log('📊 Results received:', data?.data?.length || 0);
        
        setResults(data?.data || []);
        
        // Store environment info for UI
        if (data?.meta?.environment) {
          sessionStorage.setItem('flight_search_env', data.meta.environment);
        }
      } else if (type === "hotels") {
        const cityCode = searchParams.get("cityCode") || "";
        const checkInDate = searchParams.get("checkInDate") || "";
        const checkOutDate = searchParams.get("checkOutDate") || "";
        const adults = parseInt(searchParams.get("adults") || "2");
        const roomQuantity = parseInt(searchParams.get("roomQuantity") || "1");

        // Validate required parameters
        if (!cityCode || !checkInDate || !checkOutDate) {
          toast.error("Missing required search parameters. Please start a new search.");
          setResults([]);
          setLoading(false);
          return;
        }

        const data = await searchHotels({
          cityCode,
          checkInDate,
          checkOutDate,
          adults,
          roomQuantity,
          currency: "USD",
        });

        setResults(data?.data || []);
      } else if (type === "cars") {
        const pickUpLocationCode = searchParams.get("pickUpLocationCode") || "";
        const pickUpDate = searchParams.get("pickUpDate") || "";
        const dropOffDate = searchParams.get("dropOffDate") || "";
        const driverAge = parseInt(searchParams.get("driverAge") || "30");

        // Validate required parameters
        if (!pickUpLocationCode || !pickUpDate || !dropOffDate) {
          toast.error("Missing required search parameters. Please start a new search.");
          setResults([]);
          setLoading(false);
          return;
        }

        const data = await searchCars({
          pickUpLocationCode,
          pickUpDate,
          dropOffDate,
          driverAge,
        });

        setResults(data?.data || []);
      }
    } catch (error: any) {
      const errorMessage = error.message || `Failed to search ${type}`;
      console.error('❌ Search failed:', errorMessage);
      toast.error(errorMessage, { duration: 5000 });
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (offer: any) => {
    // Store the offer and agentId in sessionStorage and navigate to booking
    sessionStorage.setItem('selectedOffer', JSON.stringify({ type, offer, agentId }));
    window.location.href = `/booking/${type}`;
  };

  const renderFlightCard = (flight: any, index: number) => {
    const firstSegment = flight.itineraries?.[0]?.segments?.[0];
    const lastSegment = flight.itineraries?.[0]?.segments?.slice(-1)[0];
    const price = flight.price?.total || flight.price?.grandTotal || "N/A";
    const currency = flight.price?.currency || "USD";
    const duration = flight.itineraries?.[0]?.duration || "";

    return (
      <Card key={index} className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Plane className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {firstSegment?.departure?.iataCode} → {lastSegment?.arrival?.iataCode}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {firstSegment?.carrierCode} {firstSegment?.number}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">
                  🟢 Lowest Price Guaranteed
                </Badge>
              </div>
              <div className="text-2xl font-bold text-primary">{formatCurrency(price, currency)}</div>
              <p className="text-sm text-muted-foreground">{currency}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>
                {firstSegment?.departure?.at ? new Date(firstSegment.departure.at).toLocaleString() : "N/A"}
              </span>
            </div>
            {duration && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>Duration: {duration.replace('PT', '').replace('H', 'h ').replace('M', 'm')}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Badge variant="outline">{flight.itineraries?.[0]?.segments?.length || 1} stop(s)</Badge>
              <Badge variant="outline">{flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || "Economy"}</Badge>
            </div>
            <Button onClick={() => handleBook(flight)} className="w-full">
              Book Now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderHotelCard = (hotel: any, index: number) => {
    const offer = hotel.offers?.[0] || hotel;
    const price = offer.price?.total || "N/A";
    const currency = offer.price?.currency || "USD";

    return (
      <Card key={index} className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <HotelIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{hotel.hotel?.name || "Hotel"}</CardTitle>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {hotel.hotel?.cityCode || "N/A"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">
                  🟢 Lowest Price Guaranteed
                </Badge>
              </div>
              <div className="text-2xl font-bold text-primary">{formatCurrency(price, currency)}</div>
              <p className="text-sm text-muted-foreground">{currency}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {offer.room && (
              <div className="text-sm">
                <span className="font-medium">Room: </span>
                {offer.room.description?.text || offer.room.typeEstimated?.category || "Standard"}
              </div>
            )}
            {offer.policies && (
              <div className="text-sm text-muted-foreground">
                Cancellation: {offer.policies.cancellation?.type || "Check policy"}
              </div>
            )}
            <Button onClick={() => handleBook(hotel)} className="w-full">
              Book Now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCarCard = (car: any, index: number) => {
    const vehicle = car.vehicle || {};
    const price = car.price?.total || "N/A";
    const currency = car.price?.currency || "USD";
    const provider = car.provider || {};

    // Build vehicle name
    const vehicleName = vehicle.make && vehicle.model 
      ? `${vehicle.make} ${vehicle.model}` 
      : vehicle.category || "Car Rental";

    return (
      <Card key={index} className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {vehicle.imageUrl ? (
                <img 
                  src={vehicle.imageUrl} 
                  alt={vehicleName}
                  className="w-16 h-12 object-contain rounded-lg bg-muted"
                />
              ) : (
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Car className="w-6 h-6 text-primary" />
                </div>
              )}
              <div>
                <CardTitle className="text-lg">{vehicleName}</CardTitle>
                <p className="text-sm text-muted-foreground">{vehicle.category || "Standard"}</p>
                {provider.name && (
                  <p className="text-xs text-muted-foreground mt-1">by {provider.name}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white text-xs">
                  🟢 Best Price
                </Badge>
              </div>
              <div className="text-2xl font-bold text-primary">{formatCurrency(price, currency)}</div>
              <p className="text-xs text-muted-foreground">total</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Vehicle Features */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{vehicle.seats || 5} seats</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 text-muted-foreground">🚪</span>
                <span>{vehicle.doors || 4} doors</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 text-muted-foreground">🧳</span>
                <span>{vehicle.bags || 2} bags</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 text-muted-foreground">⚙️</span>
                <span>{vehicle.transmission || "Auto"}</span>
              </div>
            </div>

            {/* Feature badges */}
            <div className="flex flex-wrap gap-2">
              {vehicle.hasAC !== false && (
                <Badge variant="outline" className="text-xs">❄️ AC</Badge>
              )}
              {vehicle.transmission && (
                <Badge variant="outline" className="text-xs">{vehicle.transmission}</Badge>
              )}
              {vehicle.fuelType && (
                <Badge variant="outline" className="text-xs">{vehicle.fuelType}</Badge>
              )}
              {vehicle.acrissCode && (
                <Badge variant="secondary" className="text-xs">{vehicle.acrissCode}</Badge>
              )}
            </div>

            <Button onClick={() => handleBook(car)} className="w-full">
              Book Now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Search Results | CheapFlights - Find the Best Deals</title>
        <meta name="description" content="Compare and book the best travel deals on CheapFlights. Find cheap flights, hotels, and car rentals across the USA." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Header />
      
      <main className="flex-1 pt-24 pb-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 capitalize">{type} Search Results</h1>
            <p className="text-muted-foreground">
              {loading ? "Finding the best available price for you..." : `Found ${results.length} result(s)`}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-20 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : results.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="max-w-lg mx-auto">
                  <p className="text-lg font-semibold mb-2">No results found</p>
                  <p className="text-muted-foreground mb-4">
                    {type === 'flights' 
                      ? sessionStorage.getItem('flight_search_env') === 'test'
                        ? 'No flights found. The test environment has limited route availability.'
                        : 'No flights available for this route and dates. Try different dates or check nearby airports.'
                      : type === 'hotels'
                      ? 'No hotels found for the selected city and dates. Try different dates or locations.'
                      : 'No vehicles found for the selected location and dates. Try different dates or locations.'}
                  </p>
                  {type === 'flights' && sessionStorage.getItem('flight_search_env') === 'test' && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6 text-left">
                      <p className="font-medium mb-2 text-sm text-amber-900 dark:text-amber-100">
                        ⚠️ Test Environment - Limited Data
                      </p>
                      <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                        You're using the Amadeus test API which only supports specific routes and dates:
                      </p>
                      <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                        <li>• New York (JFK) → Los Angeles (LAX)</li>
                        <li>• Madrid (MAD) → Paris (CDG)</li>
                        <li>• London (LHR) → New York (JFK)</li>
                        <li>• Dates: 7-14 days from today</li>
                      </ul>
                    </div>
                  )}
                  <Button onClick={() => window.location.href = "/"} size="lg">
                    Start a New Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {type === "flights" && results.map((flight, i) => renderFlightCard(flight, i))}
              {type === "hotels" && results.map((hotel, i) => renderHotelCard(hotel, i))}
              {type === "cars" && results.map((car, i) => renderCarCard(car, i))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;
