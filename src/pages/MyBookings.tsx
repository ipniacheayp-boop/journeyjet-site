import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plane, Hotel, Car, Calendar, DollarSign, Mail, User as UserIcon, RefreshCw, Star, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ReviewsSection } from '@/components/ReviewsSection';

interface Booking {
  id: string;
  booking_type: string;
  status: string;
  amount: number;
  currency: string;
  contact_email: string;
  contact_name: string;
  contact_phone: string;
  created_at: string;
  booking_details: any;
}

const MyBookings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login');
      return;
    }

    if (user) {
      fetchBookings();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('bookings-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'bookings',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('New booking detected:', payload);
            setBookings(prev => [payload.new as Booking, ...prev]);
            toast({
              title: "New Booking!",
              description: "Your booking has been confirmed.",
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'bookings',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Booking updated:', payload);
            setBookings(prev => 
              prev.map(b => b.id === payload.new.id ? payload.new as Booking : b)
            );
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, authLoading, navigate]);

  const fetchBookings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getBookingIcon = (type: string) => {
    switch (type) {
      case 'flight':
        return <Plane className="w-5 h-5" />;
      case 'hotel':
        return <Hotel className="w-5 h-5" />;
      case 'car':
        return <Car className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending_payment':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'refunded':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getBookingDetails = (booking: Booking) => {
    const details = booking.booking_details || {};
    
    if (booking.booking_type === 'car') {
      const vehicle = details.vehicle || {};
      const provider = details.provider || {};
      const pickUp = details.pickUp || {};
      const dropOff = details.dropOff || {};
      
      return (
        <div className="mt-3 pt-3 border-t space-y-2">
          <div className="text-sm">
            <span className="font-medium">Vehicle: </span>
            {vehicle.make} {vehicle.model || vehicle.category || 'Car Rental'}
          </div>
          {provider.name && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Provider: </span>{provider.name}
            </div>
          )}
          {details.confirmationNumber && (
            <div className="text-sm">
              <span className="font-medium">Confirmation: </span>
              <span className="font-mono">{details.confirmationNumber}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {vehicle.category && (
              <Badge variant="outline" className="text-xs">{vehicle.category}</Badge>
            )}
            {vehicle.transmission && (
              <Badge variant="outline" className="text-xs">{vehicle.transmission}</Badge>
            )}
            {vehicle.seats && (
              <Badge variant="outline" className="text-xs">{vehicle.seats} seats</Badge>
            )}
          </div>
        </div>
      );
    }
    
    if (booking.booking_type === 'flight') {
      const itinerary = details.itineraries?.[0];
      const segments = itinerary?.segments || [];
      const firstSegment = segments[0];
      const lastSegment = segments[segments.length - 1];
      
      if (firstSegment && lastSegment) {
        return (
          <div className="mt-3 pt-3 border-t text-sm">
            <span className="font-medium">{firstSegment.departure?.iataCode}</span>
            <span className="mx-2">→</span>
            <span className="font-medium">{lastSegment.arrival?.iataCode}</span>
            {details.amadeus_pnr && (
              <span className="ml-4 text-muted-foreground">PNR: {details.amadeus_pnr}</span>
            )}
          </div>
        );
      }
    }
    
    if (booking.booking_type === 'hotel') {
      const hotel = details.hotel || {};
      return (
        <div className="mt-3 pt-3 border-t text-sm">
          <span className="font-medium">{hotel.name || 'Hotel Booking'}</span>
          {hotel.cityCode && (
            <span className="text-muted-foreground ml-2">({hotel.cityCode})</span>
          )}
        </div>
      );
    }
    
    return null;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
              <p className="text-muted-foreground">View and manage your travel bookings</p>
            </div>
            <Button onClick={fetchBookings} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {bookings.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-muted-foreground text-lg">No bookings yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start planning your next adventure!
                </p>
                <Button className="mt-4" onClick={() => navigate('/')}>
                  Search Flights & Hotels
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          {getBookingIcon(booking.booking_type)}
                        </div>
                        <div>
                          <CardTitle className="capitalize">{booking.booking_type} Booking</CardTitle>
                          <CardDescription>
                            Booking ID: {booking.id.slice(0, 8)}...
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <UserIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{booking.contact_name || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{booking.contact_email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{new Date(booking.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold text-lg">
                            {booking.currency} {booking.amount.toFixed(2)}
                          </span>
                        </div>
                        {booking.status === 'confirmed' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="w-full">
                                <Star className="w-4 h-4 mr-2" />
                                Review Booking
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Reviews for {booking.booking_type} Booking</DialogTitle>
                              </DialogHeader>
                              <ReviewsSection bookingId={booking.id} showSubmitForm={true} />
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                    {getBookingDetails(booking)}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyBookings;
