import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2, Shield, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { supabase } from "@/integrations/supabase/client";

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
  const [creatingSession, setCreatingSession] = useState(false);
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

  // Create or retrieve Stripe checkout session
  const createCheckoutSession = useCallback(async (bookingId: string) => {
    setCreatingSession(true);
    
    try {
      console.log('[PaymentOptions] Creating checkout session for booking:', bookingId);
      
      const idempotencyKey = crypto.randomUUID();
      const origin = window.location.origin;
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payments-create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            booking_temp_id: bookingId,
            idempotency_key: idempotencyKey,
            return_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
            cancel_url: `${origin}/payment-cancel?booking_id=${bookingId}`,
          }),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 409 && data.error === 'price_changed') {
          toast.error("Price has changed. Please search again for updated pricing.");
          sessionStorage.removeItem('pendingBooking');
          navigate('/');
          return null;
        }
        throw new Error(data.message || data.error || 'Failed to create checkout session');
      }

      console.log('[PaymentOptions] Checkout session created:', { 
        hasUrl: !!data.checkoutUrl, 
        amount: data.amountUSD 
      });
      
      return data.checkoutUrl;
    } catch (err: any) {
      console.error('[PaymentOptions] Error creating checkout session:', err);
      toast.error(err.message || 'Failed to create payment session. Please try again.');
      return null;
    } finally {
      setCreatingSession(false);
    }
  }, [navigate]);

  const handleStripePayment = async () => {
    console.log('[PaymentOptions] Stripe payment initiated', { bookingDetails });
    
    if (!bookingDetails?.bookingId) {
      toast.error("Session expired. Please search again.");
      navigate('/');
      return;
    }

    setLoading(true);

    try {
      // Always create/retrieve a fresh checkout session to ensure URL is valid
      console.log('[PaymentOptions] Creating/retrieving checkout session...');
      const checkoutUrl = await createCheckoutSession(bookingDetails.bookingId);
      
      if (checkoutUrl) {
        // Update stored booking with new checkout URL
        const updatedBooking = { ...bookingDetails, checkoutUrl };
        sessionStorage.setItem('pendingBooking', JSON.stringify(updatedBooking));
        
        console.log('[PaymentOptions] Redirecting to Stripe checkout:', checkoutUrl);
        toast.success("Redirecting to secure Stripe checkout...");
        
        // Use location.replace for cleaner redirect (no back button to payment page)
        window.location.replace(checkoutUrl);
      } else {
        console.error('[PaymentOptions] No checkout URL returned');
        toast.error("Failed to initialize payment. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error('[PaymentOptions] Payment error:', err);
      toast.error("Payment initialization failed. Please try again.");
      setLoading(false);
    }
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
  const isProcessing = loading || creatingSession;

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
            className={`cursor-pointer hover:shadow-xl transition-all border-2 border-primary bg-primary/5 mb-6 ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
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
                <Button size="lg" disabled={isProcessing} className="px-8">
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {creatingSession ? 'Creating Session...' : 'Redirecting...'}
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
                    ${parseFloat(amount).toFixed(2)} USD
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button 
                  variant="outline" 
                  onClick={handleGoBack}
                  className="w-full"
                  disabled={isProcessing}
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
