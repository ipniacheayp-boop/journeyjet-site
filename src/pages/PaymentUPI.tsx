import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Loader2, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const PaymentUPI = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [upiId, setUpiId] = useState("");
  const [copied, setCopied] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [polling, setPolling] = useState(false);
  
  const merchantVPA = "pay@flynow";

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

  const copyVPA = () => {
    navigator.clipboard.writeText(merchantVPA);
    setCopied(true);
    toast.success("VPA ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayment = async () => {
    if (!upiId || !upiId.includes('@')) {
      toast.error("Please enter a valid UPI ID");
      return;
    }

    setLoading(true);
    setPolling(true);

  try {
      const { data, error } = await supabase.functions.invoke('payments-upi-initiate', {
        body: {
          bookingId: bookingDetails.bookingId,
          upiId,
          amount: convertedAmount || bookingDetails.amount,
          currency: 'INR',
        },
      });

      if (error) throw error;

      // Start polling for payment confirmation
      const pollInterval = setInterval(async () => {
        try {
          const { data: statusData } = await supabase.functions.invoke('payments-status', {
            body: { bookingId: bookingDetails.bookingId },
          });

          if (statusData?.payment_status === 'succeeded') {
            clearInterval(pollInterval);
            setPolling(false);
            sessionStorage.removeItem('pendingBooking');
            toast.success('Payment confirmed!');
            navigate(`/payment-success?transaction_id=${statusData.transaction_id}`);
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 5000);

      // Stop polling after 3 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        setPolling(false);
      }, 180000);

    } catch (error: any) {
      console.error("UPI payment error:", error);
      toast.error(error.message || "Payment failed. Please try again.");
      setPolling(false);
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
              <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Pay to VPA</p>
                  <p className="text-lg font-bold font-mono">{merchantVPA}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={copyVPA}
                >
                  {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                <span className="font-medium">Amount to Pay</span>
                <span className="text-2xl font-bold text-primary">
                  ₹{convertedAmount ? convertedAmount.toFixed(2) : '...'}
                </span>
              </div>
              
              {bookingDetails.currency === 'USD' && convertedAmount && (
                <p className="text-sm text-muted-foreground text-center">
                  (Original: ${parseFloat(bookingDetails.amount).toFixed(2)} USD)
                </p>
              )}

              {polling && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                  <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto mb-2" />
                  <p className="font-medium">Waiting for payment confirmation...</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This usually takes 10-30 seconds
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="upiId">Your UPI ID</Label>
                <Input
                  id="upiId"
                  type="text"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Enter your UPI ID (e.g., yourname@paytm, yourname@googlepay)
                </p>
              </div>

              <Button 
                onClick={handlePayment} 
                disabled={loading || !upiId || !convertedAmount || polling}
                className="w-full"
                size="lg"
              >
                {loading || polling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {polling ? 'Waiting for Confirmation...' : 'Processing Payment...'}
                  </>
                ) : (
                  `Pay ₹${convertedAmount ? convertedAmount.toFixed(2) : '...'}`
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
              <span className="text-green-600">✓</span> Secure UPI Payment
            </p>
            <p className="text-xs">Powered by NPCI • Instant confirmation</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentUPI;