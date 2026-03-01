import { motion } from "framer-motion";

const airlines = [
  {
    name: "Virgin Atlantic",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Virgin_Atlantic_logo.svg",
    bgColor: "bg-white",
  },
  {
    name: "Gulf Air",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUUpDipSVClCKWAM5O2krqGSWqal5XGeztdQ&s",
    bgColor: "bg-white",
  },
  {
    name: "Oman Air",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTu067JemC1GRfI4cJcSI5rKyzS0iTK8JSUvA&s",
    bgColor: "bg-white",
  },
  {
    name: "American Airlines",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSn2SKXRlALaCj6dUxlhGDcsqSwxzKMz_4tRQ&s",
    bgColor: "bg-white",
  },
  {
    name: "Delta Air Lines",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d1/Delta_logo.svg",
    bgColor: "bg-white",
  },
  {
    name: "British Airways",
    logo: "https://i.pinimg.com/564x/49/57/07/4957072a43937ac100d9e2052fc95d70.jpg",
    bgColor: "bg-white",
  },
];

const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const PopularFlights = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Popular Flights</h2>
          <p className="text-muted-foreground">Fly with the world's leading airlines</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6"
        >
          {airlines.map((airline) => (
            <motion.div
              key={airline.name}
              variants={itemVariants}
              whileHover={{ scale: 1.05, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
              transition={{ duration: 0.2 }}
              className={`${airline.bgColor} border border-border/50 rounded-xl p-4 md:p-6 flex items-center justify-center h-20 md:h-24 hover:border-primary/30 transition-colors cursor-pointer shadow-sm`}
            >
              <img
                src={airline.logo}
                alt={airline.name}
                className="h-10 md:h-12 w-auto object-contain max-w-[100px] md:max-w-[120px]"
                loading="lazy"
                onError={(e) => {
                  // Fallback to text if image fails
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  target.parentElement!.innerHTML = `<span class="text-sm font-semibold text-gray-700 text-center">${airline.name}</span>`;
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PopularFlights;
