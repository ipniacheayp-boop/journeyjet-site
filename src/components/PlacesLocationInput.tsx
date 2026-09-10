import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { MapPin } from "lucide-react";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";

export interface PlaceSuggestion {
  placeId: string;
  description: string;
}

interface DropdownRow {
  key: string;
  label: string;
  source: "section" | "google" | "country" | "city";
}

interface PlacesLocationInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  "aria-invalid"?: boolean;
}

const PlacesLocationInput = React.memo(
  ({ id, value, onChange, placeholder, className, "aria-invalid": ariaInvalid }: PlacesLocationInputProps) => {
    const [inputValue, setInputValue] = useState(value);
    const [rows, setRows] = useState<DropdownRow[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loadingGeo, setLoadingGeo] = useState(false);
    const [loadingApi, setLoadingApi] = useState(false);
    const [countries, setCountries] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [debounced, setDebounced] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const reqId = useRef(0);

    useEffect(() => {
      setInputValue(value);
    }, [value]);

    useEffect(() => {
      const t = setTimeout(() => setDebounced(inputValue), 250);
      return () => clearTimeout(t);
    }, [inputValue]);

    useEffect(() => {
      let cancelled = false;
      (async () => {
        setLoadingGeo(true);
        try {
          const [cRes, ciRes] = await Promise.all([
            fetch("/data/countries.json"),
            fetch("/data/cities.json"),
          ]);
          if (!cRes.ok || !ciRes.ok) throw new Error("geo data");
          const [cJson, ciJson] = await Promise.all([cRes.json(), ciRes.json()]);
          if (!cancelled) {
            setCountries(Array.isArray(cJson) ? cJson : []);
            setCities(Array.isArray(ciJson) ? ciJson : []);
          }
        } catch {
          if (!cancelled) {
            setCountries([]);
            setCities([]);
          }
        } finally {
          if (!cancelled) setLoadingGeo(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, []);

    const localMatches = useMemo(() => {
      const q = debounced.trim().toLowerCase();
      if (q.length < 1) return { countries: [] as string[], cities: [] as string[] };

      const countryHits = countries
        .filter((n) => n.toLowerCase().includes(q))
        .slice(0, 8);

      const cityHits = cities
        .filter((line) => line.toLowerCase().includes(q))
        .slice(0, 12);

      return { countries: countryHits, cities: cityHits };
    }, [debounced, countries, cities]);

    useEffect(() => {
      const q = debounced.trim();
      setHighlightedIndex(-1);
      if (q.length < 1) {
        setRows([]);
        setLoadingApi(false);
        return;
      }

      const myId = ++reqId.current;

      const buildLocalRows = (): DropdownRow[] => {
        const out: DropdownRow[] = [];
        const seen = new Set<string>();

        if (localMatches.countries.length) {
          out.push({ key: "sec-c", label: "Countries", source: "section" });
          for (const n of localMatches.countries) {
            if (seen.has(n)) continue;
            seen.add(n);
            out.push({ key: `co-${n}`, label: n, source: "country" });
          }
        }
        if (localMatches.cities.length) {
          out.push({ key: "sec-y", label: "Cities", source: "section" });
          for (const line of localMatches.cities) {
            if (seen.has(line)) continue;
            seen.add(line);
            out.push({ key: `ci-${line}`, label: line, source: "city" });
          }
        }
        return out;
      };

      setRows(buildLocalRows());

      if (q.length < 2) {
        setLoadingApi(false);
        return;
      }

      setLoadingApi(true);
      (async () => {
        try {
          const { data, error } = await invokeSupabaseFunction<{ suggestions?: PlaceSuggestion[] }>(
            "places-autocomplete",
            { input: q },
          );

          if (myId !== reqId.current) return;

          if (error) {
            console.warn("places-autocomplete:", error);
            setRows(buildLocalRows());
            return;
          }

          const apiList = Array.isArray(data?.suggestions) ? data.suggestions : [];
          const seen = new Set<string>();
          const merged: DropdownRow[] = [];

          if (apiList.length) {
            merged.push({ key: "sec-g", label: "Places (Google)", source: "section" });
            for (const s of apiList.slice(0, 10)) {
              const label = s.description;
              if (!label || seen.has(label)) continue;
              seen.add(label);
              merged.push({
                key: `g-${s.placeId}-${label}`,
                label,
                source: "google",
              });
            }
          }

          for (const r of buildLocalRows()) {
            if (r.source === "section") {
              merged.push(r);
              continue;
            }
            if (!seen.has(r.label)) {
              seen.add(r.label);
              merged.push(r);
            }
          }

          setRows(merged);
        } catch (e) {
          console.warn("places-autocomplete failed", e);
          if (myId === reqId.current) setRows(buildLocalRows());
        } finally {
          if (myId === reqId.current) setLoadingApi(false);
        }
      })();
    }, [debounced, localMatches]);

    const selectableRows = useMemo(() => rows.filter((r) => r.source !== "section"), [rows]);

    const handleSelect = useCallback(
      (label: string) => {
        onChange(label);
        setInputValue(label);
        setShowDropdown(false);
        setRows([]);
        setHighlightedIndex(-1);
      },
      [onChange],
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setInputValue(v);
      onChange(v);
      setShowDropdown(true);
      setHighlightedIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showDropdown || selectableRows.length === 0) {
        if (e.key === "Escape") setShowDropdown(false);
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((i) => (i < selectableRows.length - 1 ? i + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((i) => (i > 0 ? i - 1 : selectableRows.length - 1));
      } else if (e.key === "Enter" && highlightedIndex >= 0) {
        e.preventDefault();
        handleSelect(selectableRows[highlightedIndex].label);
      } else if (e.key === "Escape") {
        setShowDropdown(false);
      }
    };

    const showPanel =
      showDropdown &&
      (rows.length > 0 || loadingGeo || loadingApi || debounced.trim().length >= 1);

    return (
      <div className="relative w-full">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={inputValue}
            onChange={handleChange}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => {
              setTimeout(() => setShowDropdown(false), 200);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-autocomplete="list"
            aria-expanded={showDropdown && selectableRows.length > 0}
            aria-invalid={ariaInvalid}
            className={className}
            role="combobox"
          />
        </div>

        {showPanel && (
          <div
            ref={listRef}
            className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover text-popover-foreground shadow-lg max-h-72 overflow-y-auto"
            role="listbox"
          >
            {loadingGeo && countries.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">Loading locations…</div>
            )}
            {!loadingGeo && debounced.trim().length >= 1 && rows.length === 0 && !loadingApi && (
              <div className="px-3 py-2 text-sm text-muted-foreground">No matches — keep typing</div>
            )}
            {loadingApi && debounced.trim().length >= 2 && (
              <div className="px-3 py-1.5 text-xs text-muted-foreground border-b border-border/60">
                Searching places…
              </div>
            )}
            {rows.map((row, i) => {
              if (row.source === "section") {
                return (
                  <div
                    key={row.key}
                    className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sticky top-0 bg-popover"
                  >
                    {row.label}
                  </div>
                );
              }
              const selIndex = selectableRows.findIndex((s) => s.key === row.key);
              const active = selIndex === highlightedIndex;
              return (
                <button
                  key={row.key}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`w-full text-left px-3 py-2 text-sm border-b border-border/40 last:border-0 hover:bg-muted/80 ${
                    active ? "bg-muted" : ""
                  }`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(row.label)}
                >
                  <span className="mr-2 w-14 shrink-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {row.source === "country" ? "Country" : row.source === "city" ? "City" : "Place"}
                  </span>
                  {row.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);

PlacesLocationInput.displayName = "PlacesLocationInput";

export default PlacesLocationInput;
