import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Smartphone, QrCode, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRequireAuth } from "@/hooks/useRequireAuth";

const PaymentOptions = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useRequireAuth();
  const [loading, setLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  useEffect(() => {
    const bookingId = searchParams.get('bookingId');
    const storedBooking = sessionStorage.getItem('pendingBooking');
    
    console.log('[PaymentOptions] Loading booking details', { bookingId, hasStoredBooking: !!storedBooking });
    
    if (storedBooking) {
      const parsed = JSON.parse(storedBooking);
      console.log('[PaymentOptions] Parsed booking:', { 
        bookingId: parsed.bookingId, 
        hasCheckoutUrl: !!parsed.checkoutUrl,
        amount: parsed.amount,
        currency: parsed.currency
      });
      
      // Verify bookingId matches if provided in URL
      if (bookingId && parsed.bookingId !== bookingId) {
        toast.error("Booking mismatch. Please try again.");
        navigate('/');
        return;
      }
      
      setBookingDetails(parsed);
    } else {
      toast.error("Session expired. Please search again.");
      navigate('/');
    }
  }, [navigate, searchParams]);

  const handlePaymentMethod = (method: string) => {
    console.log('[PaymentOptions] Payment method selected:', method);
    
    if (!bookingDetails?.bookingId) {
      toast.error("Session expired. Please search again.");
      navigate('/');
      return;
    }

    setLoading(true);
    
    // Navigate to the appropriate payment page
    switch (method) {
      case 'card':
        // For card payments, redirect to Stripe Checkout URL if available
        if (bookingDetails.checkoutUrl) {
          console.log('[PaymentOptions] Redirecting to Stripe Checkout:', bookingDetails.checkoutUrl);
          toast.success("Redirecting to secure payment...");
          window.location.href = bookingDetails.checkoutUrl;
        } else {
          // Fallback to card page for manual payment
          navigate('/payment/card');
        }
        break;
      case 'upi':
      case 'stripe-upi':
        navigate('/payment/upi');
        break;
      case 'scanner':
        navigate('/payment/qr');
        break;
      default:
        toast.error("Unknown payment method");
        setLoading(false);
    }
  };

  const handleGoBack = () => {
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
  const currency = 'USD';

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

          {/* Recommended: Card Payment */}
          <div className="mb-6">
            <Card 
              className={`cursor-pointer hover:shadow-lg transition-all border-2 border-primary bg-primary/5 group ${loading ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={() => handlePaymentMethod('card')}
            >
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center">
                    <CreditCard className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">Credit/Debit Card</CardTitle>
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Recommended</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pay securely via Stripe • Visa, Mastercard, Amex
                    </p>
                  </div>
                </div>
                <Button disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Pay Now'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Other Payment Methods (INR only) */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all hover:border-muted-foreground/50 group"
              onClick={() => handlePaymentMethod('upi')}
            >
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-2 group-hover:bg-muted/80 transition-colors">
                  <Smartphone className="w-6 h-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">UPI</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-xs text-muted-foreground">
                  Pay via Razorpay (INR)
                </p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all hover:border-muted-foreground/50 group"
              onClick={() => handlePaymentMethod('stripe-upi')}
            >
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-2 group-hover:bg-muted/80 transition-colors">
                  <Smartphone className="w-6 h-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">UPI (Stripe)</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-xs text-muted-foreground">
                  Pay via Stripe UPI (INR)
                </p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all hover:border-muted-foreground/50 group"
              onClick={() => handlePaymentMethod('scanner')}
            >
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-2 group-hover:bg-muted/80 transition-colors">
                  <QrCode className="w-6 h-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">QR Scanner</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-xs text-muted-foreground">
                  Scan QR to pay (INR)
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
                  Go Back
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
