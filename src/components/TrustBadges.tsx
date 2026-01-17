import { Award, Shield, ThumbsUp, Users } from "lucide-react";
import { motion } from "framer-motion";
import reviewsImage from "../assets/reviews.jpeg";

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
      color: "text-accent",
    },
    {
      icon: Award,
      value: "15+",
      label: "Years of Service",
      color: "text-primary",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  };

  return (
    <section className="py-12 md:py-16 bg-secondary" aria-labelledby="trust-badges-title">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-12">
          <h2 id="trust-badges-title" className="text-2xl md:text-3xl font-bold mb-3">
            Trusted by Millions Worldwide
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're committed to providing you with the best travel booking experience
          </p>
        </div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} className="text-center" variants={itemVariants}>
              <div
                className={`inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-card shadow-md mb-4 ${stat.color}`}
              >
                <stat.icon className="w-7 h-7 md:w-8 md:h-8" aria-hidden="true" />
              </div>
              <div className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm mb-6 uppercase tracking-wide">Independent review platforms</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {[
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
                color: "text-gray-900",
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
            ].map((item) => (
              <div key={item.name} className="relative group">
                {/* Visible card */}
                <div
                  className="px-4 py-4 rounded-xl bg-card shadow-sm border border-border cursor-default
                transition-transform duration-200 group-hover:-translate-y-1
                w-full min-w-0 text-center"
                >
                  <div className={`text-sm font-semibold ${item.color} truncate`}>{item.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">{item.reviews}</div>
                  <div className="text-sm text-muted-foreground mt-1">{item.rating} / 5</div>
                </div>

                {/* Hover detail card */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-72 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none">
                  <div className="bg-background border border-border shadow-lg rounded-xl p-4 text-sm">
                    <div className={`font-semibold mb-1 ${item.color}`}>{item.name}</div>
                    <div className="text-yellow-500 mb-2 text-base">{item.stars}</div>
                    <div className="text-muted-foreground mb-1">
                      Rating: <span className="font-medium">{item.rating}</span> / 5
                    </div>
                    <div className="text-muted-foreground mb-1">
                      Reviews: <span className="font-medium">{item.reviews}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">{item.note}</div>
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
