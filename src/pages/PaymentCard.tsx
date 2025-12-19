import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, AlertCircle } from "lucide-react";
import { toast } from "sonner";

/**
 * PaymentCard - Redirects to Stripe Checkout
 * 
 * Primary flow: User is redirected directly to Stripe Checkout from PaymentOptions
 * This page serves as a fallback that immediately redirects to Stripe Checkout if URL exists
 */
const PaymentCard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedBooking = sessionStorage.getItem('pendingBooking');
    
    if (!storedBooking) {
      setError("Session expired. Please search again.");
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(storedBooking);
      console.log('[PaymentCard] Loaded booking:', { bookingId: parsed.bookingId, hasCheckoutUrl: !!parsed.checkoutUrl });
      
      if (parsed.checkoutUrl) {
        // Redirect to Stripe Checkout
        toast.success("Redirecting to secure payment...");
        window.location.href = parsed.checkoutUrl;
      } else {
        setError("Payment session not available. Please try again from the beginning.");
        setLoading(false);
      }
    } catch (e) {
      console.error('[PaymentCard] Error parsing booking:', e);
      setError("Session data corrupted. Please search again.");
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Redirecting to secure payment...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center bg-secondary">
          <Card className="max-w-md w-full mx-4">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Payment Session Error</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">{error}</p>
              <div className="space-y-2">
                <Button onClick={() => navigate('/')} className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Start New Search
                </Button>
                <Button variant="outline" onClick={() => navigate(-1)} className="w-full">
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return null;
};

export default PaymentCard;
