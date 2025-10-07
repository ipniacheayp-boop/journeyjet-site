import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

export interface Deal {
  id: string;
  title: string;
  image: string;
  origin: string;
  destination: string;
  airline: string;
  departDate: string;
  returnDate: string;
  price: number;
  originalPrice?: number;
  cabinClass: string;
}

interface DealCardProps {
  deal: Deal;
}

const DealCard = ({ deal }: DealCardProps) => {
  const discount = deal.originalPrice
    ? Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100)
    : 0;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
      <div className="relative h-48 overflow-hidden">
        <img
          src={deal.image}
          alt={deal.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-bold">
            Save {discount}%
          </div>
        )}
      </div>
      <CardContent className="p-5">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{deal.title}</h3>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <MapPin className="w-4 h-4" />
          <span>
            {deal.origin} <ArrowRight className="inline w-3 h-3" /> {deal.destination}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Calendar className="w-4 h-4" />
          <span>
            {new Date(deal.departDate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}{' '}
            - {new Date(deal.returnDate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Starting from</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">${deal.price}</span>
              {deal.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ${deal.originalPrice}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{deal.cabinClass}</p>
          </div>
        </div>

        <Link to={`/deals/${deal.id}`}>
          <Button className="w-full gap-2">
            View Deal <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default DealCard;
