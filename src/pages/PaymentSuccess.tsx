import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, BookOpen, Loader2, AlertCircle, Download, Ticket } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type BookingStage = 'pending_payment' | 'processing_provider' | 'confirmed' | 'failed' | 'unknown';

interface BookingDetails {
  bookingId: string;
  bookingStatus: string;
  paymentStatus: string;
  paymentVerified: boolean;
  providerBooked: boolean;
  amount: number;
  currency: string;
  bookingType: string;
  confirmedAt: string | null;
  providerBookingId: string | null;
}

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");
  const bookingIdFromUrl = searchParams.get("booking_id");
  
  const [stage, setStage] = useState<BookingStage>('pending_payment');
  const [pollCount, setPollCount] = useState(0);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  
  const maxPolls = 45; // Poll for up to 6 minutes (45 * 8s)
  const pollInterval = 8000; // 8 seconds

  // Get booking ID from URL or sessionStorage
  const getBookingId = useCallback(() => {
    if (bookingIdFromUrl) return bookingIdFromUrl;
    
    const pendingBooking = sessionStorage.getItem('pendingBooking');
    if (pendingBooking) {
      try {
        const parsed = JSON.parse(pendingBooking);
        return parsed.bookingId;
      } catch {
        return null;
      }
    }
    return null;
  }, [bookingIdFromUrl]);

  const pollBookingStatus = useCallback(async () => {
    const bookingId = getBookingId();
    
    try {
      // Use the new session-verify endpoint
      const queryParams = new URLSearchParams();
      if (sessionId) queryParams.set('session_id', sessionId);
      if (bookingId) queryParams.set('booking_id', bookingId);

      const { data, error } = await supabase.functions.invoke('payments-session-verify', {
        body: null,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Fallback to direct query with params
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payments-session-verify?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to verify session');
      }

      const result = await response.json();
      
      if (result.bookingId) {
        setBookingDetails(result);
        
        // Check for confirmed status
        if (result.bookingStatus === 'confirmed' || result.providerBooked) {
          setStage('confirmed');
          sessionStorage.removeItem('pendingBooking');
          toast.success("Booking confirmed successfully!");
          return true; // Stop polling
        }
        
        // Check for failed/cancelled status  
        if (result.bookingStatus === 'cancelled' || result.bookingStatus === 'refunded') {
          setStage('failed');
          toast.error("Booking was cancelled or refunded");
          return true; // Stop polling
        }
        
        // Payment succeeded but booking not yet confirmed
        if (result.paymentVerified || result.stripePaymentStatus === 'paid') {
          setStage('processing_provider');
        }
      }
    } catch (err) {
      console.error('Error polling booking status:', err);
    }
    
    return false; // Continue polling
  }, [getBookingId, sessionId]);

  useEffect(() => {
    // Initial toast
    toast.success("Payment received! Confirming your booking...");
    
    // Start polling
    const poll = async () => {
      const shouldStop = await pollBookingStatus();
      if (shouldStop || pollCount >= maxPolls) {
        if (pollCount >= maxPolls && stage !== 'confirmed') {
          setStage('processing_provider');
          toast.info("We're still confirming your booking. You'll receive an email shortly.");
        }
        return;
      }
      
      setPollCount(prev => prev + 1);
    };

    poll();
    
    const intervalId = setInterval(async () => {
      if (pollCount < maxPolls && stage !== 'confirmed' && stage !== 'failed') {
        const shouldStop = await pollBookingStatus();
        if (shouldStop) {
          clearInterval(intervalId);
        } else {
          setPollCount(prev => prev + 1);
        }
      } else {
        clearInterval(intervalId);
      }
    }, pollInterval);

    return () => clearInterval(intervalId);
  }, [pollBookingStatus, pollCount, stage, maxPolls]);

  // Auto-redirect after confirmation
  useEffect(() => {
    if (stage === 'confirmed') {
      const timer = setTimeout(() => {
        navigate('/my-bookings');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [stage, navigate]);

  const renderStatusContent = () => {
    switch (stage) {
      case 'confirmed':
        return (
          <>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">Booking Confirmed!</CardTitle>
          </>
        );
      
      case 'processing_provider':
        return (
          <>
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl text-blue-700">Confirming with Provider...</CardTitle>
          </>
        );
      
      case 'failed':
        return (
          <>
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-700">Booking Issue</CardTitle>
          </>
        );
      
      default:
        return (
          <>
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl">Processing Payment...</CardTitle>
          </>
        );
    }
  };

  const renderStatusMessage = () => {
    switch (stage) {
      case 'confirmed':
        return (
          <div className="space-y-3">
            <p className="text-muted-foreground">
              Your booking has been confirmed! A confirmation email has been sent to your email address.
            </p>
            {bookingDetails?.providerBookingId && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Ticket className="w-4 h-4" />
                  Confirmation: {bookingDetails.providerBookingId}
                </p>
              </div>
            )}
            {bookingDetails?.amount && (
              <p className="text-lg font-semibold">
                Total Paid: ${bookingDetails.amount.toLocaleString()} {bookingDetails.currency || 'USD'}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Redirecting to your bookings...
            </p>
          </div>
        );
      
      case 'processing_provider':
        return (
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Payment received! We're now confirming your booking with the travel provider.
            </p>
            <p className="text-sm text-muted-foreground">
              This may take a few moments. You'll receive an email confirmation shortly.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-blue-600 mt-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Checking status... ({pollCount}/{maxPolls})</span>
            </div>
          </div>
        );
      
      case 'failed':
        return (
          <div className="space-y-2">
            <p className="text-muted-foreground">
              There was an issue with your booking. If payment was taken, a refund will be processed automatically.
            </p>
            <p className="text-sm text-muted-foreground">
              Please contact support if you need assistance.
            </p>
          </div>
        );
      
      default:
        return (
          <p className="text-muted-foreground">
            Please wait while we process your payment...
          </p>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            {renderStatusContent()}
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {renderStatusMessage()}
            
            {sessionId && (
              <p className="text-xs text-muted-foreground font-mono">
                Session: {sessionId.substring(0, 20)}...
              </p>
            )}
            
            <div className="flex flex-col gap-3 justify-center pt-4">
              <Link to="/my-bookings" className="w-full">
                <Button className="w-full" variant={stage === 'confirmed' ? 'default' : 'outline'}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  View My Bookings
                </Button>
              </Link>
              <Link to="/" className="w-full">
                <Button variant="ghost" className="w-full">Back to Home</Button>
              </Link>
              
              {stage === 'processing_provider' && (
                <p className="text-xs text-muted-foreground mt-2">
                  Our agent will connect with you shortly...
                </p>
              )}
              
              {stage === 'failed' && (
                <Link to="/support" className="w-full">
                  <Button variant="destructive" className="w-full">Contact Support</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
