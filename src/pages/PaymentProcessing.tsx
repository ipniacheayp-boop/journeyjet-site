import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PaymentProcessing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'redirecting' | 'error' | 'fare_changed'>('redirecting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [newPrice, setNewPrice] = useState<number | null>(null);

  useEffect(() => {
    const bookingId = searchParams.get('bookingId');
    const checkoutUrl = searchParams.get('checkoutUrl');

    if (checkoutUrl) {
      // Direct redirect if we have checkout URL
      window.location.href = decodeURIComponent(checkoutUrl);
      return;
    }

    if (!bookingId) {
      setStatus('error');
      setErrorMessage('No booking information found. Please start a new search.');
      return;
    }

    // Try to create checkout session
    createCheckoutSession(bookingId);
  }, [searchParams]);

  const createCheckoutSession = async (bookingId: string) => {
    try {
      const idempotencyKey = `checkout-${bookingId}-${Date.now()}`;
      
      const { data, error } = await supabase.functions.invoke('payments-create-checkout-session', {
        body: {
          booking_temp_id: bookingId,
          idempotency_key: idempotencyKey,
          return_url: `${window.location.origin}/payment-success?booking_id=${bookingId}`,
          cancel_url: `${window.location.origin}/payment/cancel?bookingId=${bookingId}`,
        },
      });

      if (error) throw error;

      if (data?.error === 'price_changed') {
        setStatus('fare_changed');
        setNewPrice(data.new_price || null);
        setErrorMessage(data.message || 'The fare has changed. Please review the new price.');
        return;
      }

      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      console.error('Checkout session error:', err);
      setStatus('error');
      
      if (err.message?.includes('price_changed') || err.message?.includes('fare')) {
        setStatus('fare_changed');
        setErrorMessage('The fare has changed. Please search again for updated prices.');
      } else {
        setErrorMessage(err.message || 'Failed to initiate payment. Please try again.');
      }
    }
  };

  const handleRetry = () => {
    const bookingId = searchParams.get('bookingId');
    if (bookingId) {
      setStatus('redirecting');
      setErrorMessage('');
      createCheckoutSession(bookingId);
    }
  };

  const handleNewSearch = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-8 pb-6 text-center space-y-6">
            {status === 'redirecting' && (
              <>
                <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin" />
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Redirecting to Secure Payment</h2>
                  <p className="text-muted-foreground text-sm">
                    Please wait while we connect you to our secure payment provider...
                  </p>
                </div>
              </>
            )}

            {status === 'fare_changed' && (
              <>
                <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-amber-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Fare Has Changed</h2>
                  <p className="text-muted-foreground">
                    {errorMessage}
                  </p>
                  {newPrice && (
                    <p className="text-lg font-medium text-primary">
                      New Price: ${newPrice.toFixed(2)} USD
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-3 pt-4">
                  <Button onClick={handleNewSearch} className="w-full">
                    Search Again
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/support')}>
                    Contact Support
                  </Button>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-destructive" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Payment Initiation Failed</h2>
                  <p className="text-muted-foreground">
                    {errorMessage}
                  </p>
                </div>
                <div className="flex flex-col gap-3 pt-4">
                  <Button onClick={handleRetry} className="w-full gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={handleNewSearch}>
                    Start New Search
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/support')}>
                    Contact Support
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentProcessing;
