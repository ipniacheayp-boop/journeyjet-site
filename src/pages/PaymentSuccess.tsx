import { useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, BookOpen } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    toast({
      title: "Payment Successful!",
      description: "Your booking has been confirmed.",
    });

    // Redirect to Agent Connect page after 2 seconds
    const timer = setTimeout(() => {
      navigate('/agent-connect');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Your booking has been confirmed. A confirmation email has been sent to your email address.
            </p>
            {sessionId && (
              <p className="text-sm text-muted-foreground font-mono">
                Session ID: {sessionId.substring(0, 20)}...
              </p>
            )}
            <div className="flex flex-col gap-3 justify-center pt-4">
              <Link to="/my-bookings" className="w-full">
                <Button className="w-full">
                  <BookOpen className="mr-2 h-4 w-4" />
                  View My Bookings
                </Button>
              </Link>
              <Link to="/" className="w-full">
                <Button variant="outline" className="w-full">Back to Home</Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-2">
                Our agent will connect with you shortly...
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
