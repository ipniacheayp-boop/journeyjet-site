import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2 } from 'lucide-react';

interface AgentSendUpdateProps {
  agentId: string;
}

interface Booking {
  id: string;
  booking_reference: string;
  booking_type: string;
  contact_email: string;
  contact_name: string;
}

const AgentSendUpdate = ({ agentId }: AgentSendUpdateProps) => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [sending, setSending] = useState(false);

  const [clientEmail, setClientEmail] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [agentId]);

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const { data, error } = await supabase.functions.invoke('agent-bookings');

      if (error) {
        console.error('[AgentSendUpdate] Error fetching bookings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load bookings',
          variant: 'destructive',
        });
        return;
      }

      if (data?.bookings) {
        // Transform bookings data for dropdown
        const formattedBookings = data.bookings.map((b: any) => ({
          id: b.id,
          booking_reference: b.bookingRef || b.id,
          booking_type: b.type || 'Unknown',
          contact_email: b.clientEmail || '',
          contact_name: b.clientName || '',
        }));
        setBookings(formattedBookings);
      }
    } catch (error) {
      console.error('[AgentSendUpdate] Unexpected error:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleBookingSelect = (bookingId: string) => {
    setBookingRef(bookingId);
    const booking = bookings.find(b => b.id === bookingId);
    if (booking && booking.contact_email) {
      setClientEmail(booking.contact_email);
    }
  };

  const handleSendUpdate = async () => {
    if (!clientEmail.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a client email address',
        variant: 'destructive',
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a message',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSending(true);

      const { data, error } = await supabase.functions.invoke('agent-send-update', {
        body: {
          agentId,
          clientEmail: clientEmail.trim(),
          bookingRef: bookingRef || null,
          message: message.trim(),
        },
      });

      if (error) {
        console.error('[AgentSendUpdate] Error sending update:', error);
        toast({
          title: 'Failed to send update',
          description: 'Please try again later',
          variant: 'destructive',
        });
        return;
      }

      if (data?.success) {
        toast({
          title: 'Update sent successfully!',
          description: `Email sent to ${clientEmail}`,
        });
        // Reset form
        setClientEmail('');
        setBookingRef('');
        setMessage('');
      } else {
        toast({
          title: 'Failed to send update',
          description: data?.error || 'Unknown error occurred',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[AgentSendUpdate] Unexpected error:', error);
      toast({
        title: 'Failed to send update',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Update to Client
          </CardTitle>
          <CardDescription>
            Send booking updates, reminders, or custom messages directly to your clients
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Booking Reference (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="booking-ref">Booking Reference (Optional)</Label>
            <Select value={bookingRef} onValueChange={handleBookingSelect} disabled={loadingBookings}>
              <SelectTrigger id="booking-ref">
                <SelectValue placeholder="Select a booking or leave empty" />
              </SelectTrigger>
              <SelectContent>
                {bookings.length === 0 && !loadingBookings && (
                  <div className="p-2 text-sm text-muted-foreground">No bookings found</div>
                )}
                {bookings.map((booking) => (
                  <SelectItem key={booking.id} value={booking.id}>
                    {booking.booking_reference} - {booking.booking_type} ({booking.contact_name || 'No name'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Selecting a booking will auto-fill the client email
            </p>
          </div>

          {/* Client Email */}
          <div className="space-y-2">
            <Label htmlFor="client-email">Client Email *</Label>
            <Input
              id="client-email"
              type="email"
              placeholder="client@example.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              required
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message / Update Content *</Label>
            <Textarea
              id="message"
              placeholder="Enter your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              required
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/1000 characters
            </p>
          </div>

          {/* Send Button */}
          <Button 
            onClick={handleSendUpdate} 
            disabled={sending || !clientEmail || !message}
            className="w-full sm:w-auto"
          >
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Update
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentSendUpdate;
