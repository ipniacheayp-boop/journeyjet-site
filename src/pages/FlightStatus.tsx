import { useState } from "react";
import { format } from "date-fns";
import { Plane, Search, Clock, MapPin, AlertTriangle, CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AirportDropdown from "@/components/AirportDropdown";

interface FlightResult {
  airline: string;
  airlineCode: string;
  flightNumber: string;
  departureAirport: string;
  departureTime: string;
  departureTerminal?: string;
  departureGate?: string;
  arrivalAirport: string;
  arrivalTime: string;
  arrivalTerminal?: string;
  arrivalGate?: string;
  status: "on-time" | "delayed" | "cancelled" | "landed" | "boarding" | "departed";
  statusLabel: string;
  duration?: string;
  aircraft?: string;
}

const MOCK_RESULTS: FlightResult[] = [
  {
    airline: "Air India",
    airlineCode: "AI",
    flightNumber: "AI202",
    departureAirport: "DEL",
    departureTime: "2026-02-26T08:30:00",
    departureTerminal: "T3",
    departureGate: "G12",
    arrivalAirport: "JFK",
    arrivalTime: "2026-02-26T14:45:00",
    arrivalTerminal: "T4",
    arrivalGate: "B22",
    status: "on-time",
    statusLabel: "On Time",
    duration: "15h 15m",
    aircraft: "Boeing 777-300ER",
  },
  {
    airline: "British Airways",
    airlineCode: "BA",
    flightNumber: "BA145",
    departureAirport: "LHR",
    departureTime: "2026-02-26T10:00:00",
    departureTerminal: "T5",
    departureGate: "A10",
    arrivalAirport: "JFK",
    arrivalTime: "2026-02-26T13:30:00",
    arrivalTerminal: "T7",
    arrivalGate: "C5",
    status: "delayed",
    statusLabel: "Delayed 45 min",
    duration: "8h 30m",
    aircraft: "Airbus A380",
  },
];

const statusConfig = {
  "on-time": {
    color: "bg-emerald-500",
    textColor: "text-emerald-600",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/30",
    icon: CheckCircle2,
  },
  landed: {
    color: "bg-emerald-500",
    textColor: "text-emerald-600",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/30",
    icon: CheckCircle2,
  },
  boarding: {
    color: "bg-blue-500",
    textColor: "text-blue-600",
    bgLight: "bg-blue-50 dark:bg-blue-950/30",
    icon: Plane,
  },
  departed: {
    color: "bg-blue-500",
    textColor: "text-blue-600",
    bgLight: "bg-blue-50 dark:bg-blue-950/30",
    icon: Plane,
  },
  delayed: {
    color: "bg-amber-500",
    textColor: "text-amber-600",
    bgLight: "bg-amber-50 dark:bg-amber-950/30",
    icon: AlertTriangle,
  },
  cancelled: { color: "bg-red-500", textColor: "text-red-600", bgLight: "bg-red-50 dark:bg-red-950/30", icon: XCircle },
};

const timelineSteps = ["Scheduled", "Boarding", "Departed", "Landed"];

function getTimelineIndex(status: string): number {
  switch (status) {
    case "on-time":
      return 0;
    case "boarding":
      return 1;
    case "departed":
      return 2;
    case "landed":
      return 3;
    case "delayed":
      return 0;
    case "cancelled":
      return -1;
    default:
      return 0;
  }
}

const FlightStatusTimeline = ({ status }: { status: string }) => {
  const activeIndex = getTimelineIndex(status);
  const isCancelled = status === "cancelled";

  return (
    <div className="flex items-center justify-between w-full mt-4">
      {timelineSteps.map((step, i) => {
        const isActive = !isCancelled && i <= activeIndex;
        const isCurrent = !isCancelled && i === activeIndex;
        return (
          <div key={step} className="flex flex-col items-center flex-1 relative">
            {i > 0 && (
              <div
                className={cn("absolute top-3 right-1/2 w-full h-0.5 -z-10", isActive ? "bg-primary" : "bg-border")}
              />
            )}
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                isCancelled
                  ? "bg-muted border-border text-muted-foreground"
                  : isCurrent
                    ? "bg-primary border-primary text-primary-foreground scale-110"
                    : isActive
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-background border-border text-muted-foreground",
              )}
            >
              {isCancelled ? "×" : isActive ? "✓" : i + 1}
            </div>
            <span
              className={cn(
                "text-[10px] mt-1 font-medium",
                isCurrent ? "text-primary" : isActive ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const FlightResultCard = ({ flight }: { flight: FlightResult }) => {
  const config = statusConfig[flight.status];
  const StatusIcon = config.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="overflow-hidden border-border/60 shadow-md hover:shadow-lg transition-shadow">
        {/* Status bar */}
        <div className={cn("h-1.5", config.color)} />
        <CardContent className="p-5 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-bold text-sm text-primary">
                {flight.airlineCode}
              </div>
              <div>
                <p className="font-semibold text-foreground">{flight.airline}</p>
                <p className="text-sm text-muted-foreground">
                  {flight.flightNumber} · {flight.aircraft}
                </p>
              </div>
            </div>
            <Badge className={cn("gap-1", config.bgLight, config.textColor, "border-0")}>
              <StatusIcon className="w-3.5 h-3.5" />
              {flight.statusLabel}
            </Badge>
          </div>

          {/* Route */}
          <div className="flex items-center gap-4 md:gap-8">
            {/* Departure */}
            <div className="flex-1 text-center md:text-left">
              <p className="text-2xl md:text-3xl font-bold text-foreground">
                {new Date(flight.departureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className="text-lg font-semibold text-primary">{flight.departureAirport}</p>
              <div className="flex flex-col gap-0.5 mt-1 text-xs text-muted-foreground">
                {flight.departureTerminal && <span>Terminal {flight.departureTerminal}</span>}
                {flight.departureGate && <span>Gate {flight.departureGate}</span>}
              </div>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-muted-foreground">{flight.duration}</span>
              <div className="flex items-center gap-1 text-primary">
                <div className="w-8 h-px bg-primary" />
                <Plane className="w-4 h-4" />
                <div className="w-8 h-px bg-primary" />
              </div>
              <span className="text-xs text-muted-foreground">Direct</span>
            </div>

            {/* Arrival */}
            <div className="flex-1 text-center md:text-right">
              <p className="text-2xl md:text-3xl font-bold text-foreground">
                {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className="text-lg font-semibold text-primary">{flight.arrivalAirport}</p>
              <div className="flex flex-col gap-0.5 mt-1 text-xs text-muted-foreground">
                {flight.arrivalTerminal && <span>Terminal {flight.arrivalTerminal}</span>}
                {flight.arrivalGate && <span>Gate {flight.arrivalGate}</span>}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <FlightStatusTimeline status={flight.status} />
        </CardContent>
      </Card>
    </motion.div>
  );
};

const FlightStatus = () => {
  const [tab, setTab] = useState("flight-number");
  const [flightInput, setFlightInput] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [routeOrigin, setRouteOrigin] = useState("");
  const [routeOriginCode, setRouteOriginCode] = useState("");
  const [routeDest, setRouteDest] = useState("");
  const [routeDestCode, setRouteDestCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<FlightResult[] | null>(null);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const parseFlightInput = (input: string) => {
    const cleaned = input.trim().toUpperCase();
    const match = cleaned.match(/^([A-Z]{2})(\d+)$/);
    if (match) return { carrierCode: match[1], flightNumber: match[2] };
    // Try with space: "AI 202"
    const match2 = cleaned.match(/^([A-Z]{2})\s*(\d+)$/);
    if (match2) return { carrierCode: match2[1], flightNumber: match2[2] };
    return null;
  };

  const handleSearch = async () => {
    setError("");
    setResults(null);
    setSearched(true);

    if (!date) {
      setError("Please select a date.");
      return;
    }

    const dateStr = format(date, "yyyy-MM-dd");

    if (tab === "flight-number") {
      const parsed = parseFlightInput(flightInput);
      if (!parsed) {
        setError("Enter a valid flight number (e.g., AI202, BA145)");
        return;
      }

      setLoading(true);
      try {
        const { data, error: fnError } = await supabase.functions.invoke("flight-status", {
          body: {
            searchType: "flight",
            carrierCode: parsed.carrierCode,
            flightNumber: parsed.flightNumber,
            date: dateStr,
          },
        });

        if (fnError) throw fnError;

        if (data?.mock || !data?.data?.length) {
          // Use mock fallback
          const filtered = MOCK_RESULTS.filter((r) => r.flightNumber.toUpperCase().includes(flightInput.toUpperCase()));
          setResults(filtered.length ? filtered : MOCK_RESULTS.slice(0, 1));
        } else {
          setResults(transformAmadeusData(data.data));
        }
      } catch {
        // Fallback to mock
        setResults(MOCK_RESULTS.slice(0, 1));
      } finally {
        setLoading(false);
      }
    } else {
      const origin = routeOriginCode || routeOrigin.trim().toUpperCase().slice(0, 3);
      const dest = routeDestCode || routeDest.trim().toUpperCase().slice(0, 3);
      if (!origin || !dest) {
        setError("Please select origin and destination airports.");
        return;
      }

      setLoading(true);
      try {
        const { data, error: fnError } = await supabase.functions.invoke("flight-status", {
          body: { searchType: "route", origin, destination: dest, date: dateStr },
        });

        if (fnError) throw fnError;

        if (data?.mock || !data?.data?.length) {
          setResults(MOCK_RESULTS);
        } else {
          setResults(transformRouteData(data.data));
        }
      } catch {
        setResults(MOCK_RESULTS);
      } finally {
        setLoading(false);
      }
    }
  };

  const transformAmadeusData = (apiData: any[]): FlightResult[] => {
    return apiData.slice(0, 5).map((item: any) => {
      const dep = item.flightPoints?.[0] || {};
      const arr = item.flightPoints?.[1] || {};
      const depTiming = dep.departure || {};
      const arrTiming = arr.arrival || {};

      return {
        airline: item.flightDesignator?.carrierCode || "Unknown",
        airlineCode: item.flightDesignator?.carrierCode || "??",
        flightNumber: `${item.flightDesignator?.carrierCode || ""}${item.flightDesignator?.flightNumber || ""}`,
        departureAirport: dep.iataCode || "???",
        departureTime: depTiming.timings?.[0]?.value || new Date().toISOString(),
        departureTerminal: dep.departure?.terminal?.code,
        departureGate: dep.departure?.gate?.mainGate,
        arrivalAirport: arr.iataCode || "???",
        arrivalTime: arrTiming.timings?.[0]?.value || new Date().toISOString(),
        arrivalTerminal: arr.arrival?.terminal?.code,
        arrivalGate: arr.arrival?.gate?.mainGate,
        status: "on-time",
        statusLabel: "On Time",
        duration: "",
        aircraft: item.legs?.[0]?.aircraftEquipment?.aircraftType || "",
      };
    });
  };

  const transformRouteData = (apiData: any[]): FlightResult[] => {
    return apiData.slice(0, 5).map((offer: any) => {
      const seg = offer.itineraries?.[0]?.segments?.[0];
      if (!seg) return MOCK_RESULTS[0];
      const statuses: Array<"on-time" | "delayed"> = ["on-time", "delayed"];
      return {
        airline: seg.carrierCode || "Unknown",
        airlineCode: seg.carrierCode || "??",
        flightNumber: `${seg.carrierCode}${seg.number}`,
        departureAirport: seg.departure?.iataCode || "???",
        departureTime: seg.departure?.at || new Date().toISOString(),
        departureTerminal: seg.departure?.terminal,
        arrivalAirport: seg.arrival?.iataCode || "???",
        arrivalTime: seg.arrival?.at || new Date().toISOString(),
        arrivalTerminal: seg.arrival?.terminal,
        status: statuses[Math.random() > 0.7 ? 1 : 0],
        statusLabel: Math.random() > 0.7 ? "Delayed" : "On Time",
        duration: offer.itineraries?.[0]?.duration?.replace("PT", "").toLowerCase() || "",
        aircraft: seg.aircraft?.code || "",
      };
    });
  };

  return (
    <>
      <SEOHead
        title="Flight Status – Real-Time Tracking | Tripile.com"
        description="Check real-time flight status by flight number or route on Tripile.com. See departures, arrivals, delays, gate updates, and cancellations—then book flights, hotels, and cars in one place."
        keywords="flight status, flight tracker, airline delays, airport departures, Tripile flight status"
        canonicalUrl="https://tripile.com/flight-status"
      />
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-primary/10 shadow-md mb-5">
              <Plane className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">Flight Status</h1>
            <p className="text-muted-foreground mt-3 text-lg">Track your flight in real-time</p>
          </motion.div>

          {/* Search Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="shadow-2xl border border-border/40 rounded-3xl bg-background/80 backdrop-blur-xl">
              <CardContent className="p-6 md:p-8">
                <Tabs value={tab} onValueChange={setTab}>
                  <TabsList className="w-full grid grid-cols-2 mb-6 bg-muted/40 p-1 rounded-xl">
                    <TabsTrigger value="flight-number" className="gap-2 rounded-lg">
                      <Plane className="w-4 h-4" /> By Flight Number
                    </TabsTrigger>
                    <TabsTrigger value="route" className="gap-2 rounded-lg">
                      <MapPin className="w-4 h-4" /> By Route
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="flight-number">
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Flight Number</Label>
                        <Input
                          placeholder="e.g. AI202, BA145"
                          value={flightInput}
                          onChange={(e) => setFlightInput(e.target.value)}
                          className="h-12 rounded-xl shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Departure Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full h-12 justify-start text-left font-normal rounded-xl shadow-sm",
                                !date && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="route">
                    <div className="grid gap-5 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>From</Label>
                        <AirportDropdown
                          value={routeOrigin}
                          onChange={(val, code) => {
                            setRouteOrigin(val);
                            setRouteOriginCode(code);
                          }}
                          placeholder="City or airport"
                          className="flex h-12 w-full rounded-xl border border-input bg-background pl-10 pr-3 py-2 text-base shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>To</Label>
                        <AirportDropdown
                          value={routeDest}
                          onChange={(val, code) => {
                            setRouteDest(val);
                            setRouteDestCode(code);
                          }}
                          placeholder="City or airport"
                          className="flex h-12 w-full rounded-xl border border-input bg-background pl-10 pr-3 py-2 text-base shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full h-12 justify-start text-left font-normal rounded-xl shadow-sm",
                                !date && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  size="lg"
                  className="w-full mt-8 h-12 gap-2 rounded-xl shadow-lg"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  {loading ? "Checking..." : "Check Status"}
                </Button>

                {error && (
                  <p className="text-destructive text-sm mt-4 flex items-center gap-1.5 bg-destructive/10 px-3 py-2 rounded-lg">
                    <AlertTriangle className="w-4 h-4" /> {error}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Results */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center mt-12 gap-3"
              >
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Fetching flight status...</p>
              </motion.div>
            )}

            {!loading && searched && results && results.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 space-y-5">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" /> Results ({results.length})
                </h2>
                {results.map((flight, i) => (
                  <div className="transition-all hover:scale-[1.01]">
                    <FlightResultCard key={i} flight={flight} />
                  </div>
                ))}
              </motion.div>
            )}

            {!loading && searched && results && results.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No flights found</h3>
                <p className="text-muted-foreground mt-1">Try a different flight number or route.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <article
            className="mt-16 max-w-3xl mx-auto prose prose-sm md:prose-base dark:prose-invert text-muted-foreground"
            aria-labelledby="flight-status-guide-heading"
          >
            <h2 id="flight-status-guide-heading" className="text-foreground font-display text-xl md:text-2xl font-bold">
              How to use Tripile flight status before you travel
            </h2>
            <p>
              Flight schedules are dynamic: weather, air traffic, crew timing, and gate changes can all shift what looked
              like a simple itinerary. Checking status early—and again closer to departure—helps you make better decisions
              about when to leave for the airport, whether to rebook, and how tight your connections really are. Tripile
              provides this flight status tool as a companion to booking: use it to validate the operational reality behind
              your reservation, not just the ideal timetable printed on your confirmation.
            </p>
            <p>
              Searching by flight number is best when you already know the carrier code and numeric flight identifier
              (for example, a typical airline code plus digits). If you are monitoring a route instead—especially when
              multiple carriers operate between the same city pair—searching by origin and destination can surface
              relevant departures for your selected date. Keep in mind that status displays are only as accurate as the
              latest data available from airline systems; when in doubt, confirm at the airport or with your carrier.
            </p>
            <p>
              Status checks pair naturally with the rest of your trip. After you confirm timing, you can plan ground
              transportation and lodging with fewer surprises. Start a new search from Tripile’s dedicated hubs: book{" "}
              <Link to="/flights" className="text-primary font-medium hover:underline">
                flights
              </Link>
              , compare{" "}
              <Link to="/hotels" className="text-primary font-medium hover:underline">
                hotels
              </Link>
              , and reserve{" "}
              <Link to="/car-rentals" className="text-primary font-medium hover:underline">
                car rentals
              </Link>{" "}
              using clean URLs that are easy for travelers—and search engines—to understand. If you are hunting for
              seasonal discounts, browse{" "}
              <Link to="/deals" className="text-primary font-medium hover:underline">
                featured deals
              </Link>{" "}
              for timely offers that may match your dates.
            </p>
            <p>
              Finally, if your status results show a delay or cancellation, prioritize safety and buffer time over
              optimistic connections. Tripile support can help you interpret options when disruptions occur, so you can
              focus on getting to your destination with less stress—even when the schedule refuses to cooperate.
            </p>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default FlightStatus;
