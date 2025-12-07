import { Link } from "react-router-dom";
import { CreditCard, Headphones, Users } from "lucide-react";
import { motion } from "framer-motion";

// Feature flag for toggling feature highlights visibility
export const FEATURE_SHOW_HIGHLIGHTS = true;

const FeatureHighlights = () => {
  if (!FEATURE_SHOW_HIGHLIGHTS) return null;

  const features = [
    {
      icon: CreditCard,
      title: "Buy now, pay over time",
      description: "Flexible payment options with FlexPay. Split your travel costs into easy monthly payments.",
      link: "/support?topic=flexpay",
      linkText: "Learn More",
      ariaLabel: "Learn more about flexible payment options with FlexPay",
      gradient: "from-purple-500 via-violet-500 to-pink-500",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400"
    },
    {
      icon: Headphones,
      title: "Customer Support",
      description: "24/7 dedicated support team ready to assist you with your travel needs.",
      link: "/support",
      linkText: "Learn More",
      ariaLabel: "Learn more about our customer support services",
      gradient: "from-blue-500 via-cyan-500 to-teal-500",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: Users,
      title: "2M+ Happy Travelers",
      description: "Join millions of satisfied customers who trust us for their travel bookings.",
      link: "/reviews",
      linkText: "Learn More",
      ariaLabel: "Learn more about our happy travelers and read reviews",
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1] as const
      }
    }
  };

  return (
    <section className="bg-secondary/50 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative bg-card rounded-2xl p-6 lg:p-8 shadow-md border border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${feature.iconBg} mb-5`}>
                <feature.icon className={`w-7 h-7 ${feature.iconColor}`} aria-hidden="true" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                {feature.description}
              </p>

              {/* Link */}
              <Link
                to={feature.link}
                className={`inline-flex items-center text-sm font-semibold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded`}
                aria-label={feature.ariaLabel}
              >
                {feature.linkText}
                <svg 
                  className="w-4 h-4 ml-1 text-primary" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              {/* Gradient accent line */}
              <div className={`absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r ${feature.gradient} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureHighlights;
