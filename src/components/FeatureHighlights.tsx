import { Link } from "react-router-dom";
import { ArrowRight, CreditCard, Headphones, Users } from "lucide-react";
import { motion } from "framer-motion";

export const FEATURE_SHOW_HIGHLIGHTS = true;

const FeatureHighlights = () => {
  if (!FEATURE_SHOW_HIGHLIGHTS) return null;

  const features = [
    {
      icon: CreditCard,
      title: "Buy Now, Pay Over Time",
      subtitle: "Split your trip cost into predictable monthly payments.",
      link: "/support?topic=flexpay",
      linkText: "Learn more",
      iconBg: "bg-indigo-600",
    },
    {
      icon: Headphones,
      title: "24/7 Customer Support",
      subtitle: "Our travel specialists are always ready to assist you.",
      link: "/support",
      linkText: "Learn more",
      iconBg: "bg-sky-600",
    },
    {
      icon: Users,
      title: "Trusted by 2M+ Travelers",
      subtitle: "Millions rely on Tripile for smooth and reliable bookings.",
      link: "/reviews",
      linkText: "Learn more",
      iconBg: "bg-emerald-600",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  };

  return (
    <section className="py-16 bg-background" aria-label="Key features">
      <div className="container mx-auto px-4">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group card-unified flex flex-col items-center "
            >
              {/* Icon */}
              <div className={`w-14 h-14 mx-auto mb-5 rounded-xl ${feature.iconBg} flex items-center justify-center`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>

              {/* Subtitle */}
              <p className="text-sm text-muted-foreground text-center mb-4 max-w-[240px] mx-auto">{feature.subtitle}</p>

              {/* CTA */}
              {/* <Link
                to={feature.link}
                className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {feature.linkText}
                <svg
                  className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link> */}
            </motion.div>
          ))}
        </motion.div>
        <div className="mt-14 text-center">
          <a
            href="tel:+18009634330"
            className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Speak with a Travel Advisor
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeatureHighlights;
