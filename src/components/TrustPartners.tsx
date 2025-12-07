import { motion } from "framer-motion";

// Feature flag for toggling trust badges visibility
export const FEATURE_SHOW_TRUST_BADGES = true;

// Fallback SVG placeholder for missing images
const FallbackIcon = ({ initials }: { initials: string }) => (
  <div className="flex items-center justify-center h-7 md:h-9 px-3 bg-muted rounded text-xs font-bold text-muted-foreground">
    {initials}
  </div>
);

const TrustPartners = () => {
  if (!FEATURE_SHOW_TRUST_BADGES) return null;

  const partners = [
    {
      name: "IATA",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/IATA_logo.svg/200px-IATA_logo.svg.png",
      alt: "IATA certified - International Air Transport Association Member",
      href: "https://www.iata.org/",
      initials: "IATA"
    },
    {
      name: "ASTA",
      logo: "https://www.asta.org/Portals/0/asta-logo-1.png",
      alt: "ASTA member - American Society of Travel Advisors",
      href: "https://www.asta.org/",
      initials: "ASTA"
    },
    {
      name: "GoDaddy Secured",
      logo: "https://img1.wsimg.com/isteam/ip/static/godaddy-verified-seal.svg",
      alt: "Verified and Secured by GoDaddy",
      href: "https://www.godaddy.com/",
      initials: "V&S"
    },
    {
      name: "TRUE",
      logo: "https://images.squarespace-cdn.com/content/v1/5e7a8c7c8d9b0a6e3e5c5e5e/1585149428507-TRUE-LOGO.png",
      alt: "TRUE accredited Travel Agency",
      href: "#",
      initials: "TRUE"
    },
    {
      name: "Cloudflare",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Cloudflare_Logo.png/200px-Cloudflare_Logo.png",
      alt: "Protected by Cloudflare",
      href: "https://www.cloudflare.com/",
      initials: "CF"
    },
    {
      name: "FlexPay",
      logo: "https://cdn.brandfetch.io/idpCXXxqEY/w/400/h/400/theme/dark/icon.png",
      alt: "FlexPay - Buy Now Pay Later",
      href: "#",
      initials: "FP"
    },
    {
      name: "Amazon Pay",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Amazon_Pay_logo.svg/200px-Amazon_Pay_logo.svg.png",
      alt: "Amazon Pay Accepted",
      href: "https://pay.amazon.com/",
      initials: "AP"
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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
    if (fallback) fallback.style.display = 'flex';
  };

  return (
    <section 
      className="bg-muted/50 border-t border-border/50"
      aria-labelledby="trust-partners-title"
      role="region"
    >
      <div className="container mx-auto px-4 py-5 md:py-8">
        <h3 
          id="trust-partners-title"
          className="text-center text-sm md:text-base font-semibold text-foreground mb-4 md:mb-6"
        >
          Our Trusted Partners & Certifications
        </h3>

        <motion.div 
          className="w-full flex items-center justify-center gap-3 md:gap-7 py-2 overflow-x-auto scrollbar-hide"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          role="list"
          aria-label="Trust and security partner logos"
        >
          {partners.map((partner) => (
            <motion.a
              key={partner.name}
              href={partner.href}
              target="_blank"
              rel="noopener noreferrer"
              variants={itemVariants}
              className="flex-shrink-0 flex items-center justify-center p-2 rounded-lg bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              role="listitem"
              aria-label={partner.alt}
              title={partner.alt}
            >
              <img
                src={partner.logo}
                alt={partner.alt}
                className="h-6 md:h-9 w-auto max-w-[80px] md:max-w-[100px] object-contain"
                loading="lazy"
                decoding="async"
                onError={handleImageError}
              />
              <div className="hidden">
                <FallbackIcon initials={partner.initials} />
              </div>
            </motion.a>
          ))}
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-3">
          Your safety and trust are our highest priority.
        </p>
      </div>
    </section>
  );
};

export default TrustPartners;
