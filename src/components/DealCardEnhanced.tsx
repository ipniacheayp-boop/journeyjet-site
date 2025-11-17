import { ArrowRight, Calendar, Plane, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface DealCardEnhancedProps {
  deal: {
    id: string;
    title: string;
    image: string;
    origin: string;
    destination: string;
    airline: string;
    departDate: string;
    returnDate: string;
    price: number;
    originalPrice: number;
    cabinClass: string;
    link?: string;
  };
  index: number;
  onQuickView?: () => void;
  onClick?: () => void;
}

const DealCardEnhanced = ({ deal, index, onQuickView, onClick }: DealCardEnhancedProps) => {
  const discountPercent = Math.round(
    ((deal.originalPrice - deal.price) / deal.originalPrice) * 100
  );

  // Flash deal timer (client-side only, decorative)
  const [timeLeft, setTimeLeft] = useState({
    hours: Math.floor(Math.random() * 12) + 1,
    minutes: Math.floor(Math.random() * 60),
    seconds: Math.floor(Math.random() * 60)
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          // Reset to new random time
          hours = Math.floor(Math.random() * 12) + 1;
          minutes = Math.floor(Math.random() * 60);
          seconds = Math.floor(Math.random() * 60);
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  const showTimer = discountPercent >= 40; // Show timer for big discounts

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group h-full"
    >
      <div 
        className="relative h-full overflow-hidden rounded-2xl bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl border border-border/50 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {/* Image Section with Overlay */}
        <div className="relative h-56 overflow-hidden">
          <motion.img
            src={deal.image}
            alt={`${deal.title} - Flight deal`}
            loading="lazy"
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6 }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Discount Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
            className="absolute top-3 right-3"
          >
            <Badge className="bg-[#FFD166] text-black font-bold text-sm px-3 py-1.5 shadow-xl border-0">
              <span className="text-xs">SAVE</span> {discountPercent}%
            </Badge>
          </motion.div>

          {/* Airline Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-md border border-border/50 font-semibold">
              <Plane className="w-3 h-3 mr-1" />
              {deal.airline}
            </Badge>
          </div>

          {/* Flash Timer */}
          {showTimer && (
            <div className="absolute bottom-3 left-3 right-3">
              <div className="bg-red-500/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 text-white text-xs font-bold shadow-lg">
                <Clock className="w-3 h-3 animate-pulse" />
                <span>🔥 Deal ends in:</span>
                <span className="font-mono">
                  {String(timeLeft.hours).padStart(2, '0')}:
                  {String(timeLeft.minutes).padStart(2, '0')}:
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-5 space-y-4">
          {/* Route */}
          <div className="space-y-2">
            <h3 className="font-bold text-xl line-clamp-1 group-hover:text-primary transition-colors">
              {deal.origin} → {deal.destination}
            </h3>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="line-clamp-1">
                {format(new Date(deal.departDate), "MMM dd")} - {format(new Date(deal.returnDate), "MMM dd, yyyy")}
              </span>
            </div>
          </div>

          {/* Price Section */}
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Starting from</span>
            <div className="flex items-baseline gap-3">
              <motion.span 
                className="text-3xl font-black bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
              >
                ${deal.price}
              </motion.span>
              <span className="text-sm text-muted-foreground line-through">${deal.originalPrice}</span>
            </div>
          </div>

          {/* Class Badge */}
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className="font-medium bg-background/50 hover:bg-background transition-colors"
            >
              {deal.cabinClass}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all group/btn"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              Book Now 
              <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="backdrop-blur-sm hover:bg-background/80"
              onClick={(e) => {
                e.stopPropagation();
                onQuickView?.();
              }}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Decorative Glow Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-primary/5 rounded-2xl" />
        </div>
      </div>
    </motion.div>
  );
};

export default DealCardEnhanced;
