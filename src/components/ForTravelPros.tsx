import { motion } from "framer-motion";
import { Globe, Bell, Plane } from "lucide-react";

const ForTravelPros = () => {
  const cards = [
    {
      icon: Globe,
      title: "Explore",
      subtitle: "See destinations on your budget",
      gradient: "from-slate-700 to-slate-900",
      bgColor: "bg-white dark:bg-slate-900",
    },
    {
      icon: Bell,
      title: "Price Alerts",
      subtitle: "Know when prices change",
      gradient: "from-indigo-600 to-indigo-800",
      bgColor: "bg-white dark:bg-slate-900",
    },
    {
      icon: Plane,
      title: "Flight Tracker",
      subtitle: "See real-time delays",
      gradient: "from-sky-600 to-blue-800",
      bgColor: "bg-white dark:bg-slate-900",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
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
    <section className="py-16 md:py-20 bg-background" aria-labelledby="travel-pros-title">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 id="travel-pros-title" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            For Travel Professionals
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Professional tools to help you travel smarter and save more
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {cards.map((card) => (
            <motion.div
              key={card.title}
              variants={itemVariants}
              className={`${card.bgColor} card-unified flex flex-col items-center justify-center p-6 rounded-2xl text-center border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-md group`}
            >
              {/* Icon Container */}
              <div
                className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}
              >
                <card.icon className="w-8 h-8 text-white" aria-hidden="true" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-foreground mb-2">{card.title}</h3>

              {/* Subtitle */}
              <p className="text-muted-foreground text-sm">{card.subtitle}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ForTravelPros;
