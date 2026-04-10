import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Star, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Destination } from "@/data/destinations";

interface DestinationCardProps {
  destination: Destination;
}

export const DestinationCard = ({ destination }: DestinationCardProps) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);

  const handlePlanTrip = () => {
    // Navigate to trip planner and pre-fill destination
    // TripPlanner needs to handle URL search params if provided
    navigate(`/trip-planner?dest=${encodeURIComponent(destination.name)}`);
  };

  return (
    <div className="group relative isolate bg-card rounded-[2rem] border border-border/60 hover:border-primary/40 overflow-hidden shadow-md hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] hover:-translate-y-1.5 transition-all duration-400 flex flex-col h-full w-[280px] sm:w-full max-w-sm shrink-0">
      
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-[calc(2rem-1px)] bg-muted shrink-0">
        <img
          src={destination.image}
          alt={destination.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80" />
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <Badge className="bg-white/95 text-slate-900 hover:bg-white border-none shadow-lg backdrop-blur-md rounded-xl py-1 px-3 text-xs font-bold leading-tight transform -translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            {destination.why_visit}
          </Badge>
          <button 
            type="button" 
            className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 shadow-sm ${isLiked ? ' text-rose-500' : ' text-white'}`}
            aria-label="Save destination"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
          </button>
        </div>

        {/* Bottom Image Stats */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-white">
          <div className="flex bg-black/30 backdrop-blur-md rounded-full px-2.5 py-1 items-center gap-1.5 text-xs font-semibold">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span>{destination.rating.toFixed(1)}</span>
          </div>
          <div className="flex bg-black/30 backdrop-blur-md rounded-full px-2.5 py-1 items-center gap-1.5 text-xs font-semibold">
            <Users className="w-3.5 h-3.5 opacity-90" />
            <span>{destination.visitors_per_year}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1.5 gap-4">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-foreground leading-tight line-clamp-1">{destination.name}</h3>
            <p className="text-sm font-medium text-muted-foreground">{destination.country}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm text-muted-foreground font-medium">From</p>
            <p className="text-lg font-bold text-primary leading-tight">${(destination.price_min).toLocaleString()}</p>
          </div>
        </div>
        
        <p className="text-sm text-foreground/80 line-clamp-2 mt-3 leading-relaxed mb-6">
          {destination.description}
        </p>

        {/* Action Button */}
        <div className="mt-auto">
          <Button 
            onClick={handlePlanTrip}
            className="w-full rounded-2xl bg-primary/10 text-primary hover:bg-primary hover:text-white font-semibold flex items-center justify-center gap-2 transition-all h-12"
          >
            Plan Trip
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
