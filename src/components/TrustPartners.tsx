"use client";

import { motion } from "framer-motion";
import React from "react";

import iataLogo from "@/assets/trust/iata.svg";
import astaLogo from "@/assets/trust/asta.jpg";
import godaddyLogo from "@/assets/trust/godaddy.gif";
import trueLogo from "@/assets/trust/true.png";
import cloudflareLogo from "@/assets/trust/cloudflare.svg";
import flexpayLogo from "@/assets/trust/flexpay.png";
import amazonpayLogo from "@/assets/trust/amazonpay.jpg";

export const FEATURE_SHOW_TRUST_BADGES = true;

const TrustPartners = () => {
  if (!FEATURE_SHOW_TRUST_BADGES) return null;

  const partners = [
    { name: "IATA", logo: iataLogo, alt: "IATA - International Air Transport Association", href: "https://www.iata.org/" },
    { name: "ASTA", logo: astaLogo, alt: "ASTA - American Society of Travel Advisors Member", href: "https://www.asta.org/" },
    { name: "GoDaddy Verified", logo: godaddyLogo, alt: "GoDaddy Verified & Secured", href: "https://www.godaddy.com/web-security/website-security" },
    { name: "TRUE", logo: trueLogo, alt: "TRUE - Travel Retailer Universal Enumeration Accredited", href: "https://trueaccreditation.org/" },
    { name: "Cloudflare", logo: cloudflareLogo, alt: "Protected by Cloudflare", href: "https://www.cloudflare.com/" },
    { name: "FlexPay", logo: flexpayLogo, alt: "FlexPay - Buy Now Pay Later", href: "#" },
    { name: "Amazon Pay", logo: amazonpayLogo, alt: "Amazon Pay Accepted", href: "https://pay.amazon.com/" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  };

  return (
    <section
      className="bg-[#f8f9fa] dark:bg-slate-900/60 py-12 md:py-16 border-t border-gray-200 dark:border-slate-800"
      aria-labelledby="trust-partners-heading"
      role="region"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 id="trust-partners-heading" className="text-xl md:text-2xl font-semibold tracking-wide text-foreground">
            Trusted & Secured By
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Accredited travel partner and protected by globally recognized aviation authorities, secure payment
            providers, and enterprise-grade security infrastructure.
          </p>
        </div>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16 opacity-80"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          role="list"
          aria-label="Accreditation and security partners"
        >
          {partners.map((partner) => (
            <motion.div
              key={partner.name}
              variants={itemVariants}
              className="flex items-center justify-center"
              role="listitem"
            >
              <img
                src={partner.logo}
                alt={partner.alt}
                className="h-8 md:h-10 lg:h-12 w-auto object-contain"
                loading="lazy"
                decoding="async"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustPartners;
