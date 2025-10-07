import { useState } from "react";
import { Calendar, MapPin, Users, ChevronDown, Search, Plane, Hotel, Car, Ship } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

const SearchWidget = () => {
  const [searchType, setSearchType] = useState("flights");
  const [tripType, setTripType] = useState("round-trip");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [cabinClass, setCabinClass] = useState("economy");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!origin.trim()) newErrors.origin = "Origin is required";
    if (!destination.trim()) newErrors.destination = "Destination is required";
    if (!departDate) newErrors.departDate = "Departure date is required";
    if (tripType === "round-trip" && !returnDate) newErrors.returnDate = "Return date is required";
    if (tripType === "round-trip" && departDate && returnDate && new Date(returnDate) < new Date(departDate)) {
      newErrors.returnDate = "Return date must be after departure date";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      toast.success("Searching for best deals...");
      // Navigate to search results
      const params = new URLSearchParams({
        type: searchType,
        origin,
        destination,
        departDate,
        ...(tripType === "round-trip" && { returnDate }),
        passengers,
        cabinClass,
        tripType
      });
      window.location.href = `/search-results?${params.toString()}`;
    } else {
      toast.error("Please fix the errors in the form");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">
      <Tabs value={searchType} onValueChange={setSearchType} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="flights" className="flex items-center gap-2">
            <Plane className="w-4 h-4" />
            <span className="hidden sm:inline">Flights</span>
          </TabsTrigger>
          <TabsTrigger value="hotels" className="flex items-center gap-2">
            <Hotel className="w-4 h-4" />
            <span className="hidden sm:inline">Hotels</span>
          </TabsTrigger>
          <TabsTrigger value="cars" className="flex items-center gap-2">
            <Car className="w-4 h-4" />
            <span className="hidden sm:inline">Cars</span>
          </TabsTrigger>
          <TabsTrigger value="cruise" className="flex items-center gap-2">
            <Ship className="w-4 h-4" />
            <span className="hidden sm:inline">Cruise</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flights" className="space-y-6">
          <RadioGroup value={tripType} onValueChange={setTripType} className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="round-trip" id="round-trip" />
              <Label htmlFor="round-trip" className="cursor-pointer">Round Trip</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="one-way" id="one-way" />
              <Label htmlFor="one-way" className="cursor-pointer">One Way</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="multi-city" id="multi-city" />
              <Label htmlFor="multi-city" className="cursor-pointer">Multi-City</Label>
            </div>
          </RadioGroup>

          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="origin" className="text-sm font-medium">
                  From
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="origin"
                    type="text"
                    placeholder="City or Airport"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className={`pl-10 ${errors.origin ? 'border-destructive' : ''}`}
                    aria-invalid={!!errors.origin}
                    aria-describedby={errors.origin ? "origin-error" : undefined}
                  />
                </div>
                {errors.origin && (
                  <p id="origin-error" className="text-sm text-destructive" role="alert">
                    {errors.origin}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination" className="text-sm font-medium">
                  To
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="destination"
                    type="text"
                    placeholder="City or Airport"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className={`pl-10 ${errors.destination ? 'border-destructive' : ''}`}
                    aria-invalid={!!errors.destination}
                    aria-describedby={errors.destination ? "destination-error" : undefined}
                  />
                </div>
                {errors.destination && (
                  <p id="destination-error" className="text-sm text-destructive" role="alert">
                    {errors.destination}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="depart-date" className="text-sm font-medium">
                  Depart
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="depart-date"
                    type="date"
                    value={departDate}
                    onChange={(e) => setDepartDate(e.target.value)}
                    className={`pl-10 ${errors.departDate ? 'border-destructive' : ''}`}
                    min={new Date().toISOString().split('T')[0]}
                    aria-invalid={!!errors.departDate}
                    aria-describedby={errors.departDate ? "depart-error" : undefined}
                  />
                </div>
                {errors.departDate && (
                  <p id="depart-error" className="text-sm text-destructive" role="alert">
                    {errors.departDate}
                  </p>
                )}
              </div>

              {tripType === "round-trip" && (
                <div className="space-y-2">
                  <Label htmlFor="return-date" className="text-sm font-medium">
                    Return
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="return-date"
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className={`pl-10 ${errors.returnDate ? 'border-destructive' : ''}`}
                      min={departDate || new Date().toISOString().split('T')[0]}
                      aria-invalid={!!errors.returnDate}
                      aria-describedby={errors.returnDate ? "return-error" : undefined}
                    />
                  </div>
                  {errors.returnDate && (
                    <p id="return-error" className="text-sm text-destructive" role="alert">
                      {errors.returnDate}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="passengers" className="text-sm font-medium">
                  Passengers
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    id="passengers"
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                    className="w-full pl-10 pr-10 h-10 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Passenger' : 'Passengers'}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cabin-class" className="text-sm font-medium">
                  Cabin Class
                </Label>
                <div className="relative">
                  <select
                    id="cabin-class"
                    value={cabinClass}
                    onChange={(e) => setCabinClass(e.target.value)}
                    className="w-full px-3 pr-10 h-10 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                  >
                    <option value="economy">Economy</option>
                    <option value="premium-economy">Premium Economy</option>
                    <option value="business">Business</option>
                    <option value="first">First Class</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="flex items-end">
                <Button type="submit" size="lg" className="w-full gap-2">
                  <Search className="w-5 h-5" />
                  Search Flights
                </Button>
              </div>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="hotels" className="space-y-4">
          <p className="text-center text-muted-foreground py-8">Hotel search coming soon!</p>
        </TabsContent>

        <TabsContent value="cars" className="space-y-4">
          <p className="text-center text-muted-foreground py-8">Car rental search coming soon!</p>
        </TabsContent>

        <TabsContent value="cruise" className="space-y-4">
          <p className="text-center text-muted-foreground py-8">Cruise search coming soon!</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SearchWidget;
