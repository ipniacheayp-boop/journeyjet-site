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
      logo: "https://cdn.brandfetch.io/idhf_2Fxpu/theme/dark/logo.svg",
      alt: "IATA certified - International Air Transport Association Member",
      href: "https://www.iata.org/",
      initials: "IATA"
    },
    {
      name: "ASTA",
      logo: "https://cdn.brandfetch.io/idvS89lnpR/w/400/h/400/theme/dark/logo.png",
      alt: "ASTA member - American Society of Travel Advisors",
      href: "https://www.asta.org/",
      initials: "ASTA"
    },
    {
      name: "GoDaddy Verified & Secured",
      logo: "https://img1.wsimg.com/isteam/ip/static/verified-and-secured-light.svg",
      alt: "GoDaddy Verified and Secured",
      href: "https://www.godaddy.com/web-security/website-security",
      initials: "V&S"
    },
    {
      name: "TRUE Accredited",
      logo: "https://cdn.brandfetch.io/idDFpsfvY5/theme/dark/logo.svg",
      alt: "TRUE Accredited Travel Agency",
      href: "#",
      initials: "TRUE"
    },
    {
      name: "Cloudflare",
      logo: "https://cdn.brandfetch.io/id2S-kXbuq/theme/dark/logo.svg",
      alt: "Protected by Cloudflare",
      href: "https://www.cloudflare.com/",
      initials: "CF"
    },
    {
      name: "FlexPay",
      logo: "https://cdn.brandfetch.io/idpCXXxqEY/theme/dark/logo.svg",
      alt: "FlexPay - Buy Now Pay Later",
      href: "#",
      initials: "FP"
    },
    {
      name: "Amazon Pay",
      logo: "https://cdn.brandfetch.io/idEhf3DcL-/theme/dark/logo.svg",
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
      className="bg-slate-50 dark:bg-slate-900/50 border-t border-border/30"
      aria-labelledby="trust-partners-title"
      role="region"
    >
      <div className="container mx-auto px-4 py-6 md:py-8">
        <motion.div 
          className="w-full flex items-center justify-center flex-wrap gap-6 md:gap-10 lg:gap-12"
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
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0 flex items-center justify-center transition-all duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              role="listitem"
              aria-label={partner.alt}
              title={partner.alt}
            >
              <img
                src={partner.logo}
                alt={partner.alt}
                className="h-6 md:h-8 lg:h-9 w-auto max-w-[90px] md:max-w-[110px] lg:max-w-[130px] object-contain grayscale-0 dark:brightness-110"
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
      </div>
    </section>
  );
};

export default TrustPartners;
