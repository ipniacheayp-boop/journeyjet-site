import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const HERO_IMAGE = "/images/hero-flights-hotels.jpg";

const HeroBackground = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Parallax image layer */}
      <motion.div className="absolute inset-0" style={{ y: imageY, scale: imageScale }}>
        <img
          src={HERO_IMAGE}
          alt=""
          width={1920}
          height={1080}
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-[115%] w-full object-cover object-center hero-bg-ken-burns"
        />
      </motion.div>

      {/* Animated color wash */}
      <div className="absolute inset-0 hero-gradient-shift opacity-90" />

      {/* Base dark overlay for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/50 to-primary/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/20 to-slate-900/40" />

      {/* Vignette edges */}
      <div className="absolute inset-0 hero-vignette pointer-events-none" />

      {/* Floating ambient orbs */}
      <div className="hero-orb hero-orb-1 pointer-events-none" />
      <div className="hero-orb hero-orb-2 pointer-events-none" />
      <div className="hero-orb hero-orb-3 pointer-events-none" />

      {/* Light shimmer sweep */}
      <div className="hero-shimmer pointer-events-none" />

      {/* Subtle noise texture for depth */}
      <div className="hero-noise pointer-events-none" />
    </div>
  );
};

export default HeroBackground;
