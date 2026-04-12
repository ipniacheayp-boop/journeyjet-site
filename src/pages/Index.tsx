import { useState, useMemo, lazy, Suspense } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchWidget from "@/components/SearchWidget";
import DealCard from "@/components/DealCard";
import FAQSchema from "@/components/seo/FAQSchema";
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
const PopularFlights = lazy(() => import("@/components/PopularFlights"));
const CustomerReviewsDark = lazy(() => import("@/components/CustomerReviewsDark"));
import { mockDeals, type Deal } from "@/data/mockDeals";
import heroBlackFriday from "@/assets/hero-black-friday.jpg";
import dealLastMinute from "@/assets/deal-last-minute.jpg";
import dealBudget from "@/assets/deal-budget.jpg";
import dealSeniors from "@/assets/deal-seniors.jpg";
import dealBusiness from "@/assets/deal-business.jpg";
import dealStudents from "@/assets/deal-students.jpg";
import dealAirlines from "@/assets/deal-airlines.jpg";
import rewardsIllustration from "@/assets/rewards-illustration.png";
import rewardsIllustration2 from "@/assets/reward.webp";
import {
  ArrowRight,
  Check,
  RefreshCw,
  Shield,
  Clock,
  Headphones,
  CreditCard,
  ShieldCheck,
  BadgeDollarSign,
  Star,
  Wallet,
  Users,
  Plane,
  TrendingDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Tripile.com – Buy Cheap Flights, Hotels & Car Rentals | Best US Travel Deals</title>
        <meta
          name="description"
          content="Buy cheap flights, hotels & car rentals across the USA on Tripile.com. Compare 500+ airlines, get Price Match Guarantee, and save up to 46%. Trusted by 2M+ travelers."
        />
        <meta
          name="keywords"
          content="buy cheap flights USA, best flight deals, cheap flights near me, flight reviews, cheap hotels USA, car rentals USA, last-minute flights, travel booking, airline tickets"
        />
        <link rel="canonical" href="https://tripile.com/" />
        {/* Open Graph & Twitter: defined once in index.html to avoid duplicate meta tags */}
      </Helmet>
      <Header />

      <main id="main-content">
      {/* Professional Hero Section */}
      <section className="relative min-h-[680px] md:min-h-[780px] w-full overflow-hidden z-10" aria-label="Hero">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-[1.04] transition-transform duration-[8000ms] ease-out"
          style={{ backgroundImage: `url(${heroBlackFriday})` }}
        />

        {/* Multi-layer overlay: dark base + directional gradient for text contrast */}
        <div className="absolute inset-0 bg-slate-950/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-transparent to-slate-950/80" />

        {/* Subtle animated glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/8 blur-[100px] pointer-events-none" />

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center justify-center pt-28 pb-44">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-xs font-semibold text-white/90 tracking-widest uppercase mb-7 shadow-lg"
          >
            <Plane className="w-3.5 h-3.5 text-blue-300" />
            #1 Rated US Flight Comparison
          </motion.div>

          {/* Primary page title — one H1 per page, keyword-optimized for search */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, ease: "easeOut" }}
            className="font-display text-balance text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.12] mb-6 max-w-4xl mx-auto px-2"
          >
            <span className="text-white drop-shadow-lg">Cheap Flights, Hotels &amp; Car Rentals</span>
            <span className="block mt-3 text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-300 via-sky-300 to-blue-200 bg-clip-text text-transparent">
              | Tripile
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.6 }}
            className="text-base md:text-lg text-white/75 mb-10 max-w-xl text-center leading-relaxed"
          >
            Compare <span className="text-white font-semibold">500+ airlines</span> in seconds, unlock exclusive fares,
            and travel smarter — with <span className="text-sky-300 font-semibold">zero hidden fees</span>.
          </motion.p>

          {/* Primary CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-4 mb-12"
          >
            <a
              href="#search-widget"
              title="Jump to Tripile search — compare flights, hotels & car rentals"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("search-widget")?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              className="group inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-base font-bold px-8 py-4 rounded-2xl shadow-[0_4px_32px_rgba(59,130,246,0.55)] hover:shadow-[0_6px_40px_rgba(59,130,246,0.7)] transition-all duration-200 hover:-translate-y-0.5"
            >
              <Plane className="w-5 h-5 transition-all duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:transition-all group-hover:duration-500 " />
              Find Your Next Flight
              <ChevronRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 group-hover:transition-all group-hover:duration-500 transition-all duration-500" />
            </a>

            <Link
              to="/deals"
              title="See today’s best travel deals on Tripile"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium px-5 py-4 rounded-2xl border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all duration-200"
            >
              <TrendingDown className="w-4 h-4 text-green-400" />
              See Today's Deals
            </Link>
          </motion.div>

          {/* Popular destination tags */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {["New York", "Los Angeles", "Miami", "Las Vegas", "Chicago", "Orlando"].map((dest) => (
              <span
                key={dest}
                className="px-4 py-1.5 rounded-full text-xs font-medium text-white/70 border border-white/15 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:text-white/90 transition-all duration-150 cursor-pointer"
              >
                {dest}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="relative z-20 container mx-auto px-4 -mt-10 mb-2"
      >
        <div className="bg-card border border-border/60 rounded-2xl shadow-lg px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-6 text-center">
          {[
            { icon: Users, value: "2M+", label: "Happy Travelers", color: "text-blue-500" },
            { icon: Plane, value: "500+", label: "Airlines Compared", color: "text-indigo-500" },
            { icon: TrendingDown, value: "46%", label: "Max Savings", color: "text-green-500" },
            { icon: Star, value: "4.5", label: "Average Rating", color: "text-amber-500" },
          ].map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-xl font-extrabold tracking-tight text-foreground">{value}</span>
              </div>
              <span className="text-xs text-muted-foreground font-medium">{label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Eye-catching Offers Strip */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.55, delay: 0.1 }}
        className="container mx-auto px-4 relative z-20 mt-2 mb-6"
      >
        {/* ── Outer wrapper: dark gradient shell ── */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-900/20">
          {/* Ambient glow orbs */}
          <div className="pointer-events-none absolute -top-16 -left-16 w-72 h-72 rounded-full bg-blue-600/20 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-indigo-500/20 blur-[70px]" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-40 rounded-full bg-sky-400/8 blur-[60px]" />

          <div className="relative z-10 px-6 pt-6 pb-5">
            {/* ── Top bar: label + live badge + offer pills ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                {/* Animated live badge */}
                <span className="inline-flex items-center gap-1.5 bg-red-600/90 text-white text-[10px] font-extrabold tracking-widest uppercase px-3 py-1 rounded-full shadow-lg">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                  Live Deals
                </span>
                <div>
                  <p className="text-[10px] font-semibold text-indigo-300/80 uppercase tracking-widest">
                    Today's Exclusive Savings
                  </p>
                  <h2 className="font-display text-lg md:text-xl font-extrabold text-white leading-tight">
                    Book smarter — save <span className="text-sky-400">more</span>
                  </h2>
                </div>
              </div>
            </div>

            {/* ── Deal cards row ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1 — Flights */}
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}
              >
                {/* Image */}
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={dealLastMinute}
                    alt="Last Minute Flights Deal"
                    className="w-full h-full object-cover object-[center_70%] group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                  {/* Discount badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-lg uppercase tracking-wide">
                      Up to 46% off
                    </span>
                  </div>

                  {/* Save callout — bottom-right corner of image */}
                  <div className="absolute bottom-3 right-3 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <BadgeDollarSign className="w-3 h-3" /> Save up to $50
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex items-start gap-3">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mt-0.5">
                    <TrendingDown className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold text-blue-400/80 uppercase tracking-widest mb-0.5">
                      Flights
                    </p>
                    <p className="font-display text-base font-extrabold text-white leading-tight mb-1">
                      Instant Savings
                    </p>
                    <p className="text-xs text-white/50 leading-relaxed">
                      Compare fares & unlock limited-time deals today.
                    </p>
                  </div>
                  <Link
                    to="/deals"
                    title="View flight deals on Tripile"
                    className="shrink-0 mt-1 inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white transition-all duration-200"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>

              {/* Card 2 — Seniors */}
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}
              >
                {/* Image */}
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={dealSeniors}
                    alt="Senior Citizens Travel Deal"
                    className="w-full h-full object-cover object-[center_14%] group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                  {/* Discount badge */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-lg uppercase tracking-wide">
                      Up to 46% off
                    </span>
                  </div>

                  {/* Save callout */}
                  <div className="absolute bottom-3 right-3 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Wallet className="w-3 h-3" /> Save up to $60
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex items-start gap-3">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center mt-0.5">
                    <Users className="w-5 h-5 text-rose-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold text-rose-400/80 uppercase tracking-widest mb-0.5">
                      Senior Citizens
                    </p>
                    <p className="font-display text-base font-extrabold text-white leading-tight mb-1">Special Fares</p>
                    <p className="text-xs text-white/50 leading-relaxed">
                      Eligibility-based offers crafted for seniors.
                    </p>
                  </div>
                  <Link
                    to="/deals"
                    title="View senior & special fare deals on Tripile"
                    className="shrink-0 mt-1 inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-600/20 border border-rose-500/30 text-rose-400 hover:bg-rose-600 hover:text-white transition-all duration-200"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* ── Bottom trust strip ── */}
            <div className="mt-4 pt-4 border-t border-white/8 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-white/40 font-medium">
                {[
                  { icon: ShieldCheck, label: "Best Price Guarantee" },
                  { icon: Clock, label: "Limited Time Only" },
                  { icon: CreditCard, label: "No Hidden Fees" },
                ].map(({ icon: Icon, label }) => (
                  <span key={label} className="inline-flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-indigo-400/70" />
                    {label}
                  </span>
                ))}
              </div>
              <Link
                to="/deals"
                title="See all Tripile travel deals"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-400 hover:text-sky-300 transition-colors duration-150"
              >
                See all deals <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Structured Search Widget Container */}
      <div className="container mx-auto px-4 mt-6 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="relative"
        >
          <div
            id="search-widget"
            className="bg-card text-card-foreground rounded-2xl shadow-xl border border-border p-3 md:p-4 relative"
          >
            <SearchWidget />
          </div>
        </motion.div>
      </div>

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
                    Learn more <ArrowRight className="w-3 h-3" />
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
                { val: "2M+", label: "happy travelers" },
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

      {/* Long-form SEO copy: improves word count, text-to-HTML ratio, and internal links */}
      <section
        className="py-16 md:py-20 bg-muted/25 border-y border-border"
        aria-labelledby="tripile-travel-guide-heading"
      >
        <article className="container mx-auto px-4 max-w-3xl">
          <header className="mb-10 text-center">
            <h2 id="tripile-travel-guide-heading" className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              Book US Travel With Confidence: Flights, Stays &amp; Cars on Tripile
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
              Whether you are planning a coast-to-coast trip, a weekend city break, or a family vacation, Tripile helps
              you compare options in one place—with transparent pricing and human support when you need it.
            </p>
          </header>

          <div className="space-y-8 text-sm md:text-base text-muted-foreground leading-relaxed">
            <section aria-labelledby="intro-tripile">
              <h3 id="intro-tripile" className="font-semibold text-foreground text-lg mb-2">
                Introduction: Why travelers start on Tripile.com
              </h3>
              <p>
                Tripile.com is built for travelers who want{" "}
                <Link
                  to="/deals"
                  title="Find cheap flights on Tripile — compare airlines"
                  className="text-primary font-medium underline-offset-2 hover:underline"
                >
                  cheap flights
                </Link>
                , trusted hotel rates, and flexible{" "}
                <Link
                  to="/explore"
                  title="Explore travel destinations on Tripile"
                  className="text-primary font-medium underline-offset-2 hover:underline"
                >
                  destination ideas
                </Link>{" "}
                without jumping between dozens of tabs. Our search experience is designed around real US routes and
                popular international gateways, so you can move from inspiration to a shortlist in minutes—not hours.
                We focus on clarity: taxes and carrier rules are surfaced early, and our{" "}
                <Link
                  to="/support"
                  title="Tripile customer support — contact us 24/7"
                  className="text-primary font-medium underline-offset-2 hover:underline"
                >
                  customer support team
                </Link>{" "}
                is available around the clock if your plans change.
              </p>
              <p className="mt-4">
                From{" "}
                <Link
                  to="/flight-status"
                  title="Check live flight status on Tripile"
                  className="text-primary font-medium underline-offset-2 hover:underline"
                >
                  flight status
                </Link>{" "}
                and{" "}
                <Link
                  to="/flight-tracker"
                  title="Track flights live on Tripile"
                  className="text-primary font-medium underline-offset-2 hover:underline"
                >
                  live flight tracking
                </Link>{" "}
                to{" "}
                <Link
                  to="/trip-planner"
                  title="Tripile trip planner — build your itinerary"
                  className="text-primary font-medium underline-offset-2 hover:underline"
                >
                  itinerary planning
                </Link>
                , Tripile combines booking tools with practical resources—so you spend less time managing logistics
                and more time enjoying the trip.
              </p>
            </section>

            <section aria-labelledby="features-tripile">
              <h3 id="features-tripile" className="font-semibold text-foreground text-lg mb-2">
                Features that simplify every step
              </h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-foreground">Broad airline comparison:</strong> Search across hundreds of
                  carriers and fare families to find schedules that match your budget and flexibility needs.
                </li>
                <li>
                  <strong className="text-foreground">Hotels and bundles:</strong> Pair flights with stays when it saves
                  time—ideal for conferences, holidays, and multi-city routes.
                </li>
                <li>
                  <strong className="text-foreground">Car rentals:</strong> Add ground transportation so your airport
                  arrival and road-trip segments stay coordinated.
                </li>
                <li>
                  <strong className="text-foreground">Deals hub:</strong> Browse curated{" "}
                  <Link
                    to="/cruise-deals"
                    title="Browse cruise deals on Tripile"
                    className="text-primary font-medium underline-offset-2 hover:underline"
                  >
                    cruise deals
                  </Link>{" "}
                  and seasonal offers in one dashboard.
                </li>
                <li>
                  <strong className="text-foreground">Travel utilities:</strong> Use{" "}
                  <Link
                    to="/webcheck-in"
                    title="Airline web check-in guide — Tripile"
                    className="text-primary font-medium underline-offset-2 hover:underline"
                  >
                    airline web check-in
                  </Link>
                  ,{" "}
                  <Link
                    to="/destinations-checklist"
                    title="Travel packing checklists by destination — Tripile"
                    className="text-primary font-medium underline-offset-2 hover:underline"
                  >
                    packing checklists
                  </Link>
                  , and policy pages so you know what to expect before you fly.
                </li>
              </ul>
            </section>

            <section aria-labelledby="benefits-tripile">
              <h3 id="benefits-tripile" className="font-semibold text-foreground text-lg mb-2">
                Benefits: save money and reduce surprises
              </h3>
              <p>
                Tripile emphasizes transparent pricing, flexible payment options where available, and proactive help if
                a schedule shifts. Our{" "}
                <Link
                  to="/price-match"
                  title="Tripile Price Match Guarantee — how it works"
                  className="text-primary font-medium underline-offset-2 hover:underline"
                >
                  Price Match Guarantee
                </Link>{" "}
                is structured to reward smart shoppers, while our{" "}
                <Link
                  to="/refund-policy"
                  title="Tripile refund and cancellation policy"
                  className="text-primary font-medium underline-offset-2 hover:underline"
                >
                  refund and cancellation policy
                </Link>{" "}
                pages explain common scenarios in plain language. Travelers also rely on verified{" "}
                <Link
                  to="/reviews"
                  title="Verified Tripile customer reviews"
                  className="text-primary font-medium underline-offset-2 hover:underline"
                >
                  Tripile reviews
                </Link>{" "}
                and the{" "}
                <Link
                  to="/blog"
                  title="Tripile travel blog — tips & guides"
                  className="text-primary font-medium underline-offset-2 hover:underline"
                >
                  Tripile travel blog
                </Link>{" "}
                for timely tips— from baggage rules to destination guides.
              </p>
              <p className="mt-4">
                If you are comparing carriers, start with our{" "}
                <Link
                  to="/sitemap"
                  title="Tripile HTML site map — all travel pages"
                  className="text-primary font-medium underline-offset-2 hover:underline"
                >
                  site map
                </Link>{" "}
                to discover popular routes, airports, and city pages designed for SEO-friendly discovery—then jump back
                into search to lock a fare when you are ready.
              </p>
              <p className="mt-4">
                Business travelers appreciate fast rebooking workflows and clear receipts; families appreciate filters that
                highlight kid-friendly schedules and baggage allowances. Solo travelers and students use Tripile to spot
                flash sales, red-eye options, and alternative airports that trim total trip cost. Because we aggregate
                offers instead of pushing a single carrier, you stay in control of trade-offs between price, comfort,
                and time.
              </p>
            </section>

            <section aria-labelledby="faq-pointer">
              <h3 id="faq-pointer" className="font-semibold text-foreground text-lg mb-2">
                Questions? See our FAQ below
              </h3>
              <p>
                For quick answers on fees, changes, and how Tripile compares to other travel sites, scroll to the
                Frequently Asked Questions on this page—or contact{" "}
                <Link
                  to="/support"
                  title="Get help from Tripile support"
                  className="text-primary font-medium underline-offset-2 hover:underline"
                >
                  Tripile support
                </Link>{" "}
                for one-to-one help. We are here 24/7.
              </p>
            </section>
          </div>
        </article>
      </section>

      {/* Homepage FAQ Section */}
      <FAQSchema faqs={[
        { question: "How do I find the cheapest flights on Tripile.com?", answer: "Use our search tool to compare fares across 500+ airlines. Be flexible with dates, book midweek, and set price alerts for the best deals." },
        { question: "Does Tripile.com charge any hidden fees?", answer: "No. The price shown includes all taxes and fees. We offer complete transparency with zero hidden charges." },
        { question: "What is the Price Match Guarantee?", answer: "If you find a cheaper fare within 24 hours of booking, we'll match the price and give you an extra 10% off. That's our promise." },
        { question: "Can I cancel or change my booking?", answer: "Most bookings offer free cancellation within 24 hours. Changes depend on your fare type. Our 24/7 support team can assist with modifications." },
        { question: "How does Tripile.com compare to other travel sites?", answer: "Tripile.com searches 500+ airlines simultaneously, offers a Price Match Guarantee, transparent pricing, and 24/7 expert support — trusted by 2M+ travelers." },
      ]} />
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible>
            {[
              { q: "How do I find the cheapest flights on Tripile.com?", a: "Use our search tool to compare fares across 500+ airlines. Be flexible with dates, book midweek, and set price alerts for the best deals." },
              { q: "Does Tripile.com charge any hidden fees?", a: "No. The price shown includes all taxes and fees. We offer complete transparency with zero hidden charges." },
              { q: "What is the Price Match Guarantee?", a: "If you find a cheaper fare within 24 hours of booking, we'll match the price and give you an extra 10% off. That's our promise." },
              { q: "Can I cancel or change my booking?", a: "Most bookings offer free cancellation within 24 hours. Changes depend on your fare type. Our 24/7 support team can assist with modifications." },
              { q: "How does Tripile.com compare to other travel sites?", a: "Tripile.com searches 500+ airlines simultaneously, offers a Price Match Guarantee, transparent pricing, and 24/7 expert support — trusted by 2M+ travelers." },
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
