import { ArrowRight, Calendar, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Deal } from "@/data/mockDeals";

interface DealCardProps {
  deal: Deal;
  onClick?: () => void;
}

const DealCard = ({ deal, onClick }: DealCardProps) => {
  const discountPercent = Math.round(
    ((deal.originalPrice - deal.price) / deal.originalPrice) * 100
  );

  const handleClick = () => {
    // Track analytics
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
      className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full group cursor-pointer animate-in fade-in hover:scale-[1.02]"
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
      <div className="relative h-48 overflow-hidden">
        <img
          src={deal.image}
          alt={`${deal.title} - Flight deal from ${deal.origin} to ${deal.destination}`}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <Badge className="absolute top-3 right-3 bg-[#FFD166] text-foreground font-bold text-sm px-3 py-1 shadow-lg">
          Save {discountPercent}%
        </Badge>
      </div>
      <CardContent className="p-5 space-y-3">
        <h3 className="font-bold text-lg line-clamp-2 group-hover:text-[#0078FF] transition-colors">
          {deal.title}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Plane className="w-4 h-4" />
          <span className="truncate">
            {deal.origin} → {deal.destination}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>
            {format(new Date(deal.departDate), "MMM dd")} - {format(new Date(deal.returnDate), "MMM dd")}
          </span>
        </div>
        
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Starting from</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#0078FF]">${deal.price}</span>
            <span className="text-sm text-muted-foreground line-through">${deal.originalPrice}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <Badge variant="outline" className="font-medium">{deal.cabinClass}</Badge>
        </div>

        <Button 
          className="w-full bg-[#0078FF] hover:bg-[#0078FF]/90 text-white font-semibold group-hover:shadow-lg transition-all"
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
