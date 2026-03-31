import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, CreditCard, AlertCircle, ShieldCheck, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface StripePaymentFormProps {
  bookingId: string;
  amount: number;
  currency: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  termsAccepted?: boolean;
}

interface BillingDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const AcceptedCards = () => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-muted-foreground">We accept:</span>
    <div className="flex gap-1.5">
      {["Visa", "Mastercard", "Amex", "Discover"].map((card) => (
        <span
          key={card}
          className="text-[10px] font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border"
        >
          {card}
        </span>
      ))}
    </div>
  </div>
);

const PaymentSuccess = ({ amount, currency }: { amount: number; currency: string }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="flex flex-col items-center justify-center py-10 gap-4"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
    >
      <CheckCircle2 className="w-16 h-16 text-green-500" />
    </motion.div>
    <h3 className="text-xl font-bold text-foreground">Payment Successful!</h3>
    <p className="text-muted-foreground text-sm">
      ${amount.toFixed(2)} {currency} has been charged successfully.
    </p>
    <p className="text-xs text-muted-foreground">Redirecting to confirmation...</p>
  </motion.div>
);

const CheckoutForm = ({
  onSuccess, onError, amount, currency, disabled, termsAccepted, billingDetails,
}: {
  onSuccess: (id: string) => void;
  onError: (err: string) => void;
  amount: number;
  currency: string;
  disabled?: boolean;
  termsAccepted?: boolean;
  billingDetails: BillingDetails;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [ready, setReady] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || processing || disabled) return;

    if (!termsAccepted) {
      toast.error("Please accept the Terms & Conditions first.");
      return;
    }

    if (!billingDetails.name.trim() || !billingDetails.email.trim()) {
      toast.error("Please fill in your billing name and email.");
      return;
    }

    setProcessing(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-confirmation`,
          payment_method_data: {
            billing_details: {
              name: billingDetails.name,
              email: billingDetails.email,
              phone: billingDetails.phone || undefined,
              address: billingDetails.address ? { line1: billingDetails.address } : undefined,
            },
          },
        },
        redirect: "if_required",
      });

      if (error) {
        onError(error.message || "Payment failed");
        toast.error(error.message || "Payment failed. Please try again.");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        setSuccess(true);
        toast.success("Payment successful!");
        setTimeout(() => onSuccess(paymentIntent.id), 2000);
      } else if (paymentIntent && paymentIntent.status === "requires_action") {
        toast.info("Additional verification required...");
      } else {
        onError("Payment was not completed. Please try again.");
      }
    } catch (err: any) {
      onError(err.message || "Payment processing error");
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return <PaymentSuccess amount={amount} currency={currency} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Card Details via Stripe Elements */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" />
          Card Details
        </Label>
        <div className="border border-border rounded-lg p-4 bg-background">
          <PaymentElement
            onReady={() => setReady(true)}
            options={{ layout: "tabs" }}
          />
        </div>
      </div>

      {ready && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Accepted cards */}
            <AcceptedCards />

            {/* Pay button */}
            <Button
              type="submit"
              size="lg"
              className="w-full gap-2 text-base font-semibold h-12"
              disabled={!stripe || !elements || processing || disabled || !termsAccepted}
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Pay Now — ${amount.toFixed(2)} {currency}
                </>
              )}
            </Button>

            {!termsAccepted && (
              <p className="text-xs text-amber-600 text-center">
                Please accept the Terms & Conditions above to enable payment.
              </p>
            )}

            {/* Security footer */}
            <div className="flex flex-col items-center gap-2 pt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span>Secure Payment powered by <strong>Stripe</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                <span>256-bit SSL encryption • PCI DSS compliant</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </form>
  );
};

const StripePaymentForm = ({
  bookingId, amount, currency, onSuccess, onError, disabled, termsAccepted = true,
}: StripePaymentFormProps) => {
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [billingDetails, setBillingDetails] = useState<BillingDetails>({
    name: "", email: "", phone: "", address: "",
  });

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: keyData, error: keyErr } = await supabase.functions.invoke("payments-stripe-publishable-key");
        if (keyErr || !keyData?.publishableKey) throw new Error("Failed to load payment configuration");
        setStripePromise(loadStripe(keyData.publishableKey));

        const { data: intentData, error: intentErr } = await supabase.functions.invoke("payments-stripe-create-intent", {
          body: { bookingId, amount },
        });
        if (intentErr || !intentData?.clientSecret) throw new Error(intentData?.error || "Failed to initialize payment");
        setClientSecret(intentData.clientSecret);
      } catch (err: any) {
        const msg = err.message || "Payment setup failed";
        setError(msg);
        onError(msg);
      } finally {
        setLoading(false);
      }
    };
    if (bookingId && amount > 0) init();
  }, [bookingId, amount]);

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 flex flex-col items-center justify-center gap-3 min-h-[200px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Setting up secure payment...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">Payment Setup Error</p>
          </div>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  if (!stripePromise || !clientSecret) return null;

  return (
    <Card className="bg-card border-border overflow-hidden">
      {/* Clickable header to expand */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full bg-primary/5 border-b border-border px-6 py-4 flex items-center justify-between hover:bg-primary/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <span className="font-semibold text-sm text-foreground block">Secure Payment</span>
            <span className="text-xs text-muted-foreground">Credit / Debit Card via Stripe</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-primary">${amount.toFixed(2)}</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <CardContent className="p-6 space-y-6">
              {/* Billing Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Billing Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="billing-name" className="text-xs text-muted-foreground">Full Name *</Label>
                    <Input
                      id="billing-name"
                      placeholder="John Doe"
                      value={billingDetails.name}
                      onChange={(e) => setBillingDetails(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="billing-email" className="text-xs text-muted-foreground">Email Address *</Label>
                    <Input
                      id="billing-email"
                      type="email"
                      placeholder="john@example.com"
                      value={billingDetails.email}
                      onChange={(e) => setBillingDetails(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="billing-phone" className="text-xs text-muted-foreground">Phone Number</Label>
                    <Input
                      id="billing-phone"
                      type="tel"
                      placeholder="+1 234 567 890"
                      value={billingDetails.phone}
                      onChange={(e) => setBillingDetails(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="billing-address" className="text-xs text-muted-foreground">Billing Address (Optional)</Label>
                    <Input
                      id="billing-address"
                      placeholder="123 Main St, City"
                      value={billingDetails.address}
                      onChange={(e) => setBillingDetails(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Stripe Elements */}
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "#2563eb",
                      borderRadius: "8px",
                      fontFamily: "inherit",
                    },
                    rules: {
                      ".Input": {
                        border: "1px solid hsl(var(--border))",
                        boxShadow: "none",
                      },
                      ".Input:focus": {
                        border: "1px solid hsl(var(--primary))",
                        boxShadow: "0 0 0 1px hsl(var(--primary))",
                      },
                    },
                  },
                }}
              >
                <CheckoutForm
                  onSuccess={onSuccess}
                  onError={onError}
                  amount={amount}
                  currency={currency}
                  disabled={disabled}
                  termsAccepted={termsAccepted}
                  billingDetails={billingDetails}
                />
              </Elements>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default StripePaymentForm;
