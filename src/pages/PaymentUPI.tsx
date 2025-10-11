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
  
  const merchantVPA = "pay@flynow";

  useEffect(() => {
    const storedBooking = sessionStorage.getItem('pendingBooking');
    if (storedBooking) {
      setBookingDetails(JSON.parse(storedBooking));
    } else {
      toast.error("No booking found");
      navigate('/');
    }
  }, [navigate]);

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

    try {
      const { data, error } = await supabase.functions.invoke('payments-upi-confirm', {
        body: {
          bookingId: bookingDetails.bookingId,
          upiId,
          amount: bookingDetails.amount,
          currency: bookingDetails.currency || 'INR',
        },
      });

      if (error) throw error;

      if (data.success) {
        sessionStorage.removeItem('pendingBooking');
        toast.success("Payment successful!");
        navigate(`/payment-success?transaction_id=${data.transactionId}`);
      } else {
        throw new Error(data.message || "Payment failed");
      }
    } catch (error: any) {
      console.error("UPI payment error:", error);
      toast.error(error.message || "Payment failed. Please try again.");
      navigate('/payment-cancel');
    } finally {
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
                  ₹{parseFloat(amount).toFixed(2)}
                </span>
              </div>

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
                disabled={loading || !upiId}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  `Pay ₹${parseFloat(amount).toFixed(2)}`
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