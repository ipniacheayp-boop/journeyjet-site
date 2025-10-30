import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  LayoutDashboard, 
  Plane, 
  Hotel, 
  Car, 
  Wallet, 
  Users, 
  BookOpen, 
  LogOut,
  AlertCircle 
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AgentOverview from '@/components/agent/AgentOverview';
import AgentBookings from '@/components/agent/AgentBookings';
import AgentClients from '@/components/agent/AgentClients';
import AgentWalletView from '@/components/agent/AgentWalletView';
import AgentBookingWidget from '@/components/agent/AgentBookingWidget';
import AgentSupport from '@/components/agent/AgentSupport';

const AgentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [agentProfile, setAgentProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    checkAgentAccess();
  }, []);

  const checkAgentAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/agent/login');
        return;
      }

      // Check if user has agent role
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (roles?.role !== 'agent') {
        toast({
          title: 'Access Denied',
          description: 'You do not have agent access',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      // Fetch agent profile
      const { data: profile } = await supabase
        .from('agent_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      setAgentProfile(profile);
    } catch (error) {
      console.error('Error checking agent access:', error);
      navigate('/agent/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/agent/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Agent Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {agentProfile?.company_name} • {agentProfile?.agent_code}
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="book" className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              <span className="hidden sm:inline">Book</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Wallet</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Clients</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Support</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="overview">
              <AgentOverview agentId={agentProfile.id} />
            </TabsContent>

            <TabsContent value="book">
              <AgentBookingWidget agentId={agentProfile.id} commissionRate={agentProfile.commission_rate} />
            </TabsContent>

            <TabsContent value="bookings">
              <AgentBookings agentId={agentProfile.id} />
            </TabsContent>

            <TabsContent value="wallet">
              <AgentWalletView agentId={agentProfile.id} />
            </TabsContent>

            <TabsContent value="clients">
              <AgentClients agentId={agentProfile.id} />
            </TabsContent>

            <TabsContent value="support">
              <AgentSupport agentId={agentProfile.id} />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default AgentDashboard;
