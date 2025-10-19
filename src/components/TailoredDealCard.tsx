import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

const TailoredDealCard = ({ deal }: TailoredDealCardProps) => {
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
      <div className="relative h-48 overflow-hidden">
        <img
          src={deal.image}
          alt={deal.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground font-semibold">
          {deal.tag}
        </Badge>
      </div>
      <CardContent className="p-5">
        <h3 className="font-bold text-lg mb-2">{deal.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {deal.description}
        </p>
        <Button 
          variant="outline" 
          className="w-full border-2 border-dashed border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all"
        >
          View More
        </Button>
      </CardContent>
    </Card>
  );
};

export default TailoredDealCard;
