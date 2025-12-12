import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, RefreshCw, Home, Search } from "lucide-react";

const PaymentCancel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId') || searchParams.get('booking_id');

  const handleRetryPayment = () => {
    if (bookingId) {
      navigate(`/payment-options?bookingId=${bookingId}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Your payment was cancelled. No charges have been made to your account.
            </p>
            <p className="text-sm text-muted-foreground">
              Your booking is still saved. You can retry the payment or start a new search.
            </p>
            <div className="flex flex-col gap-3 pt-4">
              {bookingId && (
                <Button onClick={handleRetryPayment} className="w-full gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Retry Payment
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="w-full gap-2"
              >
                <Search className="w-4 h-4" />
                Start New Search
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/deals')}
                className="w-full gap-2"
              >
                <Home className="w-4 h-4" />
                Browse Deals
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentCancel;
