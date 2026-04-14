import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DealCardEnhanced from "@/components/DealCardEnhanced";
import DealQuickView from "@/components/DealQuickView";
import DealsSkeleton from "@/components/DealsSkeleton";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOptimizedMinPriceDeals, type MinPriceDeal } from "@/hooks/useOptimizedMinPriceDeals";
import { useLanguage } from "@/hooks/useLanguage";
import { Badge } from "@/components/ui/badge";
import {
  Plane,
  Filter,
  TrendingDown,
  Sparkles,
  AlertCircle,
  RefreshCw,
  TicketPercent,
  Clipboard,
  Gift,
  Tag,
  Briefcase,
  GraduationCap,
  Luggage,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { mockDeals, type Deal } from "@/data/mockDeals";
import { toast } from "@/hooks/use-toast";

// Adapter to convert MinPriceDeal to component deal format
const adaptMinPriceDeal = (deal: MinPriceDeal): Deal => ({
  id: deal.id,
  title: `${deal.originCity} to ${deal.destCity}`,
  image: getDestinationImage(deal.destination),
  origin: `${deal.originCity} (${deal.origin})`,
  destination: `${deal.destCity} (${deal.destination})`,
  airline: deal.airline,
  departDate: deal.departureDate,
  returnDate: deal.returnDate,
  price: deal.price,
  originalPrice: Math.round(deal.price * 1.3), // Estimate original price
  cabinClass: deal.cabinClass,
  link: deal.bookingLink,
});

// Get image based on destination
const getDestinationImage = (destCode: string): string => {
  const imageMap: Record<string, string> = {
    LAX: "/deal-beach.jpg",
    SFO: "/deal-nyc.jpg",
    MIA: "/deal-beach.jpg",
    LAS: "/deal-tokyo.jpg",
    DEN: "/deal-nyc.jpg",
    PHX: "/deal-beach.jpg",
    ORD: "/deal-nyc.jpg",
    LHR: "/deal-paris.jpg",
    NRT: "/deal-tokyo.jpg",
    CDG: "/deal-paris.jpg",
    CUN: "/deal-beach.jpg",
    FCO: "/deal-paris.jpg",
    HNL: "/deal-beach.jpg",
    MEX: "/deal-tokyo.jpg",
    SJU: "/deal-beach.jpg",
    ANC: "/deal-nyc.jpg",
    DUB: "/deal-paris.jpg",
    BCN: "/deal-paris.jpg",
    SYD: "/deal-beach.jpg",
  };
  return imageMap[destCode] || "/deal-beach.jpg";
};

const coupons = [
  {
    code: "TRIP20",
    discount: "20% OFF",
    description: "Save on roundtrip flights above $400. Applies to base fare only.",
    expiry: "Valid till Mar 31, 2026",
  },
  {
    code: "REDYE500",
    discount: "$50 OFF",
    description: "Late-night and red-eye departures from select US cities.",
    expiry: "Valid till Apr 15, 2026",
  },
  {
    code: "FAMILY10",
    discount: "10% OFF",
    description: "For bookings with 3+ passengers on the same itinerary.",
    expiry: "Valid till May 10, 2026",
  },
];

const getTimeRemaining = (until?: string) => {
  if (!until) return null;
  const target = new Date(until).getTime();
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) return "Ended";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
};

const specialOffers = [
  {
    id: "last-minute",
    title: "Last Minute Flight Deals",
    description: "Grab seats on departures in the next 7 days before prices jump.",
    badge: "🔥 Hot Deal",
    icon: Plane,
    ctaLabel: "View Last Minute Deals",
    couponCode: "TRIP20",
    limitedUntil: "2026-03-20T23:59:59Z",
  },
  {
    id: "under-99",
    title: "Deals Under $99",
    description: "Short hops and weekend getaways that cost less than dinner out.",
    badge: "⚡ Limited Offer",
    icon: Tag,
    ctaLabel: "See Deals Under $99",
    limitedUntil: "2026-04-01T23:59:59Z",
  },
  {
    id: "seniors",
    title: "Deals for Seniors",
    description: "Extra savings and flexible options for travelers 60+.",
    badge: "💫 Gentle Saver",
    icon: Gift,
    ctaLabel: "Explore Senior Deals",
  },
  {
    id: "business-class",
    title: "Business Class Flights",
    description: "Premium cabins at prices that feel surprisingly reasonable.",
    badge: "✈ Premium Pick",
    icon: Briefcase,
    ctaLabel: "View Business Fares",
  },
  {
    id: "students",
    title: "Student Travel Deals",
    description: "Flexible fares and extra savings for students on the move.",
    badge: "🎓 Student Special",
    icon: GraduationCap,
    ctaLabel: "Unlock Student Offers",
    couponCode: "STUDY15",
    limitedUntil: "2026-03-31T23:59:59Z",
  },
  {
    id: "top-airlines",
    title: "Top Airline Deals",
    description: "Handpicked offers from the most trusted airlines worldwide.",
    badge: "⭐ Top Pick",
    icon: Luggage,
    ctaLabel: "Browse Airline Deals",
  },
];

const Deals = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedAirline, setSelectedAirline] = useState<string>("all");
  const [selectedDestination, setSelectedDestination] = useState<string>("all");
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("price_asc"); // Default to lowest price first
  const [showFilters, setShowFilters] = useState(false);
  const [showCoupons, setShowCoupons] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Fetch minimum price deals from API with React Query caching (guaranteed 50+ deals)
  const { deals: minPriceDeals, loading, isFetching, error, fromCache, refetch } = useOptimizedMinPriceDeals(50);

  // Hook guarantees 50+ deals by combining API + fallback deals
  // Only show fallback notice if error occurred and deals are all fallback
  const usingFallback = error !== null && minPriceDeals.every((d) => d.id.startsWith("fallback-"));

  // Always use minPriceDeals (hook guarantees 50+ deals with fallback)
  const rawDeals: Deal[] = minPriceDeals.length > 0 ? minPriceDeals.map(adaptMinPriceDeal) : mockDeals;

  // Apply client-side filtering
  let filteredDeals = rawDeals.filter((deal) => {
    const priceMatch = deal.price >= priceRange[0] && deal.price <= priceRange[1];
    const airlineMatch = selectedAirline === "all" || deal.airline === selectedAirline;
    const destMatch =
      selectedDestination === "all" || deal.destination.toLowerCase().includes(selectedDestination.toLowerCase());
    return priceMatch && airlineMatch && destMatch;
  });

  // Apply client-side sorting
  switch (sort) {
    case "price_asc":
      filteredDeals = [...filteredDeals].sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      filteredDeals = [...filteredDeals].sort((a, b) => b.price - a.price);
      break;
    case "popularity":
      filteredDeals = [...filteredDeals].sort((a, b) => b.originalPrice - b.price - (a.originalPrice - a.price));
      break;
    case "date":
      filteredDeals = [...filteredDeals].sort(
        (a, b) => new Date(a.departDate).getTime() - new Date(b.departDate).getTime(),
      );
      break;
    default:
      // Featured - keep original order (already sorted by price from API)
      break;
  }

  // Paginate
  const itemsPerPage = 12;
  const paginatedDeals = filteredDeals.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const displayTotal = filteredDeals.length;
  const displayTotalPages = Math.ceil(filteredDeals.length / itemsPerPage);

  // Get unique airlines and destinations for filters
  const airlines: string[] = [...new Set(rawDeals.map((deal) => deal.airline))].filter(Boolean).sort();
  const destinations: string[] = [
    ...new Set(
      rawDeals.map((deal) => {
        const match = deal.destination.match(/^([^(]+)/);
        return match ? match[1].trim() : deal.destination;
      }),
    ),
  ]
    .filter(Boolean)
    .sort();

  const handleQuickView = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsQuickViewOpen(true);
  };

  const handleDealClick = (deal: Deal) => {
    if (deal.link) {
      navigate(deal.link);
    }
  };

  const handleBookDeal = () => {
    if (selectedDeal?.link) {
      navigate(selectedDeal.link);
      setIsQuickViewOpen(false);
    }
  };

  const resetFilters = () => {
    setPriceRange([0, 2000]);
    setSelectedAirline("all");
    setSelectedDestination("all");
    setPage(1);
  };

  const handleCopyCoupon = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Copied!",
        description: `Coupon code ${code} copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Unable to copy",
        description: "Please copy the coupon code manually.",
        variant: "destructive",
      });
    }
  };

  const handleOfferClick = (offerId: string) => {
    setActiveCategory(offerId);
    setPage(1);

    switch (offerId) {
      case "last-minute":
        setSort("date");
        toast({
          title: "Last minute deals",
          description: "Showing deals sorted by the soonest departure dates first.",
        });
        break;
      case "under-99":
        setPriceRange([0, 99]);
        setSort("price_asc");
        toast({
          title: "Deals under $99",
          description: "Price filter adjusted to highlight the most affordable fares.",
        });
        break;
      case "business-class":
        setSort("price_desc");
        toast({
          title: "Business class fares",
          description: "Showing higher-value fares first. Look for Business and Premium cabins.",
        });
        break;
      case "students":
        setSort("price_asc");
        toast({
          title: "Student-friendly fares",
          description: "Surfacing lower-cost options that work well for student travel.",
        });
        break;
      case "seniors":
        setSort("popularity");
        toast({
          title: "Senior deals",
          description: "Highlighting popular, comfortable routes for senior travelers.",
        });
        break;
      case "top-airlines":
        setSort("popularity");
        toast({
          title: "Top airline deals",
          description: "Showing offers from routes other travelers love most.",
        });
        break;
      default:
        break;
    }

    document.getElementById("deals-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background pt-16 ">
      <Helmet>
        <title>Exclusive Flight Deals & Travel Offers | Tripile.com USA</title>
        <meta
          name="description"
          content="Discover exclusive flight deals and travel offers across the USA. Save up to 50% on roundtrip flights with Tripile.com's best price guarantee. Compare fares from 500+ airlines."
        />
        <meta
          name="keywords"
          content="flight deals USA, cheap airline tickets, travel offers, discounted flights, last minute deals, best flight prices, Tripile deals"
        />
        <meta property="og:title" content="Exclusive Flight Deals & Travel Offers | Tripile.com" />
        <meta
          property="og:description"
          content="Discover exclusive travel deals on flights across the USA. Save up to 50% on roundtrip flights."
        />
        <meta property="og:url" content="https://tripile.com/deals" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://tripile.com/og-image.png" />
        <meta property="og:image:secure_url" content="https://tripile.com/og-image.png" />
        <meta property="og:site_name" content="Tripile.com" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@tripile" />
        <meta name="twitter:creator" content="@tripile" />
        <meta name="twitter:title" content="Exclusive Flight Deals &amp; Travel Offers | Tripile.com" />
        <meta
          name="twitter:description"
          content="Discover exclusive travel deals on flights across the USA. Save up to 50% on roundtrip flights."
        />
        <meta name="twitter:image" content="https://tripile.com/og-image.png" />
        <link rel="canonical" href="https://tripile.com/deals" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Exclusive Flight Deals & Travel Offers | Tripile.com USA",
            "description":
              "Discover exclusive flight deals and travel offers across the USA. Compare fares from 500+ airlines with Tripile.com.",
            "url": "https://tripile.com/deals",
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://tripile.com/" },
                { "@type": "ListItem", "position": 2, "name": "Deals", "item": "https://tripile.com/deals" },
              ],
            },
          })}
        </script>
      </Helmet>

      {/* Animated Background Shapes */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 -left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 -right-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 space-y-4 relative overflow-hidden py-8"
        >
          {/* Travel-themed SVG decorations */}
          {/* Plane trail - left side */}
          <motion.svg
            className="absolute top-4 left-[2%] w-32 h-20 pointer-events-none"
            viewBox="0 0 120 60"
            fill="none"
            animate={{ x: [0, 10, 0], y: [0, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <path d="M5 45 Q30 10, 60 30 T115 15" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.15" fill="none" />
            <polygon points="112,12 120,15 112,18" fill="hsl(var(--primary))" opacity="0.25" />
          </motion.svg>

          {/* Plane trail - right side */}
          <motion.svg
            className="absolute bottom-6 right-[3%] w-28 h-16 pointer-events-none"
            viewBox="0 0 110 50"
            fill="none"
            animate={{ x: [0, -8, 0], y: [0, 4, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <path d="M105 40 Q80 5, 50 25 T5 10" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.12" fill="none" />
            <polygon points="8,7 0,10 8,13" fill="hsl(var(--primary))" opacity="0.2" />
          </motion.svg>

          {/* Gift box icon - top right */}
          <motion.svg
            className="absolute top-2 right-[8%] w-10 h-10 pointer-events-none"
            viewBox="0 0 40 40"
            fill="none"
            animate={{ y: [0, -6, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <rect x="6" y="16" width="28" height="20" rx="3" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.15" />
            <rect x="4" y="12" width="32" height="8" rx="2" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.15" />
            <line x1="20" y1="12" x2="20" y2="36" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.12" />
            <path d="M20 12 Q15 4, 8 8" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.15" fill="none" />
            <path d="M20 12 Q25 4, 32 8" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.15" fill="none" />
          </motion.svg>

          {/* Trophy / reward icon - bottom left */}
          <motion.svg
            className="absolute bottom-2 left-[10%] w-9 h-9 pointer-events-none"
            viewBox="0 0 36 36"
            fill="none"
            animate={{ y: [0, -5, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          >
            <path d="M10 8 h16 v10 q0 8 -8 10 q-8 -2 -8 -10 z" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.15" fill="none" />
            <path d="M10 12 Q4 12, 4 8 Q4 4, 10 8" stroke="hsl(var(--primary))" strokeWidth="1.2" opacity="0.12" fill="none" />
            <path d="M26 12 Q32 12, 32 8 Q32 4, 26 8" stroke="hsl(var(--primary))" strokeWidth="1.2" opacity="0.12" fill="none" />
            <line x1="14" y1="30" x2="22" y2="30" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.12" />
            <line x1="18" y1="28" x2="18" y2="32" stroke="hsl(var(--primary))" strokeWidth="1.2" opacity="0.1" />
          </motion.svg>

          {/* Coin icon - top left */}
          <motion.svg
            className="absolute top-8 left-[20%] w-7 h-7 pointer-events-none"
            viewBox="0 0 28 28"
            fill="none"
            animate={{ y: [0, -4, 0], rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="14" cy="14" r="12" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.12" />
            <text x="14" y="18" textAnchor="middle" fontSize="12" fill="hsl(var(--primary))" opacity="0.15" fontWeight="bold">$</text>
          </motion.svg>

          {/* Map pin - right side */}
          <motion.svg
            className="absolute top-1/2 right-[4%] w-8 h-8 pointer-events-none"
            viewBox="0 0 30 36"
            fill="none"
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          >
            <path d="M15 2 C8 2, 3 7, 3 14 C3 22, 15 34, 15 34 C15 34, 27 22, 27 14 C27 7, 22 2, 15 2Z" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.12" fill="none" />
            <circle cx="15" cy="14" r="4" stroke="hsl(var(--primary))" strokeWidth="1.2" opacity="0.1" fill="none" />
          </motion.svg>

          {/* Globe icon - bottom right */}
          <motion.svg
            className="absolute bottom-4 right-[20%] w-8 h-8 pointer-events-none"
            viewBox="0 0 32 32"
            fill="none"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="16" cy="16" r="13" stroke="hsl(var(--primary))" strokeWidth="1.2" opacity="0.1" />
            <ellipse cx="16" cy="16" rx="6" ry="13" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.08" />
            <line x1="3" y1="16" x2="29" y2="16" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.08" />
          </motion.svg>

          {/* Sparkle dots */}
          <div className="absolute top-6 left-[35%] w-1.5 h-1.5 bg-primary/15 rounded-full animate-pulse pointer-events-none" />
          <div className="absolute bottom-8 right-[30%] w-2 h-2 bg-primary/10 rounded-full animate-pulse pointer-events-none" />
          <div className="absolute top-1/3 left-[45%] w-1 h-1 bg-primary/20 rounded-full animate-pulse pointer-events-none" />

          <div className="flex items-center justify-center gap-3 mb-4 relative z-10">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Plane className="w-12 h-12 text-primary" />
            </motion.div>
            <Badge variant="secondary" className="px-4 py-2 text-sm font-bold animate-pulse">
              <Sparkles className="w-4 h-4 mr-1" />
              {displayTotal}+ Live Deals
            </Badge>
          </div>

          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text text-transparent font-display relative z-10">
            Today's Best Flight Deals
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto relative z-10">
            Exclusive offers handpicked for you. Save up to <span className="text-primary font-bold">50%</span> on
            flights worldwide
          </p>
        </motion.div>

        {/* Gift Rewards Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-10 rounded-2xl overflow-hidden shadow-lg"
        >
          <div className="relative bg-gradient-to-r from-primary via-primary/90 to-primary/80 px-6 py-8 md:px-10 md:py-10 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-10 w-24 h-24 bg-primary-foreground/5 rounded-full translate-y-1/2 pointer-events-none" />

            {/* Floating reward emojis / icons */}
            <motion.span
              className="absolute top-3 right-[15%] text-2xl opacity-40 pointer-events-none select-none"
              animate={{ y: [0, -8, 0], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >🎉</motion.span>
            <motion.span
              className="absolute bottom-3 right-[30%] text-xl opacity-30 pointer-events-none select-none"
              animate={{ y: [0, -6, 0], rotate: [0, -15, 15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >🏷️</motion.span>
            <motion.span
              className="absolute top-4 right-[45%] text-2xl opacity-25 pointer-events-none select-none"
              animate={{ y: [0, -10, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >✨</motion.span>
            <motion.span
              className="absolute bottom-4 left-[5%] text-xl opacity-30 pointer-events-none select-none"
              animate={{ y: [0, -7, 0], rotate: [0, 12, -12, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            >🎁</motion.span>
            <motion.span
              className="absolute top-2 left-[25%] text-lg opacity-20 pointer-events-none select-none"
              animate={{ y: [0, -5, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            >💰</motion.span>
            <motion.span
              className="absolute bottom-2 right-[10%] text-lg opacity-25 pointer-events-none select-none"
              animate={{ y: [0, -6, 0], rotate: [0, -8, 8, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            >🎀</motion.span>

            {/* Glowing dots */}
            <div className="absolute top-1/2 right-[20%] w-2 h-2 bg-amber-300/40 rounded-full animate-pulse pointer-events-none" />
            <div className="absolute top-1/4 left-[40%] w-1.5 h-1.5 bg-primary-foreground/20 rounded-full animate-pulse pointer-events-none" />
            <div className="absolute bottom-1/3 right-[50%] w-2 h-2 bg-amber-200/30 rounded-full animate-pulse pointer-events-none" />

            <div className="relative z-10 text-center md:text-left space-y-2">
              <h2 className="text-2xl md:text-3xl font-black text-primary-foreground flex items-center gap-2 justify-center md:justify-start">
                Gift Rewards <span className="text-3xl">🎁</span>
              </h2>
              <p className="text-primary-foreground/90 text-base md:text-lg max-w-lg">
                Make Spring Travel Pay You Back: Get{" "}
                <span className="font-bold text-amber-300">up to $100*</span>{" "}
                in travel credits after every flight booking.
              </p>
            </div>

            <Button
              onClick={() => navigate("/booking")}
              className="relative z-10 bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold px-8 py-3 rounded-xl text-base shadow-md whitespace-nowrap"
            >
              Book & Earn
            </Button>
          </div>
        </motion.div>

        {/* Coupons & Special Offers Categories */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                Coupons &amp; Special Offers
                <Sparkles className="w-5 h-5 text-primary" />
              </h2>
              <p className="mt-1 text-sm md:text-base text-muted-foreground max-w-xl">
                Explore themed offers for last‑minute trips, students, seniors, and more. Start from the category that
                fits your next journey.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {specialOffers.map((offer) => {
              const Icon = offer.icon;
              const remaining = getTimeRemaining(offer.limitedUntil);
              return (
                <div
                  key={offer.id}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-background to-secondary/10 border border-primary/10 shadow-sm transition-all duration-200 hover:-translate-y-1.5 hover:shadow-2xl"
                >
                  {/* Decorative gift icon */}
                  <div className="pointer-events-none absolute -top-3 right-3 h-10 w-10 rounded-2xl bg-primary/90 text-primary-foreground flex items-center justify-center shadow-md transform translate-y-1 group-hover:translate-y-0 group-hover:rotate-3 group-hover:scale-110 transition-transform duration-200">
                    <Gift className="w-5 h-5" />
                  </div>
                  {/* Confetti / glow */}
                  <div className="pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="pointer-events-none absolute bottom-2 left-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="h-2 w-2 rounded-full bg-primary/70 animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-secondary/70 animate-bounce delay-150" />
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-bounce delay-300" />
                  </div>

                  <div className="p-4 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-base md:text-lg">{offer.title}</h3>
                          <p className="text-xs text-muted-foreground">{offer.description}</p>
                        </div>
                      </div>
                      {offer.badge && (
                        <Badge className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary border-primary/20">
                          {offer.badge}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      {remaining && (
                        <span className="text-[11px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          {remaining === "Ended" ? "Offer ended" : `Ends in ${remaining}`}
                        </span>
                      )}
                      {offer.couponCode && (
                        <Badge variant="outline" className="ml-auto text-[10px] px-2 py-0.5 font-mono">
                          Code: {offer.couponCode}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        className={`flex-1 gap-2 bg-primary/90 hover:bg-primary text-primary-foreground shadow-sm ${
                          activeCategory === offer.id ? "ring-2 ring-primary/60 ring-offset-2" : ""
                        }`}
                        onClick={() => handleOfferClick(offer.id)}
                      >
                        <Plane className="w-4 h-4" />
                        {offer.ctaLabel}
                      </Button>
                      {offer.couponCode && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="sm:w-auto w-full gap-1 text-xs"
                          onClick={() => handleCopyCoupon(offer.couponCode!)}
                        >
                          <Clipboard className="w-3 h-3" />
                          Copy Code
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Coupons Section */}
        {showCoupons && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <Card className="glass-card rounded-2xl border-primary/10 bg-gradient-to-r from-primary/5 via-secondary/5 to-background">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <TicketPercent className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Available Coupons
                      <Badge variant="secondary" className="text-xs px-2 py-0.5">
                        Limited time
                      </Badge>
                    </CardTitle>
                    <CardDescription>Apply these at checkout to stack savings on top of deals.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {coupons.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No coupons available right now. Check back later.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {coupons.map((coupon) => (
                      <div
                        key={coupon.code}
                        className="group flex flex-col justify-between rounded-xl border border-primary/10 bg-card/90 p-4 shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-primary/40 transition-all duration-200"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <Badge
                              variant="outline"
                              className="font-mono text-xs px-2 py-1 bg-primary/5 group-hover:bg-primary/10 group-hover:text-primary border-dashed"
                            >
                              {coupon.code}
                            </Badge>
                            <span className="text-sm font-semibold text-primary group-hover:scale-105 transform">
                              {coupon.discount}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{coupon.description}</p>
                          <p className="text-xs text-muted-foreground/80">Expires: {coupon.expiry}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4 w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground"
                          onClick={() => handleCopyCoupon(coupon.code)}
                        >
                          <Clipboard className="w-4 h-4 group-hover:animate-pulse" />
                          Copy Code
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.section>
        )}

        {/* Error/Fallback Notice */}
        {usingFallback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Unable to fetch live deals. Showing curated featured deals instead.
            </p>
          </motion.div>
        )}

        {/* Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4 gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <h2 className="font-bold text-lg">Filter Deals</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={showCoupons ? "default" : "outline"}
                  size="sm"
                  className="gap-1"
                  onClick={() => setShowCoupons((prev) => !prev)}
                >
                  <TicketPercent className="w-4 h-4" />
                  Coupons
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  {showFilters ? "Hide" : "Show"}
                </Button>
              </div>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 ${!showFilters && "hidden lg:grid"}`}>
              {/* Price Range */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  Price Range
                </Label>
                <Slider
                  min={0}
                  max={2000}
                  step={50}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="mt-2"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>

              {/* Airline */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Airline</Label>
                <Select value={selectedAirline} onValueChange={setSelectedAirline}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="All Airlines" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="all">All Airlines</SelectItem>
                    {airlines.map((airline) => (
                      <SelectItem key={airline} value={airline}>
                        {airline}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Destination */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Destination</Label>
                <Select value={selectedDestination} onValueChange={setSelectedDestination}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="All Destinations" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50 max-h-60">
                    <SelectItem value="all">All Destinations</SelectItem>
                    {destinations.map((dest) => (
                      <SelectItem key={dest} value={dest}>
                        {dest}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Sort By</Label>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price_asc">Price: Low → High</SelectItem>
                    <SelectItem value="price_desc">Price: High → Low</SelectItem>
                    <SelectItem value="date">Travel Date</SelectItem>
                    <SelectItem value="popularity">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reset */}
              <div className="flex items-end">
                <Button variant="outline" onClick={resetFilters} className="w-full">
                  Reset Filters
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 flex items-center justify-between"
          >
            <p className="text-muted-foreground flex items-center gap-2">
              Showing <span className="font-bold text-foreground">{paginatedDeals.length}</span> of{" "}
              <span className="font-bold text-foreground">{displayTotal}</span> deals
              {isFetching && !loading && (
                <span className="inline-flex items-center gap-1 text-xs text-primary">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Updating...
                </span>
              )}
              {fromCache && !isFetching && <span className="text-xs text-muted-foreground/70">(cached)</span>}
            </p>
            {!usingFallback && (
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="gap-2">
                <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
                Refresh Prices
              </Button>
            )}
          </motion.div>
        )}

        {/* Deals Grid */}
        {loading ? (
          <DealsSkeleton />
        ) : paginatedDeals.length === 0 ? (
          <div className="text-center py-12">
            <Plane className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-bold mb-2">No deals found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
            <Button onClick={resetFilters}>Reset Filters</Button>
          </div>
        ) : (
          <>
            <motion.div
              id="deals-grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05,
                  },
                },
              }}
            >
              {paginatedDeals.map((deal, index) => (
                <motion.div
                  key={deal.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <DealCardEnhanced
                    deal={deal}
                    index={index}
                    onQuickView={() => handleQuickView(deal)}
                    onClick={() => handleDealClick(deal)}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {displayTotalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 mt-12"
              >
                <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {[...Array(Math.min(5, displayTotalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        onClick={() => setPage(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(displayTotalPages, p + 1))}
                  disabled={page === displayTotalPages}
                >
                  Next
                </Button>
              </motion.div>
            )}
          </>
        )}
      </main>

      <Footer />

      {/* Quick View Modal */}
      <DealQuickView
        deal={selectedDeal}
        open={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onBook={handleBookDeal}
      />
    </div>
  );
};

export default Deals;
