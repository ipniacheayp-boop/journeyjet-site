import { ArrowRight, Calendar, Plane, Sparkles, Flame, TrendingUp, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Deal } from "@/data/mockDeals";
import { motion } from "framer-motion";

interface DealCardProps {
  deal: Deal;
  onClick?: () => void;
}

const DealCard = ({ deal, onClick }: DealCardProps) => {
  const discountPercent = Math.round(
    ((deal.originalPrice - deal.price) / deal.originalPrice) * 100
  );

  // Determine ribbon type based on discount or other criteria
  const getRibbonConfig = () => {
    if (discountPercent >= 40) return { label: "HOT DEAL", class: "bg-gradient-to-r from-red-500 via-rose-500 to-orange-500", icon: Flame };
    if (discountPercent >= 25) return { label: "POPULAR", class: "bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500", icon: TrendingUp };
    if (deal.price < 300) return { label: "BEST PRICE", class: "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500", icon: Star };
    if (discountPercent >= 15) return { label: "FLASH DEAL", class: "bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-400", icon: Zap };
    return null;
  };

  const ribbon = getRibbonConfig();

  const handleClick = () => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'deal_view', {
        deal_id: deal.id,
        deal_title: deal.title,
        deal_price: deal.price
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
      className="overflow-hidden h-full group cursor-pointer card-colorful border-0 hover:shadow-colorful-lg transition-all duration-500"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
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
        
        {/* Discount Badge - Gradient border effect */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 text-white font-bold text-sm px-3 py-1.5 shadow-lg border-0 rounded-full">
            -{discountPercent}% OFF
          </Badge>
        </div>
        
        {/* Airline Badge */}
        <Badge variant="secondary" className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-foreground font-medium text-xs px-3 py-1.5 shadow-md">
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
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 rounded-full border border-blue-100 dark:border-blue-800/30">
            <span className="font-medium text-blue-600 dark:text-blue-400 truncate">
              {deal.origin.split(' (')[0]}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium text-cyan-600 dark:text-cyan-400 truncate">
              {deal.destination.split(' (')[0]}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4 text-purple-500" />
          <span>
            {format(new Date(deal.departDate), "MMM dd")} - {format(new Date(deal.returnDate), "MMM dd, yyyy")}
          </span>
        </div>
        
        {/* Price Section - Colorful highlight */}
        <div className="pt-3 border-t border-gradient-to-r from-blue-200/50 to-purple-200/50 dark:border-blue-800/30">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Starting from</span>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-3xl font-black text-gradient-vibrant">${deal.price}</span>
            <span className="text-sm text-muted-foreground line-through">${deal.originalPrice}</span>
            <span className="text-xs font-semibold text-emerald-500 dark:text-emerald-400">
              Save ${deal.originalPrice - deal.price}
            </span>
          </div>
        </div>

        <Button 
          className="w-full bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 hover:from-blue-500 hover:via-purple-400 hover:to-pink-400 text-white font-semibold shadow-lg hover:shadow-[0_10px_40px_rgba(139,92,246,0.3)] transition-all duration-300 hover:-translate-y-0.5"
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
