import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Smartphone, QrCode, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PaymentOptions = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useRequireAuth();
  const [loading, setLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    const bookingId = searchParams.get('bookingId');
    const storedBooking = sessionStorage.getItem('pendingBooking');
    
    if (storedBooking) {
      const parsed = JSON.parse(storedBooking);
      
      // Verify bookingId matches if provided in URL
      if (bookingId && parsed.bookingId !== bookingId) {
        toast.error("Booking mismatch. Please try again.");
        navigate('/');
        return;
      }
      
      // Validate checkoutUrl exists
      if (!parsed.checkoutUrl) {
        setPaymentError("Payment session not created. Please go back and try again.");
        setBookingDetails(parsed);
        return;
      }
      
      setBookingDetails(parsed);
    } else {
      toast.error("No booking found. Please start a new booking.");
      navigate('/');
    }
  }, [navigate, searchParams]);

  const handlePaymentMethod = async (method: string) => {
    if (!bookingDetails?.bookingId) {
      toast.error("Booking not found. Please go back and try again.");
      return;
    }

    setLoading(true);
    setPaymentError(null);
    
    try {
      // If we have a checkoutUrl from Stripe, use it directly for card payments
      if (method === 'card' || method === 'default') {
        if (bookingDetails.checkoutUrl) {
          // Redirect to Stripe Checkout (USD)
          window.location.href = bookingDetails.checkoutUrl;
          return;
        } else {
          // Fallback: navigate to card payment page for manual entry
          navigate('/payment/card');
          return;
        }
      }
      
      // Navigate to the appropriate payment page
      switch (method) {
        case 'upi':
          navigate('/payment/upi');
          break;
        case 'stripe-upi':
          navigate('/payment/stripe-upi');
          break;
        case 'scanner':
          navigate('/payment/qr');
          break;
        default:
          // Default to Stripe Checkout
          if (bookingDetails.checkoutUrl) {
            window.location.href = bookingDetails.checkoutUrl;
          } else {
            toast.error("Payment method not available");
          }
      }
    } catch (error: any) {
      console.error("Payment method error:", error);
      toast.error("Failed to process payment. Please try again.");
      setPaymentError(error.message || "Payment error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    // Clear pending booking and go back to traveler form
    sessionStorage.removeItem('pendingBooking');
    navigate(-1);
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

  const { amount, bookingType } = bookingDetails;
  const currency = 'USD'; // Always use USD

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16 bg-secondary">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Choose Payment Method</h1>
            <p className="text-muted-foreground">
              Complete your {bookingType} booking securely
            </p>
          </div>

          {/* Error Alert */}
          {paymentError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                {paymentError}
                <Button 
                  variant="link" 
                  className="p-0 h-auto ml-2 text-destructive-foreground underline"
                  onClick={handleGoBack}
                >
                  Go back and try again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 ${paymentError || loading ? 'opacity-50 pointer-events-none' : ''}`}>
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all hover:border-primary group"
              onClick={() => handlePaymentMethod('card')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <CreditCard className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Credit/Debit Card</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Pay securely with your card
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Visa, Mastercard, Amex
                </p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all hover:border-primary group"
              onClick={() => handlePaymentMethod('upi')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Smartphone className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">UPI</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Pay using UPI apps
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Google Pay, PhonePe, Paytm
                </p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all hover:border-primary group"
              onClick={() => handlePaymentMethod('stripe-upi')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Smartphone className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">UPI (Stripe)</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Pay via UPI using Stripe
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supported in INR
                </p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all hover:border-primary group"
              onClick={() => handlePaymentMethod('scanner')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <QrCode className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">QR Scanner</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Scan QR code to pay
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  All major payment apps
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Booking Type</span>
                  <span className="font-medium capitalize">{bookingType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Booking ID</span>
                  <span className="font-mono text-xs">{bookingDetails.bookingId?.slice(0, 8)}...</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">
                    {currency} {parseFloat(amount).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Button 
                  variant="outline" 
                  onClick={handleGoBack}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Go Back'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>🔒 Your payment is secured with 256-bit SSL encryption</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentOptions;
