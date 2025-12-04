import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Flame, Star, Sparkles, Zap, Users, Plane } from "lucide-react";
import { motion } from "framer-motion";

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

const getTagConfig = (tag: string) => {
  switch (tag) {
    case "HOT DEAL":
      return { gradient: "from-red-500 via-rose-500 to-orange-500", icon: Flame };
    case "BUDGET":
      return { gradient: "from-emerald-500 via-teal-500 to-cyan-500", icon: Star };
    case "SENIOR":
      return { gradient: "from-purple-500 via-violet-500 to-pink-500", icon: Users };
    case "PREMIUM":
      return { gradient: "from-amber-500 via-yellow-500 to-orange-400", icon: Sparkles };
    case "STUDENT":
      return { gradient: "from-blue-500 via-indigo-500 to-purple-500", icon: Zap };
    case "POPULAR":
      return { gradient: "from-cyan-500 via-blue-500 to-purple-500", icon: Plane };
    default:
      return { gradient: "from-blue-500 to-cyan-500", icon: Star };
  }
};

const TailoredDealCard = ({ deal }: TailoredDealCardProps) => {
  const tagConfig = getTagConfig(deal.tag);
  const TagIcon = tagConfig.icon;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="group overflow-hidden hover:shadow-colorful-lg transition-all duration-500 h-full border-0 card-colorful">
        <div className="relative h-48 overflow-hidden">
          <img
            src={deal.image}
            alt={deal.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Colorful tag badge */}
          <Badge className={`absolute top-3 left-3 bg-gradient-to-r ${tagConfig.gradient} text-white font-bold text-xs px-3 py-1.5 shadow-lg border-0 flex items-center gap-1.5`}>
            <TagIcon className="w-3.5 h-3.5" />
            {deal.tag}
          </Badge>
        </div>
        <CardContent className="p-5 space-y-3">
          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
            {deal.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {deal.description}
          </p>
          <Button 
            variant="outline" 
            className={`w-full border-2 bg-gradient-to-r ${tagConfig.gradient} bg-clip-text text-transparent border-transparent bg-origin-border hover:text-white relative overflow-hidden group/btn`}
            style={{
              backgroundImage: `linear-gradient(white, white), linear-gradient(to right, var(--tw-gradient-stops))`,
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
            }}
          >
            <span className={`absolute inset-0 bg-gradient-to-r ${tagConfig.gradient} opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300`} />
            <span className="relative z-10 flex items-center justify-center gap-2 group-hover/btn:text-white transition-colors">
              View More
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </span>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TailoredDealCard;
