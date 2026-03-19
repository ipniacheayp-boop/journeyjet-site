import { motion } from "framer-motion";
import { ArrowRight, Plane } from "lucide-react";
import { Link } from "react-router-dom";

// Popular route cards with price data
const popularRoutes = [
  {
    from: "New York",
    fromCode: "JFK",
    to: "Los Angeles",
    toCode: "LAX",
    price: "$89",
    airline: "Multiple Airlines",
    tag: "Most Popular",
    tagColor: "bg-blue-500",
  },
  {
    from: "Chicago",
    fromCode: "ORD",
    to: "Miami",
    toCode: "MIA",
    price: "$74",
    airline: "Multiple Airlines",
    tag: "Best Value",
    tagColor: "bg-green-500",
  },
  {
    from: "Los Angeles",
    fromCode: "LAX",
    to: "Las Vegas",
    toCode: "LAS",
    price: "$49",
    airline: "Multiple Airlines",
    tag: "Quick Getaway",
    tagColor: "bg-amber-500",
  },
  {
    from: "Atlanta",
    fromCode: "ATL",
    to: "Orlando",
    toCode: "MCO",
    price: "$59",
    airline: "Multiple Airlines",
    tag: "Family Favorite",
    tagColor: "bg-purple-500",
  },
  {
    from: "Dallas",
    fromCode: "DFW",
    to: "New York",
    toCode: "JFK",
    price: "$99",
    airline: "Multiple Airlines",
    tag: "Business Class",
    tagColor: "bg-indigo-500",
  },
  {
    from: "Seattle",
    fromCode: "SEA",
    to: "San Francisco",
    toCode: "SFO",
    price: "$65",
    airline: "Multiple Airlines",
    tag: "Weekend Trip",
    tagColor: "bg-teal-500",
  },
];

// Airline logos — trust/credibility for a flight booking site
const airlines = [
  {
    name: "Virgin Atlantic",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Virgin_Atlantic_logo.svg",
  },
  {
    name: "American Airlines",
    logo: "https://s202.q4cdn.com/986123435/files/doc_downloads/logos/american-airlines/aa_aa__hrz_rgb_grd_pos.png",
  },
  {
    name: "Delta Air Lines",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d1/Delta_logo.svg",
  },
  {
    name: "United Airlines",
    logo: "https://upload.wikimedia.org/wikipedia/sco/thumb/e/e0/United_Airlines_Logo.svg/960px-United_Airlines_Logo.svg.png?_=20170709012321",
  },
  {
    name: "Southwest Airlines",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Southwest_Airlines_logo_2014.svg/1280px-Southwest_Airlines_logo_2014.svg.png",
  },
  {
    name: "Frontier Airlines",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMieGOdcK-plYFjTe8kD9YiTj4bjhErQ7tOA&s",
  },
  {
    name: "Alaska Airlines",
    logo: "https://e7.pngegg.com/pngimages/364/136/png-clipart-logo-alaska-airlines-graphics-brand-alaska-air-group-san-francisco-fire-ambulance-blue-text.png",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const PopularFlights = () => {
  return (
    <section className="py-16 md:py-20 bg-slate-50 dark:bg-slate-950/60" aria-label="Popular flight routes">
      <div className="container mx-auto px-4">
        <div className="mb-14 md:mb-20 pb-10 border-b border-border">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-center text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-6">
              Compare flights across 500+ airlines, including
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-8 md:gap-x-14 opacity-80">
              {airlines.map((airline) => (
                <div key={airline.name} className="flex items-center justify-center" title={airline.name}>
                  <img
                    src={airline.logo}
                    alt={airline.name}
                    className="h-7 md:h-9 w-auto object-contain max-w-[110px] md:max-w-[130px]"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Trending Now</p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Popular US Flight Routes</h2>
            <p className="text-muted-foreground mt-1 text-sm">Prices from one-way fares. Updated daily.</p>
          </div>
          <Link
            to="/deals"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors shrink-0"
          >
            View all deals <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Route Cards Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {popularRoutes.map((route) => (
            <motion.div
              key={`${route.fromCode}-${route.toCode}`}
              variants={itemVariants}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
            >
              <Link
                to={`/?type=flights&originLocationCode=${route.fromCode}&destinationLocationCode=${route.toCode}#search-widget`}
                className="group block bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 p-5 h-full"
              >
                {/* Tag */}
                {/* Tag */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`${route.tagColor} text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide`}
                  >
                    {route.tag}
                  </span>
                  <Plane className="w-4 h-4 text-muted-foreground" />
                </div>

                {/* Route */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-extrabold text-foreground">{route.fromCode}</div>
                    <div className="text-xs text-muted-foreground">{route.from}</div>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-0.5">
                    <div className="w-full h-px bg-border relative">
                      <div className="absolute inset-y-[-3px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary/60" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">one-way</span>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-extrabold text-foreground">{route.toCode}</div>
                    <div className="text-xs text-muted-foreground">{route.to}</div>
                  </div>
                </div>

                {/* Price + CTA */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">From</span>
                    <span className="text-2xl font-extrabold text-primary">{route.price}</span>
                  </div>
                  <span className="text-xs font-semibold text-primary group-hover:underline flex items-center gap-1">
                    Search <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Airlines we compare ── */}
      </div>
    </section>
  );
};

export default PopularFlights;
