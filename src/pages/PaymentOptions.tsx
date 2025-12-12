import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useRequireAuth } from "@/hooks/useRequireAuth";

interface BookingDetails {
  bookingId: string;
  checkoutUrl: string | null;
  amount: string;
  currency: string;
  bookingType: string;
  bookingReference?: string;
  travelerInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

const PaymentOptions = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useRequireAuth();
  const [loading, setLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const bookingId = searchParams.get('bookingId');
    const storedBooking = sessionStorage.getItem('pendingBooking');
    
    console.log('[PaymentOptions] Loading booking details', { bookingId, hasStoredBooking: !!storedBooking });
    
    if (storedBooking) {
      try {
        const parsed = JSON.parse(storedBooking);
        console.log('[PaymentOptions] Parsed booking:', { 
          bookingId: parsed.bookingId, 
          hasCheckoutUrl: !!parsed.checkoutUrl,
          amount: parsed.amount,
          currency: parsed.currency
        });
        
        // Verify bookingId matches if provided in URL
        if (bookingId && parsed.bookingId !== bookingId) {
          setError("Booking mismatch. Please try again.");
          toast.error("Booking mismatch. Please try again.");
          return;
        }
        
        setBookingDetails(parsed);
      } catch (e) {
        console.error('[PaymentOptions] Failed to parse stored booking:', e);
        setError("Session data corrupted. Please search again.");
        toast.error("Session data corrupted. Please search again.");
      }
    } else {
      setError("Session expired. Please search again.");
      toast.error("Session expired. Please search again.");
    }
  }, [searchParams]);

  const handleStripePayment = () => {
    console.log('[PaymentOptions] Stripe payment initiated');
    
    if (!bookingDetails?.bookingId) {
      toast.error("Session expired. Please search again.");
      navigate('/');
      return;
    }

    if (!bookingDetails.checkoutUrl) {
      toast.error("Payment session not available. Please try again.");
      navigate('/');
      return;
    }

    setLoading(true);
    toast.success("Redirecting to secure Stripe checkout...");
    
    // Redirect to Stripe Checkout
    window.location.href = bookingDetails.checkoutUrl;
  };

  const handleGoBack = () => {
    sessionStorage.removeItem('pendingBooking');
    navigate(-1);
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center bg-secondary">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-8 text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Session Error</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => navigate('/')} className="w-full">
                Return to Search
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Loading state
  if (!bookingDetails) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading payment details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { amount, bookingType } = bookingDetails;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16 bg-secondary">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Complete Your Payment</h1>
            <p className="text-muted-foreground">
              Secure payment for your {bookingType} booking
            </p>
          </div>

          {/* Stripe Payment Option - Only Option */}
          <Card 
            className={`cursor-pointer hover:shadow-xl transition-all border-2 border-primary bg-primary/5 mb-6 ${loading ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={handleStripePayment}
          >
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    <CreditCard className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-2xl">Pay with Stripe (USD)</CardTitle>
                    </div>
                    <p className="text-muted-foreground mt-2">
                      Visa, Mastercard, American Express, and more
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        Secure
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Instant
                      </span>
                    </div>
                  </div>
                </div>
                <Button size="lg" disabled={loading} className="px-8">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    'Pay Now'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
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
                {bookingDetails.bookingReference && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Reference</span>
                    <span className="font-mono">{bookingDetails.bookingReference}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">
                    USD {parseFloat(amount).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-6">
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

          <div className="mt-6 text-center text-sm text-muted-foreground space-y-2">
            <p className="flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              Your payment is secured with 256-bit SSL encryption
            </p>
            <p>Powered by Stripe — the world's most trusted payment platform</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentOptions;
