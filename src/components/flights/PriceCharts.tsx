import { Link } from "react-router-dom";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";

interface PriceChartsProps {
  cityName: string;
  dayData: { day: string; price: number }[];
  monthData: { month: string; price: number }[];
  cheapestDay: string;
  cheapestMonth: string;
  expensiveMonth: string;
}

const PriceCharts = ({
  cityName, dayData, monthData, cheapestDay, cheapestMonth, expensiveMonth,
}: PriceChartsProps) => {
  return (
    <section className="py-10 border-t border-border">
      <h2 className="text-2xl font-bold text-foreground mb-8">
        When's a Good Time to Book a Flight to {cityName}?
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Day of Week Chart */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            What's the Cheapest Day of the Week to Fly to {cityName}?
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            If you're looking for a flight deal for {cityName}, it's recommended to look for
            departures on <strong className="text-foreground">{cheapestDay}</strong>. Sunday tends to have higher prices.
          </p>

          <div className="bg-muted/30 rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-4 h-4 rounded-sm bg-slate-800" />
              <span className="text-xs text-muted-foreground font-medium">Day Price</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dayData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={['dataMin - 20', 'dataMax + 10']} />
                <Tooltip
                  formatter={(value: number) => [`$${value}`, "Avg Price"]}
                  contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid hsl(var(--border))' }}
                />
                <Bar dataKey="price" fill="hsl(220 30% 20%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center mt-4">
            <Link
              to="/"
              className="px-5 py-2 rounded-full bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              Search Cheap Flights
            </Link>
          </div>
        </div>

        {/* Monthly Chart */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            What Is the Cheapest Month to Fly to {cityName}?
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Historically, <strong className="text-foreground">{cheapestMonth}</strong> has been the cheapest month for flights to {cityName}. On
            the other hand, the most expensive months tend to be <strong className="text-foreground">{expensiveMonth}</strong>.
          </p>

          <div className="bg-muted/30 rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-4 h-4 rounded-sm border-2 border-slate-800 bg-slate-100" />
              <span className="text-xs text-muted-foreground font-medium">Month Price</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={['dataMin - 30', 'dataMax + 20']} />
                <Tooltip
                  formatter={(value: number) => [`$${value}`, "Avg Price"]}
                  contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid hsl(var(--border))' }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(220 30% 20%)"
                  strokeWidth={2.5}
                  fill="hsl(220 30% 20% / 0.08)"
                  dot={{ r: 4, fill: "hsl(220 30% 20%)" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center mt-4">
            <Link
              to="/"
              className="px-5 py-2 rounded-full bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              Search Cheap Flights
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PriceCharts;
