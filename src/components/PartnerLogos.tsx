import { motion } from "framer-motion";

const PartnerLogos = () => {
  const partners = [
    { name: "Booking.com", color: "#003580" },
    { name: "KAYAK", color: "#FF690F" },
    { name: "Priceline", color: "#0068EF" },
    { name: "Agoda", color: "#5392F9" },
    { name: "OpenTable", color: "#DA3743" },
    { name: "Expedia", color: "#FFCC00" },
    { name: "Hotels.com", color: "#D32F2F" },
    { name: "Trivago", color: "#007FAD" },
    { name: "Skyscanner", color: "#00D1C1" },
    { name: "Momondo", color: "#FF6600" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  };

  return (
    <section className="py-10 md:py-14 bg-muted/30" aria-labelledby="partners-title">
      <div className="container mx-auto px-4">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          id="partners-title"
          className="text-center text-sm text-muted-foreground mb-8"
        >
          Trusted by millions across leading travel platforms
        </motion.p>

        <motion.div
          className="flex flex-wrap justify-center items-center gap-6 md:gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
        >
          {partners.map((partner) => (
            <motion.div
              key={partner.name}
              variants={itemVariants}
              className="flex items-center justify-center px-4 py-2 opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
            >
              <span 
                className="text-lg md:text-xl font-bold tracking-tight"
                style={{ color: partner.color }}
              >
                {partner.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PartnerLogos;
