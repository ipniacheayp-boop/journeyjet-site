import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const UpiCheckoutForm = ({ bookingDetails, clientSecret }: any) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (error) {
        toast.error(error.message || "Payment failed. Please try again.");
      } else {
        toast.info("Confirming payment…");
      }
    } catch (err: any) {
      console.error("Stripe UPI confirm error:", err);
      toast.error(err.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      <div className="flex justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
        <span className="font-medium">Amount</span>
        <span className="text-2xl font-bold text-primary">
          ₹{parseFloat(bookingDetails.amountInINR).toFixed(2)}
        </span>
      </div>

      <Button type="submit" disabled={!stripe || loading} className="w-full" size="lg">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing…
          </>
        ) : (
          `Pay ₹${parseFloat(bookingDetails.amountInINR).toFixed(2)} with UPI`
        )}
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={() => navigate("/payment-options")}
        className="w-full"
        disabled={loading}
      >
        Choose Another Method
      </Button>
    </form>
  );
};

const PaymentStripeUPI = () => {
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const storedBooking = sessionStorage.getItem("pendingBooking");
        if (!storedBooking) {
          toast.error("No booking found");
          window.location.href = "/";
          return;
        }
        const baseBooking = JSON.parse(storedBooking);

        // Load Stripe with publishable key (public key, safe for frontend)
        const stripePublishableKey = "pk_live_51SCf0hRZ1oiw5xMj93coxIRQh0ahJ0sCGdwUo7AdrlH3qnPbHM3GtwVLaDwooEq6P158m4zHkYlXfxIkEZplD3P700BU9V0kRY";
        setStripePromise(loadStripe(stripePublishableKey));

        // Convert USD -> INR if needed
        let amountInINR = baseBooking.amount;
        if ((baseBooking.currency || "USD").toUpperCase() !== "INR") {
          const { data: convData, error: convError } = await supabase.functions.invoke(
            "payments-convert",
            { body: { from: "USD", to: "INR", amount: baseBooking.amount } }
          );
          if (convError) throw convError;
          amountInINR = convData.convertedAmount;
        }

        const enriched = { ...baseBooking, amountInINR, currency: "INR" };
        setBookingDetails(enriched);

        // Create a UPI-enabled PaymentIntent in INR
        const { data: intentData, error: intentError } = await supabase.functions.invoke(
          "payments-stripe-create-intent",
          {
            body: {
              bookingId: baseBooking.bookingId,
              amount: amountInINR,
              currency: "INR",
            },
          }
        );
        if (intentError) throw intentError;
        setClientSecret(intentData.clientSecret);
      } catch (err: any) {
        console.error("Init Stripe UPI page error:", err);
        toast.error(err.message || "Failed to initialize UPI payment");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const appearance = useMemo(
    () => ({ theme: "stripe" as const }),
    []
  );

  if (loading || !bookingDetails) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16 bg-secondary">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Smartphone className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Pay Using UPI (Stripe)</h1>
            <p className="text-muted-foreground">Complete your payment securely via UPI on Stripe</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              {stripePromise && clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                  <UpiCheckoutForm bookingDetails={bookingDetails} clientSecret={clientSecret} />
                </Elements>
              ) : (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading payment form...
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              <span className="text-green-600">✓</span> Secured by Stripe • UPI supported in INR
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentStripeUPI;
