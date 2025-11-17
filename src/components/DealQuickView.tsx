import { X, Calendar, Plane, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface DealQuickViewProps {
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
  } | null;
  open: boolean;
  onClose: () => void;
  onBook: () => void;
}

const DealQuickView = ({ deal, open, onClose, onBook }: DealQuickViewProps) => {
  if (!deal) return null;

  const discountPercent = Math.round(
    ((deal.originalPrice - deal.price) / deal.originalPrice) * 100
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-2">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Hero Image */}
              <div className="relative h-72 overflow-hidden">
                <img
                  src={deal.image}
                  alt={deal.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Discount Badge */}
                <div className="absolute top-4 right-4">
                  <Badge className="bg-[#FFD166] text-black font-bold text-lg px-4 py-2 shadow-xl">
                    SAVE {discountPercent}%
                  </Badge>
                </div>

                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 left-4 bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm"
                  onClick={onClose}
                >
                  <X className="w-5 h-5" />
                </Button>

                {/* Route Info Overlay */}
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h2 className="text-3xl font-black mb-2">
                    {deal.origin} → {deal.destination}
                  </h2>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="bg-white/20 backdrop-blur-md border-white/30">
                      <Plane className="w-3 h-3 mr-1" />
                      {deal.airline}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 backdrop-blur-md border-white/30">
                      {deal.cabinClass}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6">
                {/* Dates */}
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">
                    {format(new Date(deal.departDate), "EEEE, MMMM dd, yyyy")} - {format(new Date(deal.returnDate), "EEEE, MMMM dd, yyyy")}
                  </span>
                </div>

                {/* Price Section */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground font-medium">Total Price (Starting from)</span>
                    <div className="flex items-baseline gap-4">
                      <span className="text-5xl font-black bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        ${deal.price}
                      </span>
                      <div className="space-y-1">
                        <span className="text-lg text-muted-foreground line-through block">${deal.originalPrice}</span>
                        <Badge className="bg-green-500 text-white">You save ${deal.originalPrice - deal.price}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">*Price per person, taxes and fees included</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Departure</span>
                    <p className="font-semibold">{deal.origin}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Destination</span>
                    <p className="font-semibold">{deal.destination}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Airline</span>
                    <p className="font-semibold">{deal.airline}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Class</span>
                    <p className="font-semibold">{deal.cabinClass}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-6 shadow-xl hover:shadow-2xl transition-all group"
                    onClick={onBook}
                  >
                    Book This Deal
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    variant="outline"
                    className="px-6 py-6"
                    onClick={onClose}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default DealQuickView;
