import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Plane } from 'lucide-react';

interface Airport {
  iataCode: string;
  icaoCode: string;
  airportName: string;
  city: string;
  country: string;
}

interface AirportDropdownProps {
  value: string;
  onChange: (value: string, iataCode: string) => void;
  placeholder?: string;
  className?: string;
}

const AirportDropdown = React.memo(({ value, onChange, placeholder, className }: AirportDropdownProps) => {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [inputValue, setInputValue] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [debouncedValue, setDebouncedValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load airports data
  useEffect(() => {
    fetch('/data/airports.json')
      .then(res => res.json())
      .then(data => setAirports(data))
      .catch(err => console.error('Failed to load airports:', err));
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
      .filter(airport => {
        const nameMatch = airport.airportName.toLowerCase().includes(searchTerm);
        const cityMatch = airport.city.toLowerCase().includes(searchTerm);
        const iataMatch = airport.iataCode.toLowerCase().includes(searchTerm);
        const countryMatch = airport.country.toLowerCase().includes(searchTerm);
        
        return nameMatch || cityMatch || iataMatch || countryMatch;
      })
      .slice(0, 10);
  }, [debouncedValue, airports]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowDropdown(true);
    setHighlightedIndex(-1);
  };

  // Handle airport selection
  const handleSelect = useCallback((airport: Airport) => {
    const displayValue = `${airport.airportName} (${airport.iataCode})`;
    setInputValue(displayValue);
    onChange(displayValue, airport.iataCode);
    setShowDropdown(false);
    setHighlightedIndex(-1);
  }, [onChange]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || filteredAirports.length === 0) {
      if (e.key === 'Escape') {
        setShowDropdown(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredAirports.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredAirports.length) {
          handleSelect(filteredAirports[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
        <Plane className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
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

      {showDropdown && filteredAirports.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-background border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredAirports.map((airport, index) => (
            <div
              key={`${airport.iataCode}-${index}`}
              onClick={() => handleSelect(airport)}
              className={`px-4 py-3 cursor-pointer transition-colors border-b border-border last:border-b-0 ${
                index === highlightedIndex
                  ? 'bg-primary/10'
                  : 'hover:bg-muted'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">
                    {airport.airportName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {airport.city}, {airport.country}
                  </div>
                </div>
                <div className="flex-shrink-0 font-semibold text-primary">
                  {airport.iataCode}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

AirportDropdown.displayName = 'AirportDropdown';

export default AirportDropdown;
