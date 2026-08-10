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
      <DialogContent className="h-screen w-screen max-w-none translate-x-0 translate-y-0 left-0 top-0 rounded-none border-0 p-0 sm:rounded-none overflow-hidden">
        <AnimatePresence mode="wait">
          {stage === "loading" ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary/95 via-primary to-primary/60 px-6 py-16 text-primary-foreground"
            >
              {/* ambient glow */}
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-amber-300/25 blur-3xl"
                animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.6, 0.35] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-40 -right-24 h-[32rem] w-[32rem] rounded-full bg-primary-foreground/15 blur-3xl"
                animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.55, 0.3] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="relative z-10 w-full max-w-2xl text-center">
                <motion.span
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
                  Scanning live fares
                </motion.span>

                <motion.h2
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-display mt-6 text-4xl font-extrabold leading-[1.05] sm:text-5xl md:text-6xl"
                >
                  Save Up to 90% on Flights
                  <span className="mt-2 block text-amber-300">— Delivered to You</span>
                </motion.h2>
                <p className="mx-auto mt-5 max-w-lg text-base text-primary-foreground/85 sm:text-lg">
                  Tripile scans flight prices 24/7 and finds the best-value deals from your airport.
                </p>

                <div className="mx-auto mt-10 h-2 w-full max-w-md overflow-hidden rounded-full bg-primary-foreground/20">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-amber-200 to-amber-400"
                    initial={{ width: "5%" }}
                    animate={{ width: `${Math.min(stepIndex + 1, 3) * 33}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>

                <ul className="mx-auto mt-8 max-w-sm space-y-4 text-left">
                  {STEPS.map((step, i) => (
                    <motion.li
                      key={step}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 * i }}
                      className="flex items-center gap-3 text-lg font-semibold"
                    >
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full ${
                          i < stepIndex ? "bg-emerald-400 text-slate-900" : "bg-primary-foreground/15"
                        }`}
                        aria-hidden="true"
                      >
                        {i < stepIndex ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
                        )}
                      </span>
                      <span className={i < stepIndex ? "" : "text-primary-foreground/60"}>{step}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="savings"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative flex h-full w-full flex-col items-center justify-center overflow-y-auto bg-background px-6 py-16 text-center"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/15 to-transparent"
              />
              <div className="relative z-10 w-full max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-destructive">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  Live · 855 deals found this week
                </span>

                <motion.h2
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-display mt-6 text-4xl font-extrabold text-foreground sm:text-5xl md:text-6xl"
                >
                  Average <span className="text-primary">$487</span> Savings Per Flight
                </motion.h2>
                <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground sm:text-lg">
                  Join <strong className="text-foreground">2,500+ travelers</strong> who never pay full airfare again
                </p>

                <p className="mt-10 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Deals from</p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {AIRLINES.map((airline, i) => (
                    <motion.div
                      key={airline}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className="rounded-2xl border border-border bg-card px-3 py-4 text-sm font-semibold text-foreground shadow-sm"
                    >
                      {airline}
                    </motion.div>
                  ))}
                </div>
                <p className="mt-3 text-xs italic text-muted-foreground">...and many more</p>

                <Button
                  size="lg"
                  className="mt-8 w-full max-w-md rounded-2xl py-6 text-base font-bold"
                  onClick={() => {
                    onOpenChange(false);
                    navigate(ctaHref);
                  }}
                >
                  See How It Works
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
                <p className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Zap className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  Takes 30 seconds · Cancel anytime
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  *Indicative savings based on tracked Tripile bookings. Fares change without notice.
                </p>
              </div>
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
