import { useState, useMemo, lazy, Suspense } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchWidget from "@/components/SearchWidget";
import DealCard from "@/components/DealCard";

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
import rewardsIllustration2 from "@/assets/reward.png";
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
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Tripile.com – Book Cheap Flights, Hotels & Car Rentals in the USA</title>
        <meta
          name="description"
          content="Tripile.com helps you find the best flight deals, hotel discounts, and car rentals across the USA. Compare thousands of fares instantly and save big on your next trip."
        />
        <meta
          name="keywords"
          content="cheap flights USA, flight deals, book flights online, US travel deals, last-minute flights, discounted airline tickets, cheap hotels, car rentals USA"
        />
        <link rel="canonical" href="https://tripile.com/" />
      </Helmet>
      <Header />

      {/* Professional Hero Section */}
      <section className="relative min-h-[680px] md:min-h-[780px] w-full overflow-hidden z-10">
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

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, ease: "easeOut" }}
            className="font-display text-balance text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] mb-6"
          >
            <span className="text-white drop-shadow-lg">Your Gateway to</span>
            <br />
            <span className="bg-gradient-to-r from-blue-300 via-sky-300 to-blue-200 bg-clip-text text-transparent">
              Affordable US Adventures
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
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("search-widget")?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              className="group inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-base font-bold px-8 py-4 rounded-2xl shadow-[0_4px_32px_rgba(59,130,246,0.55)] hover:shadow-[0_6px_40px_rgba(59,130,246,0.7)] transition-all duration-200 hover:-translate-y-0.5"
            >
              <Plane className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              Find Your Next Flight
              <ChevronRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform duration-200" />
            </a>

            <Link
              to="/deals"
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
            { icon: TrendingDown, value: "50%", label: "Max Savings", color: "text-green-500" },
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
            <Link to="/reviews" className="text-primary font-semibold hover:underline flex items-center gap-1">
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
              <Link to="/deals">
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
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card rounded-3xl p-8 md:p-12 max-w-5xl mx-auto"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">SIGN UP & UNLOCK REWARDS</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex justify-center"
              >
                <img src={rewardsIllustration2} alt="Rewards and benefits illustration" className="w-full max-w-md" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  {["Members only Deals", "Lounge access", "Reward points", "Alerts & notifications"].map((benefit) => (
                    <div key={benefit} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                        <Check className="w-3 h-3 text-green-500" />
                      </div>
                      <span className="text-foreground font-medium text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>

                <Link to="/account" className="block">
                  <Button size="lg" className="w-full text-lg font-bold btn-premium">
                    Join Now For Free
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
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
              <Link to="/account">
                <Button
                  size="lg"
                  className="gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-[0_4px_32px_rgba(59,130,246,0.45)] hover:shadow-[0_6px_40px_rgba(59,130,246,0.6)] transition-all duration-200 hover:-translate-y-0.5 px-8"
                >
                  Sign Up Free <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/deals">
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

      {/* App Download Section */}
      <Suspense fallback={<div className="py-20" />}>
        <AppDownload />
      </Suspense>

      <Footer />
      <Suspense fallback={null}>
        <FlyBot />
      </Suspense>
    </div>
  );
};

export default Index;
