import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  MapPin, Plane, Search, RefreshCw, Loader2, AlertCircle, Compass,
  ArrowRight, ChevronDown, Clock, CalendarDays, Route, Send,
  Satellite, PlaneTakeoff, LocateFixed
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
  iataCode: string; icaoCode: string; airportName: string; city: string; country: string;
}

interface DropdownOption { value: string; label: string; sublabel?: string }

const statusColors: Record<string, string> = {
  "en-route": "bg-green-600", landed: "bg-blue-600", scheduled: "bg-yellow-600",
  active: "bg-green-600", cancelled: "bg-destructive", diverted: "bg-orange-600", unknown: "bg-muted-foreground",
};
const statusLabels: Record<string, string> = {
  "en-route": "En Route", landed: "Landed", scheduled: "Scheduled",
  active: "Active", cancelled: "Cancelled", diverted: "Diverted",
};

/* ─── Airlines ─── */
const airlinesList = [
  { code: "6E", name: "IndiGo" },{ code: "AA", name: "American Airlines" },{ code: "AC", name: "Air Canada" },
  { code: "AF", name: "Air France" },{ code: "AI", name: "Air India" },{ code: "AK", name: "AirAsia" },
  { code: "AM", name: "Aeromexico" },{ code: "AS", name: "Alaska Airlines" },{ code: "AY", name: "Finnair" },
  { code: "AZ", name: "ITA Airways" },{ code: "B6", name: "JetBlue Airways" },{ code: "BA", name: "British Airways" },
  { code: "BR", name: "EVA Air" },{ code: "CA", name: "Air China" },{ code: "CI", name: "China Airlines" },
  { code: "CX", name: "Cathay Pacific" },{ code: "CZ", name: "China Southern" },{ code: "DL", name: "Delta Air Lines" },
  { code: "EK", name: "Emirates" },{ code: "ET", name: "Ethiopian Airlines" },{ code: "EY", name: "Etihad Airways" },
  { code: "F9", name: "Frontier Airlines" },{ code: "FR", name: "Ryanair" },{ code: "GA", name: "Garuda Indonesia" },
  { code: "HA", name: "Hawaiian Airlines" },{ code: "IB", name: "Iberia" },{ code: "JL", name: "Japan Airlines" },
  { code: "KE", name: "Korean Air" },{ code: "KL", name: "KLM" },{ code: "LA", name: "LATAM Airlines" },
  { code: "LH", name: "Lufthansa" },{ code: "LX", name: "Swiss Air" },{ code: "MH", name: "Malaysia Airlines" },
  { code: "MU", name: "China Eastern" },{ code: "NH", name: "All Nippon Airways" },{ code: "NK", name: "Spirit Airlines" },
  { code: "NZ", name: "Air New Zealand" },{ code: "OS", name: "Austrian Airlines" },{ code: "QF", name: "Qantas" },
  { code: "QR", name: "Qatar Airways" },{ code: "SK", name: "SAS" },{ code: "SQ", name: "Singapore Airlines" },
  { code: "SV", name: "Saudia" },{ code: "TG", name: "Thai Airways" },{ code: "TK", name: "Turkish Airlines" },
  { code: "TP", name: "TAP Portugal" },{ code: "UA", name: "United Airlines" },{ code: "VN", name: "Vietnam Airlines" },
  { code: "VS", name: "Virgin Atlantic" },{ code: "W6", name: "Wizz Air" },{ code: "WN", name: "Southwest Airlines" },
].sort((a, b) => a.name.localeCompare(b.name));

const commonFlights = airlinesList.flatMap((a) =>
  [1, 2, 5, 10, 50, 100, 200, 300].map((n) => ({ value: `${a.code}${n}`, label: a.name }))
).sort((a, b) => a.value.localeCompare(b.value));

/* ─── Tabs ─── */
const tabs = [
  { id: "tracker", label: "Flight Tracker", icon: PlaneTakeoff },
  { id: "schedules", label: "Schedules", icon: Clock },
  { id: "future", label: "Future Schedules", icon: CalendarDays },
  { id: "routes", label: "Airline Routes", icon: Route },
  { id: "nearby", label: "Nearby", icon: Send },
  { id: "autocomplete", label: "Autocomplete", icon: Search },
  { id: "satellite", label: "Satellite", icon: Satellite },
];

/* ─── Autocomplete Input ─── */
const AutocompleteInput = ({
  options, value, onChange, placeholder, icon: Icon, onKeyDown,
}: {
  options: DropdownOption[]; value: string; onChange: (v: string) => void;
  placeholder: string; icon: React.ElementType; onKeyDown?: (e: React.KeyboardEvent) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [hlIdx, setHlIdx] = useState(-1);
  const wRef = useRef<HTMLDivElement>(null);
  const lRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!value.trim()) return options;
    const q = value.toLowerCase();
    return options.filter(o =>
      o.value.toLowerCase().includes(q) || o.label.toLowerCase().includes(q) || o.sublabel?.toLowerCase().includes(q)
    );
  }, [value, options]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (wRef.current && !wRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (hlIdx >= 0 && lRef.current) (lRef.current.children[hlIdx] as HTMLElement)?.scrollIntoView({ block: "nearest" });
  }, [hlIdx]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setHlIdx(p => Math.min(p + 1, Math.min(filtered.length - 1, 49))); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHlIdx(p => Math.max(p - 1, -1)); }
    else if (e.key === "Enter" && hlIdx >= 0 && open) { e.preventDefault(); onChange(filtered[hlIdx].value); setOpen(false); setHlIdx(-1); }
    else if (e.key === "Escape") setOpen(false);
    else onKeyDown?.(e);
  };

  return (
    <div ref={wRef} className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
      <Input placeholder={placeholder} value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); setHlIdx(-1); }}
        onFocus={() => setOpen(true)} onKeyDown={handleKey} className="pl-9 pr-9" />
      {open && filtered.length > 0 && (
        <div ref={lRef} className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filtered.slice(0, 50).map((o, i) => (
            <button key={o.value + i} type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2.5 text-sm border-b border-border/50 last:border-0 transition-colors ${
                i === hlIdx ? "bg-primary/10" : "hover:bg-muted"
              } text-foreground`}>
              <span className="font-semibold">{o.value}</span>
              {o.label !== o.value && <span className="ml-2 text-muted-foreground text-xs">{o.label}</span>}
              {o.sublabel && <span className="ml-1 text-muted-foreground text-xs">· {o.sublabel}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Results Table ─── */
const ResultsTable = ({ columns, rows }: { columns: string[]; rows: Record<string, string>[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border">
          {columns.map(c => <th key={c} className="text-left py-3 px-4 font-semibold text-foreground">{c}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
            {columns.map(c => <td key={c} className="py-3 px-4 text-foreground">{row[c] || "—"}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ─── Tab Panels ─── */
const SchedulesTab = ({ airportOptions }: { airportOptions: DropdownOption[] }) => {
  const [airport, setAirport] = useState("");
  const [type, setType] = useState("departure");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    if (!airport.trim()) { setError("Please enter an airport IATA code."); return; }
    setLoading(true); setError(null);
    try {
      const { data, error: e } = await supabase.functions.invoke("aviation-schedules", {
        body: { iataCode: airport.trim(), type },
      });
      if (e) throw new Error(e.message);
      if (data.error) { setError(data.error); setResults([]); return; }
      setResults(data.schedules || []);
      if ((data.schedules || []).length === 0) setError("No schedules found.");
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const rows = results.slice(0, 100).map((s: any) => ({
    Flight: s.flight?.iataNumber || "—",
    Airline: s.airline?.iataCode || "—",
    From: s.departure?.iataCode || "—",
    To: s.arrival?.iataCode || "—",
    "Dep Time": s.departure?.scheduledTime || "—",
    "Arr Time": s.arrival?.scheduledTime || "—",
    Status: s.status || "—",
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" /> Real-Time Airport Schedules
      </h2>
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AutocompleteInput options={airportOptions} value={airport} onChange={setAirport}
              placeholder="Airport IATA (e.g. JFK)" icon={MapPin} onKeyDown={e => e.key === "Enter" && search()} />
            <div className="relative">
              <select value={type} onChange={e => setType(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring appearance-none">
                <option value="departure">Departures</option>
                <option value="arrival">Arrivals</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            <Button onClick={search} disabled={loading} size="lg" className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>
      {error && <ErrorMsg msg={error} />}
      {rows.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{rows.length} Schedule(s)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultsTable columns={["Flight", "Airline", "From", "To", "Dep Time", "Arr Time", "Status"]} rows={rows} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const FutureSchedulesTab = ({ airportOptions }: { airportOptions: DropdownOption[] }) => {
  const [airport, setAirport] = useState("");
  const [type, setType] = useState("departure");
  const [date, setDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 8); return d.toISOString().split("T")[0]; });
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    if (!airport.trim()) { setError("Please enter an airport IATA code."); return; }
    setLoading(true); setError(null);
    try {
      const { data, error: e } = await supabase.functions.invoke("aviation-future-schedules", {
        body: { iataCode: airport.trim(), type, date },
      });
      if (e) throw new Error(e.message);
      if (data.error) { setError(data.error); setResults([]); return; }
      setResults(data.schedules || []);
      if ((data.schedules || []).length === 0) setError("No future schedules found.");
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const rows = results.slice(0, 100).map((s: any) => ({
    Flight: s.flight?.iataNumber || s.flight?.number || "—",
    Airline: s.airline?.iataCode || s.airline?.name || "—",
    From: s.departure?.iataCode || "—",
    To: s.arrival?.iataCode || "—",
    "Dep Time": s.departure?.scheduledTime || "—",
    "Arr Time": s.arrival?.scheduledTime || "—",
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-primary" /> Future Flight Schedules
      </h2>
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <AutocompleteInput options={airportOptions} value={airport} onChange={setAirport}
              placeholder="Airport IATA (e.g. JFK)" icon={MapPin} onKeyDown={e => e.key === "Enter" && search()} />
            <div className="relative">
              <select value={type} onChange={e => setType(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring appearance-none">
                <option value="departure">Departures</option>
                <option value="arrival">Arrivals</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            <Button onClick={search} disabled={loading} size="lg" className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>
      {error && <ErrorMsg msg={error} />}
      {rows.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">{rows.length} Schedule(s)</CardTitle></CardHeader>
          <CardContent>
            <ResultsTable columns={["Flight", "Airline", "From", "To", "Dep Time", "Arr Time"]} rows={rows} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const AirlineRoutesTab = ({ airportOptions, airlineOptions }: { airportOptions: DropdownOption[]; airlineOptions: DropdownOption[] }) => {
  const [airlineCode, setAirlineCode] = useState("");
  const [depAirport, setDepAirport] = useState("");
  const [arrAirport, setArrAirport] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    if (!airlineCode.trim() && !depAirport.trim()) { setError("Enter an airline or departure airport."); return; }
    setLoading(true); setError(null);
    try {
      const { data, error: e } = await supabase.functions.invoke("aviation-routes", {
        body: { airlineIata: airlineCode.trim() || undefined, depIata: depAirport.trim() || undefined, arrIata: arrAirport.trim() || undefined },
      });
      if (e) throw new Error(e.message);
      if (data.error) { setError(data.error); setResults([]); return; }
      setResults(data.routes || []);
      if ((data.routes || []).length === 0) setError("No routes found.");
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const rows = results.slice(0, 100).map((r: any) => ({
    Airline: r.airlineIata || "—",
    From: r.departureIata || "—",
    To: r.arrivalIata || "—",
    "Flight #": r.flightNumber || "—",
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Route className="w-5 h-5 text-primary" /> Airline Routes
      </h2>
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <AutocompleteInput options={airlineOptions} value={airlineCode} onChange={setAirlineCode}
              placeholder="Airline (e.g. AA)" icon={PlaneTakeoff} />
            <AutocompleteInput options={airportOptions} value={depAirport} onChange={setDepAirport}
              placeholder="From Airport (e.g. JFK)" icon={MapPin} />
            <AutocompleteInput options={airportOptions} value={arrAirport} onChange={setArrAirport}
              placeholder="To Airport (e.g. LAX)" icon={MapPin} />
            <Button onClick={search} disabled={loading} size="lg" className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
              Search Routes
            </Button>
          </div>
        </CardContent>
      </Card>
      {error && <ErrorMsg msg={error} />}
      {rows.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">{rows.length} Route(s)</CardTitle></CardHeader>
          <CardContent>
            <ResultsTable columns={["Airline", "From", "To", "Flight #"]} rows={rows} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const NearbyTab = () => {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [distance, setDistance] = useState("200");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const useMyLocation = () => {
    if (!navigator.geolocation) { setError("Geolocation not supported"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLat(String(pos.coords.latitude.toFixed(4))); setLng(String(pos.coords.longitude.toFixed(4))); setLocating(false); },
      () => { setError("Could not get location"); setLocating(false); }
    );
  };

  const search = async () => {
    if (!lat || !lng) { setError("Please enter coordinates or use your location."); return; }
    setLoading(true); setError(null);
    try {
      const { data, error: e } = await supabase.functions.invoke("aviation-nearby", {
        body: { lat: parseFloat(lat), lng: parseFloat(lng), distance: parseInt(distance) },
      });
      if (e) throw new Error(e.message);
      if (data.error) { setError(data.error); setResults([]); return; }
      setResults(data.results || []);
      if ((data.results || []).length === 0) setError("No nearby airports found.");
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const rows = results.slice(0, 100).map((r: any) => ({
    Code: r.codeIataAirport || r.iataCode || "—",
    Name: r.nameAirport || r.name || "—",
    City: r.codeIataCity || r.city || "—",
    Country: r.nameCountry || r.country || "—",
    Distance: r.distance ? `${r.distance} km` : "—",
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Send className="w-5 h-5 text-primary" /> Nearby Airports
      </h2>
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input placeholder="Latitude" value={lat} onChange={e => setLat(e.target.value)} type="number" step="any" />
            <Input placeholder="Longitude" value={lng} onChange={e => setLng(e.target.value)} type="number" step="any" />
            <Input placeholder="Distance (km)" value={distance} onChange={e => setDistance(e.target.value)} type="number" />
            <Button variant="outline" onClick={useMyLocation} disabled={locating}>
              {locating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LocateFixed className="w-4 h-4 mr-2" />}
              My Location
            </Button>
            <Button onClick={search} disabled={loading} size="lg" className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>
      {error && <ErrorMsg msg={error} />}
      {rows.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">{rows.length} Airport(s)</CardTitle></CardHeader>
          <CardContent>
            <ResultsTable columns={["Code", "Name", "City", "Country", "Distance"]} rows={rows} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const AutocompleteTab = () => {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("airport");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    if (!query.trim()) { setError("Please enter a search query."); return; }
    setLoading(true); setError(null);
    try {
      const { data, error: e } = await supabase.functions.invoke("aviation-autocomplete", {
        body: { query: query.trim(), type },
      });
      if (e) throw new Error(e.message);
      if (data.error) { setError(data.error); setResults([]); return; }
      setResults(data.results || []);
      if ((data.results || []).length === 0) setError("No results found.");
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const rows = results.slice(0, 100).map((r: any) => {
    if (type === "airline") return { Code: r.codeIataAirline || "—", Name: r.nameAirline || r.name || "—", Country: r.nameCountry || "—", Status: r.statusAirline || "—" };
    if (type === "city") return { Code: r.codeIataCity || "—", Name: r.nameCity || r.name || "—", Country: r.nameCountry || "—" };
    return { Code: r.codeIataAirport || "—", Name: r.nameAirport || r.name || "—", City: r.codeIataCity || "—", Country: r.nameCountry || "—" };
  });

  const cols = type === "airline" ? ["Code", "Name", "Country", "Status"] : type === "city" ? ["Code", "Name", "Country"] : ["Code", "Name", "City", "Country"];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Search className="w-5 h-5 text-primary" /> Aviation Database Search
      </h2>
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input placeholder="Search code (e.g. JFK, AA, NYC)" value={query}
              onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} />
            <div className="relative">
              <select value={type} onChange={e => setType(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring appearance-none">
                <option value="airport">Airport</option>
                <option value="airline">Airline</option>
                <option value="city">City</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            <Button onClick={search} disabled={loading} size="lg" className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>
      {error && <ErrorMsg msg={error} />}
      {rows.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">{rows.length} Result(s)</CardTitle></CardHeader>
          <CardContent><ResultsTable columns={cols} rows={rows} /></CardContent>
        </Card>
      )}
    </div>
  );
};

const SatelliteTab = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);

  const search = async () => {
    setLoading(true); setError(null);
    try {
      const { data, error: e } = await supabase.functions.invoke("flight-tracker", {
        body: { flightNumber: undefined, airline: undefined, depIata: undefined },
      });
      // Satellite data uses the same flight tracker but shows all tracked objects
      if (e) throw new Error(e.message);
      if (data.error) { setError(data.error); return; }
      const flights = (data.flights || []).filter((f: any) => f.geography?.altitude > 30000);
      setResults(flights.slice(0, 50));
      if (flights.length === 0) setError("No high-altitude objects found.");
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const rows = results.map((f: any) => ({
    ID: f.flight?.iataNumber || f.flight?.icaoNumber || "—",
    Latitude: f.geography?.latitude?.toFixed(4) || "—",
    Longitude: f.geography?.longitude?.toFixed(4) || "—",
    Altitude: f.geography?.altitude ? `${f.geography.altitude.toFixed(0)} m` : "—",
    Speed: f.speed?.horizontal ? `${f.speed.horizontal.toFixed(0)} km/h` : "—",
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Satellite className="w-5 h-5 text-primary" /> Satellite & High-Altitude Tracker
      </h2>
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Button onClick={search} disabled={loading} size="lg">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Satellite className="w-4 h-4 mr-2" />}
              Scan High-Altitude Objects
            </Button>
            <p className="text-sm text-muted-foreground self-center">Shows flights above 30,000m altitude</p>
          </div>
        </CardContent>
      </Card>
      {error && <ErrorMsg msg={error} />}
      {rows.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">{rows.length} Object(s)</CardTitle></CardHeader>
          <CardContent><ResultsTable columns={["ID", "Latitude", "Longitude", "Altitude", "Speed"]} rows={rows} /></CardContent>
        </Card>
      )}
    </div>
  );
};

const ErrorMsg = ({ msg }: { msg: string }) => (
  <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
    <AlertCircle className="w-5 h-5 flex-shrink-0" />
    <p className="text-sm">{msg}</p>
  </div>
);

/* ─── Main ─── */
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

  useEffect(() => {
    fetch("/data/airports.json").then(r => r.json())
      .then((d: Airport[]) => setAirports(d.sort((a, b) => a.city.localeCompare(b.city)))).catch(console.error);
  }, []);

  const airportOptions = useMemo<DropdownOption[]>(() =>
    airports.map(a => ({ value: a.iataCode, label: `${a.city} - ${a.airportName}`, sublabel: a.country })), [airports]);
  const airlineOptions = useMemo<DropdownOption[]>(() =>
    airlinesList.map(a => ({ value: a.code, label: a.name })), []);
  const flightOptions = useMemo<DropdownOption[]>(() => commonFlights, []);

  useEffect(() => {
    if (mapRef.current && !leafletMap.current) {
      leafletMap.current = L.map(mapRef.current, { center: [20, 0], zoom: 2, zoomControl: true, scrollWheelZoom: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 18,
      }).addTo(leafletMap.current);
      markersLayer.current = L.layerGroup().addTo(leafletMap.current);
    }
    return () => { if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; } };
  }, []);

  const createPlaneIcon = (r: number) => L.divIcon({
    html: `<div style="transform:rotate(${r}deg);font-size:24px;color:hsl(var(--primary));">✈</div>`,
    className: "plane-marker", iconSize: [30, 30], iconAnchor: [15, 15],
  });

  const updateMarkers = useCallback((fd: FlightData[]) => {
    if (!markersLayer.current || !leafletMap.current) return;
    markersLayer.current.clearLayers();
    const bounds: L.LatLngExpression[] = [];
    fd.forEach(f => {
      if (!f.geography?.latitude || !f.geography?.longitude) return;
      bounds.push([f.geography.latitude, f.geography.longitude]);
      const m = L.marker([f.geography.latitude, f.geography.longitude], { icon: createPlaneIcon(f.geography.direction || 0) });
      m.bindPopup(`<div style="min-width:200px;font-family:system-ui;"><h3 style="font-weight:700;">${f.flight?.iataNumber||"N/A"}</h3><p><b>Route:</b> ${f.departure?.iataCode||"?"} → ${f.arrival?.iataCode||"?"}</p><p><b>Alt:</b> ${f.geography?.altitude?.toFixed(0)||"N/A"} m</p><p><b>Speed:</b> ${f.speed?.horizontal?.toFixed(0)||"N/A"} km/h</p></div>`);
      m.on("click", () => setSelectedFlight(f));
      m.addTo(markersLayer.current!);
    });
    if (bounds.length > 0) leafletMap.current.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [50, 50], maxZoom: 8 });
  }, []);

  const searchFlights = useCallback(async () => {
    if (!flightNumber.trim() && !airline.trim() && !airport.trim()) { setError("Please enter a flight number, airline, or airport."); return; }
    setLoading(true); setError(null);
    try {
      const { data, error: e } = await supabase.functions.invoke("flight-tracker", {
        body: { flightNumber: flightNumber.trim() || undefined, airline: airline.trim() || undefined, depIata: airport.trim() || undefined },
      });
      if (e) throw new Error(e.message);
      if (data.error) { setError(data.error); setFlights([]); return; }
      const r = data.flights || [];
      if (r.length === 0) { setError("No flights found."); setFlights([]); return; }
      setFlights(r); setSelectedFlight(r[0]); updateMarkers(r);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  }, [flightNumber, airline, airport, updateMarkers]);

  useEffect(() => {
    if (autoRefresh && flights.length > 0) intervalRef.current = setInterval(searchFlights, 10000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh, flights.length, searchFlights]);

  const statusBg = selectedFlight ? statusColors[selectedFlight.status] || statusColors.unknown : "";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Aviation Dashboard | Tripile" description="Complete aviation intelligence — track flights, schedules, routes & more." />
      <Header />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1 flex items-center gap-2">
            <PlaneTakeoff className="w-8 h-8 text-primary" /> Aviation Dashboard
          </h1>
          <p className="text-muted-foreground">Complete aviation intelligence — flights, schedules, routes, satellites & more</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-6 border-b border-border">
          {tabs.map(tab => {
            const TIcon = tab.icon; const isAct = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors border-b-2 ${
                  isAct ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}>
                <TIcon className="w-4 h-4" />{tab.label}
              </button>
            );
          })}
        </div>

        {/* Flight Tracker Tab */}
        {activeTab === "tracker" && (
          <>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <AutocompleteInput options={flightOptions} value={flightNumber} onChange={setFlightNumber}
                    placeholder="Flight (e.g. AA100)" icon={Search} onKeyDown={e => e.key === "Enter" && searchFlights()} />
                  <AutocompleteInput options={airlineOptions} value={airline} onChange={setAirline}
                    placeholder="Airline (e.g. AA)" icon={PlaneTakeoff} />
                  <AutocompleteInput options={airportOptions} value={airport} onChange={setAirport}
                    placeholder="Airport (e.g. JFK)" icon={MapPin} onKeyDown={e => e.key === "Enter" && searchFlights()} />
                  <Button onClick={searchFlights} disabled={loading} size="lg" className="w-full">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                    Track Flight
                  </Button>
                </div>
                {flights.length > 0 && (
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <Button variant={autoRefresh ? "default" : "outline"} size="sm" onClick={() => setAutoRefresh(!autoRefresh)}>
                      <RefreshCw className={`w-4 h-4 mr-1 ${autoRefresh ? "animate-spin" : ""}`} />
                      {autoRefresh ? "Auto-Refresh ON" : "Auto-Refresh OFF"}
                    </Button>
                    <span className="text-xs text-muted-foreground">{autoRefresh ? "Refreshing every 10s" : "Click to enable live tracking"}</span>
                    <Badge variant="secondary">{flights.length} flight(s)</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
            {error && <div className="mb-6"><ErrorMsg msg={error} /></div>}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="overflow-hidden"><div ref={mapRef} className="w-full h-[500px] md:h-[600px]" /></Card>
              </div>
              <div className="space-y-4">
                {selectedFlight ? (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Flight Details</CardTitle>
                        <Badge className={`${statusBg} text-white`}>{statusLabels[selectedFlight.status] || selectedFlight.status || "Unknown"}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <DetailRow label="Flight" value={selectedFlight.flight?.iataNumber || "N/A"} />
                      <DetailRow label="Airline" value={selectedFlight.airline?.iataCode || "N/A"} />
                      <div className="flex items-center gap-2 py-2 bg-muted/50 rounded-lg px-3">
                        <div className="text-center flex-1">
                          <div className="text-lg font-bold text-foreground">{selectedFlight.departure?.iataCode || "?"}</div>
                          <div className="text-xs text-muted-foreground">Departure</div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-primary flex-shrink-0" />
                        <div className="text-center flex-1">
                          <div className="text-lg font-bold text-foreground">{selectedFlight.arrival?.iataCode || "?"}</div>
                          <div className="text-xs text-muted-foreground">Arrival</div>
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
                    <CardHeader className="pb-2"><CardTitle className="text-sm">All Results ({flights.length})</CardTitle></CardHeader>
                    <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
                      {flights.map((f, i) => (
                        <button key={i} onClick={() => { setSelectedFlight(f); if (leafletMap.current && f.geography?.latitude) leafletMap.current.setView([f.geography.latitude, f.geography.longitude], 6); }}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedFlight === f ? "border-primary bg-primary/5" : "border-border hover:bg-muted"}`}>
                          <div className="flex justify-between items-center">
                            <div><span className="font-medium text-sm text-foreground">{f.flight?.iataNumber}</span><span className="text-xs text-muted-foreground ml-2">{f.airline?.iataCode}</span></div>
                            <Badge variant="outline" className="text-xs">{f.departure?.iataCode} → {f.arrival?.iataCode}</Badge>
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

        {activeTab === "schedules" && <SchedulesTab airportOptions={airportOptions} />}
        {activeTab === "future" && <FutureSchedulesTab airportOptions={airportOptions} />}
        {activeTab === "routes" && <AirlineRoutesTab airportOptions={airportOptions} airlineOptions={airlineOptions} />}
        {activeTab === "nearby" && <NearbyTab />}
        {activeTab === "autocomplete" && <AutocompleteTab />}
        {activeTab === "satellite" && <SatelliteTab />}
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
