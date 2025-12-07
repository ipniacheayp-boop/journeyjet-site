import { motion } from "framer-motion";

// Feature flag for toggling trust badges visibility
export const FEATURE_SHOW_TRUST_BADGES = true;

const TrustPartners = () => {
  if (!FEATURE_SHOW_TRUST_BADGES) return null;

  const partners = [
    {
      name: "IATA",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/IATA_logo.svg/200px-IATA_logo.svg.png",
      alt: "IATA - International Air Transport Association Member"
    },
    {
      name: "ASTA",
      logo: "https://www.asta.org/Portals/0/asta-logo-1.png",
      alt: "ASTA - American Society of Travel Advisors"
    },
    {
      name: "GoDaddy Secured",
      logo: "https://img1.wsimg.com/isteam/ip/static/godaddy-verified-seal.svg",
      alt: "GoDaddy Verified and Secured"
    },
    {
      name: "TRUE",
      logo: "https://images.squarespace-cdn.com/content/v1/5e7a8c7c8d9b0a6e3e5c5e5e/1585149428507-TRUE-LOGO.png",
      alt: "TRUE - Trusted Accredited Travel Agency"
    },
    {
      name: "Cloudflare",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Cloudflare_Logo.png/200px-Cloudflare_Logo.png",
      alt: "Protected by Cloudflare"
    },
    {
      name: "FlexPay",
      logo: "https://cdn.brandfetch.io/idpCXXxqEY/w/400/h/400/theme/dark/icon.png",
      alt: "FlexPay - Buy Now Pay Later"
    },
    {
      name: "Amazon Pay",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Amazon_Pay_logo.svg/200px-Amazon_Pay_logo.svg.png",
      alt: "Amazon Pay Accepted"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: [0.25, 0.1, 0.25, 1] as const
      }
    }
  };

  return (
    <section 
      className="bg-muted/50 border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]"
      aria-labelledby="trust-partners-title"
      role="region"
    >
      <div className="container mx-auto px-4 py-6 md:py-10">
        <div className="text-center mb-6 md:mb-8">
          <h3 
            id="trust-partners-title"
            className="text-lg md:text-xl font-bold text-foreground mb-1.5"
          >
            Our Trusted Partners & Certifications
          </h3>
          <p className="text-sm text-muted-foreground">
            Your safety and trust are our highest priority.
          </p>
        </div>

        <motion.div 
          className="flex flex-wrap justify-center items-center gap-6 md:gap-10 lg:gap-12 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          role="list"
          aria-label="Trust and security partner logos"
        >
          {partners.map((partner) => (
            <motion.div
              key={partner.name}
              variants={itemVariants}
              className="flex items-center justify-center grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300"
              role="listitem"
            >
              <img
                src={partner.logo}
                alt={partner.alt}
                className="h-10 md:h-12 w-auto max-w-[100px] md:max-w-[120px] object-contain"
                loading="lazy"
                decoding="async"
                role="img"
                aria-label={partner.alt}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustPartners;
