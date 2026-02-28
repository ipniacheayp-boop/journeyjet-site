import { ArrowRight, Calendar, Plane, Clock, Eye, Flame, TrendingUp, Star } from "lucide-react";
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
  index?: number;
  onQuickView?: () => void;
  onClick?: () => void;
}

const DealCardEnhanced = ({ deal, index = 0, onQuickView, onClick }: DealCardEnhancedProps) => {
  const discountPercent = Math.round(
    ((deal.originalPrice - deal.price) / deal.originalPrice) * 100
  );
  const [imgError, setImgError] = useState(false);

  // Determine ribbon type based on discount
  const getRibbon = () => {
    if (discountPercent >= 40) return { text: "Hot Deal", color: "bg-red-500", icon: Flame };
    if (discountPercent >= 25) return { text: "Popular", color: "bg-orange-500", icon: TrendingUp };
    if (discountPercent >= 15) return { text: "Best Price", color: "bg-green-500", icon: Star };
    return null;
  };
  
  const ribbon = getRibbon();

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

  // Get proper image path
  const getImageSrc = () => {
    if (imgError) return "/deal-beach.jpg";
    if (!deal.image) return "/deal-beach.jpg";
    if (deal.image.startsWith("http")) return deal.image;
    if (deal.image.startsWith("/")) return deal.image;
    return `/${deal.image}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d");
    } catch {
      return dateStr;
    }
  };

  const showTimer = discountPercent >= 40;

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
        {/* Ribbon Tag */}
        {ribbon && (
          <div className={`absolute top-4 left-0 z-20 ${ribbon.color} text-white px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 rounded-r-full shadow-lg`}>
            <ribbon.icon className="w-3.5 h-3.5" />
            {ribbon.text}
          </div>
        )}

        {/* Image Section with Overlay */}
        <div className="relative h-52 overflow-hidden">
          <motion.img
            src={getImageSrc()}
            alt={`${deal.title} - Flight deal`}
            loading="lazy"
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6 }}
            onError={() => setImgError(true)}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Discount Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 + index * 0.05, type: "spring" }}
            className="absolute top-3 right-3"
          >
            <Badge className="bg-primary text-primary-foreground font-bold text-sm px-3 py-1.5 shadow-xl border-0">
              -{discountPercent}%
            </Badge>
          </motion.div>

          {/* Airline Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-white/90 text-foreground backdrop-blur-sm px-3 py-1.5 font-semibold">
              <Plane className="w-3.5 h-3.5 mr-1.5" />
              {deal.airline}
            </Badge>
          </div>

          {/* Cabin Class */}
          <div className="absolute bottom-3 right-3">
            <Badge variant="outline" className="bg-black/50 text-white border-white/30 backdrop-blur-sm">
              {deal.cabinClass}
            </Badge>
          </div>

          {/* Flash Timer */}
          {showTimer && (
            <div className="absolute top-14 left-0 right-0 px-3">
              <div className="bg-red-500/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center justify-center gap-2 text-white text-xs font-bold shadow-lg">
                <Clock className="w-3 h-3 animate-pulse" />
                <span>Deal ends in:</span>
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
        <div className="p-5 space-y-3 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {deal.title}
          </h3>

          {/* Route */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium truncate">{deal.origin.split(' (')[0]}</span>
            <ArrowRight className="w-4 h-4 flex-shrink-0 text-primary" />
            <span className="font-medium truncate">{deal.destination.split(' (')[0]}</span>
          </div>
          
          {/* Dates */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>{formatDate(deal.departDate)} - {formatDate(deal.returnDate)}</span>
          </div>

          {/* Price Section */}
          <div className="mt-auto pt-3 space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-muted-foreground line-through">${Math.round(deal.originalPrice)}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-primary">${Math.round(deal.price)}</span>
                  <span className="text-sm text-muted-foreground">/person</span>
                </div>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
                Save ${Math.round(deal.originalPrice - deal.price)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
              >
                View Deal
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              {onQuickView && (
                <Button
                  variant="outline"
                  size="icon"
                  className="flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickView();
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
            </div>
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
