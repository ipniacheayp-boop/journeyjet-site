import FlightCardSimple, { NormalizedFlight } from "./FlightCardSimple";

interface DealsGridProps {
  flights: NormalizedFlight[];
  title?: string;
}

const DealsGrid = ({ flights, title = "Top Deals" }: DealsGridProps) => {
  if (!flights.length) return null;

  const cheapest = flights.reduce((min, f) => (f.price < min.price ? f : min), flights[0]);

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="space-y-3">
        {flights.map((flight) => (
          <FlightCardSimple
            key={flight.id}
            flight={flight}
            isCheapest={flight.id === cheapest.id}
          />
        ))}
      </div>
    </section>
  );
};

export default DealsGrid;
