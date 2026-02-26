import { motion } from "framer-motion";

const PartnerLogos = () => {
  const partners = [
    {
      name: "Booking.com",
      logo: "https://upload.wikimedia.org/wikipedia/commons/b/be/Booking.com_logo.svg",
    },
    {
      name: "KAYAK",
      logo: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Kayak_Logo.svg",
    },
    {
      name: "Priceline",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbsxyq5At2IeUTWbQ6zQrjtzBorWnskhnBGQ&s",
    },
    {
      name: "Agoda",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Agoda_logo_2019.svg/330px-Agoda_logo_2019.svg.png",
    },
    {
      name: "OpenTable",
      logo: "https://mma.prnewswire.com/media/122496/opentable__inc__logo.jpg?w=200",
    },
    {
      name: "Expedia",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Expedia_2012_logo.svg/3840px-Expedia_2012_logo.svg.png",
    },
    {
      name: "Hotels.com",
      logo: "https://upload.wikimedia.org/wikipedia/commons/1/16/Hotels.com_Logo_2023.svg",
    },
    {
      name: "Trivago",
      logo: "https://cdn.freebiesupply.com/logos/large/2x/trivago-logo-png-transparent.png",
    },
    {
      name: "Skyscanner",
      logo: "https://upload.wikimedia.org/wikipedia/commons/9/94/Skyscanner_Logo_LockupHorizontal_SkyBlue_RGB.svg",
    },
    {
      name: "Momondo",
      logo: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Press-logo-momondo_colour.png",
    },
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
              className="flex items-center justify-center px-4 py-2 opacity-60 hover:opacity-100 transition-opacity duration-300 "
            >
              <img src={partner.logo} alt={partner.name} className="h-6 md:h-8 w-auto object-contain" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PartnerLogos;
