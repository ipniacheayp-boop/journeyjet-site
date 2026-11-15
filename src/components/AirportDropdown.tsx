import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Plane } from "lucide-react";

interface Airport {
  iataCode: string;
  icaoCode: string;
  airportName: string;
  city: string;
  country: string;
  aliases?: string[];
  searchTerms?: string[];
}

interface AirportDropdownProps {
  value: string;
  onChange: (value: string, iataCode: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  required?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  /** Spoken name for the suggestion list, e.g. "Departure airport suggestions". */
  listLabel?: string;
}

const AirportDropdown = React.memo(({ value, onChange, placeholder, className, id, required, "aria-invalid": ariaInvalid, "aria-describedby": ariaDescribedBy, listLabel }: AirportDropdownProps) => {
  const autoId = React.useId();
  const inputId = id || `airport-${autoId}`;
  const listId = `${inputId}-listbox`;
  const statusId = `${inputId}-status`;
  const [announcement, setAnnouncement] = useState("");
  const [airports, setAirports] = useState<Airport[]>([]);
  const [inputValue, setInputValue] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [debouncedValue, setDebouncedValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Load airports data
  useEffect(() => {
    fetch("/data/airports.json")
      .then((res) => res.json())
      .then((data) => setAirports(data))
      .catch((err) => console.error("Failed to load airports:", err));
  }, []);

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Filter airports with performance optimization
  const filteredAirports = useMemo(() => {
    if (!debouncedValue || debouncedValue.length < 2) {
      return [];
    }

    const searchTerm = debouncedValue.toLowerCase().trim();

    return airports
      .filter((airport) => {
        const nameMatch = airport.airportName.toLowerCase().includes(searchTerm);
        const cityMatch = airport.city.toLowerCase().includes(searchTerm);
        const iataMatch = airport.iataCode.toLowerCase().includes(searchTerm);
        const countryMatch = airport.country.toLowerCase().includes(searchTerm);
        const aliasMatch = airport.aliases?.some(a => a.toLowerCase().includes(searchTerm)) ?? false;
        const searchTermMatch = airport.searchTerms?.some(t => t.includes(searchTerm)) ?? false;

        return nameMatch || cityMatch || iataMatch || countryMatch || aliasMatch || searchTermMatch;
      })
      .sort((a, b) => {
        // Prioritize exact IATA matches, then city starts-with, then alphabetical
        const aIata = a.iataCode.toLowerCase() === searchTerm ? -2 : 0;
        const bIata = b.iataCode.toLowerCase() === searchTerm ? -2 : 0;
        const aCity = a.city.toLowerCase().startsWith(searchTerm) ? -1 : 0;
        const bCity = b.city.toLowerCase().startsWith(searchTerm) ? -1 : 0;
        return (aIata + aCity) - (bIata + bCity) || a.city.localeCompare(b.city);
      });
  }, [debouncedValue, airports]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowDropdown(true);
    setHighlightedIndex(-1);

    // Extract IATA code from typed input
    const codeCandidate = newValue.trim().toUpperCase();
    if (/^[A-Z]{3}$/.test(codeCandidate)) {
      onChange(newValue, codeCandidate);
    } else {
      // Try to extract code from "City (CODE)" format
      const match = newValue.match(/\(([A-Z]{3})\)/);
      if (match) {
        onChange(newValue, match[1]);
      } else {
        onChange(newValue, "");
      }
    }
  };

  // Handle airport selection
  const handleSelect = useCallback(
    (airport: Airport) => {
      const displayValue = airport.iataCode;
      setInputValue(displayValue);
      onChange(displayValue, airport.iataCode);
      setShowDropdown(false);
      setHighlightedIndex(-1);
      setAnnouncement(`Selected ${airport.airportName}, ${airport.city} (${airport.iataCode})`);
    },
    [onChange],
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || filteredAirports.length === 0) {
      if (e.key === "Escape") {
        setShowDropdown(false);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < filteredAirports.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        e.stopPropagation();
        if (highlightedIndex >= 0 && highlightedIndex < filteredAirports.length) {
          handleSelect(filteredAirports[highlightedIndex]);
        } else if (filteredAirports.length > 0) {
          // Auto-select first result when Enter is pressed without highlighting
          handleSelect(filteredAirports[0]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowDropdown(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Announce how many suggestions are available
  useEffect(() => {
    if (!showDropdown || !debouncedValue || debouncedValue.length < 2) return;
    setAnnouncement(
      filteredAirports.length === 0
        ? "No matching airports"
        : `${Math.min(filteredAirports.length, 50)}${filteredAirports.length > 50 ? "+" : ""} suggestions available. Use up and down arrows to review, Enter to select.`,
    );
  }, [filteredAirports.length, debouncedValue, showDropdown]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [highlightedIndex]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show dropdown when there are results
  useEffect(() => {
    if (filteredAirports.length > 0 && debouncedValue.length >= 2) {
      setShowDropdown(true);
    }
  }, [filteredAirports, debouncedValue]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <Plane aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showDropdown && filteredAirports.length > 0}
          aria-controls={listId}
          aria-activedescendant={showDropdown && highlightedIndex >= 0 ? `${listId}-opt-${highlightedIndex}` : undefined}
          aria-required={required || undefined}
          required={required}
          aria-invalid={ariaInvalid || undefined}
          aria-describedby={[ariaDescribedBy, statusId].filter(Boolean).join(" ")}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (filteredAirports.length > 0) {
              setShowDropdown(true);
            }
          }}
          placeholder={placeholder}
          className={className}
        />
      </div>
      <span id={statusId} role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>

      {showDropdown && filteredAirports.length > 0 && (
        <div
          ref={dropdownRef}
          id={listId}
          role="listbox"
          aria-label={listLabel || "Airport suggestions"}
          className="absolute z-50 w-full mt-2 bg-background border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredAirports.map((airport, index) => (
            <div
              key={`${airport.iataCode}-${index}`}
              id={`${listId}-opt-${index}`}
              role="option"
              aria-selected={index === highlightedIndex}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(airport)}
              className={`px-4 py-3 cursor-pointer transition-colors border-b border-border last:border-b-0 ${
                index === highlightedIndex ? "bg-primary/10" : "hover:bg-muted"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">{airport.airportName}</div>
                  <div className="text-sm text-muted-foreground">
                    {airport.city}, {airport.country}
                  </div>
                </div>
                <div className="flex-shrink-0 font-semibold text-primary">{airport.iataCode}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

AirportDropdown.displayName = "AirportDropdown";

export default AirportDropdown;
