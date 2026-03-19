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
      subtitle: "Split your trip cost into predictable monthly payments. No interest, no surprises.",
      link: "/support?topic=flexpay",
      linkText: "Learn about FlexPay",
      iconBg: "bg-indigo-600",
      accent: "border-indigo-500/20 hover:border-indigo-500/40",
      badge: "FlexPay",
      badgeBg: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
    },
    {
      icon: Headphones,
      title: "24/7 Customer Support",
      subtitle: "Real travel specialists available around the clock — by phone, chat, or email.",
      link: "/support",
      linkText: "Contact Support",
      iconBg: "bg-sky-600",
      accent: "border-sky-500/20 hover:border-sky-500/40",
      badge: "Always On",
      badgeBg: "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
    },
    {
      icon: Users,
      title: "Trusted by 2M+ Travelers",
      subtitle: "Millions of satisfied travelers rely on Tripile for smooth, reliable bookings every day.",
      link: "/reviews",
      linkText: "Read Reviews",
      iconBg: "bg-emerald-600",
      accent: "border-emerald-500/20 hover:border-emerald-500/40",
      badge: "Top Rated",
      badgeBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
  };

  return (
    <section className="py-14 bg-background" aria-label="Key features">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Why Choose Tripile</p>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Everything You Need for Smarter Travel</h2>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className={`group relative flex flex-col bg-card rounded-2xl border-2 ${feature.accent} p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}
            >
              {/* Badge */}
              <span
                className={`self-start text-[10px] font-bold px-2.5 py-1 rounded-full ${feature.badgeBg} mb-4 uppercase tracking-wider`}
              >
                {feature.badge}
              </span>

              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 shadow-sm`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-base font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{feature.subtitle}</p>

              {/* CTA */}
              <Link
                to={feature.link}
                className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group"
              >
                {feature.linkText}
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom advisor link */}
        <div className="mt-10 text-center">
          <a
            href="tel:+18009634330"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <Headphones className="w-4 h-4" />
            Speak with a Travel Advisor
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeatureHighlights;
