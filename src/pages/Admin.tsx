import { useState, useEffect } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  FileText, 
  BarChart3,
  RefreshCw,
  Shield,
  DollarSign,
  ShoppingCart,
  Activity,
  LogOut,
  Radio,
  Star,
  Edit,
  Eye,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ReviewsSection } from '@/components/ReviewsSection';
import { SiteReviewsAdmin } from '@/components/SiteReviewsAdmin';
import { StripeHealthCheck } from '@/components/StripeHealthCheck';
import AgentManagement from '@/components/agent/AgentManagement';

interface Booking {
  id: string;
  booking_type: string;
  status: string;
  payment_status: string | null;
  payment_method: string | null;
  amount: number;
  currency: string;
  contact_email: string;
  contact_name: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
  booking_details: any;
  transaction_id: string | null;
}

interface Payment {
  payment_id: string;
  booking_reference: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  booking_type?: string;
  contact_email?: string;
}

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  role: string;
}

interface Stats {
  totalBookings: number;
  totalRevenue: number;
  bookingsByType: Record<string, number>;
  bookingsByStatus: Record<string, number>;
  bookingsByDay: Record<string, number>;
  recentBookingsCount: number;
}

const Admin = () => {
  const { isAdmin, loading } = useAdmin();
  const { signOut } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editStatus, setEditStatus] = useState<string>('');
  const [editPaymentStatus, setEditPaymentStatus] = useState<string>('');
  const [editPaymentMethod, setEditPaymentMethod] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  // View modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
      
      // Set up real-time updates for bookings
      const channel = supabase
        .channel('admin-bookings-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookings'
          },
          (payload) => {
            console.log('Booking change detected:', payload);
            fetchAllData();
          }
        )
        .subscribe();

      // Auto-refresh every 30 seconds (reduced from 5 to avoid console spam)
      const interval = setInterval(() => {
        fetchStats();
      }, 30000);

      return () => {
        supabase.removeChannel(channel);
        clearInterval(interval);
      };
    }
  }, [isAdmin]);

  const fetchAllData = async () => {
    setLoadingData(true);
    await Promise.all([
      fetchBookings(),
      fetchPayments(),
      fetchUsers(),
      fetchStats(),
    ]);
    setLoadingData(false);
  };

  const fetchBookings = async () => {
    try {
      console.log('[Admin] Fetching bookings with filters:', { filterType, filterStatus });
      const { data, error } = await supabase.functions.invoke('admin-bookings', {
        body: { 
          type: filterType !== 'all' ? filterType : undefined, 
          status: filterStatus !== 'all' ? filterStatus : undefined 
        },
      });

      if (error) {
        console.error('[Admin] Edge function error:', error);
        throw error;
      }
      
      console.log('[Admin] Received bookings:', data?.bookings?.length || 0);
      setBookings(data?.bookings || []);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch bookings",
        variant: "destructive",
      });
      setBookings([]);
    }
  };

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-payments');
      if (error) throw error;
      setPayments(data.payments || []);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      // Silent fail for payments - not critical
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-users');
      if (error) throw error;
      setUsers(data.users || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      // Silent fail for users - not critical
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-stats');
      if (error) throw error;
      setStats(data);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      // Silent fail for stats - not critical
    }
  };

  const handleRefund = async (bookingId: string) => {
    if (!confirm('Are you sure you want to refund this booking?')) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-refund', {
        body: { booking_id: bookingId },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Refund processed: ${data.currency} ${data.amount}`,
      });

      fetchAllData();
    } catch (error: any) {
      console.error('Error processing refund:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process refund",
        variant: "destructive",
      });
    }
  };

  const openEditModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditStatus(booking.status);
    setEditPaymentStatus(booking.payment_status || 'pending');
    setEditPaymentMethod(booking.payment_method || 'agent');
    setEditNotes(booking.booking_details?.admin_notes || '');
    setEditModalOpen(true);
  };

  const openViewModal = (booking: Booking) => {
    setViewBooking(booking);
    setViewModalOpen(true);
  };

  const handleUpdateBooking = async () => {
    if (!selectedBooking) return;

    setUpdating(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-booking-update', {
        body: {
          booking_id: selectedBooking.id,
          status: editStatus,
          payment_status: editPaymentStatus,
          payment_method: editPaymentMethod,
          notes: editNotes
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Booking updated successfully",
      });

      setEditModalOpen(false);
      fetchBookings();
    } catch (error: any) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update booking",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'succeeded':
      case 'paid':
        return 'bg-green-500';
      case 'pending_payment':
      case 'processing':
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
      case 'failed':
        return 'bg-red-500';
      case 'refunded':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getPaymentStatusColor = (status: string | null) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'bg-green-500';
      case 'pending':
      case 'processing':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      case 'refunded':
        return 'bg-gray-500';
      default:
        return 'bg-yellow-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold flex items-center gap-2">
                <Shield className="h-8 w-8 text-primary" />
                Admin Dashboard
              </h1>
              <Badge variant="outline" className="flex items-center gap-1">
                <Radio className="h-3 w-3 text-green-500 animate-pulse" />
                Live
              </Badge>
            </div>
            <p className="text-muted-foreground">Manage bookings, payments, and users • Updates automatically</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchAllData} disabled={loadingData} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingData ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={signOut} variant="destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="site-reviews" className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-primary" />
              Site Reviews
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalBookings || bookings.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.recentBookingsCount || 0} in last 30 days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats?.totalRevenue?.toFixed(2) || '0.00'}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                  <p className="text-xs text-muted-foreground">Registered accounts</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Health</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Operational</div>
                  <p className="text-xs text-muted-foreground">All systems running</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Bookings by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats?.bookingsByType && Object.entries(stats.bookingsByType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{type}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bookings by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats?.bookingsByStatus && Object.entries(stats.bookingsByStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                        <Badge className={getStatusColor(status)}>{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Bookings Management</CardTitle>
                    <CardDescription>View and manage all bookings ({bookings.length} total)</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="flight">Flight</SelectItem>
                        <SelectItem value="hotel">Hotel</SelectItem>
                        <SelectItem value="car">Car</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="pending_payment">Pending</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button onClick={fetchBookings} size="sm">
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-mono text-xs">{booking.id.slice(0, 8)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {booking.booking_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium">{booking.contact_name || 'N/A'}</div>
                                <div className="text-muted-foreground text-xs">{booking.contact_email}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {booking.contact_phone ? (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {booking.contact_phone}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">N/A</span>
                              )}
                            </TableCell>
                            <TableCell className="font-semibold">
                              {booking.currency} {booking.amount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status.replace(/_/g, ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getPaymentStatusColor(booking.payment_status)}>
                                {booking.payment_status || 'pending'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm capitalize">
                              {booking.payment_method || 'N/A'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(booking.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openViewModal(booking)}
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditModal(booking)}
                                  title="Edit Booking"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {booking.status === 'confirmed' && booking.payment_status === 'paid' && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleRefund(booking.id)}
                                  >
                                    Refund
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {!loadingData && bookings.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No bookings found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Transactions</CardTitle>
                <CardDescription>View all Stripe payment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Booking</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.payment_id}>
                        <TableCell className="font-mono text-xs">{payment.payment_id?.substring(0, 20)}...</TableCell>
                        <TableCell className="font-semibold">
                          {payment.currency} {payment.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payment.booking_type ? (
                            <Badge variant="outline" className="capitalize">
                              {payment.booking_type}
                            </Badge>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{payment.contact_email || 'N/A'}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {payments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No payments found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead>Last Sign In</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.last_sign_in_at 
                            ? new Date(user.last_sign_in_at).toLocaleDateString()
                            : 'Never'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {users.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Booking Reviews</CardTitle>
                <CardDescription>View and manage booking-specific reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <ReviewsSection />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="site-reviews" className="space-y-4">
            <SiteReviewsAdmin />
          </TabsContent>

          <TabsContent value="agents" className="space-y-4">
            <AgentManagement />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="grid gap-4">
              <StripeHealthCheck />
              
              <Card>
                <CardHeader>
                  <CardTitle>Analytics & Reports</CardTitle>
                  <CardDescription>View booking trends and statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Recent Activity (Last 30 Days)</h3>
                      {stats?.bookingsByDay && Object.keys(stats.bookingsByDay).length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries(stats.bookingsByDay)
                            .sort(([a], [b]) => b.localeCompare(a))
                            .slice(0, 10)
                            .map(([date, count]) => (
                              <div key={date} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <span className="text-sm font-medium">{new Date(date).toLocaleDateString()}</span>
                                <Badge>{count} bookings</Badge>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No recent activity
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Booking Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>
              Update booking status and payment information
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <strong>Booking ID:</strong> {selectedBooking.id.slice(0, 8)}...
              </div>
              <div className="text-sm text-muted-foreground">
                <strong>Customer:</strong> {selectedBooking.contact_name} ({selectedBooking.contact_email})
              </div>
              
              <div className="space-y-2">
                <Label>Booking Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending_payment">Pending Payment</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select value={editPaymentStatus} onValueChange={setEditPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={editPaymentMethod} onValueChange={setEditPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="agent">Agent (Offline)</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Admin Notes</Label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add internal notes..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBooking} disabled={updating}>
              {updating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Booking Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Full booking information
            </DialogDescription>
          </DialogHeader>
          
          {viewBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Booking ID</Label>
                  <p className="font-mono text-sm">{viewBooking.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Transaction ID</Label>
                  <p className="font-mono text-sm">{viewBooking.transaction_id || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <Badge variant="outline" className="capitalize">{viewBooking.booking_type}</Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={getStatusColor(viewBooking.status)}>
                    {viewBooking.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Payment Status</Label>
                  <Badge className={getPaymentStatusColor(viewBooking.payment_status)}>
                    {viewBooking.payment_status || 'pending'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Payment Method</Label>
                  <p className="capitalize">{viewBooking.payment_method || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className="font-semibold">{viewBooking.currency} {viewBooking.amount.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <p className="text-sm">{new Date(viewBooking.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p>{viewBooking.contact_name || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p>{viewBooking.contact_email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p>{viewBooking.contact_phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Booking Details</h4>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-48">
                  {JSON.stringify(viewBooking.booking_details, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setViewModalOpen(false);
              if (viewBooking) openEditModal(viewBooking);
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Admin;
