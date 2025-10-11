import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const stripePromise = loadStripe(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "");

const CheckoutForm = ({ bookingDetails, onSuccess }: any) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cardholderName, setCardholderName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !cardholderName) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // Create payment intent
      const { data: intentData, error: intentError } = await supabase.functions.invoke(
        'payments-stripe-create-intent',
        {
          body: {
            bookingId: bookingDetails.bookingId,
            amount: bookingDetails.amount,
            currency: bookingDetails.currency || 'USD',
          },
        }
      );

      if (intentError) throw intentError;

      const { clientSecret } = intentData;

      // Confirm card payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: cardholderName,
              email: bookingDetails.contact_email,
            },
          },
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        // Confirm booking
        const { error: confirmBookingError } = await supabase.functions.invoke(
          'payments-confirm',
          {
            body: {
              bookingId: bookingDetails.bookingId,
              transactionId: paymentIntent.id,
              paymentMethod: 'stripe',
            },
          }
        );

        if (confirmBookingError) throw confirmBookingError;

        sessionStorage.removeItem('pendingBooking');
        toast.success("Payment successful!");
        navigate(`/payment-success?transaction_id=${paymentIntent.id}`);
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="cardholderName">Cardholder Name</Label>
        <Input
          id="cardholderName"
          type="text"
          placeholder="John Doe"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Card Details</Label>
        <div className="border rounded-md p-3 bg-background">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: 'hsl(var(--foreground))',
                  '::placeholder': {
                    color: 'hsl(var(--muted-foreground))',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="flex justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
        <span className="font-medium">Total Amount</span>
        <span className="text-2xl font-bold text-primary">
          {bookingDetails.currency} {parseFloat(bookingDetails.amount).toFixed(2)}
        </span>
      </div>

      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          `Pay ${bookingDetails.currency} ${parseFloat(bookingDetails.amount).toFixed(2)}`
        )}
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={() => navigate('/payment-options')}
        className="w-full"
        disabled={loading}
      >
        Choose Another Method
      </Button>
    </form>
  );
};

const PaymentCard = () => {
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  useEffect(() => {
    const storedBooking = sessionStorage.getItem('pendingBooking');
    if (storedBooking) {
      setBookingDetails(JSON.parse(storedBooking));
    } else {
      toast.error("No booking found");
      window.location.href = '/';
    }
  }, []);

  if (!bookingDetails) {
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
              <CreditCard className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Secure Card Payment</h1>
            <p className="text-muted-foreground">
              Enter your card details to complete the booking
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise}>
                <CheckoutForm bookingDetails={bookingDetails} />
              </Elements>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              <span className="text-green-600">✓</span> Secured by Stripe
            </p>
            <p className="text-xs mt-1">Your payment information is encrypted and secure</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentCard;
