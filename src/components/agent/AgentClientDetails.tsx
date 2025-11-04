import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Eye, Mail, Phone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AgentClientDetailsProps {
  agentId: string;
}

interface BookingWithUser {
  id: string;
  booking_type: string;
  status: string;
  amount: number;
  currency: string;
  created_at: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  user_id: string | null;
}

const AgentClientDetails = ({ agentId }: AgentClientDetailsProps) => {
  const [bookings, setBookings] = useState<BookingWithUser[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<BookingWithUser | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    fetchClientDetails();
  }, [agentId]);

  useEffect(() => {
    applyFilters();
  }, [filterStatus, searchQuery, bookings]);

  const fetchClientDetails = async () => {
    try {
      setLoading(true);
      console.info('[ClientDetails] Fetching bookings for agent:', agentId);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        console.error('[ClientDetails] No session token available');
        return;
      }

      const { data, error } = await supabase.functions.invoke('agent-bookings', {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) {
        console.error('[ClientDetails] Error response:', error);
        throw error;
      }

      console.info('[ClientDetails] Response:', data);

      // Transform the data from edge function format to component format
      const transformedBookings = data?.bookings?.map((booking: any) => ({
        id: booking.booking_reference || 'N/A',
        booking_type: booking.booking_type,
        status: booking.status,
        amount: booking.amount,
        currency: booking.currency,
        created_at: booking.created_at,
        contact_name: booking.user?.name || 'Unknown',
        contact_email: booking.user?.email || 'N/A',
        contact_phone: booking.user?.contact || null,
        user_id: null,
      })) || [];

      setBookings(transformedBookings);
      setFilteredBookings(transformedBookings);
    } catch (error) {
      console.error('[ClientDetails] Error fetching client details:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(b => b.status === filterStatus);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b => 
        b.contact_name?.toLowerCase().includes(query) ||
        b.contact_email?.toLowerCase().includes(query) ||
        b.id.toLowerCase().includes(query)
      );
    }

    setFilteredBookings(filtered);
    setPage(1);
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      confirmed: 'default',
      pending_payment: 'secondary',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status.replace('_', ' ')}</Badge>;
  };

  const paginatedBookings = filteredBookings.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(filteredBookings.length / limit);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Client Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-40" />
          </div>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Client Details</CardTitle>
            <Badge variant="outline">{filteredBookings.length} clients</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or booking ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending_payment">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking Ref</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      {searchQuery || filterStatus !== 'all' 
                        ? 'No clients match your filters'
                        : 'No clients assigned yet'}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-mono text-sm">
                        {booking.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="capitalize">{booking.booking_type}</TableCell>
                      <TableCell className="font-medium">{booking.contact_name}</TableCell>
                      <TableCell className="text-sm">{booking.contact_email}</TableCell>
                      <TableCell className="text-sm">
                        {booking.contact_phone || '—'}
                      </TableCell>
                      <TableCell>
                        {booking.currency} {Number(booking.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Client & Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Client Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedBooking.contact_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm">{selectedBooking.contact_email}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = `mailto:${selectedBooking.contact_email}`}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {selectedBooking.contact_phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm">{selectedBooking.contact_phone}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.location.href = `tel:${selectedBooking.contact_phone}`}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Booking Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Booking Reference</p>
                    <p className="font-mono text-sm">{selectedBooking.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="capitalize">{selectedBooking.booking_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-semibold">
                      {selectedBooking.currency} {Number(selectedBooking.amount).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(selectedBooking.status)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="text-sm">
                      {new Date(selectedBooking.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AgentClientDetails;
