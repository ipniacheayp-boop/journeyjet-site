import { motion } from "framer-motion";

// Feature flag for toggling trust badges visibility
export const FEATURE_SHOW_TRUST_BADGES = true;

// Fallback placeholder for missing images
const FallbackBadge = ({ name }: { name: string }) => (
  <div className="flex items-center justify-center h-8 md:h-10 px-4 bg-gray-200 dark:bg-gray-700 rounded text-xs font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
    {name}
  </div>
);

const TrustPartners = () => {
  if (!FEATURE_SHOW_TRUST_BADGES) return null;

  // Official logos in exact order from reference
  const partners = [
    {
      name: "IATA",
      logo: "https://upload.wikimedia.org/wikipedia/commons/f/f7/IATAlogo.svg",
      alt: "IATA - International Air Transport Association",
      href: "https://www.iata.org/",
    },
    {
      name: "ASTA",
      logo: "https://amanitours.com/wp-content/uploads/2020/02/ASTA-logo.png",
      alt: "ASTA - American Society of Travel Advisors Member",
      href: "https://www.asta.org/",
    },
    {
      name: "GoDaddy Verified",
      logo: "https://seal.godaddy.com/images/3/en/siteseal_gd_3_h_l_m.gif",
      alt: "GoDaddy Verified & Secured",
      href: "https://www.godaddy.com/web-security/website-security",
    },
    {
      name: "TRUE",
      logo: "https://har-production-assets.s3.amazonaws.com/variants/zPpfDEQ2CZXZe97GoPVADe8s/bf15e1fa2ab7bef67faf07c8849cb6ba2ac42e07828cd811c90f37bb92a2e91e.png",
      alt: "TRUE - Travel Retailer Universal Enumeration Accredited",
      href: "https://trueaccreditation.org/",
    },
    {
      name: "Cloudflare",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Cloudflare_Logo.png/512px-Cloudflare_Logo.png",
      alt: "Protected by Cloudflare",
      href: "https://www.cloudflare.com/",
    },
    {
      name: "FlexPay",
      logo: "https://cdn.document360.io/ff52d920-99b4-4c2b-9b32-5d5fe9700cb0/Images/Documentation/FlexpayLogo-FullColor-V(1).png",
      alt: "FlexPay - Buy Now Pay Later",
      href: "#",
    },
    {
      name: "Amazon Pay",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Amazon_Pay_logo.svg/512px-Amazon_Pay_logo.svg.png",
      alt: "Amazon Pay Accepted",
      href: "https://pay.amazon.com/",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, name: string) => {
    const target = e.currentTarget;
    target.style.display = "none";
    const fallback = target.nextElementSibling as HTMLElement;
    if (fallback) fallback.style.display = "flex";
  };

  return (
    <section
      className="bg-[#f8f9fa] dark:bg-slate-900/60 py-6 md:py-8"
      aria-labelledby="trust-partners-heading"
      role="region"
    >
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <h2
          id="trust-partners-heading"
          className="text-center text-lg md:text-xl font-semibold text-foreground tracking-wide mb-6"
        >
          TrustPartners
        </h2>

        {/* Logos Row */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-6 md:gap-8 lg:gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
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
              whileHover={{
                scale: 1.05,
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center p-2 md:p-3 rounded-lg bg-white dark:bg-slate-800/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              role="listitem"
              aria-label={partner.alt}
              title={partner.alt}
            >
              <img
                src={partner.logo}
                alt={partner.alt}
                className="h-7 md:h-9 lg:h-10 w-auto max-w-[100px] md:max-w-[120px] object-contain"
                loading="lazy"
                decoding="async"
                onError={(e) => handleImageError(e, partner.name)}
              />
              <div className="hidden">
                <FallbackBadge name={partner.name} />
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustPartners;
