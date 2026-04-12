import { motion } from "framer-motion";
import { Globe, Sparkles, Bell, Plane, ArrowRight, Briefcase, Shield, Zap, Map } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const tools = [
  {
    icon: Globe,
    title: "Explore Destinations",
    subtitle: "Discover top destinations worldwide with curated experiences, pricing insights, and travel inspiration.",
    link: "/explore",
    linkText: "Explore destinations",
    gradient: "from-blue-600 to-indigo-700",
    highlight: "#0b69ff",
    badge: "Popular",
  },
  {
    icon: Sparkles,
    title: "AI Trip Planner",
    subtitle: "Design a personalized, day-by-day itinerary instantly using advanced AI.",
    link: "/trip-planner",
    linkText: "Plan a trip",
    gradient: "from-violet-600 to-purple-700",
    highlight: "#7c3aed",
    badge: "New",
  },
  {
    icon: Plane,
    title: "Flight Status Tracker",
    subtitle: "Track any US flight in real time — delays, gate changes, and arrivals.",
    link: "/flight-status",
    linkText: "Track a flight",
    gradient: "from-sky-500 to-blue-700",
    highlight: "#0ea5e9",
    badge: "Live",
  },
  {
    icon: Map,
    title: "Travel Checklists",
    subtitle: "Track your global adventures and save your bucket list destinations.",
    link: "/destinations-checklist",
    linkText: "View checklists",
    gradient: "from-emerald-500 to-teal-700",
    highlight: "#10b981",
    badge: "Free",
  },
];

const perks = [
  { icon: Briefcase, label: "Business class deals" },
  { icon: Shield, label: "Best price guarantee" },
  { icon: Zap, label: "Instant booking" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const ForTravelPros = () => {
  return (
    <section className="py-16 md:py-24 bg-background" aria-labelledby="travel-pros-title">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Smart Travel Tools</p>
          <h2 id="travel-pros-title" className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Built for Savvy Travelers
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Everything you need to find better fares, track flights, and travel with confidence.
          </p>
        </motion.div>

        {/* Tool Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto mb-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.title}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative bg-card rounded-2xl border border-border hover:border-primary/25 hover:shadow-lg transition-all duration-200 p-6 flex flex-col overflow-hidden"
              >
                {/* Subtle gradient top stripe */}
                <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${tool.gradient}`} />

                {/* Badge */}
                <span
                  className={`self-start text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${tool.gradient} text-white mb-4 uppercase tracking-wider`}
                >
                  {tool.badge}
                </span>

                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-4 shadow-sm`}
                >
                  <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                </div>

                <h3 className="text-base font-bold text-foreground mb-2">{tool.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{tool.subtitle}</p>

                <Link
                  to={tool.link}
                  className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  {tool.linkText}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom perks bar + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-6 max-w-5xl mx-auto bg-muted/50 dark:bg-muted/20 rounded-2xl border border-border px-6 py-4"
        >
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-5">
            {perks.map(({ icon: PerkIcon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <PerkIcon className="w-4 h-4 text-primary shrink-0" />
                {label}
              </div>
            ))}
          </div>
          <Button asChild size="sm" className="shrink-0 rounded-xl bg-primary hover:bg-primary/90 font-semibold gap-2">
            <Link to="/account" title="Create your free Tripile account — member deals & alerts">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default ForTravelPros;
