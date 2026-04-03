import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  MapPin, Plane, Search, RefreshCw, Loader2, AlertCircle, Compass,
  ArrowRight, ChevronDown, Clock, CalendarDays, Route, Send, SearchIcon,
  Satellite, PlaneTakeoff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ─── Types ─── */
interface FlightData {
  flight: { iataNumber: string; icaoNumber: string; number: string };
  airline: { iataCode: string; icaoCode: string; name?: string };
  departure: { iataCode: string; icaoCode: string; terminal?: string; gate?: string; scheduledTime?: string };
  arrival: { iataCode: string; icaoCode: string; terminal?: string; gate?: string; scheduledTime?: string };
  geography: { latitude: number; longitude: number; altitude: number; direction: number };
  speed: { horizontal: number; isGround: boolean; vspeed: number };
  status: string;
}

interface Airport {
  iataCode: string;
  icaoCode: string;
  airportName: string;
  city: string;
  country: string;
}

const statusColors: Record<string, string> = {
  "en-route": "bg-green-600",
  landed: "bg-blue-600",
  scheduled: "bg-yellow-600",
  active: "bg-green-600",
  cancelled: "bg-destructive",
  diverted: "bg-orange-600",
  unknown: "bg-muted-foreground",
};

const statusLabels: Record<string, string> = {
  "en-route": "En Route",
  landed: "Landed",
  scheduled: "Scheduled",
  active: "Active",
  cancelled: "Cancelled",
  diverted: "Diverted",
};

/* ─── Airlines ─── */
const airlinesList = [
  { code: "6E", name: "IndiGo" },
  { code: "AA", name: "American Airlines" },
  { code: "AC", name: "Air Canada" },
  { code: "AF", name: "Air France" },
  { code: "AI", name: "Air India" },
  { code: "AK", name: "AirAsia" },
  { code: "AM", name: "Aeromexico" },
  { code: "AS", name: "Alaska Airlines" },
  { code: "AY", name: "Finnair" },
  { code: "AZ", name: "ITA Airways" },
  { code: "B6", name: "JetBlue Airways" },
  { code: "BA", name: "British Airways" },
  { code: "BR", name: "EVA Air" },
  { code: "CA", name: "Air China" },
  { code: "CI", name: "China Airlines" },
  { code: "CX", name: "Cathay Pacific" },
  { code: "CZ", name: "China Southern Airlines" },
  { code: "DL", name: "Delta Air Lines" },
  { code: "EK", name: "Emirates" },
  { code: "ET", name: "Ethiopian Airlines" },
  { code: "EW", name: "Eurowings" },
  { code: "EY", name: "Etihad Airways" },
  { code: "F9", name: "Frontier Airlines" },
  { code: "FJ", name: "Fiji Airways" },
  { code: "FR", name: "Ryanair" },
  { code: "G3", name: "GOL Airlines" },
  { code: "GA", name: "Garuda Indonesia" },
  { code: "HA", name: "Hawaiian Airlines" },
  { code: "HU", name: "Hainan Airlines" },
  { code: "IB", name: "Iberia" },
  { code: "JL", name: "Japan Airlines" },
  { code: "KE", name: "Korean Air" },
  { code: "KL", name: "KLM Royal Dutch Airlines" },
  { code: "KQ", name: "Kenya Airways" },
  { code: "LA", name: "LATAM Airlines" },
  { code: "LH", name: "Lufthansa" },
  { code: "LO", name: "LOT Polish Airlines" },
  { code: "LX", name: "Swiss International Air Lines" },
  { code: "MH", name: "Malaysia Airlines" },
  { code: "MS", name: "EgyptAir" },
  { code: "MU", name: "China Eastern Airlines" },
  { code: "NH", name: "All Nippon Airways" },
  { code: "NK", name: "Spirit Airlines" },
  { code: "NZ", name: "Air New Zealand" },
  { code: "OS", name: "Austrian Airlines" },
  { code: "OZ", name: "Asiana Airlines" },
  { code: "PC", name: "Pegasus Airlines" },
  { code: "PR", name: "Philippine Airlines" },
  { code: "QF", name: "Qantas" },
  { code: "QR", name: "Qatar Airways" },
  { code: "SA", name: "South African Airways" },
  { code: "SK", name: "SAS Scandinavian Airlines" },
  { code: "SN", name: "Brussels Airlines" },
  { code: "SQ", name: "Singapore Airlines" },
  { code: "SU", name: "Aeroflot" },
  { code: "SV", name: "Saudia" },
  { code: "TG", name: "Thai Airways" },
  { code: "TK", name: "Turkish Airlines" },
  { code: "TP", name: "TAP Air Portugal" },
  { code: "UA", name: "United Airlines" },
  { code: "UK", name: "Vistara" },
  { code: "VN", name: "Vietnam Airlines" },
  { code: "VS", name: "Virgin Atlantic" },
  { code: "VY", name: "Vueling" },
  { code: "W6", name: "Wizz Air" },
  { code: "WN", name: "Southwest Airlines" },
  { code: "WS", name: "WestJet" },
].sort((a, b) => a.name.localeCompare(b.name));

/* ─── Common flight numbers ─── */
const commonFlightNumbers = airlinesList.flatMap((a) =>
  [100, 200, 300, 1, 2, 5, 10, 50].map((n) => ({
    value: `${a.code}${n}`,
    label: a.name,
  }))
).sort((a, b) => a.value.localeCompare(b.value));

/* ─── Tabs ─── */
const tabs = [
  { id: "tracker", label: "Flight Tracker", icon: PlaneTakeoff },
  { id: "schedules", label: "Schedules", icon: Clock },
  { id: "future", label: "Future Schedules", icon: CalendarDays },
  { id: "routes", label: "Airline Routes", icon: Route },
  { id: "nearby", label: "Nearby", icon: Send },
  { id: "autocomplete", label: "Autocomplete", icon: SearchIcon },
  { id: "satellite", label: "Satellite", icon: Satellite },
];

/* ─── Autocomplete Dropdown ─── */
interface DropdownOption { value: string; label: string; sublabel?: string }

const AutocompleteInput = ({
  options, value, onChange, placeholder, icon: Icon, onKeyDown, showChevron = true,
}: {
  options: DropdownOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  icon: React.ElementType;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  showChevron?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!value.trim()) return options;
    const q = value.toLowerCase();
    return options.filter(
      (o) => o.value.toLowerCase().includes(q) || o.label.toLowerCase().includes(q) || o.sublabel?.toLowerCase().includes(q)
    );
  }, [value, options]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (highlightIdx >= 0 && listRef.current) {
      const el = listRef.current.children[highlightIdx] as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIdx]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlightIdx((p) => Math.min(p + 1, Math.min(filtered.length - 1, 49)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((p) => Math.max(p - 1, -1));
    } else if (e.key === "Enter" && highlightIdx >= 0 && open) {
      e.preventDefault();
      onChange(filtered[highlightIdx].value);
      setOpen(false);
      setHighlightIdx(-1);
    } else if (e.key === "Escape") {
      setOpen(false);
    } else {
      onKeyDown?.(e);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
      {showChevron && (
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
      )}
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); setHighlightIdx(-1); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        className={`pl-9 ${showChevron ? "pr-9" : ""}`}
      />
      {open && filtered.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {filtered.slice(0, 50).map((opt, i) => (
            <button
              key={opt.value + i}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2.5 text-sm border-b border-border/50 last:border-0 transition-colors ${
                i === highlightIdx ? "bg-primary/10 text-foreground" : "hover:bg-muted text-foreground"
              }`}
            >
              <span className="font-semibold text-foreground">{opt.value}</span>
              {opt.label !== opt.value && (
                <span className="ml-2 text-muted-foreground text-xs">{opt.label}</span>
              )}
              {opt.sublabel && (
                <span className="ml-1 text-muted-foreground text-xs">· {opt.sublabel}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Coming Soon Panel ─── */
const ComingSoonPanel = ({ title, description }: { title: string; description: string }) => (
  <Card className="mt-6">
    <CardContent className="py-16 text-center">
      <Compass className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mx-auto">{description}</p>
      <Badge variant="secondary" className="mt-4">Coming Soon</Badge>
    </CardContent>
  </Card>
);

/* ─── Main Component ─── */
const FlightTracker = () => {
  const [activeTab, setActiveTab] = useState("tracker");
  const [flightNumber, setFlightNumber] = useState("");
  const [airline, setAirline] = useState("");
  const [airport, setAirport] = useState("");
  const [airports, setAirports] = useState<Airport[]>([]);
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<FlightData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load airports
  useEffect(() => {
    fetch("/data/airports.json")
      .then((r) => r.json())
      .then((data: Airport[]) => setAirports(data.sort((a, b) => a.city.localeCompare(b.city))))
      .catch(console.error);
  }, []);

  const airportOptions = useMemo<DropdownOption[]>(
    () => airports.map((a) => ({ value: a.iataCode, label: `${a.city} - ${a.airportName}`, sublabel: a.country })),
    [airports]
  );

  const airlineOptions = useMemo<DropdownOption[]>(
    () => airlinesList.map((a) => ({ value: a.code, label: a.name })),
    []
  );

  const flightOptions = useMemo<DropdownOption[]>(() => commonFlightNumbers, []);

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !leafletMap.current) {
      leafletMap.current = L.map(mapRef.current, {
        center: [20, 0],
        zoom: 2,
        zoomControl: true,
        scrollWheelZoom: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(leafletMap.current);
      markersLayer.current = L.layerGroup().addTo(leafletMap.current);
    }
    return () => {
      if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; }
    };
  }, []);

  const createPlaneIcon = (rotation: number) =>
    L.divIcon({
      html: `<div style="transform:rotate(${rotation}deg);font-size:24px;color:hsl(var(--primary));">✈</div>`,
      className: "plane-marker",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

  const updateMarkers = useCallback((flightData: FlightData[]) => {
    if (!markersLayer.current || !leafletMap.current) return;
    markersLayer.current.clearLayers();
    const bounds: L.LatLngExpression[] = [];

    flightData.forEach((f) => {
      if (!f.geography?.latitude || !f.geography?.longitude) return;
      const { latitude, longitude, direction } = f.geography;
      bounds.push([latitude, longitude]);
      const marker = L.marker([latitude, longitude], { icon: createPlaneIcon(direction || 0) });
      marker.bindPopup(`
        <div style="min-width:220px;font-family:system-ui;">
          <h3 style="margin:0 0 8px;font-weight:700;font-size:16px;">${f.flight?.iataNumber || "N/A"}</h3>
          <p style="margin:3px 0;"><b>Airline:</b> ${f.airline?.iataCode || "N/A"}</p>
          <p style="margin:3px 0;"><b>Route:</b> ${f.departure?.iataCode || "?"} → ${f.arrival?.iataCode || "?"}</p>
          <p style="margin:3px 0;"><b>Altitude:</b> ${f.geography?.altitude?.toFixed(0) || "N/A"} m</p>
          <p style="margin:3px 0;"><b>Speed:</b> ${f.speed?.horizontal?.toFixed(0) || "N/A"} km/h</p>
          <p style="margin:3px 0;"><b>Status:</b> ${f.status || "N/A"}</p>
        </div>
      `);
      marker.on("click", () => setSelectedFlight(f));
      marker.addTo(markersLayer.current!);
    });

    if (bounds.length > 0) {
      leafletMap.current.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [50, 50], maxZoom: 8 });
    }
  }, []);

  const searchFlights = useCallback(async () => {
    if (!flightNumber.trim() && !airline.trim() && !airport.trim()) {
      setError("Please enter a flight number, airline code, or airport code.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("flight-tracker", {
        body: {
          flightNumber: flightNumber.trim() || undefined,
          airline: airline.trim() || undefined,
          depIata: airport.trim() || undefined,
        },
      });
      if (fnError) throw new Error(fnError.message);
      if (data.error) { setError(data.error); setFlights([]); return; }
      const results = data.flights || [];
      if (results.length === 0) { setError("No flights found. Please check the input and try again."); setFlights([]); return; }
      setFlights(results);
      setSelectedFlight(results[0]);
      updateMarkers(results);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch flight data");
    } finally {
      setLoading(false);
    }
  }, [flightNumber, airline, airport, updateMarkers]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh && flights.length > 0) {
      intervalRef.current = setInterval(searchFlights, 10000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh, flights.length, searchFlights]);

  const statusBg = selectedFlight ? statusColors[selectedFlight.status] || statusColors.unknown : "";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Aviation Dashboard | Tripile"
        description="Complete aviation intelligence — track flights, schedules, routes, satellites & more in real-time."
      />
      <Header />

      <main className="container mx-auto px-4 py-8 mt-16">
        {/* Hero */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1 flex items-center gap-2">
            <PlaneTakeoff className="w-8 h-8 text-primary" />
            Aviation Dashboard
          </h1>
          <p className="text-muted-foreground">
            Complete aviation intelligence — flights, schedules, routes, satellites & more
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-6 border-b border-border">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors border-b-2 ${
                  isActive
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === "tracker" && (
          <>
            {/* Search */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <AutocompleteInput
                    options={flightOptions}
                    value={flightNumber}
                    onChange={setFlightNumber}
                    placeholder="Flight (e.g. AA100)"
                    icon={Search}
                    onKeyDown={(e) => e.key === "Enter" && searchFlights()}
                  />
                  <AutocompleteInput
                    options={airlineOptions}
                    value={airline}
                    onChange={setAirline}
                    placeholder="Airline (e.g. AA)"
                    icon={PlaneTakeoff}
                  />
                  <AutocompleteInput
                    options={airportOptions}
                    value={airport}
                    onChange={setAirport}
                    placeholder="Airport (e.g. JFK)"
                    icon={MapPin}
                    onKeyDown={(e) => e.key === "Enter" && searchFlights()}
                  />
                  <Button onClick={searchFlights} disabled={loading} size="lg" className="w-full">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                    Track Flight
                  </Button>
                </div>

                {flights.length > 0 && (
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <Button
                      variant={autoRefresh ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAutoRefresh(!autoRefresh)}
                    >
                      <RefreshCw className={`w-4 h-4 mr-1 ${autoRefresh ? "animate-spin" : ""}`} />
                      {autoRefresh ? "Auto-Refresh ON" : "Auto-Refresh OFF"}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {autoRefresh ? "Refreshing every 10s" : "Click to enable live tracking"}
                    </span>
                    <Badge variant="secondary">{flights.length} flight(s) found</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-4 mb-6 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Map + Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="overflow-hidden">
                  <div ref={mapRef} className="w-full h-[500px] md:h-[600px]" />
                </Card>
              </div>

              <div className="space-y-4">
                {selectedFlight ? (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Flight Details</CardTitle>
                        <Badge className={`${statusBg} text-white`}>
                          {statusLabels[selectedFlight.status] || selectedFlight.status || "Unknown"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <DetailRow label="Flight" value={selectedFlight.flight?.iataNumber || "N/A"} />
                      <DetailRow label="Airline" value={selectedFlight.airline?.iataCode || "N/A"} />

                      <div className="flex items-center gap-2 py-2 bg-muted/50 rounded-lg px-3">
                        <div className="text-center flex-1">
                          <div className="text-lg font-bold text-foreground">{selectedFlight.departure?.iataCode || "?"}</div>
                          <div className="text-xs text-muted-foreground">Departure</div>
                          {selectedFlight.departure?.terminal && (
                            <div className="text-xs text-muted-foreground">T{selectedFlight.departure.terminal}</div>
                          )}
                          {selectedFlight.departure?.gate && (
                            <div className="text-xs text-muted-foreground">Gate {selectedFlight.departure.gate}</div>
                          )}
                        </div>
                        <ArrowRight className="w-5 h-5 text-primary flex-shrink-0" />
                        <div className="text-center flex-1">
                          <div className="text-lg font-bold text-foreground">{selectedFlight.arrival?.iataCode || "?"}</div>
                          <div className="text-xs text-muted-foreground">Arrival</div>
                          {selectedFlight.arrival?.terminal && (
                            <div className="text-xs text-muted-foreground">T{selectedFlight.arrival.terminal}</div>
                          )}
                          {selectedFlight.arrival?.gate && (
                            <div className="text-xs text-muted-foreground">Gate {selectedFlight.arrival.gate}</div>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-border pt-3 space-y-2">
                        <DetailRow label="Latitude" value={selectedFlight.geography?.latitude?.toFixed(4) || "N/A"} />
                        <DetailRow label="Longitude" value={selectedFlight.geography?.longitude?.toFixed(4) || "N/A"} />
                        <DetailRow label="Altitude" value={`${selectedFlight.geography?.altitude?.toFixed(0) || "N/A"} m`} />
                        <DetailRow label="Speed" value={`${selectedFlight.speed?.horizontal?.toFixed(0) || "N/A"} km/h`} />
                        <DetailRow label="Direction" value={`${selectedFlight.geography?.direction?.toFixed(0) || "N/A"}°`} />
                        <DetailRow label="On Ground" value={selectedFlight.speed?.isGround ? "Yes" : "No"} />
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <PlaneTakeoff className="w-14 h-14 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="font-semibold text-foreground mb-1">No Flight Selected</p>
                      <p className="text-muted-foreground text-sm">Search for a flight to see real-time tracking</p>
                    </CardContent>
                  </Card>
                )}

                {flights.length > 1 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">All Results ({flights.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
                      {flights.map((f, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSelectedFlight(f);
                            if (leafletMap.current && f.geography?.latitude) {
                              leafletMap.current.setView([f.geography.latitude, f.geography.longitude], 6);
                            }
                          }}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedFlight === f ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium text-sm text-foreground">{f.flight?.iataNumber}</span>
                              <span className="text-xs text-muted-foreground ml-2">{f.airline?.iataCode}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {f.departure?.iataCode} → {f.arrival?.iataCode}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "schedules" && (
          <ComingSoonPanel
            title="Real-Time Schedules"
            description="View real-time flight schedules for any airport. Check arrivals and departures with live status updates."
          />
        )}
        {activeTab === "future" && (
          <ComingSoonPanel
            title="Future Schedules"
            description="Browse upcoming flight schedules. Plan ahead with future departure and arrival times for all airlines."
          />
        )}
        {activeTab === "routes" && (
          <ComingSoonPanel
            title="Airline Routes"
            description="Explore airline route networks worldwide. Discover direct connections between airports for any carrier."
          />
        )}
        {activeTab === "nearby" && (
          <ComingSoonPanel
            title="Nearby Flights"
            description="Discover flights currently in the air near any location. See aircraft overhead in real-time."
          />
        )}
        {activeTab === "autocomplete" && (
          <ComingSoonPanel
            title="Autocomplete API"
            description="Search and autocomplete airport and airline data instantly. Perfect for building travel applications."
          />
        )}
        {activeTab === "satellite" && (
          <ComingSoonPanel
            title="Satellite Tracker"
            description="Track satellites in real-time orbit. View positions and trajectories of space objects worldwide."
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-foreground">{value}</span>
  </div>
);

export default FlightTracker;
