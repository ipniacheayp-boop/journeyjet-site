import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plane, Hotel, Car, Calendar, DollarSign, Mail, User as UserIcon, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
                          <Button variant="outline" size="sm" className="w-full">
                            View Details
                          </Button>
                        )}
                      </div>
                    </div>
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
