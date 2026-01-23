import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFlightSearch } from "@/hooks/useFlightSearch";
import { useHotelSearch } from "@/hooks/useHotelSearch";
import { useCarSearch } from "@/hooks/useCarSearch";
import FlightResultCard from "@/components/FlightResultCard";
import HotelResultCard from "@/components/HotelResultCard";
import CarResultCard from "@/components/CarResultCard";
import { toast } from "sonner";
import CallSupportPopup from "@/components/CallSupportPopup";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "flights";
  const agentId = searchParams.get("agentId") || undefined;

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { searchFlights, retryState } = useFlightSearch();
  const { searchHotels } = useHotelSearch();
  const { searchCars } = useCarSearch();
  const [showCallPopup, setShowCallPopup] = useState(false);

  useEffect(() => {
    performSearch();
  }, [searchParams]);

  useEffect(() => {
    if (sessionStorage.getItem("callPopupShown")) return;

    const timer = setTimeout(() => {
      sessionStorage.setItem("callPopupShown", "true");
      setShowCallPopup(true);
    }, 6000); // 6 seconds after results page loads

    return () => clearTimeout(timer);
  }, []);

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

        console.log("🔍 Search environment:", data?.meta?.environment || "unknown");
        console.log("📊 Results received:", data?.data?.length || 0);

        setResults(data?.data || []);

        // Store environment info for UI
        if (data?.meta?.environment) {
          sessionStorage.setItem("flight_search_env", data.meta.environment);
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
      console.error("❌ Search failed:", errorMessage);
      toast.error(errorMessage, { duration: 5000 });
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (offer: any) => {
    // Store the offer and agentId in sessionStorage and navigate to booking
    sessionStorage.setItem("selectedOffer", JSON.stringify({ type, offer, agentId }));
    window.location.href = `/booking/${type}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Search Results | CheapFlights - Find the Best Deals</title>
        <meta
          name="description"
          content="Compare and book the best travel deals on CheapFlights. Find cheap flights, hotels, and car rentals across the USA."
        />
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
            <div className="space-y-6">
              {/* Retry indicator */}
              {type === "flights" && retryState.isRetrying && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700 rounded-lg p-4 flex items-center gap-3">
                  <div className="animate-spin h-5 w-5 border-2 border-amber-500 border-t-transparent rounded-full" />
                  <div>
                    <p className="font-medium text-amber-900 dark:text-amber-100">
                      Retrying... attempt {retryState.currentAttempt} of {retryState.maxAttempts}
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      High demand detected. Please wait while we try again.
                    </p>
                  </div>
                </div>
              )}
              
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
            </div>
          ) : results.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="max-w-lg mx-auto">
                  <p className="text-lg font-semibold mb-2">No results found</p>
                  <p className="text-muted-foreground mb-4">
                    {type === "flights"
                      ? sessionStorage.getItem("flight_search_env") === "test"
                        ? "No flights found. The test environment has limited route availability."
                        : "No flights available for this route and dates. Try different dates or check nearby airports."
                      : type === "hotels"
                        ? "No hotels found for the selected city and dates. Try different dates or locations."
                        : "No vehicles found for the selected location and dates. Try different dates or locations."}
                  </p>
                  {type === "flights" && sessionStorage.getItem("flight_search_env") === "test" && (
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
                  <Button onClick={() => (window.location.href = "/")} size="lg">
                    Start a New Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {type === "flights" &&
                results.map((flight, i) => <FlightResultCard key={i} flight={flight} onBook={handleBook} />)}
              {type === "hotels" &&
                results.map((hotel, i) => <HotelResultCard key={i} hotel={hotel} onBook={handleBook} />)}
              {type === "cars" && results.map((car, i) => <CarResultCard key={i} car={car} onBook={handleBook} />)}
            </div>
          )}
        </div>
      </main>

      {showCallPopup && <CallSupportPopup onClose={() => setShowCallPopup(false)} />}

      <Footer />
    </div>
  );
};

export default SearchResults;
