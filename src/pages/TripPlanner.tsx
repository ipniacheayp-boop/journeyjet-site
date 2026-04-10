import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { fetchCountryData, generateGroqItinerary, TripPlan, CountryData } from "@/lib/tripPlanner";
import { MapPin, Calendar, Wallet, ThermometerSun, Info, Globe2, Users, Coins, Clock, Sparkles, Loader2, ArrowRight, Lightbulb, Compass, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const TripPlanner = () => {
  const [searchParams] = useSearchParams();
  const initDest = searchParams.get("dest") || "";
  
  const [destination, setDestination] = useState(initDest);
  const [days, setDays] = useState(3);
  const [loading, setLoading] = useState(false);
  
  const [countryData, setCountryData] = useState<CountryData | null>(null);
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleGeneratePlan = async () => {
    if (!destination.trim()) {
      toast.error("Please enter a destination.");
      return;
    }
    if (days < 1 || days > 14) {
      toast.error("Please enter between 1 and 14 days.");
      return;
    }
    
    setLoading(true);
    setCountryData(null);
    setTripPlan(null);

    try {
      const countryPromise = fetchCountryData(destination).catch(() => null);
      const aiPromise = generateGroqItinerary(destination, days);

      const [cData, aiPlan] = await Promise.all([countryPromise, aiPromise]);

      setCountryData(cData);
      setTripPlan(aiPlan);
      toast.success("Itinerary generated successfully!");
      
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);

    } catch (error: any) {
      toast.error(error.message || "Failed to generate trip plan.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("nature")) return "bg-green-500/10 text-green-600 border-green-500/20";
    if (cat.includes("culture") || cat.includes("history")) return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    if (cat.includes("food")) return "bg-orange-500/10 text-orange-600 border-orange-500/20";
    if (cat.includes("entertainment") || cat.includes("nightlife")) return "bg-purple-500/10 text-purple-600 border-purple-500/20";
    return "bg-primary/10 text-primary border-primary/20";
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      <Header />

      <main className="pb-24">
        {/* Cinematic Hero Section */}
        <section className="relative min-h-[85vh] lg:min-h-[75vh] flex items-center justify-center pt-20 px-4">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1663427929868-3941f957bb36?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              alt="Travel background" 
              className="w-full h-full object-cover object-center animate-slow-zoom"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-background" />
          </div>

          <div className="relative z-10 w-full max-w-4xl mx-auto text-center mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <Badge className="mb-6 py-2 px-5 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 rounded-full font-medium tracking-wide">
                <Sparkles className="w-4 h-4 mr-2 text-primary" />
                Powered by LLaMA 3.3 AI
              </Badge>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-white tracking-tight drop-shadow-lg">
                Where to next?
              </h1>
              <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                Experience global travel planning redesigned. Personalized day-by-day itineraries mapped out in seconds.
              </p>
            </motion.div>

            {/* Floating Search Interface */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="relative p-[1px] rounded-[2rem] bg-gradient-to-r mb-32 from-primary/50 via-white/20 to-primary/50 shadow-2xl"
            >
              <div className="bg-background/95 backdrop-blur-xl rounded-[2rem] p-3 md:p-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                      <MapPin className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <Input 
                      placeholder="Destination (e.g. USA, Japan)" 
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="pl-14 h-16 text-lg font-medium border-none bg-muted/30 focus-visible:bg-transparent rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/50 transition-all placeholder:text-muted-foreground/70"
                      onKeyDown={(e) => e.key === "Enter" && handleGeneratePlan()}
                    />
                  </div>
                  
                  <div className="relative w-full md:w-48 group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                      <Calendar className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <Input 
                      type="number"
                      min={1}
                      max={14}
                      value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                      className="pl-14 h-16 text-lg font-medium border-none bg-muted/30 focus-visible:bg-transparent rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/50 transition-all placeholder:text-muted-foreground/70"
                    />
                    <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-muted-foreground/70 font-medium">
                      Days
                    </div>
                  </div>

                  <Button 
                    onClick={handleGeneratePlan} 
                    disabled={loading}
                    className="h-16 px-8 rounded-2xl w-full md:w-auto text-lg font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all bg-gradient-to-r from-primary to-primary/80"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        Design Trip
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {loading && (
          <section className="py-24 px-4 bg-background z-10 relative">
            <div className="flex flex-col items-center justify-center space-y-6 max-w-sm mx-auto text-center">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <Compass className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
              </div>
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="space-y-2"
              >
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                  AI is exploring {destination || "the world"}...
                </h3>
                <p className="text-muted-foreground">Analyzing local insights, weather patterns, and top attractions to craft your perfect itinerary.</p>
              </motion.div>
            </div>
          </section>
        )}

        <AnimatePresence>
          {(tripPlan || countryData) && !loading && (
            <motion.section 
              id="results"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="container mx-auto px-4 max-w-6xl relative z-10 -mt-10"
            >
              {/* Dynamic Country Feature Card */}
              {countryData && (
                <div className="relative rounded-[2.5rem]  overflow-hidden shadow-2xl mb-12 border border-border/50 group bg-card">
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={countryData.flags.svg} 
                      alt="" 
                      className="w-full h-full object-cover opacity-10 dark:opacity-5 mix-blend-luminosity group-hover:scale-105 transition-transform duration-1000" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/40" />
                  </div>
                  
                  <div className="relative z-10 p-8 md:p-12">
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                      <div className="shrink-0 relative">
                        <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                        <img 
                          src={countryData.flags.svg} 
                          alt={`Flag`} 
                          className="w-32 md:w-48 aspect-video object-cover rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/10 relative z-10 transform -rotate-2" 
                        />
                      </div>
                      
                      <div className="flex-1">
                        <Badge className="mb-3 bg-primary/10 text-primary hover:bg-primary/20 border-none font-semibold text-xs tracking-widest uppercase">
                          Destination Overview
                        </Badge>
                        <h2 className="text-5xl md:text-7xl font-black mb-3 tracking-tighter">
                          {countryData.name.common}
                        </h2>
                        
                        <div className="flex flex-wrap gap-x-8 gap-y-4 mt-6">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <MapPin className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Capital</p>
                              <p className="font-bold text-base">{countryData.capital?.[0] || 'N/A'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                              <Coins className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Currency</p>
                              <p className="font-bold text-base">{Object.values(countryData.currencies || {})[0]?.name || 'N/A'}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                              <Globe2 className="w-5 h-5 text-purple-500" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Region</p>
                              <p className="font-bold text-base">{countryData.region}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tripPlan && (
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 pb-24">
                  {/* Left Column: Itinerary */}
                  <div className="lg:col-span-8 space-y-12">
                    <div>
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                          <Compass className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-3xl font-bold tracking-tight">Your Custom Itinerary</h3>
                      </div>
                      
                      <div className="space-y-6">
                        <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                          {tripPlan.itinerary.map((day, ix) => (
                            <motion.div 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.5, delay: ix * 0.1 }}
                              key={day.day}
                            >
                              <AccordionItem 
                                value={`item-${day.day}`} 
                                className="group border border-border/50 bg-card rounded-[2rem] px-6 md:px-8 py-2 mb-4 hover:border-primary/30 transition-all data-[state=open]:shadow-xl data-[state=open]:border-primary/40"
                              >
                                <AccordionTrigger className="hover:no-underline py-6">
                                  <div className="flex items-center gap-6 text-left w-full pr-4">
                                    <div className="relative shrink-0">
                                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-md group-data-[state=open]:opacity-100 opacity-0 transition-opacity" />
                                      <div className="w-16 h-16 rounded-full bg-muted border-2 border-background group-data-[state=open]:border-primary group-data-[state=open]:bg-primary/10 flex flex-col items-center justify-center relative z-10 transition-colors">
                                        <span className="text-xs font-bold text-muted-foreground group-data-[state=open]:text-primary uppercase tracking-widest">Day</span>
                                        <span className="text-2xl font-black text-foreground group-data-[state=open]:text-primary leading-none">{day.day}</span>
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-bold text-xl md:text-2xl mb-1">{day.title}</h4>
                                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> {day.activities.length} activities planned
                                      </p>
                                    </div>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-8 pt-4">
                                  <div className="pl-[4.5rem] relative">
                                    {/* Timeline line */}
                                    <div className="absolute left-[2.25rem] top-2 bottom-4 w-0.5 bg-border rounded-full" />
                                    
                                    <div className="space-y-8">
                                      {day.activities.map((activity, idx) => (
                                        <div key={idx} className="relative">
                                          {/* Timeline dot */}
                                          <div className="absolute -left-[2.55rem] top-1.5 w-3 h-3 rounded-full bg-background border-2 border-primary z-10 shadow-[0_0_0_4px_hsl(var(--background))]" />
                                          <p className="text-foreground/90 leading-relaxed text-base md:text-lg">{activity}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </motion.div>
                          ))}
                        </Accordion>
                      </div>
                    </div>

                    {/* Places Grid */}
                    <div>
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-3xl font-bold tracking-tight">Must-Visit Places</h3>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-5">
                        {tripPlan.popular_places.map((place, idx) => (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: idx * 0.1 }}
                            key={idx}
                          >
                            <Card className="h-full border-border/50 bg-card hover:bg-muted/50 hover:border-primary/30 transition-all shadow-sm rounded-3xl overflow-hidden flex flex-col group cursor-pointer relative">
                              <CardContent className="p-6 flex flex-col flex-1 z-10">
                                <div className="flex justify-between items-start mb-4">
                                  <div className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border ${getCategoryColor(place.category)}`}>
                                    {place.category}
                                  </div>
                                </div>
                                <h4 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{place.name}</h4>
                                <p className="text-sm text-muted-foreground mb-6 leading-relaxed flex-1">{place.description}</p>
                                
                                <div className="flex items-center gap-2 mt-auto">
                                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Clock className="w-3.5 h-3.5 text-primary" />
                                  </span>
                                  <span className="text-xs font-semibold text-foreground/80">Best for: {place.best_time}</span>
                                </div>
                              </CardContent>
                              
                              {/* Hover gradient effect */}
                              <div className="absolute right-0 bottom-0 w-32 h-32 bg-primary/5 rounded-tl-[100%] transition-transform duration-500 group-hover:scale-150 z-0" />
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: AI Insights Sidebar */}
                  <div className="lg:col-span-4">
                    <div className="sticky top-28 space-y-6">
                      
                      {/* Vibe Bento */}
                      <Card className="border-none bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-xl shadow-primary/5 rounded-[2rem] overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                          <Info className="w-32 h-32 text-primary" />
                        </div>
                        <CardContent className="p-8 relative z-10">
                          <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            The Vibe
                          </h4>
                          <p className="text-foreground/80 leading-relaxed font-medium">"{tripPlan.known_for}"</p>
                        </CardContent>
                      </Card>

                      {/* Info Grid Bento */}
                      <div className="grid grid-cols-1 gap-4">
                        <Card className="border-border/50 bg-card shadow-sm rounded-3xl hover:border-primary/20 transition-colors">
                          <CardContent className="p-6 flex flex-col items-center text-center justify-center h-full gap-3">
                            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                              <ThermometerSun className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">When to go</p>
                              <p className="font-bold text-sm leading-tight">{tripPlan.best_time_to_visit}</p>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="border-border/50 bg-card shadow-sm rounded-3xl hover:border-primary/20 transition-colors">
                          <CardContent className="p-6 flex flex-col items-center text-center justify-center h-full gap-3">
                            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                              <Wallet className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Daily Budget</p>
                              <p className="font-bold text-sm leading-tight">{tripPlan.budget_estimate}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Travel Tips Bento */}
                      <Card className="border-border/50 bg-card shadow-sm rounded-[2rem]">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-yellow-500" />
                            Local Insider Tips
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-4">
                            {tripPlan.travel_tips.map((tip, idx) => (
                              <li key={idx} className="flex gap-4 items-start group">
                                <div className="mt-0.5 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                                  <ChevronRight className="w-4 h-4" />
                                </div>
                                <span className="text-sm text-foreground/80 leading-relaxed font-medium">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                    </div>
                  </div>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

export default TripPlanner;
