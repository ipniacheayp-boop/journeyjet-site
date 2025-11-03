import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users,
  TrendingUp,
  User,
  LogOut
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AgentOverview from '@/components/agent/AgentOverview';
import AgentBookings from '@/components/agent/AgentBookings';
import AgentClients from '@/components/agent/AgentClients';
import AgentWalletView from '@/components/agent/AgentWalletView';
import AgentBookingWidget from '@/components/agent/AgentBookingWidget';
import AgentSupport from '@/components/agent/AgentSupport';
import AgentLeads from '@/components/agent/AgentLeads';
import AgentAnalytics from '@/components/agent/AgentAnalytics';
import AgentProfile from '@/components/agent/AgentProfile';
import { PlusCircle } from 'lucide-react';

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
        .maybeSingle();

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
        .maybeSingle();

      // If profile doesn't exist, create one automatically
      if (!profile) {
        const agentCode = `AGT${Date.now().toString().slice(-8)}`;
        const { data: newProfile, error: createError } = await supabase
          .from('agent_profiles')
          .insert({
            user_id: session.user.id,
            agent_code: agentCode,
            company_name: 'My Company',
            contact_person: session.user.email?.split('@')[0] || 'Agent',
            phone: '',
            commission_rate: 5.0,
            is_verified: true,
            status: 'active'
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating agent profile:', createError);
          toast({
            title: 'Setup Error',
            description: 'Failed to create agent profile. Please contact support.',
            variant: 'destructive',
          });
          return;
        }

        // Initialize wallet
        await supabase
          .from('agent_wallet')
          .insert({
            agent_id: newProfile.id,
            balance: 0,
            currency: 'USD'
          });

        setAgentProfile(newProfile);
        toast({
          title: 'Welcome!',
          description: 'Your agent profile has been set up. Please update your details in the Profile tab.',
        });
      } else {
        setAgentProfile(profile);
      }
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

  const handleStartNewBooking = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('agent-start-booking');
      
      if (error) throw error;
      
      if (data.success) {
        // Store agent context in session storage for the booking flow
        sessionStorage.setItem('agentBooking', JSON.stringify({
          agentId: data.agentId,
          agentCode: data.agentCode,
        }));
        
        navigate(data.redirectUrl);
        toast({
          title: 'Starting New Booking',
          description: 'Redirecting to search...',
        });
      }
    } catch (error) {
      console.error('Error starting booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to start new booking',
        variant: 'destructive',
      });
    }
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
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">My Bookings</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
            </TabsList>

            <Button onClick={handleStartNewBooking} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Start New Booking
            </Button>
          </div>

          <div className="mt-6">
            <TabsContent value="overview">
              <AgentOverview agentId={agentProfile.id} />
            </TabsContent>

            <TabsContent value="bookings">
              <AgentBookings agentId={agentProfile.id} />
            </TabsContent>

            <TabsContent value="profile">
              <AgentProfile agentId={agentProfile.id} />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default AgentDashboard;
