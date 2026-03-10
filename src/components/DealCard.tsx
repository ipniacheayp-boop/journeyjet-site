import { ArrowRight, Calendar, Plane, Sparkles, Flame, TrendingUp, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  // FX-SmartSave calculation for this deal
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

  // Determine ribbon type based on discount or other criteria
  const getRibbonConfig = () => {
    if (discountPercent >= 40) return { label: "HOT DEAL", class: "bg-coral", icon: Flame };
    if (discountPercent >= 25) return { label: "POPULAR", class: "bg-primary", icon: TrendingUp };
    if (deal.price < 300) return { label: "BEST PRICE", class: "bg-emerald-600", icon: Star };
    if (discountPercent >= 15) return { label: "FLASH DEAL", class: "bg-amber-600", icon: Zap };
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

  // Get proper image path
  const getImageSrc = () => {
    if (!deal.image) return "/deal-beach.jpg";
    if (deal.image.startsWith("http")) return deal.image;
    if (deal.image.startsWith("/")) return deal.image;
    return `/${deal.image}`;
  };

  return (
    <Card
      className="overflow-hidden h-full group cursor-pointer card-unified border-0 hover:shadow-lg transition-all duration-300"
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
      <div className="relative h-52 overflow-hidden">
        <img
          src={getImageSrc()}
          alt={`${deal.title} - Flight deal from ${deal.origin} to ${deal.destination}`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/deal-beach.jpg";
          }}
        />

        {/* Gradient Overlay - More vibrant */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-purple-900/20 to-transparent" />

        {/* Ribbon Tag */}
        {ribbon && (
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`absolute -top-1 -right-1 ${ribbon.class} text-white px-4 py-1.5 text-xs font-bold rounded-bl-xl rounded-tr-xl shadow-lg flex items-center gap-1`}
          >
            <ribbon.icon className="w-3 h-3" />
            {ribbon.label}
          </motion.div>
        )}

        {/* Discount Badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-coral text-white font-bold text-sm px-3 py-1.5 shadow-md border-0 rounded-full">
            -{discountPercent}% OFF
          </Badge>
        </div>

        {/* Airline Badge */}
        <Badge
          variant="secondary"
          className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-foreground font-medium text-xs px-3 py-1.5 shadow-md"
        >
          <Plane className="w-3 h-3 mr-1.5 text-primary" />
          {deal.airline || "Multiple Airlines"}
        </Badge>

        {/* Cabin Class Badge */}
        <Badge className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white border-white/20 font-medium text-xs">
          {deal.cabinClass}
        </Badge>
      </div>

      <CardContent className="p-5 space-y-4">
        <h3 className="font-display font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {deal.title}
        </h3>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800">
            <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
              {deal.origin.split(" (")[0]}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
              {deal.destination.split(" (")[0]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>
            {format(new Date(deal.departDate), "MMM dd")} - {format(new Date(deal.returnDate), "MMM dd, yyyy")}
          </span>
        </div>

        {/* Price Section */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Starting from</span>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-3xl font-black text-primary">${deal.price}</span>
            <span className="text-sm text-muted-foreground line-through">${deal.originalPrice}</span>
            <span className="text-xs font-semibold text-emerald-500 dark:text-emerald-400">
              Save ${deal.originalPrice - deal.price}
            </span>
          </div>

          {/* FX-SmartSave Badge */}
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

        <Button
          className="w-full btn-premium"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          aria-label={`View ${deal.title} deal details`}
        >
          View Deal <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default DealCard;
