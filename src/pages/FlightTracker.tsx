import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Plane, Search, RefreshCw, Loader2, AlertCircle, Navigation } from "lucide-react";
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

interface FlightData {
  flight: { iataNumber: string; icaoNumber: string; number: string };
  airline: { iataCode: string; icaoCode: string; name?: string };
  departure: { iataCode: string; icaoCode: string; terminal?: string; gate?: string; scheduledTime?: string };
  arrival: { iataCode: string; icaoCode: string; terminal?: string; gate?: string; scheduledTime?: string };
  geography: { latitude: number; longitude: number; altitude: number; direction: number };
  speed: { horizontal: number; isGround: boolean; vspeed: number };
  status: string;
}

const statusColors: Record<string, string> = {
  "en-route": "bg-green-500",
  landed: "bg-blue-500",
  scheduled: "bg-yellow-500",
  active: "bg-green-500",
  cancelled: "bg-red-500",
  diverted: "bg-orange-500",
  unknown: "bg-muted",
};

const FlightTracker = () => {
  const [flightNumber, setFlightNumber] = useState("");
  const [airline, setAirline] = useState("");
  const [airport, setAirport] = useState("");
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<FlightData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  const createPlaneIcon = (rotation: number) => {
    return L.divIcon({
      html: `<div style="transform: rotate(${rotation}deg); font-size: 24px; color: hsl(var(--primary));">✈</div>`,
      className: "plane-marker",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  const updateMarkers = useCallback((flightData: FlightData[]) => {
    if (!markersLayer.current || !leafletMap.current) return;
    markersLayer.current.clearLayers();

    const bounds: L.LatLngExpression[] = [];

    flightData.forEach((f) => {
      if (!f.geography?.latitude || !f.geography?.longitude) return;

      const { latitude, longitude, direction } = f.geography;
      bounds.push([latitude, longitude]);

      const marker = L.marker([latitude, longitude], {
        icon: createPlaneIcon(direction || 0),
      });

      marker.bindPopup(`
        <div style="min-width: 200px; font-family: system-ui;">
          <h3 style="margin: 0 0 8px; font-weight: 600;">${f.flight?.iataNumber || "N/A"}</h3>
          <p style="margin: 2px 0;"><strong>Airline:</strong> ${f.airline?.iataCode || "N/A"}</p>
          <p style="margin: 2px 0;"><strong>From:</strong> ${f.departure?.iataCode || "N/A"}</p>
          <p style="margin: 2px 0;"><strong>To:</strong> ${f.arrival?.iataCode || "N/A"}</p>
          <p style="margin: 2px 0;"><strong>Alt:</strong> ${f.geography?.altitude?.toFixed(0) || "N/A"} m</p>
          <p style="margin: 2px 0;"><strong>Speed:</strong> ${f.speed?.horizontal?.toFixed(0) || "N/A"} km/h</p>
          <p style="margin: 2px 0;"><strong>Status:</strong> ${f.status || "N/A"}</p>
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
      setError("Please enter a flight number, airline, or airport code.");
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

      if (data.error) {
        setError(data.error);
        setFlights([]);
        return;
      }

      const results = data.flights || [];
      if (results.length === 0) {
        setError("No flights found. Check the flight number and try again.");
        setFlights([]);
        return;
      }

      setFlights(results);
      setSelectedFlight(results[0]);
      updateMarkers(results);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch flight data";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [flightNumber, airline, airport, updateMarkers]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh && flights.length > 0) {
      intervalRef.current = setInterval(() => {
        searchFlights();
      }, 10000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, flights.length, searchFlights]);

  const statusBg = selectedFlight ? statusColors[selectedFlight.status] || statusColors.unknown : "";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Flight Tracker | Tripile"
        description="Track flights in real-time on an interactive map. See live position, altitude, speed and status."
      />
      <Header />

      <main className="container mx-auto px-4 py-8 mt-16">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            <Navigation className="inline-block w-8 h-8 mr-2 text-primary" />
            Flight Tracker
          </h1>
          <p className="text-muted-foreground">Track any flight in real-time on an interactive map</p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Flight Number (e.g. AA100)"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchFlights()}
                  className="pl-9"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Airline Code (e.g. AA)"
                  value={airline}
                  onChange={(e) => setAirline(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Airport Code (e.g. JFK)"
                  value={airport}
                  onChange={(e) => setAirport(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={searchFlights} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                Track Flight
              </Button>
            </div>

            {flights.length > 0 && (
              <div className="flex items-center gap-3 mt-4">
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
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div ref={mapRef} className="w-full h-[500px] md:h-[600px]" />
            </Card>
          </div>

          {/* Flight Details */}
          <div className="space-y-4">
            {selectedFlight ? (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Flight Details</CardTitle>
                    <Badge className={`${statusBg} text-white`}>{selectedFlight.status || "Unknown"}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <DetailRow label="Flight" value={selectedFlight.flight?.iataNumber || "N/A"} />
                  <DetailRow label="Airline" value={selectedFlight.airline?.iataCode || "N/A"} />
                  <DetailRow label="Departure" value={selectedFlight.departure?.iataCode || "N/A"} />
                  <DetailRow label="Arrival" value={selectedFlight.arrival?.iataCode || "N/A"} />
                  <DetailRow label="Latitude" value={selectedFlight.geography?.latitude?.toFixed(4) || "N/A"} />
                  <DetailRow label="Longitude" value={selectedFlight.geography?.longitude?.toFixed(4) || "N/A"} />
                  <DetailRow label="Altitude" value={`${selectedFlight.geography?.altitude?.toFixed(0) || "N/A"} m`} />
                  <DetailRow label="Speed" value={`${selectedFlight.speed?.horizontal?.toFixed(0) || "N/A"} km/h`} />
                  <DetailRow label="Direction" value={`${selectedFlight.geography?.direction?.toFixed(0) || "N/A"}°`} />
                  {selectedFlight.departure?.terminal && (
                    <DetailRow label="Dep Terminal" value={selectedFlight.departure.terminal} />
                  )}
                  {selectedFlight.arrival?.terminal && (
                    <DetailRow label="Arr Terminal" value={selectedFlight.arrival.terminal} />
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Navigation className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground text-sm">Search for a flight to see tracking details</p>
                </CardContent>
              </Card>
            )}

            {/* Flight List */}
            {flights.length > 1 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">All Results</CardTitle>
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
                        <span className="font-medium text-sm text-foreground">{f.flight?.iataNumber}</span>
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
