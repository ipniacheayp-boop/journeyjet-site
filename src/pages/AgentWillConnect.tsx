import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Phone, Mail, Home, BookOpen, Clock, User } from "lucide-react";

interface BookingDetails {
  bookingId: string;
  bookingReference: string;
  bookingType: string;
  amount: string;
  currency: string;
  travelerInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

const AgentWillConnect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingIdFromUrl = searchParams.get("booking_id");
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);

  useEffect(() => {
    const pendingBooking = sessionStorage.getItem('pendingBooking');
    
    if (pendingBooking) {
      try {
        const parsed = JSON.parse(pendingBooking);
        setBookingDetails({
          bookingId: parsed.bookingId,
          bookingReference: parsed.bookingReference || parsed.bookingId?.slice(0, 8).toUpperCase(),
          bookingType: parsed.bookingType,
          amount: parsed.amount,
          currency: parsed.currency || 'USD',
          travelerInfo: parsed.travelerInfo,
        });
        // Clear session storage
        sessionStorage.removeItem('pendingBooking');
        sessionStorage.removeItem('selectedOffer');
      } catch (e) {
        console.error('[AgentWillConnect] Error parsing stored booking:', e);
      }
    } else if (bookingIdFromUrl) {
      setBookingDetails({
        bookingId: bookingIdFromUrl,
        bookingReference: bookingIdFromUrl.slice(0, 8).toUpperCase(),
        bookingType: 'flight',
        amount: '0',
        currency: 'USD',
      });
    }
  }, [bookingIdFromUrl]);

  if (!bookingDetails) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No booking details found.</p>
              <Button onClick={() => navigate('/')}>
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16 bg-secondary">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-3xl text-green-700 dark:text-green-400">
                Booking Confirmed
              </CardTitle>
              <p className="text-lg text-amber-600 dark:text-amber-400 font-medium mt-2">
                Payment Pending
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Booking Reference */}
              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Booking Reference</p>
                <span className="text-3xl font-bold font-mono tracking-wider text-primary">
                  {bookingDetails.bookingReference}
                </span>
              </div>

              {/* Agent Contact Notice */}
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Our Travel Agent Will Contact You
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      Your booking is confirmed and reserved. One of our friendly travel agents will 
                      contact you shortly to complete the payment securely over the phone.
                    </p>
                  </div>
                </div>
              </div>

              {/* Expected Timeline */}
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Expected Response Time</p>
                  <p className="text-xs text-muted-foreground">
                    Within 2-4 hours during business hours (9 AM - 6 PM EST)
                  </p>
                </div>
              </div>

              {/* Booking Summary */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium">Booking Summary</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Booking Type</span>
                  <span className="font-medium capitalize">{bookingDetails.bookingType}</span>
                </div>
                
                {parseFloat(bookingDetails.amount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="font-bold text-lg">
                      ${parseFloat(bookingDetails.amount).toFixed(2)} {bookingDetails.currency}
                    </span>
                  </div>
                )}
                
                {bookingDetails.travelerInfo && (
                  <div className="pt-2">
                    <p className="text-sm font-medium mb-1">Traveler</p>
                    <p className="text-sm text-muted-foreground">
                      {bookingDetails.travelerInfo.firstName} {bookingDetails.travelerInfo.lastName}
                    </p>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-3">Need Immediate Assistance?</h4>
                <div className="space-y-2">
                  <a 
                    href="tel:+1-800-555-0123" 
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Phone className="w-4 h-4" />
                    +1 (800) 555-0123
                  </a>
                  <a 
                    href="mailto:support@cheapflights.travel" 
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Mail className="w-4 h-4" />
                    support@cheapflights.travel
                  </a>
                </div>
              </div>

              {/* Email Confirmation Notice */}
              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <Mail className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Confirmation Email Sent
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {bookingDetails.travelerInfo?.email 
                      ? `We've sent a confirmation email to ${bookingDetails.travelerInfo.email}`
                      : "A confirmation email has been sent to your email address."}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                <Link to="/my-bookings" className="w-full">
                  <Button className="w-full" size="lg">
                    <BookOpen className="mr-2 h-5 w-5" />
                    View My Bookings
                  </Button>
                </Link>
                <Link to="/" className="w-full">
                  <Button variant="outline" className="w-full" size="lg">
                    <Home className="mr-2 h-5 w-5" />
                    Return to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AgentWillConnect;