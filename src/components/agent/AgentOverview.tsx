import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, BookOpen, Wallet } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AgentOverviewProps {
  agentId: string;
}

const AgentOverview = ({ agentId }: AgentOverviewProps) => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalCommission: 0,
    walletBalance: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [agentId]);

  const fetchStats = async () => {
    try {
      // Fetch bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('amount, created_at, status')
        .eq('agent_id', agentId);

      // Fetch commissions
      const { data: commissions } = await supabase
        .from('agent_commissions')
        .select('commission_amount, created_at')
        .eq('agent_id', agentId);

      // Fetch wallet
      const { data: wallet } = await supabase
        .from('agent_wallet')
        .select('balance')
        .eq('agent_id', agentId)
        .single();

      const totalBookings = bookings?.length || 0;
      const totalRevenue = bookings?.reduce((sum, b) => sum + Number(b.amount), 0) || 0;
      const totalCommission = commissions?.reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;
      const walletBalance = wallet?.balance || 0;

      setStats({
        totalBookings,
        totalRevenue,
        totalCommission,
        walletBalance,
      });

      // Prepare chart data (last 6 months)
      const monthlyData: { [key: string]: number } = {};
      bookings?.forEach(booking => {
        const month = new Date(booking.created_at).toLocaleDateString('en-US', { month: 'short' });
        monthlyData[month] = (monthlyData[month] || 0) + Number(booking.amount);
      });

      const chartArray = Object.entries(monthlyData).map(([month, revenue]) => ({
        month,
        revenue,
      }));

      setChartData(chartArray);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="h-32 bg-muted rounded-lg" />
      </div>
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentOverview;
