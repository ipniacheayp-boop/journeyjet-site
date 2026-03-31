import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, CreditCard, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StripePaymentFormProps {
  bookingId: string;
  amount: number;
  currency: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

const CheckoutForm = ({ onSuccess, onError, amount, currency, disabled }: {
  onSuccess: (id: string) => void;
  onError: (err: string) => void;
  amount: number;
  currency: string;
  disabled?: boolean;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [ready, setReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || processing || disabled) return;

    setProcessing(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-confirmation`,
        },
        redirect: "if_required",
      });

      if (error) {
        onError(error.message || "Payment failed");
        toast.error(error.message || "Payment failed. Please try again.");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onSuccess(paymentIntent.id);
        toast.success("Payment successful!");
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement
        onReady={() => setReady(true)}
        options={{
          layout: "tabs",
        }}
      />

      {ready && (
        <div className="pt-2">
          <Button
            type="submit"
            size="lg"
            className="w-full gap-2 text-base font-semibold"
            disabled={!stripe || !elements || processing || disabled}
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Pay ${amount.toFixed(2)} {currency}
              </>
            )}
          </Button>
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span>Secured by Stripe • 256-bit SSL encryption</span>
          </div>
        </div>
      )}
    </form>
  );
};

const StripePaymentForm = ({ bookingId, amount, currency, onSuccess, onError, disabled }: StripePaymentFormProps) => {
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Get publishable key
        const { data: keyData, error: keyErr } = await supabase.functions.invoke("payments-stripe-publishable-key");
        if (keyErr || !keyData?.publishableKey) {
          throw new Error("Failed to load payment configuration");
        }
        setStripePromise(loadStripe(keyData.publishableKey));

        // 2. Create payment intent
        const { data: intentData, error: intentErr } = await supabase.functions.invoke("payments-stripe-create-intent", {
          body: { bookingId, amount },
        });
        if (intentErr || !intentData?.clientSecret) {
          throw new Error(intentData?.error || "Failed to initialize payment");
        }
        setClientSecret(intentData.clientSecret);
      } catch (err: any) {
        const msg = err.message || "Payment setup failed";
        setError(msg);
        onError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId && amount > 0) {
      init();
    }
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
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!stripePromise || !clientSecret) return null;

  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="bg-primary/5 border-b border-border px-6 py-3 flex items-center gap-2">
        <CreditCard className="w-4 h-4 text-primary" />
        <span className="font-semibold text-sm text-foreground">Secure Payment</span>
      </div>
      <CardContent className="p-6">
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
              variables: {
                colorPrimary: "#6366f1",
                borderRadius: "8px",
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
          />
        </Elements>
      </CardContent>
    </Card>
  );
};

export default StripePaymentForm;
