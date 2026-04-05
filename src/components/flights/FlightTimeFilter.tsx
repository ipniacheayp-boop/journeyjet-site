import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sunrise, Sun, Sunset, Moon } from "lucide-react";

export type TimeSlot = "all" | "morning" | "afternoon" | "evening" | "night";

interface FlightTimeFilterProps {
  selected: TimeSlot;
  onSelect: (slot: TimeSlot) => void;
  counts: Record<TimeSlot, number>;
}

const timeSlots: { key: TimeSlot; label: string; range: string; icon: any }[] = [
  { key: "all", label: "All Times", range: "", icon: null },
  { key: "morning", label: "Morning", range: "6am – 12pm", icon: Sunrise },
  { key: "afternoon", label: "Afternoon", range: "12pm – 6pm", icon: Sun },
  { key: "evening", label: "Evening", range: "6pm – 10pm", icon: Sunset },
  { key: "night", label: "Night", range: "10pm – 6am", icon: Moon },
];

export function getTimeSlot(dateStr: string): TimeSlot {
  if (!dateStr) return "morning";
  const hour = new Date(dateStr).getHours();
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 22) return "evening";
  return "night";
}

export function FlightTimeFilter({ selected, onSelect, counts }: FlightTimeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {timeSlots.map(({ key, label, range, icon: Icon }) => (
        <Button
          key={key}
          variant={selected === key ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(key)}
          className="gap-1.5"
        >
          {Icon && <Icon className="w-4 h-4" />}
          {label}
          {range && <span className="text-xs opacity-70">({range})</span>}
          <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
            {counts[key]}
          </Badge>
        </Button>
      ))}
    </div>
  );
}

export default FlightTimeFilter;
