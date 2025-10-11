import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Smartphone, QrCode, Loader2 } from "lucide-react";
import { toast } from "sonner";

const PaymentOptions = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  useEffect(() => {
    const storedBooking = sessionStorage.getItem('pendingBooking');
    if (storedBooking) {
      setBookingDetails(JSON.parse(storedBooking));
    } else {
      toast.error("No booking found");
      navigate('/');
    }
  }, [navigate]);

  const handlePaymentMethod = async (method: string) => {
    setLoading(true);
    
    try {
      if (method === 'card') {
        if (!bookingDetails?.checkoutUrl) {
          toast.error("No payment URL available");
          return;
        }
        // Redirect to Stripe checkout
        window.location.href = bookingDetails.checkoutUrl;
      } else if (method === 'upi') {
        navigate('/payment/upi');
      } else if (method === 'scanner') {
        navigate('/payment/qr');
      }
    } catch (error) {
      toast.error("Failed to process payment method");
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

  const { amount, currency = 'USD', bookingType } = bookingDetails;

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                  onClick={() => navigate(-1)}
                  className="w-full"
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
