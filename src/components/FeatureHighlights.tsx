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
      subtitle: "Make monthly payments with no hidden fees",
      link: "/support?topic=flexpay",
      linkText: "Learn More",
      ariaLabel: "Learn more about flexible payment options with FlexPay",
      iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
    },
    {
      icon: Headphones,
      title: "Customer Support",
      subtitle: "Happy to help our customers with queries round the clock",
      link: "/support",
      linkText: "Learn More",
      ariaLabel: "Learn more about our 24/7 customer support services",
      iconBg: "bg-gradient-to-br from-sky-500 to-blue-600",
    },
    {
      icon: Users,
      title: "2 Million+",
      subtitle: "Happy Travelers",
      link: "/reviews",
      linkText: "Learn More",
      ariaLabel: "Learn more about our happy travelers and read reviews",
      iconBg: "bg-gradient-to-br from-emerald-500 to-green-600",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  };

  return (
    <section
      className="w-full bg-white py-12 md:py-16"
      aria-label="Key features and benefits"
    >
      <div className="container mx-auto px-4">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group flex flex-col items-center text-center px-4"
              role="region"
              aria-label={feature.title}
            >
              {/* Icon Container */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-5 shadow-lg`}
              >
                <feature.icon
                  className="w-8 h-8 md:w-10 md:h-10 text-white"
                  aria-hidden="true"
                />
              </motion.div>

              {/* Title */}
              <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">
                {feature.title}
              </h3>

              {/* Subtitle */}
              <p className="text-muted-foreground text-sm md:text-base mb-4 max-w-[260px]">
                {feature.subtitle}
              </p>

              {/* Learn More Link */}
              <Link
                to={feature.link}
                className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 underline underline-offset-4 decoration-primary/40 hover:decoration-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureHighlights;
