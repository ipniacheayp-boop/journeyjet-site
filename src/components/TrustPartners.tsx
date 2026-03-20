"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";

export const FEATURE_SHOW_TRUST_BADGES = true;

const partners = [
  {
    name: "IATA",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f7/IATAlogo.svg",
    alt: "IATA – International Air Transport Association",
    href: "https://www.iata.org/",
    label: "IATA Member",
  },
  {
    name: "ASTA",
    logo: "https://holidayplanners.com/wp-content/uploads/2014/12/ASTA-logo.jpg",
    alt: "ASTA – American Society of Travel Advisors",
    href: "https://www.asta.org/",
    label: "ASTA Accredited",
  },
  {
    name: "TRUE",
    logo: "https://www.ccra.com/wp-content/uploads/2020/11/TRUE-Logo-4.png",
    alt: "TRUE – Travel Retailer Universal Enumeration",
    href: "https://trueaccreditation.org/",
    label: "TRUE Accredited",
  },
  {
    name: "Cloudflare",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Cloudflare_Logo.svg",
    alt: "Protected by Cloudflare",
    href: "https://www.cloudflare.com/",
    label: "Cloudflare Protected",
  },
  {
    name: "GoDaddy",
    logo: "https://seal.godaddy.com/images/3/en/siteseal_gd_3_h_l_m.gif",
    alt: "GoDaddy Verified & Secured",
    href: "https://www.godaddy.com/web-security/website-security",
    label: "SSL Verified",
  },
  {
    name: "FlexPay",
    logo: "https://cdn.document360.io/ff52d920-99b4-4c2b-9b32-5d5fe9700cb0/Images/Documentation/FlexpayLogo-FullColor-V(1).png",
    alt: "FlexPay – Buy Now Pay Later",
    href: "https://www.upgrade.com/flex-pay/",
    label: "FlexPay Partner",
  },
  {
    name: "Amazon Pay",
    logo: "https://i.pinimg.com/736x/e4/59/c4/e459c4e28958ca826d22ff37b89162ee.jpg",
    alt: "Amazon Pay Accepted",
    href: "https://pay.amazon.com/",
    label: "Amazon Pay",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const TrustPartners = () => {
  if (!FEATURE_SHOW_TRUST_BADGES) return null;

  return (
    <section
      className="py-12 md:py-16 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800"
      aria-labelledby="trust-partners-heading"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <p
            id="trust-partners-heading"
            className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2"
          >
            Accredited &amp; Secured By
          </p>
          <h2 className="text-lg md:text-xl font-bold text-foreground">Your Booking is Safe with Us</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
            Recognized by global aviation authorities, secured by enterprise-grade infrastructure, and backed by trusted
            payment providers.
          </p>
        </div>

        {/* Partner cards */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          role="list"
          aria-label="Accreditation and security partners"
        >
          {partners.map((partner) => (
            <motion.a
              key={partner.name}
              href={partner.href}
              target="_blank"
              rel="noopener noreferrer"
              variants={itemVariants}
              role="listitem"
              aria-label={partner.alt}
              title={partner.alt}
              className="group flex flex-col items-center gap-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-24 p-4 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 w-[120px]"
            >
              <img
                src={partner.logo}
                alt={partner.alt}
                className="h-8 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                loading="lazy"
                decoding="async"
              />
              <span className="text-[10px] font-semibold text-muted-foreground text-center leading-tight">
                {partner.label}
              </span>
            </motion.a>
          ))}
        </motion.div>

        {/* SSL note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-2 mt-7 text-xs text-muted-foreground"
        >
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>
            All transactions are protected with <strong className="text-foreground">256-bit SSL encryption</strong>
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustPartners;
