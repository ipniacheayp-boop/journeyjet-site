import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plane, Calendar, Mail, Phone, MessageSquare, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import type { Deal } from "@/data/mockDeals";
import { useState } from "react";
import { Link } from "react-router-dom";

interface DealModalProps {
  deal: Deal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DealModal = ({ deal, open, onOpenChange }: DealModalProps) => {
  const [showContact, setShowContact] = useState(false);

  if (!deal) return null;

  const discountPercent = Math.round(
    ((deal.originalPrice - deal.price) / deal.originalPrice) * 100
  );

  const handleGoToDeal = () => {
    // Track analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'deal_go_to', {
        deal_id: deal.id,
        deal_title: deal.title,
        deal_price: deal.price
      });
    }
  };

  const handleContactEmail = () => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'deal_contact_email', {
        deal_id: deal.id,
        deal_title: deal.title
      });
    }
  };

  const handleContactCall = () => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'deal_contact_call', {
        deal_id: deal.id,
        deal_title: deal.title
      });
    }
  };

  const handleContactChat = () => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'deal_contact_chat', {
        deal_id: deal.id,
        deal_title: deal.title
      });
    }
    // Trigger FlyBot chat
    const chatButton = document.querySelector('[aria-label="Chat with us"]') as HTMLButtonElement;
    if (chatButton) {
      chatButton.click();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{deal.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Hero Image */}
          <div className="relative h-64 -mt-6 -mx-6 overflow-hidden rounded-t-lg">
            <img
              src={deal.image}
              alt={deal.title}
              className="w-full h-full object-cover"
            />
            <Badge className="absolute top-4 right-4 bg-[#FFD166] text-foreground font-bold text-lg px-4 py-2">
              Save {discountPercent}%
            </Badge>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-foreground">{deal.title}</h2>

          {/* Route */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Plane className="w-5 h-5" />
            <span>{deal.origin} → {deal.destination}</span>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-5 h-5" />
            <span>
              {format(new Date(deal.departDate), "MMM dd, yyyy")} - {format(new Date(deal.returnDate), "MMM dd, yyyy")}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-sm text-muted-foreground">Starting from</span>
            <span className="text-3xl font-bold text-[#0078FF]">${deal.price}</span>
            <span className="text-lg text-muted-foreground line-through">${deal.originalPrice}</span>
          </div>

          {/* Class */}
          <div>
            <Badge variant="outline" className="font-medium">
              {deal.cabinClass}
            </Badge>
          </div>

          <Separator />

          {/* Primary Actions */}
          <div className="space-y-3">
            <Link to={deal.link || "/booking"} onClick={handleGoToDeal}>
              <Button 
                size="lg" 
                className="w-full bg-[#0078FF] hover:bg-[#0078FF]/90 text-white font-semibold"
              >
                Go to Deal <ExternalLink className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => setShowContact(!showContact)}
            >
              Connect to an Agent
            </Button>
          </div>

          {/* Contact Panel */}
          {showContact && (
            <div className="bg-muted/50 rounded-lg p-6 space-y-4 animate-in slide-in-from-top-2">
              <h3 className="font-semibold text-lg">Contact Our Travel Agents</h3>
              
              <div className="space-y-3">
                {/* Email */}
                <a
                  href="mailto:help@chyeap.com"
                  onClick={handleContactEmail}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-background transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Email Support</div>
                    <div className="text-sm text-muted-foreground">help@chyeap.com</div>
                  </div>
                </a>

                {/* Phone */}
                <Link
                  to="/contact-us"
                  onClick={handleContactCall}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-background transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Call Us</div>
                    <div className="text-sm text-muted-foreground">1-800-123-4567</div>
                  </div>
                </Link>

                {/* Live Chat */}
                <button
                  onClick={handleContactChat}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-background transition-colors group w-full text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Live Chat</div>
                    <div className="text-sm text-muted-foreground">Chat with us instantly</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DealModal;
