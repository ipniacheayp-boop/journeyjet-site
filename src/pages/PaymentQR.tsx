import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const PaymentQR = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [qrData, setQrData] = useState<any>(null);
  const [polling, setPolling] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);

  useEffect(() => {
    const storedBooking = sessionStorage.getItem('pendingBooking');
    if (storedBooking) {
      const booking = JSON.parse(storedBooking);
      setBookingDetails(booking);
      
      // Convert currency if needed
      if (booking.currency === 'USD') {
        convertCurrency(booking.amount);
      } else {
        setConvertedAmount(parseFloat(booking.amount));
      }
    } else {
      toast.error("No booking found");
      navigate('/');
    }
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

  useEffect(() => {
    if (bookingDetails) {
      generateQR();
    }
  }, [bookingDetails]);

  const generateQR = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('payments-qr-generate', {
        body: {
          bookingId: bookingDetails.bookingId,
          amount: bookingDetails.amount,
          currency: bookingDetails.currency || 'INR',
        },
      });

      if (error) throw error;
      
      setQrData(data);
      startPolling(data.transactionId);
    } catch (error: any) {
      console.error("QR generation error:", error);
      toast.error("Failed to generate QR code");
      navigate('/payment-options');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (transactionId: string) => {
    setPolling(true);
    
    const pollInterval = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('payments-qr-status', {
          body: { transactionId },
        });

        if (error) throw error;

        if (data.status === 'succeeded') {
          clearInterval(pollInterval);
          setPolling(false);
          sessionStorage.removeItem('pendingBooking');
          toast.success("Payment successful!");
          navigate(`/payment-success?transaction_id=${transactionId}`);
        } else if (data.status === 'failed') {
          clearInterval(pollInterval);
          setPolling(false);
          toast.error("Payment failed");
          navigate('/payment-cancel');
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 5000); // Poll every 5 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      setPolling(false);
    }, 300000);
  };

  if (!bookingDetails || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Generating QR Code...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { amount, currency = 'INR' } = bookingDetails;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16 bg-secondary">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <QrCode className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Scan QR Code</h1>
            <p className="text-muted-foreground">
              Use any UPI app to scan and pay
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center">Payment QR Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center p-8 bg-white rounded-lg">
                {qrData?.qrCodeUrl ? (
                  <img 
                    src={qrData.qrCodeUrl} 
                    alt="Payment QR Code" 
                    className="w-64 h-64"
                  />
                ) : (
                  <div className="w-64 h-64 bg-secondary flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="text-center space-y-2">
                <p className="text-2xl font-bold text-primary">
                  ₹{convertedAmount ? convertedAmount.toFixed(2) : '...'}
                </p>
                {bookingDetails.currency === 'USD' && convertedAmount && (
                  <p className="text-xs text-muted-foreground">
                    (Original: ${parseFloat(bookingDetails.amount).toFixed(2)} USD)
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Transaction ID: {qrData?.transactionId?.slice(0, 12)}...
                </p>
              </div>

              {polling && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                    <p className="font-medium">Waiting for payment...</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The page will automatically update once payment is confirmed
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-primary">1.</span>
                  <p>Open any UPI app (Google Pay, PhonePe, Paytm, etc.)</p>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-primary">2.</span>
                  <p>Scan the QR code shown above</p>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-primary">3.</span>
                  <p>Verify the amount and complete payment</p>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-primary">4.</span>
                  <p>Wait for automatic confirmation</p>
                </div>
              </div>

              <Button 
                variant="outline" 
                onClick={() => navigate('/payment-options')}
                className="w-full"
              >
                Choose Another Method
              </Button>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              <span className="text-green-600">✓</span> Secure UPI Payment
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentQR;