import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CreditCard } from "lucide-react";

/**
 * PaymentUPI - Information page explaining UPI is not available for USD payments
 * 
 * UPI payments are only available for INR transactions.
 * All Stripe payments are processed in USD only.
 */
const PaymentUPI = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16 flex items-center justify-center bg-secondary">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <CardTitle className="text-xl">UPI Not Available</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              UPI payments are only available for INR transactions. 
              All international bookings are processed in USD via Stripe.
            </p>
            <p className="text-sm text-muted-foreground">
              Please use the card payment option to complete your booking.
            </p>
            <div className="space-y-2 pt-4">
              <Button onClick={() => navigate('/payment-options')} className="w-full">
                <CreditCard className="mr-2 h-4 w-4" />
                Pay with Card (USD)
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
};

export default PaymentUPI;