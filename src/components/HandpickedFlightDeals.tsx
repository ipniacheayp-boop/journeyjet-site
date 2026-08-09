import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftRight, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FlightDeal {
  from: string;
  to: string;
  airline: string;
  cabin: string;
  depart: string;
  ret: string;
  price: number;
  image: string;
}

const deals: FlightDeal[] = [
  {
    from: "New York",
    to: "Miami",
    airline: "American Airlines",
    cabin: "Economy Class",
    depart: "Aug 21, 2026",
    ret: "Aug 25, 2026",
    price: 249,
    image: "https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?auto=format&fit=crop&w=800&q=70",
  },
  {
    from: "San Francisco",
    to: "Las Vegas",
    airline: "Frontier",
    cabin: "Economy Class",
    depart: "Aug 27, 2026",
    ret: "Aug 28, 2026",
    price: 229,
    image: "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?auto=format&fit=crop&w=800&q=70",
  },
  {
    from: "Chicago",
    to: "Denver",
    airline: "United Airlines",
    cabin: "Economy Class",
    depart: "Aug 25, 2026",
    ret: "Aug 27, 2026",
    price: 259,
    image: "https://images.unsplash.com/photo-1546156929-a4c0ac411f47?auto=format&fit=crop&w=800&q=70",
  },
  {
    from: "Dallas",
    to: "Los Angeles",
    airline: "Delta Air Lines",
    cabin: "Economy Class",
    depart: "Aug 29, 2026",
    ret: "Sep 2, 2026",
    price: 279,
    image: "https://images.unsplash.com/photo-1534190239940-9ba8944ea261?auto=format&fit=crop&w=800&q=70",
  },
  {
    from: "Atlanta",
    to: "Orlando",
    airline: "Southwest",
    cabin: "Economy Class",
    depart: "Sep 4, 2026",
    ret: "Sep 8, 2026",
    price: 239,
    image: "https://images.unsplash.com/photo-1597466599360-3b9775841aec?auto=format&fit=crop&w=800&q=70",
  },
  {
    from: "Seattle",
    to: "Phoenix",
    airline: "Alaska Airlines",
    cabin: "Economy Class",
    depart: "Sep 10, 2026",
    ret: "Sep 14, 2026",
    price: 269,
    image: "https://images.unsplash.com/photo-1558645836-e44122a743ee?auto=format&fit=crop&w=800&q=70",
  },
];

const HandpickedFlightDeals = () => {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section aria-labelledby="handpicked-deals-heading" className="py-10 bg-slate-50/80 dark:bg-slate-900/30">
      <div className="container mx-auto px-4">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 md:p-10 shadow-sm">
          <div className="text-center">
            <span className="inline-block rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white">
              Deals of the Week
            </span>
            <h2
              id="handpicked-deals-heading"
              className="font-display mt-4 text-2xl font-extrabold uppercase tracking-tight text-foreground md:text-4xl"
            >
              Handpicked Top Flight Deals
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-sm text-muted-foreground md:text-base">
              Get access to unbeatable flight offers tailored to your travel needs. Explore and book the lowest fares on
              top airlines.
            </p>
          </div>

          <div className="relative mt-8">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="Show previous flight deals"
              className="absolute -left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-foreground shadow-md transition hover:bg-slate-50 md:flex dark:border-slate-700 dark:bg-slate-900"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="Show next flight deals"
              className="absolute -right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-foreground shadow-md transition hover:bg-slate-50 md:flex dark:border-slate-700 dark:bg-slate-900"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>

            <div
              ref={trackRef}
              className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {deals.map((deal) => (
                <article
                  key={`${deal.from}-${deal.to}`}
                  className="min-w-[280px] max-w-[320px] flex-1 shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
                >
                  <img
                    src={deal.image}
                    alt={`Flights from ${deal.from} to ${deal.to}`}
                    loading="lazy"
                    decoding="async"
                    className="h-44 w-full object-cover"
                  />
                  <div className="p-5">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                      <span>{deal.from}</span>
                      <ArrowLeftRight className="h-4 w-4 text-primary" aria-hidden="true" />
                      <span>{deal.to}</span>
                    </h3>

                    <p className="mt-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <span className="text-foreground">{deal.airline}</span>
                      <span className="text-primary" aria-hidden="true">•</span>
                      <span>{deal.cabin}</span>
                    </p>

                    <p className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-foreground dark:bg-slate-900">
                      <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      {deal.depart} – {deal.ret}
                    </p>

                    <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Starting From</p>
                        <p className="text-2xl font-extrabold text-emerald-600">${Math.ceil(deal.price)}</p>
                        <p className="text-xs text-muted-foreground">Per Person</p>
                      </div>
                      <Button asChild className="rounded-xl">
                        <Link to="/deals" title={`Book ${deal.from} to ${deal.to} flight deal`}>
                          Book Now
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-1 text-xs leading-relaxed text-muted-foreground md:text-sm">
            <p className="font-bold text-foreground">*Note: All fares are quoted in USD.</p>
            <p>
              The fares mentioned above are for flight tickets and inclusive of fuel surcharges,{" "}
              <Link to="/taxes-fees" className="underline hover:text-primary">
                service fee and taxes
              </Link>
              . Based on historical data, these fares are subject to change without prior notice and cannot be
              guaranteed at the time of booking. Kindly go through our{" "}
              <Link to="/terms" className="underline hover:text-primary">
                terms and conditions
              </Link>{" "}
              before booking.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HandpickedFlightDeals;
