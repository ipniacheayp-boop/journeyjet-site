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
      description: "Flexible payment options with FlexPay",
      link: "/support?topic=flexpay",
      linkText: "Learn More",
      ariaLabel: "Learn more about flexible payment options with FlexPay",
      iconBg: "bg-gradient-to-br from-purple-500 to-pink-500",
      iconColor: "text-white"
    },
    {
      icon: Headphones,
      title: "Customer Support",
      description: "24/7 dedicated support team",
      link: "/support",
      linkText: "Learn More",
      ariaLabel: "Learn more about our 24/7 customer support services",
      iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
      iconColor: "text-white"
    },
    {
      icon: Users,
      title: "2 Million+ Happy Travelers",
      description: "Join our satisfied customers",
      link: "/reviews",
      linkText: "Learn More",
      ariaLabel: "Learn more about our happy travelers and read reviews",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500",
      iconColor: "text-white"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1] as const
      }
    }
  };

  return (
    <section 
      className="w-full border-t border-border/30 bg-gradient-to-b from-background to-secondary/30"
      aria-label="Key features and benefits"
    >
      <div className="container mx-auto px-4 py-8 md:py-12">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature) => (
            <motion.section
              key={feature.title}
              variants={itemVariants}
              className="group relative bg-white/90 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-sm border border-border/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center"
              role="region"
              aria-label={feature.title}
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl ${feature.iconBg} mb-4 md:mb-5 shadow-lg`}>
                <feature.icon className={`w-7 h-7 md:w-8 md:h-8 ${feature.iconColor}`} aria-hidden="true" />
              </div>

              {/* Content */}
              <h3 className="text-lg md:text-xl font-bold text-foreground mb-1.5">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {feature.description}
              </p>

              {/* Link */}
              <Link
                to={feature.link}
                className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                aria-label={feature.ariaLabel}
                title={feature.ariaLabel}
              >
                {feature.linkText}
                <svg 
                  className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.section>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureHighlights;
