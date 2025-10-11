import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentUPI = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    const storedBooking = sessionStorage.getItem('pendingBooking');
    if (storedBooking) {
      const booking = JSON.parse(storedBooking);
      setBookingDetails(booking);
      
      // Convert currency if needed
      convertCurrency(booking.amount);
    } else {
      toast.error("No booking found");
      navigate('/');
    }

    return () => {
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, [navigate]);

  const convertCurrency = async (usdAmount: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('payments-convert', {
        body: { from: 'USD', to: 'INR', amount: usdAmount },
      });

      if (error) throw error;
      setConvertedAmount(data.convertedAmount);
    } catch (error) {
      console.error("Currency conversion error:", error);
      setConvertedAmount(usdAmount * 83); // Fallback rate
    }
  };

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      toast.error("Payment system is loading. Please wait...");
      return;
    }

    if (!convertedAmount) {
      toast.error("Amount conversion failed. Please try again.");
      return;
    }

    setLoading(true);

    try {
      // Create Razorpay order
      const { data, error } = await supabase.functions.invoke('payments-razorpay-create-order', {
        body: {
          bookingId: bookingDetails.bookingId,
          amount: convertedAmount,
          currency: 'INR',
        },
      });

      if (error) throw error;

      console.log('Opening Razorpay checkout with order ID:', data.orderId);

      // Open Razorpay checkout
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'GoCheapFlights',
        description: `Booking #${bookingDetails.bookingId.slice(0, 8)}`,
        order_id: data.orderId,
        prefill: {
          email: bookingDetails.contact_email,
          contact: bookingDetails.contact_phone || '',
        },
        theme: {
          color: '#0EA5E9',
        },
        method: {
          upi: true,
          card: false,
          netbanking: false,
          wallet: false,
        },
        handler: async function (response: any) {
          try {
            console.log('Payment completed, verifying:', response.razorpay_payment_id);
            
            // Verify payment
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
              'payments-razorpay-verify',
              {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  bookingId: bookingDetails.bookingId,
                },
              }
            );

            if (verifyError) {
              console.error('Verification failed:', verifyError);
              throw verifyError;
            }

            if (verifyData.success) {
              console.log('Payment verified successfully');
              sessionStorage.removeItem('pendingBooking');
              toast.success("Payment successful!");
              navigate(`/payment-success?transaction_id=${response.razorpay_payment_id}`);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error: any) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed");
            navigate('/payment-cancel');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            console.log('Payment modal dismissed');
            setLoading(false);
            toast.info("Payment cancelled");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
        navigate('/payment-cancel');
      });
      
      razorpay.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Payment failed. Please try again.");
      setLoading(false);
    }
  };

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

  const { amount, currency = 'INR', bookingType } = bookingDetails;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16 bg-secondary">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Smartphone className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Pay Using UPI</h1>
            <p className="text-muted-foreground">
              Complete your payment securely via UPI
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                <span className="font-medium">Amount to Pay</span>
                <span className="text-2xl font-bold text-primary">
                  ₹{convertedAmount ? convertedAmount.toFixed(2) : '...'}
                </span>
              </div>
              
              {bookingDetails && convertedAmount && (
                <p className="text-sm text-muted-foreground text-center">
                  (Original: ${parseFloat(bookingDetails.amount).toFixed(2)} USD)
                </p>
              )}

              <div className="bg-secondary/50 border rounded-lg p-4 text-sm">
                <p className="font-medium mb-2">How it works:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Click "Pay with UPI" button</li>
                  <li>Choose your UPI app (GPay, PhonePe, Paytm, etc.)</li>
                  <li>Complete payment securely in your UPI app</li>
                  <li>Get instant confirmation</li>
                </ol>
              </div>

              <Button 
                onClick={handlePayment} 
                disabled={loading || !convertedAmount || !razorpayLoaded}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : !razorpayLoaded ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading Payment System...
                  </>
                ) : (
                  `Pay ₹${convertedAmount ? convertedAmount.toFixed(2) : '...'} with UPI`
                )}
              </Button>

              <Button 
                variant="outline" 
                onClick={() => navigate('/payment-options')}
                className="w-full"
                disabled={loading}
              >
                Choose Another Method
              </Button>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p className="flex items-center justify-center gap-2">
              <span className="text-green-600">✓</span> Secure Payment via Razorpay
            </p>
            <p className="text-xs">UPI • Instant confirmation • 100% Secure</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentUPI;