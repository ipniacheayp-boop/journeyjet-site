import { Button } from "@/components/ui/button";
import { ArrowRight, Flame, Star, Sparkles, Zap, Users, Plane, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export interface TailoredDeal {
  id: string;
  title: string;
  description: string;
  image: string;
  tag: string;
}

interface TailoredDealCardProps {
  deal: TailoredDeal;
}

const tagConfigs: Record<string, { color: string; bg: string; icon: React.ElementType; cta: string }> = {
  "HOT DEAL": { color: "text-rose-500", bg: "bg-rose-500", icon: Flame, cta: "Grab This Deal" },
  BUDGET: { color: "text-emerald-500", bg: "bg-emerald-600", icon: Star, cta: "Find Budget Flights" },
  SENIOR: { color: "text-purple-500", bg: "bg-purple-600", icon: Users, cta: "Senior Deals" },
  PREMIUM: { color: "text-amber-500", bg: "bg-amber-500", icon: Sparkles, cta: "Upgrade to Business" },
  STUDENT: { color: "text-blue-500", bg: "bg-blue-600", icon: Zap, cta: "Student Savings" },
  POPULAR: { color: "text-sky-500", bg: "bg-sky-600", icon: Plane, cta: "Browse Airlines" },
};

const defaultConfig = { color: "text-primary", bg: "bg-primary", icon: Star, cta: "View Deals" };

const TailoredDealCard = ({ deal }: TailoredDealCardProps) => {
  const cfg = tagConfigs[deal.tag] ?? defaultConfig;
  const Icon = cfg.icon;

  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card hover:shadow-xl hover:border-primary/20 transition-all duration-300 h-full flex flex-col"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden shrink-0">
        <img
          src={deal.image}
          alt={deal.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {/* gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Tag badge */}
        <div
          className={`absolute top-0 left-0 ${cfg.bg} text-white px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider rounded-br-2xl flex items-center gap-1.5 shadow-md`}
        >
          <Icon className="w-3 h-3" />
          {deal.tag}
        </div>

        {/* Title over image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-base leading-snug drop-shadow">{deal.title}</h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1 gap-4">
        <p className="text-sm text-muted-foreground leading-relaxed flex-1">{deal.description}</p>

        {/* Limited time note */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>Limited time offer · Terms apply</span>
        </div>

        {/* CTA */}
        <Button
          asChild
          className={`w-full rounded-xl font-semibold gap-2 ${cfg.bg} hover:opacity-90 text-white border-0`}
        >
          <Link to="/deals">
            {cfg.cta}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
};

export default TailoredDealCard;
