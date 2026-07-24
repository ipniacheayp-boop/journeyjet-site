import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchWidget from "@/components/SearchWidget";
import HeroBackground from "@/components/HeroBackground";
import DealCard from "@/components/DealCard";
import FAQSchema from "@/components/seo/FAQSchema";
import HomePageSchema from "@/components/seo/HomePageSchema";
import { popularDestinations } from "@/data/destinationsData";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Lazy load below-the-fold components for better TTI
const DealModal = lazy(() => import("@/components/DealModal"));
const TailoredDealCard = lazy(() => import("@/components/TailoredDealCard"));
const TrustBadges = lazy(() => import("@/components/TrustBadges"));
const FlyBot = lazy(() => import("@/components/FlyBot"));
const FeatureHighlights = lazy(() => import("@/components/FeatureHighlights"));
const ForTravelPros = lazy(() => import("@/components/ForTravelPros"));
const PartnerLogos = lazy(() => import("@/components/PartnerLogos"));
const AppDownload = lazy(() => import("@/components/AppDownload"));
const FlightsHotelsSearch = lazy(() => import("@/components/FlightsHotelsSearch"));
const PopularFlights = lazy(() => import("@/components/PopularFlights"));
const CustomerReviewsDark = lazy(() => import("@/components/CustomerReviewsDark"));
import { mockDeals, type Deal } from "@/data/mockDeals";
import dealLastMinute from "@/assets/deal-last-minute.jpg";
import dealBudget from "@/assets/deal-budget.jpg";
import dealSeniors from "@/assets/deal-seniors.jpg";
import dealBusiness from "@/assets/deal-business.jpg";
import dealStudents from "@/assets/deal-students.jpg";
import dealAirlines from "@/assets/deal-airlines.jpg";
import rewardsIllustration2 from "@/assets/reward.webp";
import {
  ArrowRight,
  RefreshCw,
  Shield,
  Clock,
  Headphones,
  CreditCard,
  Star,
  Users,
  Plane,
  ChevronRight,
  Hotel,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Shuffle array helper
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const Index = () => {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // SEO: Google keeps crawling legacy query-parameter variants of the homepage
  // (?type=hotels, ?type=flights&originLocationCode=..., ?ref=...) as separate
  // "Crawled - currently not indexed" URLs. Redirect the meaningful ?type= variants
  // to their dedicated clean routes, and strip all other tracking/search params so
  // every signal consolidates on the clean canonical (https://tripile.com/).
  const navigate = useNavigate();
  useEffect(() => {
    if (typeof window === "undefined") return;
    const search = window.location.search;
    if (!search) return;
    const type = new URLSearchParams(search).get("type");
    const typeRoute: Record<string, string> = {
      flights: "/flights",
      hotels: "/hotels",
      cars: "/car-rentals",
      "car-rentals": "/car-rentals",
    };
    if (type && typeRoute[type]) {
      navigate(typeRoute[type], { replace: true });
      return;
    }
    window.history.replaceState(null, "", window.location.pathname + window.location.hash);
  }, [navigate]);


  const pinnedDeals = useMemo(() => mockDeals.filter((deal) => deal.isPinned).slice(0, 2), []);
  const unpinnedDeals = useMemo(() => mockDeals.filter((deal) => !deal.isPinned), []);

  const featuredDeals = useMemo(() => {
    const needed = 6 - pinnedDeals.length;
    const shuffled = shuffleArray(unpinnedDeals);
    return [...pinnedDeals, ...shuffled.slice(0, needed)];
  }, [pinnedDeals, unpinnedDeals, refreshKey]);

  const handleRefreshDeals = () => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "deals_refresh");
    }
    setRefreshKey((prev) => prev + 1);
  };

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsModalOpen(true);
  };

  const tailoredDeals = [
    {
      id: "1",
      title: "Last Minute Flight Deals",
      description: "Up to $50* Off Instantly, Just Like That.",
      image: dealLastMinute,
      tag: "HOT DEAL",
    },
    {
      id: "2",
      title: "Deals Under $199",
      description: "Fly With Up To 25% Off* On Flights.",
      image: dealBudget,
      tag: "BUDGET",
    },
    {
      id: "3",
      title: "Deals for Seniors",
      description: "Save Up To $60* On Flights For Seniors.",
      image: dealSeniors,
      tag: "SENIOR",
    },
    {
      id: "4",
      title: "Business Class Flights",
      description: "Up To 45% Off* Business Class Bliss.",
      image: dealBusiness,
      tag: "PREMIUM",
    },
    {
      id: "5",
      title: "Student Travel Deals",
      description: "Unlock Savings Up To $40* For Students.",
      image: dealStudents,
      tag: "STUDENT",
    },
    {
      id: "6",
      title: "Top Airline Deals",
      description: "Up To 20% Off* On Your Favorite Airlines.",
      image: dealAirlines,
      tag: "POPULAR",
    },
  ];

  const whyChooseUs = [
    {
      icon: Shield,
      title: "Best Price Guarantee",
      stat: "10% off",
      statLabel: "if you find lower",
      description:
        "Find a cheaper fare anywhere else and we'll match it — plus give you an extra 10% off. That's our promise.",
      color: "text-blue-500",
      iconBg: "bg-blue-600",
      link: "/deals",
      linkTitle: "Tripile best price guarantee — compare travel deals",
      linkLabel: "Learn more about our Price Guarantee",
    },
    {
      icon: Clock,
      title: "24/7 Expert Support",
      stat: "< 2 min",
      statLabel: "avg. response time",
      description: "Real travel specialists on call day and night — by phone, live chat, or email. Never wait alone.",
      color: "text-emerald-500",
      iconBg: "bg-emerald-600",
      link: "/support",
      linkTitle: "Contact Tripile support — 24/7 travel help",
      linkLabel: "Learn more about 24/7 support",
    },
    {
      icon: Headphones,
      title: "Personalized Guidance",
      stat: "500+",
      statLabel: "airlines compared",
      description:
        "Our agents search across 500+ carriers to find the fare that best fits your schedule, budget, and preferences.",
      color: "text-indigo-500",
      iconBg: "bg-indigo-600",
      link: "/support",
      linkTitle: "Tripile travel experts — personalized flight search",
      linkLabel: "Learn more about personalized search",
    },
    {
      icon: CreditCard,
      title: "Flexible Payments",
      stat: "0%",
      statLabel: "interest on FlexPay",
      description:
        "Break your trip into easy monthly installments with zero interest. Multiple cards, wallets, and BNPL options.",
      color: "text-amber-500",
      iconBg: "bg-amber-500",
      link: "/support?topic=flexpay",
      linkTitle: "Tripile FlexPay — flexible payment options for travel",
      linkLabel: "Learn more about FlexPay",
    },
  ];

  const heroDestinations = popularDestinations.filter((d) =>
    ["new-york", "los-angeles", "miami", "las-vegas", "chicago", "orlando"].includes(d.slug),
  );

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Cheap Flights, Hotels & Car Rentals USA | Tripile.com</title>
        <meta
          name="description"
          content="Book cheap flights, hotels & car rentals across the USA. Compare 500+ airlines, rent cars from $26/day in top cities, Price Match Guarantee & 24/7 US support."
        />
        <meta
          name="keywords"
          content="cheap flights USA, car rentals USA, cheap car rental, rent a car USA, flight deals, cheap hotels USA, airport car rental, US travel deals, Enterprise Hertz Avis"
        />
        <link rel="canonical" href="https://tripile.com/" />
        <link rel="alternate" hrefLang="en-us" href="https://tripile.com/" />
        <link rel="alternate" hrefLang="x-default" href="https://tripile.com/" />
        <meta property="og:url" content="https://tripile.com/" />
        <meta property="og:title" content="Cheap Flights, Hotels & Car Rentals USA | Tripile.com" />
        <meta
          property="og:description"
          content="Book cheap flights, hotels & car rentals across the USA. Compare 500+ airlines, Price Match Guarantee, no hidden fees & 24/7 US support."
        />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:title" content="Cheap Flights, Hotels & Car Rentals USA | Tripile.com" />
        <meta
          name="twitter:description"
          content="Book cheap flights, hotels & car rentals across the USA. Compare 500+ airlines, Price Match Guarantee, no hidden fees & 24/7 US support."
        />
      </Helmet>
      <HomePageSchema />
      <Header />

      <main id="main-content">
      {/* Hero — cinematic background with parallax & effects */}
      <section className="relative w-full overflow-hidden min-h-[540px] md:min-h-[600px]" aria-label="Search flights and hotels in the USA">
        <HeroBackground />

        <div className="container mx-auto px-4 relative z-10 pt-28 md:pt-36 pb-10 md:pb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-7"
          >
            <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-semibold text-white uppercase tracking-wider mb-5 shadow-lg">
              <Shield className="w-3.5 h-3.5 text-sky-300" aria-hidden="true" />
              Flights &amp; Hotels — All 50 States
            </p>
            <h1 className="font-sans text-balance text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-snug tracking-normal mb-4 drop-shadow-md max-w-4xl mx-auto">
              Search Cheap Flights &amp; Hotels in the USA
            </h1>
          </motion.div>

          {/* Quick service pills with hover — SEO internal links */}
          <nav aria-label="Book flights or hotels" className="flex flex-wrap justify-center gap-2 mb-6 max-w-md mx-auto">
            {[
              { to: "/flights", label: "Search Flights", icon: Plane, title: "Search cheap flights USA — Tripile", className: "search-tab-flights" },
              { to: "/hotels", label: "Search Hotels", icon: Hotel, title: "Search cheap hotels USA — Tripile", className: "search-tab-hotels" },
            ].map(({ to, label, icon: Icon, title, className }) => (
              <Link
                key={to}
                to={to}
                title={title}
                className={`hero-service-pill ${className} inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white/90 bg-white/10 border border-white/20 backdrop-blur-sm`}
              >
                <Icon className="hero-pill-icon w-4 h-4" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Search widget */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            <div
              id="search-widget"
              className="hero-search-widget bg-white dark:bg-slate-950 rounded-2xl border border-white/20 dark:border-slate-700 p-4 md:p-6"
            >
              <SearchWidget />
            </div>
          </motion.div>

          {/* Popular US destinations — SEO internal links */}
          <nav
            aria-label="Popular US travel destinations"
            className="flex flex-wrap justify-center gap-2 mt-6 max-w-3xl mx-auto"
          >
            <span className="text-xs text-white/60 font-medium self-center mr-1">Trending flights:</span>
            {heroDestinations.map((dest) => (
              <Link
                key={dest.slug}
                to={`/flights-to/${dest.slug}`}
                title={`Cheap flights to ${dest.city}, ${dest.country === "US" ? "USA" : dest.country} — Tripile`}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium text-white/90 bg-white/10 border border-white/20 hover:bg-white/25 hover:text-white hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
              >
                {dest.city}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* Trust stats bar */}
      <section aria-label="Tripile trust metrics" className="bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-4 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
            {[
              { icon: Users, value: "50K+", label: "US Travelers", color: "text-primary", href: "/reviews" },
              { icon: Plane, value: "500+", label: "Airlines Compared", color: "text-indigo-600", href: "/flights" },
              { icon: Hotel, value: "$79", label: "Hotels From", color: "text-indigo-600", href: "/hotels" },
              { icon: Star, value: "4.5★", label: "Average Rating", color: "text-amber-500", href: "/reviews" },
            ].map(({ icon: Icon, value, label, color, href }) => (
              <Link
                key={label}
                to={href}
                title={`${label} — Tripile`}
                className="flex items-center justify-center gap-3 group hover:opacity-80 transition-opacity"
              >
                <div className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-extrabold text-foreground leading-none">{value}</p>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">{label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Flights & Hotels search — popular destinations */}
      <Suspense fallback={<div className="py-16" />}>
        <FlightsHotelsSearch />
      </Suspense>

      {/* Today's deals — clean cards on white background */}
      <section aria-labelledby="today-deals-heading" className="py-10 bg-slate-50/80 dark:bg-slate-900/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Limited Time</p>
              <h2 id="today-deals-heading" className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Today&apos;s Best Travel Deals
              </h2>
            </div>
            <Link
              to="/deals"
              title="See all Tripile travel deals"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              View all deals <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                image: dealLastMinute,
                alt: "Last minute flight deals USA",
                badge: "Flights",
                title: "Last-Minute Flight Deals",
                desc: "Save up to $50 on same-week departures.",
                href: "/deals",
              },
              {
                image: dealBudget,
                alt: "Budget flights under $199",
                badge: "Budget",
                title: "Flights Under $199",
                desc: "Round-trip fares to top US destinations.",
                href: "/deals",
              },
              {
                image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
                alt: "Cheap hotels USA — compare rates on Tripile",
                badge: "Hotels",
                title: "Hotels From $79/Night",
                desc: "Top-rated stays in NYC, Vegas, Miami & more.",
                href: "/hotels",
              },
            ].map((deal) => (
              <Link
                key={deal.title}
                to={deal.href}
                title={`${deal.title} — Tripile`}
                className="group bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={deal.image}
                    alt={deal.alt}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                    {deal.badge}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-foreground mb-1">{deal.title}</h3>
                  <p className="text-sm text-muted-foreground">{deal.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights Strip - Three Columns */}
      <Suspense fallback={<div className="py-12" />}>
        <FeatureHighlights />
      </Suspense>

      {/* Popular Flights Section */}
      <Suspense fallback={<div className="py-20" />}>
        <PopularFlights />
      </Suspense>

      {/* For Travel Pros Section */}
      <Suspense fallback={<div className="py-20" />}>
        <ForTravelPros />
      </Suspense>

      {/* Partner Logos Strip */}
      <Suspense fallback={<div className="py-12" />}>
        <PartnerLogos />
      </Suspense>

      {/* Why Choose Us Section - Professional */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950/60">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Why Tripile</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">Why Travelers Choose Tripile</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm">
              Join over <strong className="text-foreground">2 million</strong> satisfied travelers who trust us to find
              the best deals, every day.
            </p>
          </motion.div>

          {/* Cards Grid */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto"
          >
            {whyChooseUs.map((item) => (
              <motion.div
                key={item.title}
                variants={fadeInUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group bg-card rounded-2xl border border-border hover:border-primary/25 hover:shadow-lg transition-all duration-200 p-6 flex gap-5"
              >
                {/* Icon */}
                <div
                  className={`shrink-0 w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center shadow-sm mt-0.5`}
                >
                  <item.icon className="w-5 h-5 text-white" />
                </div>

                {/* Text */}
                <div className="min-w-0">
                  {/* Stat */}
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className={`text-xl font-extrabold ${item.color}`}>{item.stat}</span>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                      {item.statLabel}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-foreground mb-1.5">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                  <Link
                    to={item.link}
                    title={item.linkTitle}
                    className={`inline-flex items-center gap-1 mt-3 text-xs font-semibold ${item.color} hover:opacity-80 transition-opacity`}
                  >
                    {item.linkLabel} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom social-proof strip */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="font-semibold text-foreground ml-1">4.5</span>
              <span>/ 5 average rating</span>
            </div>
            <span className="hidden sm:block w-px h-4 bg-border" />
            <span>
              Based on <strong className="text-foreground">56,000+</strong> verified reviews
            </span>
            <span className="hidden sm:block w-px h-4 bg-border" />
            <Link
              to="/reviews"
              title="Read verified Tripile customer reviews"
              className="text-primary font-semibold hover:underline flex items-center gap-1"
            >
              Read reviews <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Deals - Structured Layout */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4"
          >
            <motion.div variants={fadeInUp}>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">Featured Deals</h2>
              <p className="text-muted-foreground">Handpicked offers refreshed daily</p>
            </motion.div>
            <motion.div variants={fadeInUp} className="flex gap-3">
              <Button variant="outline" className="gap-2 rounded-xl hover:bg-muted/50" onClick={handleRefreshDeals}>
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Link to="/deals" title="View all featured travel deals on Tripile">
                <Button className="gap-2 rounded-xl btn-premium">
                  View All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {featuredDeals.map((deal, index) => (
              <motion.div
                key={`${deal.id}-${refreshKey}`}
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <DealCard deal={deal} onClick={() => handleDealClick(deal)} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Suspense fallback={null}>
        <DealModal deal={selectedDeal} open={isModalOpen} onOpenChange={setIsModalOpen} />
      </Suspense>

      {/* Customer Reviews Dark Section */}
      <Suspense fallback={<div className="py-20" />}>
        <CustomerReviewsDark />
      </Suspense>

      {/* Tailored Travel Deals */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mb-12"
          >
            <motion.h2 variants={fadeInUp} className="font-display text-3xl md:text-4xl font-bold mb-2">
              Tailored Travel Deals
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground max-w-3xl">
              From weekend escapes to last-minute flights, travel with the best deals handpicked by our team.
            </motion.p>
          </motion.div>
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {tailoredDeals.map((deal, index) => (
              <motion.div key={deal.id} variants={fadeInUp}>
                <Suspense fallback={<div className="h-48 bg-muted/50 rounded-xl animate-pulse" />}>
                  <TailoredDealCard deal={deal} />
                </Suspense>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Suspense fallback={<div className="py-12" />}>
        <TrustBadges />
      </Suspense>

      {/* Premium Rewards Section */}
      <section className="py-20 bg-background overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto rounded-3xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-2">
              {/* Left: Illustration */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="relative bg-gradient-to-br from-primary/10 via-indigo-500/10 to-sky-500/10 flex items-center justify-center p-8 min-h-[260px]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_60%,rgba(59,130,246,0.12),transparent_70%)]" />
                <img
                  src={rewardsIllustration2}
                  alt="Rewards and benefits illustration"
                  title="Tripile member rewards — exclusive USA travel perks"
                  loading="lazy"
                  decoding="async"
                  className="w-full max-w-lg relative z-10 drop-shadow-xl rounded-lg"
                />
              </motion.div>

              {/* Right: Content */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="p-8 md:p-10 flex flex-col justify-center"
              >
                <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Member Benefits</p>
                <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
                  Sign Up &amp; Unlock Exclusive Rewards
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Join free and get instant access to member-only deals, price alerts, and travel perks — no credit card
                  needed.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-7">
                  {[
                    { label: "Members-only Deals", icon: "🎟️" },
                    { label: "Airport Lounge Access", icon: "🛋️" },
                    { label: "Reward Points", icon: "⭐" },
                    { label: "Price Drop Alerts", icon: "🔔" },
                    { label: "Priority Support", icon: "🎧" },
                    { label: "FlexPay Installments", icon: "💳" },
                  ].map(({ label, icon }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs shrink-0">
                        {icon}
                      </div>
                      <span className="text-sm font-medium text-foreground">{label}</span>
                    </div>
                  ))}
                </div>

                <Link to="/account" title="Join Tripile free — member deals & travel perks" className="block">
                  <Button size="lg" className="w-full font-bold rounded-xl btn-premium gap-2">
                    Join Free — No Credit Card <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="py-24 relative overflow-hidden bg-slate-950">
        {/* Background glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/15 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-indigo-500/12 blur-[90px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08),transparent_70%)]" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/5 text-xs font-semibold text-white/70 tracking-widest uppercase mb-8">
              <Plane className="w-3.5 h-3.5 text-blue-400" />
              Start Flying Smarter Today
            </div>

            <h2 className="font-display text-4xl md:text-6xl font-extrabold text-white mb-5 leading-tight">
              Ready to Find Your
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                {" "}
                Best Fare?
              </span>
            </h2>
            <p className="text-base md:text-lg mb-10 text-white/65 max-w-xl mx-auto leading-relaxed">
              Compare 500+ airlines in seconds, unlock exclusive member deals, and book with zero hidden fees.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/account" title="Sign up free on Tripile — compare fares & unlock member deals">
                <Button
                  size="lg"
                  className="gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-[0_4px_32px_rgba(59,130,246,0.45)] hover:shadow-[0_6px_40px_rgba(59,130,246,0.6)] transition-all duration-200 hover:-translate-y-0.5 px-8"
                >
                  Sign Up Free <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/deals" title="Browse all Tripile flight & travel deals">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-2xl px-8"
                >
                  Browse All Deals
                </Button>
              </Link>
            </div>

            {/* Quick proof stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/50">
              {[
                { val: "50K+", label: "happy travelers" },
                { val: "500+", label: "airlines compared" },
                { val: "$0", label: "hidden fees" },
                { val: "24/7", label: "expert support" },
              ].map(({ val, label }, i) => (
                <div key={val} className="flex items-center gap-3">
                  {i > 0 && <span className="w-px h-4 bg-white/15" />}
                  <div>
                    <span className="font-extrabold text-white text-base">{val}</span>
                    <span className="ml-1">{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>


      {/* Homepage FAQ Section */}
      <FAQSchema faqs={[
        { question: "How do I find the cheapest flights on Tripile.com?", answer: "Use our search tool to compare fares across 500+ airlines. Be flexible with dates, book midweek, and set price alerts for the best deals." },
        { question: "How do I find cheap hotels on Tripile?", answer: "Select the Hotels tab in our search widget, enter your destination and dates, and compare rates across top neighborhoods. Hotel deals start from $79/night in cities like Las Vegas and Orlando." },
        { question: "Does Tripile.com charge any hidden fees?", answer: "No. The price shown includes all taxes and fees. We offer complete transparency with zero hidden charges on flights, hotels, and car rentals." },
        { question: "What is the Price Match Guarantee?", answer: "If you find a cheaper fare within 24 hours of booking, we'll match the price and give you an extra 10% off. That's our promise." },
        { question: "Can I cancel or change my booking?", answer: "Most bookings offer free cancellation within 24 hours. Changes depend on your fare type. Our 24/7 support team can assist with modifications." },
        { question: "How does Tripile.com compare to other travel sites?", answer: "Tripile.com searches 500+ airlines simultaneously, compares car rentals nationwide, offers a Price Match Guarantee, transparent pricing, and 24/7 expert support — trusted by 2M+ travelers." },
      ]} />
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible>
            {[
              { q: "How do I find the cheapest flights on Tripile.com?", a: "Use our search tool to compare fares across 500+ airlines. Be flexible with dates, book midweek, and set price alerts for the best deals." },
              { q: "How do I find cheap hotels on Tripile?", a: "Select the Hotels tab in our search widget, enter your destination and dates, and compare rates across top neighborhoods. Hotel deals start from $79/night." },
              { q: "Does Tripile.com charge any hidden fees?", a: "No. The price shown includes all taxes and fees. We offer complete transparency with zero hidden charges on flights, hotels, and car rentals." },
              { q: "What is the Price Match Guarantee?", a: "If you find a cheaper fare within 24 hours of booking, we'll match the price and give you an extra 10% off. That's our promise." },
              { q: "Can I cancel or change my booking?", a: "Most bookings offer free cancellation within 24 hours. Changes depend on your fare type. Our 24/7 support team can assist with modifications." },
              { q: "How does Tripile.com compare to other travel sites?", a: "Tripile.com searches 500+ airlines simultaneously, compares car rentals nationwide, offers a Price Match Guarantee, transparent pricing, and 24/7 expert support — trusted by 2M+ travelers." },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`home-faq-${i}`} className="border-border">
                <AccordionTrigger className="text-sm text-left hover:text-primary transition-colors">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      </main>

      <Footer />
      <Suspense fallback={null}>
        <FlyBot />
      </Suspense>
    </div>
  );
};

export default Index;
