import { ArrowRight, Calendar, Plane, Sparkles } from "lucide-react";
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
    if (discountPercent >= 40) return { label: "HOT DEAL", class: "ribbon-hot" };
    if (discountPercent >= 25) return { label: "POPULAR", class: "ribbon-popular" };
    if (deal.price < 300) return { label: "BEST PRICE", class: "ribbon-best" };
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

  return (
    <Card 
      className="overflow-hidden h-full group cursor-pointer card-premium border-0 bg-card"
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
          src={deal.image}
          alt={`${deal.title} - Flight deal from ${deal.origin} to ${deal.destination}`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Ribbon Tag */}
        {ribbon && (
          <div className={`ribbon ${ribbon.class}`}>
            <Sparkles className="w-3 h-3 inline mr-1" />
            {ribbon.label}
          </div>
        )}
        
        {/* Discount Badge */}
        <Badge className="absolute top-3 left-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-sm px-3 py-1.5 shadow-lg border-0 rounded-full">
          Save {discountPercent}%
        </Badge>
        
        {/* Airline Badge */}
        <Badge variant="secondary" className="absolute bottom-3 left-3 glass text-foreground font-medium text-xs">
          <Plane className="w-3 h-3 mr-1" />
          {deal.airline || "Multiple Airlines"}
        </Badge>
      </div>
      
      <CardContent className="p-5 space-y-4">
        <h3 className="font-display font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {deal.title}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-full">
            <Plane className="w-3.5 h-3.5" />
            <span className="truncate font-medium">
              {deal.origin} → {deal.destination}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>
            {format(new Date(deal.departDate), "MMM dd")} - {format(new Date(deal.returnDate), "MMM dd, yyyy")}
          </span>
        </div>
        
        {/* Price Section */}
        <div className="pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Starting from</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-primary">${deal.price}</span>
            <span className="text-sm text-muted-foreground line-through">${deal.originalPrice}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <Badge variant="outline" className="font-medium rounded-full border-primary/30 text-primary">
            {deal.cabinClass}
          </Badge>
        </div>

        <Button 
          className="w-full btn-premium text-sm"
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