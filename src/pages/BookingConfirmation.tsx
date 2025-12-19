import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, BookOpen, Home, Mail, Ticket, Plane, Hotel, Car } from "lucide-react";

interface ConfirmationDetails {
  bookingId: string;
  bookingReference: string;
  bookingType: string;
  amount: string;
  currency: string;
  travelerInfo?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const BookingConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingIdFromUrl = searchParams.get("booking_id");
  const [confirmationDetails, setConfirmationDetails] = useState<ConfirmationDetails | null>(null);

  useEffect(() => {
    // Try to get booking details from session storage or URL
    const pendingBooking = sessionStorage.getItem('pendingBooking');
    
    if (pendingBooking) {
      try {
        const parsed = JSON.parse(pendingBooking);
        setConfirmationDetails({
          bookingId: parsed.bookingId,
          bookingReference: parsed.bookingReference || parsed.bookingId?.slice(0, 8).toUpperCase(),
          bookingType: parsed.bookingType,
          amount: parsed.amount,
          currency: parsed.currency || 'USD',
          travelerInfo: parsed.travelerInfo,
        });
        // Clear session storage after confirmation
        sessionStorage.removeItem('pendingBooking');
        sessionStorage.removeItem('selectedOffer');
      } catch (e) {
        console.error('[BookingConfirmation] Error parsing stored booking:', e);
      }
    } else if (bookingIdFromUrl) {
      setConfirmationDetails({
        bookingId: bookingIdFromUrl,
        bookingReference: bookingIdFromUrl.slice(0, 8).toUpperCase(),
        bookingType: 'flight',
        amount: '0',
        currency: 'USD',
      });
    }
  }, [bookingIdFromUrl]);

  const getBookingIcon = () => {
    switch (confirmationDetails?.bookingType) {
      case 'flights':
      case 'flight':
        return <Plane className="w-8 h-8 text-primary" />;
      case 'hotels':
      case 'hotel':
        return <Hotel className="w-8 h-8 text-primary" />;
      case 'cars':
      case 'car':
        return <Car className="w-8 h-8 text-primary" />;
      default:
        return <Ticket className="w-8 h-8 text-primary" />;
    }
  };

  if (!confirmationDetails) {
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
                Booking Confirmed!
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Your booking has been successfully confirmed.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Booking Reference */}
              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Booking Reference</p>
                <div className="flex items-center justify-center gap-3">
                  {getBookingIcon()}
                  <span className="text-3xl font-bold font-mono tracking-wider">
                    {confirmationDetails.bookingReference}
                  </span>
                </div>
              </div>

              {/* Booking Summary */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Booking Type</span>
                  <span className="font-medium capitalize">{confirmationDetails.bookingType}</span>
                </div>
                
                {parseFloat(confirmationDetails.amount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Paid</span>
                    <span className="font-bold text-lg">
                      ${parseFloat(confirmationDetails.amount).toFixed(2)} {confirmationDetails.currency}
                    </span>
                  </div>
                )}
                
                {confirmationDetails.travelerInfo && (
                  <>
                    <div className="border-t pt-3 mt-3">
                      <p className="text-sm font-medium mb-2">Traveler</p>
                      <p className="text-sm text-muted-foreground">
                        {confirmationDetails.travelerInfo.firstName} {confirmationDetails.travelerInfo.lastName}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Email Confirmation Notice */}
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Confirmation Email Sent
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {confirmationDetails.travelerInfo?.email 
                      ? `We've sent a confirmation email to ${confirmationDetails.travelerInfo.email}`
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

export default BookingConfirmation;
