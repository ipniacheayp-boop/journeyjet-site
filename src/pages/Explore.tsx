import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Flame, Sun, Snowflake, TrendingUp, DollarSign, Gem, Compass, X, Heart } from "lucide-react";
import { destinations, Destination } from "@/data/destinations";
import { DestinationCard } from "@/components/explore/DestinationCard";

const RECENT_SEARCHES_KEY = "tripile_recent_searches";

export default function Explore() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [seasonToggle, setSeasonToggle] = useState<"all" | "summer" | "winter">("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    // Delay scroll to ensure React Router finishes mounting the DOM and restoring history
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, 0);

    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() && !recentSearches.includes(term.trim())) {
      const updated = [term.trim(), ...recentSearches].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    }
  };

  const removeRecentSearch = (term: string) => {
    const updated = recentSearches.filter((t) => t !== term);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  // Filter Logic
  const filteredData = useMemo(() => {
    let raw = [...destinations];

    // Text search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      raw = raw.filter((d) => d.name.toLowerCase().includes(lower) || d.country.toLowerCase().includes(lower));
    }

    // Buttons Category filter
    if (activeFilter !== "all") {
      raw = raw.filter((d) => d.category.includes(activeFilter));
    }

    // Season Toggle
    if (seasonToggle !== "all") {
      raw = raw.filter((d) => d.category.includes(seasonToggle));
    }

    return raw;
  }, [searchTerm, activeFilter, seasonToggle]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Cinematic Hero Search Area */}
      <section className="relative pt-32 pb-20 mt-10 px-4 min-h-[60vh] flex flex-col justify-center overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1521336575822-6da63fb45455?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Explore Background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-background" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 w-full">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-white drop-shadow-2xl"
          >
            Find your next{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">adventure.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto font-medium drop-shadow-md"
          >
            Explore carefully curated destinations across the globe. From hidden gems to ultimate luxury getaways.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative max-w-3xl mx-auto"
          >
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-muted-foreground z-20">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <Input
              placeholder="Search by country, city, or vibe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(searchTerm)}
              className="pl-16 pr-36 h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] text-xl text-white placeholder:text-white/60 outline-none focus-visible:ring-primary focus-visible:border-primary transition-all focus-visible:bg-white/20"
            />
            <Button
              size="lg"
              className="absolute right-3 top-4 bottom-4 rounded-full px-8 py-4 text-lg font-bold shadow-lg bg-primary hover:bg-primary/90 text-white"
              onClick={() => handleSearch(searchTerm)}
            >
              Search
            </Button>
          </motion.div>

          {/* Quick Search Chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-8 flex flex-wrap justify-center gap-3 max-w-3xl mx-auto"
          >
            <span className="text-sm font-bold text-white/80 mr-2 flex items-center drop-shadow-md">
              <Flame className="w-4 h-4 mr-1 text-orange-400" /> Trending:
            </span>
            {["Bali", "Japan", "Italy", "Maldives", "Switzerland"].map((tag) => (
              <Badge
                key={tag}
                className="cursor-pointer bg-white/15 hover:bg-primary text-white border border-white/20 backdrop-blur-md transition-all py-1.5 px-4 text-sm rounded-full shadow-sm"
                onClick={() => handleSearch(tag)}
              >
                {tag}
              </Badge>
            ))}
          </motion.div>

          {/* Recent Searches */}
          <AnimatePresence>
            {recentSearches.length > 0 && !searchTerm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 flex flex-wrap justify-center gap-2 max-w-3xl mx-auto overflow-hidden"
              >
                <span className="text-sm font-semibold text-white/70 mr-2 flex items-center">Recent:</span>
                {recentSearches.map((term) => (
                  <div
                    key={term}
                    className="flex items-center bg-black/40 backdrop-blur-md border border-white/10 rounded-full pl-4 pr-1.5 py-1.5 text-sm shadow-sm text-white"
                  >
                    <span
                      className="cursor-pointer font-medium mr-2 hover:text-primary transition-colors"
                      onClick={() => handleSearch(term)}
                    >
                      {term}
                    </span>
                    <button
                      onClick={() => removeRecentSearch(term)}
                      className="hover:bg-white/20 p-1 rounded-full text-white/60 hover:text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Sticky Filter Bar */}
      <div className="sticky top-[68px] z-40 bg-background/85 backdrop-blur-2xl border-b border-border/40 py-4 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar px-4">
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              className={`rounded-full shadow-sm transition-all border 
  ${
    activeFilter === "all"
      ? "bg-primary text-white shadow-primary/25 border-primary"
      : "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
  }`}
              onClick={() => setActiveFilter("all")}
            >
              All Destinations
            </Button>

            <Button
              size="sm"
              className={`rounded-full gap-1.5 shadow-sm transition-all border
  ${
    activeFilter === "romantic"
      ? "bg-rose-500 text-white shadow-rose-500/25 border-rose-500"
      : "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/20"
  }`}
              onClick={() => setActiveFilter("romantic")}
            >
              <Heart className="w-4 h-4" /> Romantic
            </Button>

            <Button
              size="sm"
              className={`rounded-full gap-1.5 shadow-sm transition-all border
  ${
    activeFilter === "luxury"
      ? "bg-amber-500 text-white shadow-amber-500/25 border-amber-500"
      : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20"
  }`}
              onClick={() => setActiveFilter("luxury")}
            >
              <Gem className="w-4 h-4" /> Luxury
            </Button>

            <Button
              size="sm"
              className={`rounded-full gap-1.5 shadow-sm transition-all border
  ${
    activeFilter === "cheap"
      ? "bg-emerald-500 text-white shadow-emerald-500/25 border-emerald-500"
      : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20"
  }`}
              onClick={() => setActiveFilter("cheap")}
            >
              <DollarSign className="w-4 h-4" /> Budget
            </Button>

            <Button
              size="sm"
              className={`rounded-full gap-1.5 shadow-sm transition-all border
  ${
    activeFilter === "adventure"
      ? "bg-indigo-500 text-white shadow-indigo-500/25 border-indigo-500"
      : "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border-indigo-500/20"
  }`}
              onClick={() => setActiveFilter("adventure")}
            >
              <Compass className="w-4 h-4" /> Adventure
            </Button>
          </div>

          <div className="flex items-center gap-1 bg-muted/60 p-1.5 rounded-full shrink-0 border border-border/50">
            <Button
              size="sm"
              className={`rounded-full h-8 px-4 text-xs font-semibold transition-all border
  ${
    seasonToggle === "summer"
      ? "bg-orange-500 text-white shadow-orange-500/25 border-orange-500"
      : "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20"
  }`}
              onClick={() => setSeasonToggle(seasonToggle === "summer" ? "all" : "summer")}
            >
              <Sun className="w-4 h-4 mr-1.5" /> Summer
            </Button>

            <Button
              size="sm"
              className={`rounded-full h-8 px-4 text-xs font-semibold transition-all border
  ${
    seasonToggle === "winter"
      ? "bg-blue-500 text-white shadow-blue-500/25 border-blue-500"
      : "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20"
  }`}
              onClick={() => setSeasonToggle(seasonToggle === "winter" ? "all" : "winter")}
            >
              <Snowflake className="w-4 h-4 mr-1.5" /> Winter
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12 min-h-[50vh]">
        {filteredData.length === 0 ? (
          <div className="text-center py-32 flex flex-col items-center">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No destinations found</h3>
            <p className="text-muted-foreground mb-8">We couldn't find anything matching your filters or search.</p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setActiveFilter("all");
                setSeasonToggle("all");
              }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <>
            {/* SEARCH RESULTS VIEW (Grid Mode) */}
            {searchTerm || activeFilter !== "all" || seasonToggle !== "all" ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="animate-in fade-in duration-500"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Search className="w-4 h-4 text-primary" />
                    </span>
                    Showing {filteredData.length} Results
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredData.map((dest, i) => (
                    <motion.div
                      key={dest.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                    >
                      <DestinationCard destination={dest} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* EXPLORE MODE (Carousel rows) */
              <div className="space-y-16 animate-in fade-in duration-700">
                {/* Section: Trending Now */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-primary" />
                      Trending Worldwide
                    </h2>
                  </div>
                  <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-4 px-4 no-scrollbar [scrollbar-width:none]">
                    {filteredData
                      .filter((d) => d.category.includes("trending"))
                      .slice(0, 8)
                      .map((dest) => (
                        <div className="snap-center shrink-0" key={dest.id}>
                          <DestinationCard destination={dest} />
                        </div>
                      ))}
                  </div>
                </section>

                {/* Section: Best Value */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <DollarSign className="w-6 h-6 text-green-500" />
                      Best Value Getaways
                    </h2>
                  </div>
                  <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-4 px-4 no-scrollbar">
                    {filteredData
                      .filter((d) => d.category.includes("cheap"))
                      .slice(0, 8)
                      .map((dest) => (
                        <div className="snap-center shrink-0" key={dest.id}>
                          <DestinationCard destination={dest} />
                        </div>
                      ))}
                  </div>
                </section>

                {/* Section: Ultimate Luxury */}
                <section className="bg-slate-900 dark:bg-card border border-border/50 rounded-[2.5rem] p-8 md:p-12 -mx-4 md:mx-0 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                    <Gem className="w-64 h-64 text-white" />
                  </div>
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div>
                      <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none mb-3">
                        Premium Collection
                      </Badge>
                      <h2 className="text-3xl font-bold flex items-center gap-2 text-white">Ultimate Luxury</h2>
                    </div>
                  </div>
                  <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 no-scrollbar relative z-10 w-[calc(100%+32px)] -ml-4 md:w-auto md:ml-0 md:px-0 px-4">
                    {filteredData
                      .filter((d) => d.category.includes("luxury"))
                      .slice(0, 8)
                      .map((dest) => (
                        <div className="snap-center shrink-0" key={dest.id}>
                          {/* Card forced to dark mode compatibility slightly differently if needed, but DestinationCard is bg-card */}
                          <DestinationCard destination={dest} />
                        </div>
                      ))}
                  </div>
                </section>

                {/* Section: Hidden Gems */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Compass className="w-6 h-6 text-indigo-500" />
                      Hidden Gems
                    </h2>
                  </div>
                  <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 no-scrollbar relative z-10 w-[calc(100%+32px)] -ml-4 md:w-auto md:ml-0 md:px-0 px-4">
                    {filteredData
                      .filter((d) => d.category.includes("hidden_gem"))
                      .slice(0, 8)
                      .map((dest) => (
                        <div className="snap-center shrink-0" key={dest.id}>
                          <DestinationCard destination={dest} />
                        </div>
                      ))}
                  </div>
                </section>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
