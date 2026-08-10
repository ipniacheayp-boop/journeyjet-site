import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Loader2, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const STEPS = ["Loading best deals", "All airports found", "Save up to 90% now"];

const AIRLINES = [
  "American Airlines",
  "Delta Air Lines",
  "United Airlines",
  "Southwest",
  "Alaska Airlines",
  "JetBlue",
];

interface SavingsRevealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ctaHref?: string;
}

export function SavingsRevealDialog({ open, onOpenChange, ctaHref = "/deals" }: SavingsRevealDialogProps) {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [stage, setStage] = useState<"loading" | "savings">("loading");

  useEffect(() => {
    if (!open) return;
    setStage("loading");
    setStepIndex(0);

    const timers: ReturnType<typeof setTimeout>[] = [
      setTimeout(() => setStepIndex(1), 700),
      setTimeout(() => setStepIndex(2), 1400),
      setTimeout(() => setStepIndex(3), 2100),
      setTimeout(() => setStage("savings"), 2600),
    ];

    return () => timers.forEach(clearTimeout);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden rounded-3xl border-slate-200 p-0 dark:border-slate-800">
        <AnimatePresence mode="wait">
          {stage === "loading" ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative bg-gradient-to-br from-primary/90 via-primary to-primary/70 px-8 py-12 text-primary-foreground"
            >
              <h2 className="font-display text-3xl font-extrabold leading-tight md:text-4xl">
                Save Up to 90% on Flights
                <span className="block text-amber-300">— Delivered to You</span>
              </h2>
              <p className="mt-3 max-w-sm text-sm text-primary-foreground/85">
                Tripile scans flight prices 24/7 and finds the best-value deals from your airport.
              </p>

              <div className="mt-7 h-1.5 w-full overflow-hidden rounded-full bg-primary-foreground/20">
                <motion.div
                  className="h-full rounded-full bg-amber-300"
                  initial={{ width: "5%" }}
                  animate={{ width: `${Math.min(stepIndex + 1, 3) * 33}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>

              <ul className="mt-6 space-y-3">
                {STEPS.map((step, i) => (
                  <li key={step} className="flex items-center gap-3 text-base font-semibold">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${
                        i < stepIndex ? "bg-emerald-400 text-slate-900" : "bg-primary-foreground/15"
                      }`}
                      aria-hidden="true"
                    >
                      {i < stepIndex ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-300" />
                      )}
                    </span>
                    <span className={i < stepIndex ? "" : "text-primary-foreground/60"}>{step}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ) : (
            <motion.div
              key="savings"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-8 py-10 text-center"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-destructive">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Live · 855 deals found this week
              </span>

              <h2 className="font-display mt-4 text-3xl font-extrabold text-foreground md:text-4xl">
                Average <span className="text-primary">$487</span> Savings Per Flight
              </h2>
              <p className="mx-auto mt-3 max-w-xs text-sm text-muted-foreground">
                Join <strong className="text-foreground">2,500+ travelers</strong> who never pay full airfare again
              </p>

              <p className="mt-6 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Deals from</p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {AIRLINES.map((airline) => (
                  <div
                    key={airline}
                    className="rounded-xl border border-slate-200 bg-card px-2 py-3 text-xs font-semibold text-foreground shadow-sm dark:border-slate-800"
                  >
                    {airline}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs italic text-muted-foreground">...and many more</p>

              <Button
                size="lg"
                className="mt-6 w-full rounded-xl text-base font-bold"
                onClick={() => {
                  onOpenChange(false);
                  navigate(ctaHref);
                }}
              >
                See How It Works
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Zap className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Takes 30 seconds · Cancel anytime
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                *Indicative savings based on tracked Tripile bookings. Fares change without notice.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

interface SavingsRevealButtonProps {
  label?: string;
  ctaHref?: string;
  className?: string;
}

export function SavingsRevealButton({
  label = "See Your Average Savings",
  ctaHref = "/deals",
  className = "",
}: SavingsRevealButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="lg"
        className={`rounded-xl font-bold ${className}`}
        onClick={() => setOpen(true)}
        aria-label="Reveal average flight savings with Tripile"
      >
        <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
        {label}
      </Button>
      <SavingsRevealDialog open={open} onOpenChange={setOpen} ctaHref={ctaHref} />
    </>
  );
}

export default SavingsRevealButton;
