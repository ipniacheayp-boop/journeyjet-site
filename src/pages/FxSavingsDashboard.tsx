import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { toast } from 'sonner';
import { 
  TrendingDown, 
  Download, 
  RefreshCw, 
  DollarSign, 
  Plane, 
  Building2, 
  Car,
  Calendar,
  ArrowLeft,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';

interface FxLog {
  id: string;
  booking_id: string | null;
  product_type: string;
  original_currency: string;
  original_amount: number;
  recommended_currency: string;
  recommended_amount: number;
  savings_usd: number;
  created_at: string;
}

interface Aggregates {
  totalSavingsUsd: number;
  avgSavingsPerBooking: number;
  totalTransactions: number;
  byProductType: Record<string, { count: number; totalSavings: number }>;
}

interface FxStatsResponse {
  logs: FxLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  aggregates: Aggregates;
}

const productTypeIcons: Record<string, React.ReactNode> = {
  flight: <Plane className="h-4 w-4" />,
  hotel: <Building2 className="h-4 w-4" />,
  car: <Car className="h-4 w-4" />,
};

export default function FxSavingsDashboard() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState<FxStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
      return;
    }
    
    if (!isAdmin) {
      toast.error('Admin access required');
      navigate('/');
      return;
    }

    fetchStats();
  }, [user, isAdmin, page, dateFilter]);

  const getDateRange = () => {
    const end = new Date();
    let start: Date | null = null;

    switch (dateFilter) {
      case '7d':
        start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = null;
    }

    return { startDate: start?.toISOString(), endDate: end.toISOString() };
  };

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error('No auth token');
      }

      const { startDate, endDate } = getDateRange();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fx-admin-stats?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch stats');
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('[FxSavingsDashboard] Error:', error);
      toast.error('Failed to load FX savings data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error('No auth token');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fx-admin-stats?export=csv`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fx-smartsave-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Export downloaded successfully');
    } catch (error) {
      console.error('[FxSavingsDashboard] Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <TrendingDown className="h-8 w-8 text-green-600" />
                FX-SmartSave Analytics
              </h1>
              <p className="text-muted-foreground">
                Currency arbitrage savings and recommendations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as typeof dateFilter)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={fetchStats} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Button onClick={handleExport} disabled={isExporting}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Aggregates Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Savings</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold text-green-600">
                  ${data?.aggregates.totalSavingsUsd.toLocaleString() || '0'}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg Savings / Transaction</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">
                  ${data?.aggregates.avgSavingsPerBooking.toFixed(2) || '0'}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">
                  {data?.aggregates.totalTransactions.toLocaleString() || '0'}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Top Segment</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="flex items-center gap-2">
                  {data?.aggregates.byProductType && Object.entries(data.aggregates.byProductType)
                    .sort(([, a], [, b]) => b.totalSavings - a.totalSavings)
                    .slice(0, 1)
                    .map(([type, stats]) => (
                      <div key={type} className="flex items-center gap-2">
                        {productTypeIcons[type]}
                        <span className="text-xl font-bold capitalize">{type}</span>
                        <Badge variant="secondary">${stats.totalSavings.toFixed(0)}</Badge>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* By Product Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {['flight', 'hotel', 'car'].map((type) => {
            const stats = data?.aggregates.byProductType?.[type];
            return (
              <Card key={type}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {productTypeIcons[type]}
                    <span className="capitalize">{type}s</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-12 w-full" />
                  ) : stats ? (
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-lg font-bold">{stats.count} transactions</div>
                        <div className="text-sm text-muted-foreground">
                          ${stats.totalSavings.toFixed(2)} saved
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Avg/txn</div>
                        <div className="font-medium">
                          ${stats.count > 0 ? (stats.totalSavings / stats.count).toFixed(2) : '0'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">No data</div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              SmartSave Transaction Log
            </CardTitle>
            <CardDescription>
              Recent currency optimization recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Original</TableHead>
                      <TableHead>Recommended</TableHead>
                      <TableHead className="text-right">Savings</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {productTypeIcons[log.product_type]}
                            <span className="capitalize">{log.product_type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.original_currency} {log.original_amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            {log.recommended_currency} {log.recommended_amount.toLocaleString()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          ${log.savings_usd.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!data?.logs || data.logs.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No SmartSave transactions recorded yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {data && data.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total)
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page >= data.pagination.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
