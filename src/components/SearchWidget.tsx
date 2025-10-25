import { useState } from "react";
import { toast } from "sonner";
import { Calendar, MapPin, Users, ChevronDown, Search, Plane, Hotel, Car, Ship } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import AirportDropdown from "@/components/AirportDropdown";

const SearchWidget = () => {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState("flights");
  
  // Flight state
  const [tripType, setTripType] = useState("round-trip");
  const [flightOrigin, setFlightOrigin] = useState("");
  const [flightOriginCode, setFlightOriginCode] = useState("");
  const [flightDestination, setFlightDestination] = useState("");
  const [flightDestinationCode, setFlightDestinationCode] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [cabinClass, setCabinClass] = useState("ECONOMY");

  // Hotel state
  const [cityCode, setCityCode] = useState("");
  const [cityCodeIATA, setCityCodeIATA] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [hotelGuests, setHotelGuests] = useState("2");
  const [rooms, setRooms] = useState("1");

  // Car state
  const [pickUpLocation, setPickUpLocation] = useState("");
  const [pickUpLocationCode, setPickUpLocationCode] = useState("");
  const [pickUpDate, setPickUpDate] = useState("");
  const [dropOffDate, setDropOffDate] = useState("");
  const [driverAge, setDriverAge] = useState("30");

  // Cruise state
  const [cruiseOrigin, setCruiseOrigin] = useState("");
  const [cruiseDestination, setCruiseDestination] = useState("");
  const [cruiseDate, setCruiseDate] = useState("");
  const [cruisePassengers, setCruisePassengers] = useState("2");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateFlightForm = () => {
    const newErrors: Record<string, string> = {};
    if (!flightOrigin.trim()) newErrors.origin = "Origin is required";
    if (!flightDestination.trim()) newErrors.destination = "Destination is required";
    if (!departDate) newErrors.departDate = "Departure date is required";
    if (tripType === "round-trip" && !returnDate) newErrors.returnDate = "Return date is required";
    if (tripType === "round-trip" && departDate && returnDate && new Date(returnDate) < new Date(departDate)) {
      newErrors.returnDate = "Return date must be after departure date";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateHotelForm = () => {
    const newErrors: Record<string, string> = {};
    if (!cityCode.trim()) newErrors.cityCode = "City is required";
    if (!checkInDate) newErrors.checkInDate = "Check-in date is required";
    if (!checkOutDate) newErrors.checkOutDate = "Check-out date is required";
    if (checkInDate && checkOutDate && new Date(checkOutDate) <= new Date(checkInDate)) {
      newErrors.checkOutDate = "Check-out must be after check-in";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCarForm = () => {
    const newErrors: Record<string, string> = {};
    if (!pickUpLocation.trim()) newErrors.pickUpLocation = "Pick-up location is required";
    if (!pickUpDate) newErrors.pickUpDate = "Pick-up date is required";
    if (!dropOffDate) newErrors.dropOffDate = "Drop-off date is required";
    if (pickUpDate && dropOffDate && new Date(dropOffDate) <= new Date(pickUpDate)) {
      newErrors.dropOffDate = "Drop-off must be after pick-up";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFlightSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateFlightForm()) {
      toast.success("Searching for flights...");
      const origin = (flightOriginCode || flightOrigin).trim().toUpperCase();
      const destination = (flightDestinationCode || flightDestination).trim().toUpperCase();
      const params = new URLSearchParams({
        type: "flights",
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate: departDate,
        ...(tripType === "round-trip" && { returnDate }),
        adults: passengers,
        travelClass: cabinClass,
      });
      navigate(`/search-results?${params.toString()}`);
    } else {
      toast.error("Please fix the errors in the form");
    }
  };

  const handleHotelSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateHotelForm()) {
      toast.success("Searching for hotels...");
      const params = new URLSearchParams({
        type: "hotels",
        cityCode: cityCodeIATA || cityCode,
        checkInDate,
        checkOutDate,
        adults: hotelGuests,
        roomQuantity: rooms,
      });
      navigate(`/search-results?${params.toString()}`);
    } else {
      toast.error("Please fix the errors in the form");
    }
  };

  const handleCarSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCarForm()) {
      toast.success("Searching for cars...");
      const pickUp = (pickUpLocationCode || pickUpLocation).trim().toUpperCase();
      const params = new URLSearchParams({
        type: "cars",
        pickUpLocationCode: pickUp,
        pickUpDate,
        dropOffDate,
        driverAge,
      });
      navigate(`/search-results?${params.toString()}`);
    } else {
      toast.error("Please fix the errors in the form");
    }
  };

  const handleCruiseSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Cruise search coming soon! Check our deals page for cruise offers.");
    navigate("/deals");
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

        {/* FLIGHTS TAB */}
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
          </RadioGroup>

          <form onSubmit={handleFlightSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="flight-origin">From</Label>
                <AirportDropdown
                  value={flightOrigin}
                  onChange={(value, iataCode) => {
                    setFlightOrigin(value);
                    setFlightOriginCode(iataCode);
                  }}
                  placeholder="City or Airport"
                  className={`pl-10 ${errors.origin ? 'border-destructive' : ''}`}
                />
                {errors.origin && <p className="text-sm text-destructive">{errors.origin}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="flight-destination">To</Label>
                <AirportDropdown
                  value={flightDestination}
                  onChange={(value, iataCode) => {
                    setFlightDestination(value);
                    setFlightDestinationCode(iataCode);
                  }}
                  placeholder="City or Airport"
                  className={`pl-10 ${errors.destination ? 'border-destructive' : ''}`}
                />
                {errors.destination && <p className="text-sm text-destructive">{errors.destination}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="depart-date">Depart</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="depart-date"
                    type="date"
                    value={departDate}
                    onChange={(e) => setDepartDate(e.target.value)}
                    className={`pl-10 ${errors.departDate ? 'border-destructive' : ''}`}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                {errors.departDate && <p className="text-sm text-destructive">{errors.departDate}</p>}
              </div>

              {tripType === "round-trip" && (
                <div className="space-y-2">
                  <Label htmlFor="return-date">Return</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="return-date"
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className={`pl-10 ${errors.returnDate ? 'border-destructive' : ''}`}
                      min={departDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  {errors.returnDate && <p className="text-sm text-destructive">{errors.returnDate}</p>}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="passengers">Passengers</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    id="passengers"
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                    className="w-full pl-10 pr-10 h-10 rounded-md border border-input bg-background"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cabin-class">Cabin Class</Label>
                <div className="relative">
                  <select
                    id="cabin-class"
                    value={cabinClass}
                    onChange={(e) => setCabinClass(e.target.value)}
                    className="w-full px-3 pr-10 h-10 rounded-md border border-input bg-background"
                  >
                    <option value="ECONOMY">Economy</option>
                    <option value="PREMIUM_ECONOMY">Premium Economy</option>
                    <option value="BUSINESS">Business</option>
                    <option value="FIRST">First Class</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
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

        {/* HOTELS TAB */}
        <TabsContent value="hotels" className="space-y-6">
          <form onSubmit={handleHotelSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="city-code">City</Label>
                <AirportDropdown
                  value={cityCode}
                  onChange={(value, iataCode) => {
                    setCityCode(value);
                    setCityCodeIATA(iataCode);
                  }}
                  placeholder="City or Airport"
                  className={`pl-10 ${errors.cityCode ? 'border-destructive' : ''}`}
                />
                {errors.cityCode && <p className="text-sm text-destructive">{errors.cityCode}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="check-in">Check-in</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="check-in"
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className={`pl-10 ${errors.checkInDate ? 'border-destructive' : ''}`}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                {errors.checkInDate && <p className="text-sm text-destructive">{errors.checkInDate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="check-out">Check-out</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="check-out"
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className={`pl-10 ${errors.checkOutDate ? 'border-destructive' : ''}`}
                    min={checkInDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
                {errors.checkOutDate && <p className="text-sm text-destructive">{errors.checkOutDate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hotel-guests">Guests</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    id="hotel-guests"
                    value={hotelGuests}
                    onChange={(e) => setHotelGuests(e.target.value)}
                    className="w-full pl-10 pr-10 h-10 rounded-md border border-input bg-background"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="rooms">Rooms</Label>
                <div className="relative">
                  <select
                    id="rooms"
                    value={rooms}
                    onChange={(e) => setRooms(e.target.value)}
                    className="w-full px-3 pr-10 h-10 rounded-md border border-input bg-background"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Room' : 'Rooms'}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                </div>
              </div>

              <div className="md:col-span-2 flex items-end">
                <Button type="submit" size="lg" className="w-full gap-2">
                  <Search className="w-5 h-5" />
                  Search Hotels
                </Button>
              </div>
            </div>
          </form>
        </TabsContent>

        {/* CARS TAB */}
        <TabsContent value="cars" className="space-y-6">
          <form onSubmit={handleCarSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="pickup-location">Pick-up Location</Label>
                <AirportDropdown
                  value={pickUpLocation}
                  onChange={(value, iataCode) => {
                    setPickUpLocation(value);
                    setPickUpLocationCode(iataCode);
                  }}
                  placeholder="Airport or City"
                  className={`pl-10 ${errors.pickUpLocation ? 'border-destructive' : ''}`}
                />
                {errors.pickUpLocation && <p className="text-sm text-destructive">{errors.pickUpLocation}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickup-date">Pick-up Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="pickup-date"
                    type="date"
                    value={pickUpDate}
                    onChange={(e) => setPickUpDate(e.target.value)}
                    className={`pl-10 ${errors.pickUpDate ? 'border-destructive' : ''}`}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                {errors.pickUpDate && <p className="text-sm text-destructive">{errors.pickUpDate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dropoff-date">Drop-off Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="dropoff-date"
                    type="date"
                    value={dropOffDate}
                    onChange={(e) => setDropOffDate(e.target.value)}
                    className={`pl-10 ${errors.dropOffDate ? 'border-destructive' : ''}`}
                    min={pickUpDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
                {errors.dropOffDate && <p className="text-sm text-destructive">{errors.dropOffDate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="driver-age">Driver Age</Label>
                <div className="relative">
                  <Input
                    id="driver-age"
                    type="number"
                    value={driverAge}
                    onChange={(e) => setDriverAge(e.target.value)}
                    min="18"
                    max="99"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" size="lg" className="w-full md:w-auto gap-2">
                <Search className="w-5 h-5" />
                Search Cars
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* CRUISE TAB */}
        <TabsContent value="cruise" className="space-y-6">
          <form onSubmit={handleCruiseSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="cruise-origin">Departure Port</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="cruise-origin"
                    placeholder="Port City"
                    value={cruiseOrigin}
                    onChange={(e) => setCruiseOrigin(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cruise-destination">Destination</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="cruise-destination"
                    placeholder="Destination Region"
                    value={cruiseDestination}
                    onChange={(e) => setCruiseDestination(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cruise-date">Departure Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="cruise-date"
                    type="date"
                    value={cruiseDate}
                    onChange={(e) => setCruiseDate(e.target.value)}
                    className="pl-10"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cruise-passengers">Passengers</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    id="cruise-passengers"
                    value={cruisePassengers}
                    onChange={(e) => setCruisePassengers(e.target.value)}
                    className="w-full pl-10 pr-10 h-10 rounded-md border border-input bg-background"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" size="lg" className="w-full md:w-auto gap-2">
                <Search className="w-5 h-5" />
                Search Cruises
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SearchWidget;
