import { memo, useState } from "react";
import { ArrowRight, Calendar, Plane, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { getDestinationImage } from "@/data/destinationImages";
import type { DuffelDeal } from "@/services/duffelDeals";

interface DuffelDealCardProps {
  deal: DuffelDeal;
  index?: number;
  onSelect: (deal: DuffelDeal) => void;
}

const formatMoney = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Math.ceil(amount));
  } catch {
    return `${Math.ceil(amount)} ${currency}`;
  }
};

const formatDate = (value: string | null) => {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatDuration = (minutes: number | null) => {
  if (!minutes || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const DuffelDealCard = ({ deal, index = 0, onSelect }: DuffelDealCardProps) => {
  const [logoFailed, setLogoFailed] = useState(false);

  const image = getDestinationImage(deal.destination);
  const depart = formatDate(deal.departureDate);
  const back = formatDate(deal.returnDate);
  const duration = formatDuration(deal.durationMinutes);
  // Savings are shown only when the backend derived them from other real
  // Duffel offers on the same route.
  const hasSavings = deal.savings !== null && deal.savings > 0 && deal.savingsPercent !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.04 }}
      className="group h-full"
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-lg transition-all duration-300 hover:shadow-2xl">
        <div className="relative h-44 overflow-hidden bg-muted">
          <img
            src={image}
            alt={`${deal.destCity} destination`}
            loading="lazy"
            decoding="async"
            width={800}
            height={600}
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {deal.isCheapestOnRoute && (
            <Badge className="absolute left-3 top-3 border-0 bg-primary text-primary-foreground font-semibold shadow-lg">
              Best Price
            </Badge>
          )}
          {deal.stops === 0 && (
            <Badge variant="secondary" className="absolute right-3 top-3 bg-background/90 font-semibold">
              Nonstop
            </Badge>
          )}

          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            {deal.airlineLogo && !logoFailed ? (
              <img
                src={deal.airlineLogo}
                alt={deal.airline ? `${deal.airline} logo` : "Airline logo"}
                loading="lazy"
                width={24}
                height={24}
                className="h-6 w-6 rounded bg-white p-0.5"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <span className="flex h-6 w-6 items-center justify-center rounded bg-white/90 text-foreground">
                <Plane className="h-3.5 w-3.5" />
              </span>
            )}
            {deal.airline && (
              <span className="rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold">
                {deal.airline}
              </span>
            )}

          </div>

          {deal.cabinClass && (
            <Badge
              variant="outline"
              className="absolute bottom-3 right-3 border-white/30 bg-black/50 text-white capitalize"
            >
              {deal.cabinClass.replace(/_/g, " ")}
            </Badge>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3 className="line-clamp-1 text-lg font-bold">
            {deal.originCity} to {deal.destCity}
          </h3>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">{deal.origin}</span>
            <ArrowRight className="h-4 w-4 flex-shrink-0 text-primary" />
            <span className="font-medium">{deal.destination}</span>
            <span className="ml-auto text-xs">
              {deal.stops === 0 ? "Nonstop" : `${deal.stops} stop${deal.stops > 1 ? "s" : ""}`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {depart && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {back ? `${depart} – ${back}` : depart}
              </span>
            )}
            {duration && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {duration}
              </span>
            )}
          </div>

          {deal.flightNumber && (
            <p className="text-xs text-muted-foreground">Flight {deal.flightNumber}</p>
          )}

          <div className="mt-auto space-y-3 pt-2">
            <div className="flex items-end justify-between gap-2">
              <div>
                {hasSavings && deal.referencePrice !== null && (
                  <p className="text-xs text-muted-foreground line-through">
                    {formatMoney(deal.referencePrice, deal.currency)}
                  </p>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-primary">
                    {formatMoney(deal.price, deal.currency)}
                  </span>
                  <span className="text-sm text-muted-foreground">/person</span>
                </div>
              </div>
              {hasSavings ? (
                <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                  Save {formatMoney(deal.savings!, deal.currency)}
                </p>
              ) : (
                <p className="text-xs font-semibold text-muted-foreground">Lowest available fare</p>
              )}
            </div>

            <Button className="w-full font-semibold" onClick={() => onSelect(deal)}>
              View Deal
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default memo(DuffelDealCard);
