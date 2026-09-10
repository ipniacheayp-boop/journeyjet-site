import { AlertTriangle, Ban } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  RESTRICTED_DESTINATIONS,
  COMPLIANCE_COPY,
} from "@/config/sanctionsCompliance";

/**
 * ⚠️ STRIPE SANCTIONS COMPLIANCE — shared, reusable warning card.
 *
 * Renders a high-visibility (red/orange bordered) notice for destinations
 * that cannot be booked due to international sanctions. Used on hotel
 * detail/listing surfaces and on the checkout page. Designed to be clearly
 * legible in compliance screenshots.
 */
interface RestrictedDestinationNoticeProps {
  /** Optional matched jurisdiction name (e.g. "Cuba") for a tailored line. */
  destination?: string | null;
  /** "card" = full checkout card with the restricted list; "inline" = compact banner. */
  variant?: "card" | "inline";
  /** Show the bulleted list of restricted destinations (card variant). */
  showList?: boolean;
  className?: string;
}

export function RestrictedDestinationNotice({
  destination,
  variant = "card",
  showList = true,
  className,
}: RestrictedDestinationNoticeProps) {
  if (variant === "inline") {
    return (
      <div
        className={cn(
          "rounded-lg border-2 border-red-500/60 bg-red-50 dark:bg-red-950/30 p-4 flex items-start gap-3",
          className,
        )}
        role="alert"
      >
        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-semibold text-red-700 dark:text-red-300">
            {COMPLIANCE_COPY.title}
          </p>
          <p className="text-red-700/90 dark:text-red-300/90 mt-0.5">
            {COMPLIANCE_COPY.shortNotice}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "border-2 border-red-500/70 bg-red-50/80 dark:bg-red-950/30 shadow-md",
        className,
      )}
      role="alert"
    >
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
            <Ban className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-700 dark:text-red-300 flex items-center gap-2">
              <span aria-hidden>{COMPLIANCE_COPY.emoji}</span> {COMPLIANCE_COPY.title}
            </h3>
            {destination && (
              <p className="text-sm font-medium text-red-700/90 dark:text-red-300/90">
                Destination flagged: {destination}
              </p>
            )}
          </div>
        </div>

        <p className="text-sm text-red-800/90 dark:text-red-200/90">
          {COMPLIANCE_COPY.checkoutMessage}
        </p>

        {showList && (
          <div className="rounded-lg border border-red-400/50 bg-white/60 dark:bg-red-950/40 p-4">
            <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">
              Restricted destinations include:
            </p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-red-800/90 dark:text-red-200/90">
              {RESTRICTED_DESTINATIONS.map((d) => (
                <li key={d} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-sm font-medium text-red-700 dark:text-red-300">
          {COMPLIANCE_COPY.paymentDisabledLine}
        </p>
      </CardContent>
    </Card>
  );
}

export default RestrictedDestinationNotice;
