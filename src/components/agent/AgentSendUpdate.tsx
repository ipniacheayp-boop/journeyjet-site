import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2, FileText } from 'lucide-react';

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
  const [sendingConfirmation, setSendingConfirmation] = useState(false);

  // Booking confirmation form fields
  const [confirmationData, setConfirmationData] = useState({
    clientEmail: '',
    bookingRef: '',
    travelerName: '',
    flightNumber: '',
    airline: '',
    departureDateTime: '',
    originAirport: '',
    destinationAirport: '',
    totalFare: '',
    paymentMethod: 'Stripe',
    agentPhone: '',
    customMessage: '',
  });

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

  const handleSendConfirmation = async () => {
    // Validate required fields
    const requiredFields = [
      { field: confirmationData.clientEmail, name: 'Client Email' },
      { field: confirmationData.bookingRef, name: 'Booking Reference' },
      { field: confirmationData.travelerName, name: 'Traveler Name' },
      { field: confirmationData.flightNumber, name: 'Flight Number' },
      { field: confirmationData.airline, name: 'Airline' },
      { field: confirmationData.departureDateTime, name: 'Departure Date & Time' },
      { field: confirmationData.originAirport, name: 'Origin Airport' },
      { field: confirmationData.destinationAirport, name: 'Destination Airport' },
      { field: confirmationData.totalFare, name: 'Total Fare' },
      { field: confirmationData.agentPhone, name: 'Agent Phone' },
    ];

    const missingField = requiredFields.find(({ field }) => !field.trim());
    if (missingField) {
      toast({
        title: 'Validation Error',
        description: `Please enter ${missingField.name}`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setSendingConfirmation(true);

      const { data, error } = await supabase.functions.invoke('agent-send-confirmation', {
        body: {
          agentId,
          clientEmail: confirmationData.clientEmail.trim(),
          bookingRef: confirmationData.bookingRef.trim(),
          travellers: [
            {
              name: confirmationData.travelerName.trim(),
            },
          ],
          flightDetails: [
            {
              airline: confirmationData.airline.trim(),
              flightNo: confirmationData.flightNumber.trim(),
              departureCity: confirmationData.originAirport.trim(),
              arrivalCity: confirmationData.destinationAirport.trim(),
              departureTime: confirmationData.departureDateTime,
            },
          ],
          totalFare: parseFloat(confirmationData.totalFare),
          currency: 'USD',
          paymentMethod: confirmationData.paymentMethod,
          agentPhone: confirmationData.agentPhone.trim(),
          message: confirmationData.customMessage.trim() || 'Your booking is confirmed! Your e-ticket will be emailed shortly.',
        },
      });

      if (error) {
        console.error('[AgentSendUpdate] Error sending confirmation:', error);
        toast({
          title: 'Failed to send confirmation',
          description: 'Please try again later',
          variant: 'destructive',
        });
        return;
      }

      if (data?.success) {
        toast({
          title: 'Booking Confirmation sent successfully!',
          description: `PDF confirmation emailed to ${confirmationData.clientEmail}`,
        });
        // Reset form
        setConfirmationData({
          clientEmail: '',
          bookingRef: '',
          travelerName: '',
          flightNumber: '',
          airline: '',
          departureDateTime: '',
          originAirport: '',
          destinationAirport: '',
          totalFare: '',
          paymentMethod: 'Stripe',
          agentPhone: '',
          customMessage: '',
        });
      } else {
        toast({
          title: 'Failed to send confirmation',
          description: data?.error || 'Unknown error occurred',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[AgentSendUpdate] Unexpected error:', error);
      toast({
        title: 'Failed to send confirmation',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setSendingConfirmation(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Client Communication
          </CardTitle>
          <CardDescription>
            Send booking updates, confirmations, or custom messages to your clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="update" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="update">
                <Mail className="h-4 w-4 mr-2" />
                Send Update
              </TabsTrigger>
              <TabsTrigger value="confirmation">
                <FileText className="h-4 w-4 mr-2" />
                Booking Confirmation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="update" className="space-y-6 mt-6">
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
            </TabsContent>

            <TabsContent value="confirmation" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client Email */}
                <div className="space-y-2">
                  <Label htmlFor="conf-email">Client Email *</Label>
                  <Input
                    id="conf-email"
                    type="email"
                    placeholder="customer@example.com"
                    value={confirmationData.clientEmail}
                    onChange={(e) => setConfirmationData({ ...confirmationData, clientEmail: e.target.value })}
                    required
                  />
                </div>

                {/* Booking Reference */}
                <div className="space-y-2">
                  <Label htmlFor="conf-ref">Booking Reference *</Label>
                  <Input
                    id="conf-ref"
                    placeholder="CF123456"
                    value={confirmationData.bookingRef}
                    onChange={(e) => setConfirmationData({ ...confirmationData, bookingRef: e.target.value })}
                    required
                  />
                </div>

                {/* Traveler Name */}
                <div className="space-y-2">
                  <Label htmlFor="traveler-name">Traveler Name *</Label>
                  <Input
                    id="traveler-name"
                    placeholder="John Smith"
                    value={confirmationData.travelerName}
                    onChange={(e) => setConfirmationData({ ...confirmationData, travelerName: e.target.value })}
                    required
                  />
                </div>

                {/* Airline */}
                <div className="space-y-2">
                  <Label htmlFor="airline">Airline Name *</Label>
                  <Input
                    id="airline"
                    placeholder="American Airlines"
                    value={confirmationData.airline}
                    onChange={(e) => setConfirmationData({ ...confirmationData, airline: e.target.value })}
                    required
                  />
                </div>

                {/* Flight Number */}
                <div className="space-y-2">
                  <Label htmlFor="flight-no">Flight Number *</Label>
                  <Input
                    id="flight-no"
                    placeholder="AA2858"
                    value={confirmationData.flightNumber}
                    onChange={(e) => setConfirmationData({ ...confirmationData, flightNumber: e.target.value })}
                    required
                  />
                </div>

                {/* Departure DateTime */}
                <div className="space-y-2">
                  <Label htmlFor="departure-time">Departure Date & Time *</Label>
                  <Input
                    id="departure-time"
                    type="datetime-local"
                    value={confirmationData.departureDateTime}
                    onChange={(e) => setConfirmationData({ ...confirmationData, departureDateTime: e.target.value })}
                    required
                  />
                </div>

                {/* Origin Airport */}
                <div className="space-y-2">
                  <Label htmlFor="origin">Origin Airport *</Label>
                  <Input
                    id="origin"
                    placeholder="Saint Louis, MO (STL)"
                    value={confirmationData.originAirport}
                    onChange={(e) => setConfirmationData({ ...confirmationData, originAirport: e.target.value })}
                    required
                  />
                </div>

                {/* Destination Airport */}
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination Airport *</Label>
                  <Input
                    id="destination"
                    placeholder="Dallas, TX (DFW)"
                    value={confirmationData.destinationAirport}
                    onChange={(e) => setConfirmationData({ ...confirmationData, destinationAirport: e.target.value })}
                    required
                  />
                </div>

                {/* Total Fare */}
                <div className="space-y-2">
                  <Label htmlFor="fare">Total Fare (USD) *</Label>
                  <Input
                    id="fare"
                    type="number"
                    step="0.01"
                    placeholder="4373.60"
                    value={confirmationData.totalFare}
                    onChange={(e) => setConfirmationData({ ...confirmationData, totalFare: e.target.value })}
                    required
                  />
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label htmlFor="payment">Payment Method *</Label>
                  <Select 
                    value={confirmationData.paymentMethod}
                    onValueChange={(value) => setConfirmationData({ ...confirmationData, paymentMethod: value })}
                  >
                    <SelectTrigger id="payment">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Stripe">Stripe</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                      <SelectItem value="Wallet">Wallet</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Agent Phone */}
                <div className="space-y-2">
                  <Label htmlFor="agent-phone">Agent Phone Number *</Label>
                  <Input
                    id="agent-phone"
                    type="tel"
                    placeholder="+1-216-302-2732"
                    value={confirmationData.agentPhone}
                    onChange={(e) => setConfirmationData({ ...confirmationData, agentPhone: e.target.value })}
                    required
                  />
                </div>

                {/* Custom Message */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="custom-msg">Custom Message (Optional)</Label>
                  <Textarea
                    id="custom-msg"
                    placeholder="Your booking is confirmed! Your e-ticket will be emailed shortly."
                    value={confirmationData.customMessage}
                    onChange={(e) => setConfirmationData({ ...confirmationData, customMessage: e.target.value })}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>

              {/* Generate & Send Button */}
              <Button 
                onClick={handleSendConfirmation}
                disabled={sendingConfirmation}
                className="w-full sm:w-auto"
              >
                {sendingConfirmation ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating PDF & Sending...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate & Send Confirmation
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentSendUpdate;
