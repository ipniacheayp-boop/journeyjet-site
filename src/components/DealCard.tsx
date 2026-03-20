import { ArrowRight, Calendar, Plane, Flame, TrendingUp, Star, Zap, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Deal } from "@/data/mockDeals";
import { motion } from "framer-motion";
import { useFxSmartSave } from "@/hooks/useFxSmartSave";
import FxSmartSaveBadge from "@/components/FxSmartSaveBadge";
import { TooltipProvider } from "@/components/ui/tooltip";

interface DealCardProps {
  deal: Deal;
  onClick?: () => void;
}

const DealCard = ({ deal, onClick }: DealCardProps) => {
  const discountPercent = Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100);

  const { data: fxData } = useFxSmartSave({
    productType: "flight",
    prices: [
      { currency: "USD", amount: deal.price },
      { currency: "EUR", amount: deal.price * 0.92 },
      { currency: "GBP", amount: deal.price * 0.79 },
    ],
    origin: deal.origin,
    destination: deal.destination,
    travelDate: deal.departDate,
  });

  const getRibbonConfig = () => {
    if (discountPercent >= 40) return { label: "HOT DEAL", class: "bg-rose-500", icon: Flame };
    if (discountPercent >= 25) return { label: "POPULAR", class: "bg-blue-600", icon: TrendingUp };
    if (deal.price < 300) return { label: "BEST PRICE", class: "bg-emerald-600", icon: Star };
    if (discountPercent >= 15) return { label: "FLASH DEAL", class: "bg-amber-500", icon: Zap };
    return null;
  };

  const ribbon = getRibbonConfig();

  const handleClick = () => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "deal_view", {
        deal_id: deal.id,
        deal_title: deal.title,
        deal_price: deal.price,
      });
    }
    onClick?.();
  };

  const getImageSrc = () => {
    if (!deal.image) return "/deal-beach.jpg";
    if (deal.image.startsWith("http")) return deal.image;
    if (deal.image.startsWith("/")) return deal.image;
    return `/${deal.image}`;
  };

  const originCity = deal.origin.split(" (")[0];
  const destCity = deal.destination.split(" (")[0];

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-border bg-card hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer h-full flex flex-col"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`View deal: ${deal.title}`}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden shrink-0">
        <img
          src={getImageSrc()}
          alt={`${deal.title} - Flight deal from ${deal.origin} to ${deal.destination}`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/deal-beach.jpg";
          }}
        />

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

        {/* Ribbon */}
        {ribbon && (
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className={`absolute top-0 right-0 ${ribbon.class} text-white px-3 py-1.5 text-[10px] font-bold rounded-bl-xl rounded-tr-2xl shadow-lg flex items-center gap-1 uppercase tracking-wide`}
          >
            <ribbon.icon className="w-3 h-3" />
            {ribbon.label}
          </motion.div>
        )}

        {/* Discount badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-rose-500 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow">
            -{discountPercent}%
          </span>
        </div>

        {/* Route pill — bottom left over image */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/55 backdrop-blur-sm rounded-full px-3 py-1.5">
          <MapPin className="w-3 h-3 text-white/70" />
          <span className="text-white text-xs font-semibold">{originCity}</span>
          <ArrowRight className="w-3 h-3 text-white/50" />
          <span className="text-white text-xs font-semibold">{destCity}</span>
        </div>

        {/* Cabin badge */}
        <span className="absolute bottom-3 right-3 text-[10px] font-semibold text-white/80 bg-black/40 backdrop-blur-sm border border-white/10 px-2 py-1 rounded-full">
          {deal.cabinClass}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Title + airline */}
        <div>
          <h3 className="font-bold text-base leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-1">
            {deal.title}
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Plane className="w-3 h-3 text-primary/60" />
            {deal.airline || "Multiple Airlines"}
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {format(new Date(deal.departDate), "MMM d")} → {format(new Date(deal.returnDate), "MMM d, yyyy")}
          </span>
        </div>

        {/* Price */}
        <div className="mt-auto pt-3 border-t border-border">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">From</span>
          <div className="flex items-baseline gap-2.5 mt-0.5">
            <span className="text-3xl font-black text-primary leading-none">${deal.price}</span>
            <span className="text-sm text-muted-foreground line-through">${deal.originalPrice}</span>
            <span className="text-xs font-semibold text-emerald-500">Save ${deal.originalPrice - deal.price}</span>
          </div>

          {fxData && fxData.savingsUSD >= 10 && (
            <TooltipProvider>
              <div className="mt-2">
                <FxSmartSaveBadge
                  savingsUSD={fxData.savingsUSD}
                  recommendedCurrency={fxData.recommendedCurrency}
                  recommendedAmountLocal={fxData.recommendedAmountLocal}
                  recommendedAmountUSD={fxData.recommendedAmountUSD}
                  breakdown={fxData.breakdown}
                />
              </div>
            </TooltipProvider>
          )}
        </div>

        {/* CTA */}
        <Button
          className="w-full rounded-xl font-semibold bg-primary hover:bg-primary/90 gap-2 mt-1"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          aria-label={`View ${deal.title} deal details`}
        >
          View Deal <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

export default DealCard;
