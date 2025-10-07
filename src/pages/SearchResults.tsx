import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useFlightSearch } from "@/hooks/useFlightSearch";
import { useHotelSearch } from "@/hooks/useHotelSearch";
import { useCarSearch } from "@/hooks/useCarSearch";
import { toast } from "sonner";
import { Plane, Hotel as HotelIcon, Car, MapPin, Calendar, Users, Clock } from "lucide-react";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "flights";
  
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

        setResults(data?.data || []);
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
      toast.error(error.message || `Failed to search ${type}`);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (offer: any) => {
    // Store the offer in sessionStorage and navigate to booking
    sessionStorage.setItem('selectedOffer', JSON.stringify({ type, offer }));
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
              <div className="text-2xl font-bold text-primary">${price}</div>
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
              <div className="text-2xl font-bold text-primary">${price}</div>
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
    const vehicle = car.vehicle;
    const price = car.price?.total || "N/A";
    const currency = car.price?.currency || "USD";

    return (
      <Card key={index} className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {vehicle?.make || ""} {vehicle?.model || "Vehicle"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{vehicle?.category || "Standard"}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">${price}</div>
              <p className="text-sm text-muted-foreground">{currency}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>{vehicle?.seats || "N/A"} seats</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {vehicle?.transmission && (
                <Badge variant="outline">{vehicle.transmission}</Badge>
              )}
              {vehicle?.acrissCode && (
                <Badge variant="outline">{vehicle.acrissCode}</Badge>
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
      <Header />
      
      <main className="flex-1 pt-24 pb-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 capitalize">{type} Search Results</h1>
            <p className="text-muted-foreground">
              {loading ? "Searching..." : `Found ${results.length} result(s)`}
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
                <p className="text-lg text-muted-foreground mb-4">
                  No results found for your search criteria.
                </p>
                <Button onClick={() => window.location.href = "/"}>
                  Start a New Search
                </Button>
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
