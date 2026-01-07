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

        <div className="mt-10 md:mt-12 flex justify-center">
          <img
            src={reviewsImage}
            alt="Customer reviews from Trustpilot, Google, Facebook, Sitejabber"
            className="max-w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
