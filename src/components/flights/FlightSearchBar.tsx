import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface FlightSearchBarProps {
  defaultDestination?: string;
}

const FlightSearchBar = ({ defaultDestination = "" }: FlightSearchBarProps) => {
  const [destination, setDestination] = useState(defaultDestination);
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!destination.trim()) return;
    const slug = destination.trim().toLowerCase().replace(/\s+/g, "-");
    navigate(`/flights-to-${slug}`);
  };

  return (
    <div className="flex gap-2 max-w-lg">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search destination city..."
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="pl-9 bg-background text-foreground border-border"
        />
      </div>
      <Button onClick={handleSearch} size="sm">
        Search Flights
      </Button>
    </div>
  );
};

export default FlightSearchBar;
