import { useState, useMemo } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchWidget from "@/components/SearchWidget";
import DealCard from "@/components/DealCard";
import DealModal from "@/components/DealModal";
import TailoredDealCard from "@/components/TailoredDealCard";
import TrustBadges from "@/components/TrustBadges";
import FlyBot from "@/components/FlyBot";

import FeatureHighlights from "@/components/FeatureHighlights";
import ForTravelPros from "@/components/ForTravelPros";
import PartnerLogos from "@/components/PartnerLogos";
import AppDownload from "@/components/AppDownload";
import PopularFlights from "@/components/PopularFlights";
import CustomerReviewsDark from "@/components/CustomerReviewsDark";
import { mockDeals, type Deal } from "@/data/mockDeals";
import heroBlackFriday from "@/assets/hero-black-friday.jpg";
import dealLastMinute from "@/assets/deal-last-minute.jpg";
import dealBudget from "@/assets/deal-budget.jpg";
import dealSeniors from "@/assets/deal-seniors.jpg";
import dealBusiness from "@/assets/deal-business.jpg";
import dealStudents from "@/assets/deal-students.jpg";
import dealAirlines from "@/assets/deal-airlines.jpg";
import rewardsIllustration from "@/assets/rewards-illustration.png";
import { ArrowRight, Check, RefreshCw, Shield, Clock, Headphones, CreditCard } from "lucide-react";
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
      description: "Find a lower price? We'll match it plus give you 10% off.",
    },
    { icon: Clock, title: "24/7 Support", description: "Our travel experts are available around the clock." },
    { icon: Headphones, title: "Expert Guidance", description: "Personalized recommendations from real travel pros." },
    { icon: CreditCard, title: "Flexible Payments", description: "Pay your way with multiple payment options." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>CheapFlights – Book Cheap Flights, Hotels & Car Rentals in the USA</title>
        <meta
          name="description"
          content="CheapFlights helps you find the best flight deals, hotel discounts, and car rentals across the USA. Compare thousands of fares instantly and save big on your next trip."
        />
        <meta
          name="keywords"
          content="cheap flights USA, flight deals, book flights online, US travel deals, last-minute flights, discounted airline tickets, cheap hotels, car rentals USA"
        />
        <link rel="canonical" href="https://cheapflights.com/" />
      </Helmet>
      <Header />

      {/* Premium Hero Section - Vibrant & Colorful */}
      <section className="relative min-h-[600px] md:min-h-[700px] w-full overflow-hidden">
        {/* Background Image with Parallax Effect */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{ backgroundImage: `url(${heroBlackFriday})` }}
        />

        {/* Vibrant Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/60 to-pink-900/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-transparent to-orange-500/20" />

        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />

        {/* Content */}
        <div className="container mx-auto px-4 h-full relative z-10 flex flex-col items-center justify-center pt-24 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-4xl"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block px-5 py-2.5 bg-gradient-to-r from-coral via-rose-500 to-orange-500 text-white text-sm font-bold rounded-full mb-6 shadow-lg shadow-coral/30 animate-bounce-subtle"
            >
              ✈️ BIGGEST SALE OF THE YEAR
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Discover Your Next
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Adventure
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg md:text-xl text-white/90 mb-4 max-w-2xl mx-auto"
            >
              Compare 500+ airlines and save up to 50% on flights, hotels, and car rentals.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-xl md:text-2xl font-semibold text-cyan-400"
            >
              Zero Booking Fees • Instant Confirmation
            </motion.p>
          </motion.div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 120L48 110C96 100 192 80 288 75C384 70 480 80 576 85C672 90 768 90 864 85C960 80 1056 70 1152 70C1248 70 1344 80 1392 85L1440 90V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
              className="fill-background"
            />
          </svg>
        </div>
      </section>

      {/* Floating Search Widget - Glowing Border */}
      <div className="container mx-auto px-4 -mt-24 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="relative"
        >
          {/* Glowing border effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-75 blur-sm animate-pulse" />
          <div className="glass-vibrant rounded-3xl shadow-colorful-lg p-3 md:p-4 relative">
            <SearchWidget />
          </div>
        </motion.div>
      </div>

      {/* Feature Highlights Strip - Three Columns */}
      <FeatureHighlights />

      {/* Popular Flights Section */}
      <PopularFlights />

      {/* For Travel Pros Section */}
      <ForTravelPros />

      {/* Partner Logos Strip */}
      <PartnerLogos />

      {/* Why Choose Us Section - Colorful */}
      <section className="py-20 bg-gradient-to-b from-background via-blue-50/30 to-background dark:from-background dark:via-blue-950/20 dark:to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeInUp} className="font-display text-3xl md:text-4xl font-bold mb-4">
              Why Travelers Choose <span className="text-gradient-vibrant">ChyeapFlights</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Join over 2 million satisfied travelers who trust us for their journeys
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {whyChooseUs.map((item, index) => {
              const gradients = [
                "from-blue-500 to-cyan-500",
                "from-purple-500 to-pink-500",
                "from-orange-500 to-rose-500",
                "from-emerald-500 to-teal-500",
              ];
              return (
                <motion.div
                  key={item.title}
                  variants={fadeInUp}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="card-colorful p-6 text-center group hover-glow-blue"
                >
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${gradients[index]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Featured Deals - Colorful Section */}
      <section className="py-20 bg-gradient-to-b from-purple-50/50 via-blue-50/30 to-background dark:from-purple-950/20 dark:via-blue-950/10 dark:to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4"
          >
            <motion.div variants={fadeInUp}>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
                <span className="text-gradient-vibrant">Featured</span> Deals
              </h2>
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

      <DealModal deal={selectedDeal} open={isModalOpen} onOpenChange={setIsModalOpen} />

      {/* Customer Reviews Dark Section */}
      <CustomerReviewsDark />

      {/* Tailored Travel Deals */}
      <section className="py-20 bg-muted/30">
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
                <TailoredDealCard deal={deal} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <TrustBadges />

      {/* Premium Rewards Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card rounded-3xl p-8 md:p-12 max-w-5xl mx-auto"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
              SIGN UP & UNLOCK <span className="text-gradient">REWARDS</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex justify-center"
              >
                <img src={rewardsIllustration} alt="Rewards and benefits illustration" className="w-full max-w-md" />
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
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-600 to-cyan-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Join millions of travelers who trust us to find the best deals
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/account">
                <Button
                  size="lg"
                  className="gap-2 bg-white text-primary hover:bg-white/90 font-semibold rounded-xl shadow-lg"
                >
                  Sign Up Now <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/deals">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-xl"
                >
                  Browse All Deals
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* App Download Section */}
      <AppDownload />

      <Footer />
      <FlyBot />
    </div>
  );
};

export default Index;
