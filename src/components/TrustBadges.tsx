import { Award, Shield, ThumbsUp, Users } from "lucide-react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
const TrustBadges = () => {
  const stats = [
    {
      icon: Users,
      value: "2M+",
      label: "Happy Travelers",
      color: "text-primary",
    },
    {
      icon: ThumbsUp,
      value: "4.8/5",
      label: "Customer Rating",
      color: "text-success",
    },
    {
      icon: Shield,
      value: "100%",
      label: "Secure Booking",
      color: "text-success",
    },
    {
      icon: Award,
      value: "15+",
      label: "Years of Service",
      color: "text-primary",
    },
  ];

  const platforms = [
    {
      name: "Trustpilot",
      rating: "4.4",
      reviews: "9,865 reviews",
      stars: "★★★★★",
      note: "Verified customer reviews",
      color: "text-green-600",
    },
    {
      name: "Google",
      rating: "4.1",
      reviews: "1,605 reviews",
      stars: "★★★★☆",
      note: "Public Google user ratings",
      color: "text-yellow-500",
    },
    {
      name: "Sitejabber",
      rating: "4.7",
      reviews: "22,801 reviews",
      stars: "★★★★★",
      note: "Independent consumer review site",
      color: "text-orange-500",
    },
    {
      name: "Reviews.io",
      rating: "4.1",
      reviews: "4,585 reviews",
      stars: "★★★★☆",
      note: "Verified purchase reviews",
      color: "text-gray-900 dark:text-gray-200",
    },
    {
      name: "Facebook",
      rating: "4.4",
      reviews: "483 reviews",
      stars: "★★★★☆",
      note: "Customer feedback on Facebook",
      color: "text-blue-600",
    },
    {
      name: "ResellerRatings",
      rating: "4.6",
      reviews: "18,200 reviews",
      stars: "★★★★★",
      note: "Retail & service review authority",
      color: "text-purple-600",
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <section className="py-16 md:py-20 bg-background/50 border-y border-border/40" aria-labelledby="trust-badges-title">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 id="trust-badges-title" className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            Trusted by Millions Worldwide
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We’re committed to providing a secure, reliable, and premium travel booking experience.
          </p>
        </div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={itemVariants}>
              <div className="glass-card text-center px-5 py-6 hover:-translate-y-1 transition-all duration-300">
                <div
                  className={`mx-auto mb-4 flex items-center justify-center
                  w-14 h-14 md:w-16 md:h-16 rounded-full
                  bg-background border border-border shadow-sm ${stat.color}`}
                >
                  <stat.icon className="w-7 h-7 md:w-8 md:h-8" />
                </div>
                <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Review Platforms */}
        <div className="mt-16 border-t border-border/60 pt-10">
          <p className="text-center text-xs font-semibold tracking-widest text-muted-foreground mb-8">
            VERIFIED REVIEWS FROM INDEPENDENT PLATFORMS
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {platforms.map((item) => (
              <div key={item.name} className="relative group">
                {/* Base card */}
                <div
                  className="rounded-xl bg-card border border-border/60
                  px-4 py-4 text-center shadow-sm
                  transition-all duration-300
                  hover:-translate-y-1 hover:shadow-md"
                >
                  <div className={`font-semibold text-sm ${item.color}`}>{item.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{item.reviews}</div>
                  <div className="text-xs text-muted-foreground mt-1">{item.rating} / 5</div>
                </div>

                {/* Hover detail */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-72
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-200
                  pointer-events-none z-30"
                >
                  <div className="glass-card p-4 text-sm">
                    <div className={`font-semibold mb-1 ${item.color}`}>{item.name}</div>
                    <div className="text-yellow-500 text-base mb-2">{item.stars}</div>
                    <p className="text-muted-foreground">
                      Rating: <span className="font-medium">{item.rating}</span> / 5
                    </p>
                    <p className="text-muted-foreground">
                      Reviews: <span className="font-medium">{item.reviews}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">{item.note}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
