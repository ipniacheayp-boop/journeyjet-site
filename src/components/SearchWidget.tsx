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
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";

const airportMap: Record<string, string> = {
  ATL: "ATL",
  LAS: "LAS",
  LAX: "LAX",
  ORD: "ORD",
  YYC: "YYC",
  YXX: "YXX",
  FLL: "FLL",
  PHX: "PHX",
  YWG: "YWG",
  YYZ: "YYZ",
  YVR: "YVR",
  CLE: "CLE",
  COS: "COS",
  DFW: "DFW",
  MCO: "MCO",
};

interface SearchWidgetProps {
  defaultTab?: string;
  isAgentBooking?: boolean;
  agentId?: string;
}

const SearchWidget = ({ defaultTab = "flights", isAgentBooking = false, agentId }: SearchWidgetProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState(defaultTab);

  // Flight state
  const [tripType, setTripType] = useState("round-trip");
  const [flightOrigin, setFlightOrigin] = useState("");
  const [flightOriginCode, setFlightOriginCode] = useState("");
  const [flightDestination, setFlightDestination] = useState("");
  const [flightDestinationCode, setFlightDestinationCode] = useState("");
  const today = new Date().toISOString().split("T")[0];
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
    // Prevent past dates
    if (departDate && departDate < today) newErrors.departDate = "Departure date cannot be in the past";
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
    // Auto-set departure date to today if empty (prevents "required" error from confusing users)
    if (!departDate) {
      const autoDate = today;
      setDepartDate(autoDate);
      // Re-validate with auto-set date
      if (!flightOrigin.trim() || !flightDestination.trim()) {
        validateFlightForm();
        toast.error("Please fix the errors in the form");
        return;
      }
    }
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
        ...(isAgentBooking && agentId && { agentId }),
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
        ...(isAgentBooking && agentId && { agentId }),
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
        ...(isAgentBooking && agentId && { agentId }),
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

  useEffect(() => {
    const type = searchParams.get("type");

    // Switch tab
    if (type === "hotels") setSearchType("hotels");
    if (type === "flights") setSearchType("flights");

    // Hotels → autofill city only
    const city = searchParams.get("city") || searchParams.get("cityCode");
    if (city) {
      setCityCode(city);
      setCityCodeIATA(city);
      setCheckInDate("");
      setCheckOutDate("");
    }

    // Flights → autofill from & to only
    const origin = searchParams.get("originLocationCode");
    const destination = searchParams.get("destinationLocationCode");

    if (origin) {
      setFlightOrigin(airportMap[origin] || origin);
      setFlightOriginCode(origin);
      setDepartDate("");
      setReturnDate("");
    }

    if (destination) {
      setFlightDestination(airportMap[destination] || destination);
      setFlightDestinationCode(destination);
    }
    // Auto scroll to widget
    if (type === "hotels" || type === "flights") {
      setTimeout(() => {
        document.getElementById("search-widget")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [searchParams]);

  return (
    <div className="w-full">
      <Tabs value={searchType} onValueChange={setSearchType} className="w-full">
        {/* Tab Bar */}
        <TabsList className="grid w-full grid-cols-4 mb-5 h-12 bg-muted/60 dark:bg-muted/30 rounded-xl p-1 gap-1">
          <TabsTrigger
            value="flights"
            className="flex items-center gap-2 rounded-lg h-10 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-primary"
          >
            <Plane className="w-4 h-4" />
            <span className="hidden sm:inline">Flights</span>
          </TabsTrigger>
          <TabsTrigger
            value="hotels"
            className="flex items-center gap-2 rounded-lg h-10 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-primary"
          >
            <Hotel className="w-4 h-4" />
            <span className="hidden sm:inline">Hotels</span>
          </TabsTrigger>
          <TabsTrigger
            value="cars"
            className="flex items-center gap-2 rounded-lg h-10 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-primary"
          >
            <Car className="w-4 h-4" />
            <span className="hidden sm:inline">Cars</span>
          </TabsTrigger>
          <TabsTrigger
            value="cruise"
            className="flex items-center gap-2 rounded-lg h-10 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-primary"
          >
            <Ship className="w-4 h-4" />
            <span className="hidden sm:inline">Cruise</span>
          </TabsTrigger>
        </TabsList>

        {/* ── FLIGHTS TAB ── */}
        <TabsContent value="flights" className="space-y-4">
          {/* Trip type selector */}
          <RadioGroup value={tripType} onValueChange={setTripType} className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="round-trip" id="round-trip" className="h-4 w-4" />
              <Label htmlFor="round-trip" className="cursor-pointer text-sm font-medium">
                Round Trip
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="one-way" id="one-way" className="h-4 w-4" />
              <Label htmlFor="one-way" className="cursor-pointer text-sm font-medium">
                One Way
              </Label>
            </div>
          </RadioGroup>

          <form onSubmit={handleFlightSearch} className="space-y-3">
            {/* Row 1: Origin / Destination / Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="flight-origin"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  From
                </Label>
                <AirportDropdown
                  value={flightOrigin}
                  onChange={(value, iataCode) => {
                    setFlightOrigin(value);
                    setFlightOriginCode(iataCode);
                  }}
                  placeholder="City or Airport"
                  className={`pl-10 px-2 py-1 rounded-lg border border-input bg-background text-foreground h-11 ${errors.origin ? "border-destructive" : ""}`}
                />
                {errors.origin && <p className="text-xs text-destructive">{errors.origin}</p>}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="flight-destination"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  To
                </Label>
                <AirportDropdown
                  value={flightDestination}
                  onChange={(value, iataCode) => {
                    setFlightDestination(value);
                    setFlightDestinationCode(iataCode);
                  }}
                  placeholder="City or Airport"
                  className={`pl-10 px-2 py-1 rounded-lg border border-input bg-background text-foreground h-11 ${errors.destination ? "border-destructive" : ""}`}
                />
                {errors.destination && <p className="text-xs text-destructive">{errors.destination}</p>}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="depart-date"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  Depart
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="depart-date"
                    type="date"
                    value={departDate}
                    onChange={(e) => setDepartDate(e.target.value)}
                    className={`pl-10 h-11 rounded-lg ${errors.departDate ? "border-destructive" : ""}`}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                {errors.departDate && <p className="text-xs text-destructive">{errors.departDate}</p>}
              </div>

              {tripType === "round-trip" ? (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="return-date"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                  >
                    Return
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="return-date"
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className={`pl-10 h-11 rounded-lg ${errors.returnDate ? "border-destructive" : ""}`}
                      min={departDate || new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  {errors.returnDate && <p className="text-xs text-destructive">{errors.returnDate}</p>}
                </div>
              ) : (
                <div />
              )}
            </div>

            {/* Row 2: Passengers / Class / Submit */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div className="space-y-1.5">
                <Label
                  htmlFor="passengers"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  Passengers
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    id="passengers"
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                    className="w-full pl-10 pr-4 h-11 rounded-lg border border-input bg-background text-foreground text-sm"
                    aria-label="Number of passengers"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "Passenger" : "Passengers"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="cabin-class"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  Cabin Class
                </Label>
                <select
                  id="cabin-class"
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value)}
                  className="w-full px-3 pr-4 h-11 rounded-lg border border-input bg-background text-sm"
                  aria-label="Cabin class"
                >
                  <option value="ECONOMY">Economy</option>
                  <option value="PREMIUM_ECONOMY">Premium Economy</option>
                  <option value="BUSINESS">Business</option>
                  <option value="FIRST">First Class</option>
                </select>
              </div>

              <Button
                type="submit"
                size="lg"
                className="h-11 w-full gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
              >
                <Search className="w-4 h-4" />
                Search Flights
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* ── HOTELS TAB ── */}
        <TabsContent value="hotels" className="space-y-4">
          <form onSubmit={handleHotelSearch} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="city-code"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  City
                </Label>
                <AirportDropdown
                  value={cityCode}
                  onChange={(value, iataCode) => {
                    setCityCode(value);
                    setCityCodeIATA(iataCode);
                  }}
                  placeholder="City or Airport"
                  className={`pl-10 bg-background text-foreground px-2 py-1 rounded-lg border border-input h-11 ${errors.cityCode ? "border-destructive" : ""}`}
                />
                {errors.cityCode && <p className="text-xs text-destructive">{errors.cityCode}</p>}
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="check-in"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  Check-in
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="check-in"
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className={`pl-10 h-11 rounded-lg ${errors.checkInDate ? "border-destructive" : ""}`}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                {errors.checkInDate && <p className="text-xs text-destructive">{errors.checkInDate}</p>}
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="check-out"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  Check-out
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="check-out"
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className={`pl-10 h-11 rounded-lg ${errors.checkOutDate ? "border-destructive" : ""}`}
                    min={checkInDate || new Date().toISOString().split("T")[0]}
                  />
                </div>
                {errors.checkOutDate && <p className="text-xs text-destructive">{errors.checkOutDate}</p>}
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="hotel-guests"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  Guests
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    id="hotel-guests"
                    value={hotelGuests}
                    aria-label="Number of guests"
                    onChange={(e) => setHotelGuests(e.target.value)}
                    className="w-full pl-10 pr-4 h-11 rounded-lg border border-input bg-background text-foreground text-sm"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "Guest" : "Guests"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div className="space-y-1.5">
                <Label htmlFor="rooms" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Rooms
                </Label>
                <select
                  id="rooms"
                  value={rooms}
                  aria-label="Number of rooms"
                  onChange={(e) => setRooms(e.target.value)}
                  className="w-full px-3 pr-4 h-11 rounded-lg border border-input bg-background text-sm"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "Room" : "Rooms"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <Button
                  type="submit"
                  size="lg"
                  className="h-11 w-full gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
                >
                  <Search className="w-4 h-4" />
                  Search Hotels
                </Button>
              </div>
            </div>
          </form>
        </TabsContent>

        {/* ── CARS TAB ── */}
        <TabsContent value="cars" className="space-y-4">
          <form onSubmit={handleCarSearch} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="pickup-location"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  Pick-up Location
                </Label>
                <AirportDropdown
                  value={pickUpLocation}
                  onChange={(value, iataCode) => {
                    setPickUpLocation(value);
                    setPickUpLocationCode(iataCode);
                  }}
                  placeholder="Airport or City"
                  className={`pl-10 bg-background text-foreground px-2 py-1 rounded-lg border border-input h-11 ${errors.pickUpLocation ? "border-destructive" : ""}`}
                />
                {errors.pickUpLocation && <p className="text-xs text-destructive">{errors.pickUpLocation}</p>}
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="pickup-date"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  Pick-up Date
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="pickup-date"
                    type="date"
                    value={pickUpDate}
                    onChange={(e) => setPickUpDate(e.target.value)}
                    className={`pl-10 h-11 rounded-lg ${errors.pickUpDate ? "border-destructive" : ""}`}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                {errors.pickUpDate && <p className="text-xs text-destructive">{errors.pickUpDate}</p>}
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="dropoff-date"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  Drop-off Date
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="dropoff-date"
                    type="date"
                    value={dropOffDate}
                    onChange={(e) => setDropOffDate(e.target.value)}
                    className={`pl-10 h-11 rounded-lg ${errors.dropOffDate ? "border-destructive" : ""}`}
                    min={pickUpDate || new Date().toISOString().split("T")[0]}
                  />
                </div>
                {errors.dropOffDate && <p className="text-xs text-destructive">{errors.dropOffDate}</p>}
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="driver-age"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  Driver Age
                </Label>
                <Input
                  id="driver-age"
                  type="number"
                  value={driverAge}
                  onChange={(e) => setDriverAge(e.target.value)}
                  min="18"
                  max="99"
                  className="h-11 rounded-lg"
                />
              </div>
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-11 w-full gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
            >
              <Search className="w-4 h-4" />
              Search Cars
            </Button>
          </form>
        </TabsContent>

        {/* ── CRUISE TAB ── */}
        <TabsContent value="cruise" className="space-y-4">
          <form onSubmit={handleCruiseSearch} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="cruise-origin"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  Departure Port
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="cruise-origin"
                    placeholder="Port City"
                    value={cruiseOrigin}
                    onChange={(e) => setCruiseOrigin(e.target.value)}
                    className="pl-10 h-11 rounded-lg"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="cruise-destination"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  Destination
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="cruise-destination"
                    placeholder="Destination Region"
                    value={cruiseDestination}
                    onChange={(e) => setCruiseDestination(e.target.value)}
                    className="pl-10 h-11 rounded-lg"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="cruise-date"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  Departure Date
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="cruise-date"
                    type="date"
                    value={cruiseDate}
                    onChange={(e) => setCruiseDate(e.target.value)}
                    className="pl-10 h-11 rounded-lg"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="cruise-passengers"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  Passengers
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    id="cruise-passengers"
                    value={cruisePassengers}
                    onChange={(e) => setCruisePassengers(e.target.value)}
                    className="w-full pl-10 pr-4 h-11 rounded-lg border border-input bg-background text-foreground text-sm"
                    aria-label="Number of passengers"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "Passenger" : "Passengers"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-11 w-full gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
            >
              <Search className="w-4 h-4" />
              Search Cruises
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SearchWidget;
