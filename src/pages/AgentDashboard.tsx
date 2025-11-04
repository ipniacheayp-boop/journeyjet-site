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
import AgentClientDetails from '@/components/agent/AgentClientDetails';
import { PlusCircle } from 'lucide-react';

const AgentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [agentProfile, setAgentProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState<{ type: string; message: string; field?: string } | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    checkAgentAccess();
  }, []);

  const checkAgentAccess = async () => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('[AgentDashboard] Setup taking longer than expected (12s timeout)');
        setError({
          type: 'TIMEOUT',
          message: 'Setup is taking longer than expected. Please try again.'
        });
        setLoading(false);
      }
    }, 12000);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        clearTimeout(timeoutId);
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
        clearTimeout(timeoutId);
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

      // If profile doesn't exist, create one via edge function
      if (!profile) {
        console.log('[AgentDashboard] No profile found, calling agent_safety_register...');
        
        try {
          const { data: registerData, error: registerError } = await supabase.functions.invoke('agent_safety_register', {
            body: {
              userId: session.user.id,
              companyName: 'My Company',
              contactPerson: session.user.email?.split('@')[0] || 'Agent',
              phone: ''
            }
          });

          console.warn('[AgentRegister] response:', registerData, registerError);

          if (registerError) {
            console.error('[AgentDashboard] Registration error:', registerError);
            clearTimeout(timeoutId);
            setError({
              type: 'CREATE_FAILED',
              message: 'We couldn\'t finish setting up your agent profile. This is usually temporary.'
            });
            setLoading(false);
            return;
          }

          if (!registerData?.success) {
            const errorType = registerData?.error || 'CREATE_FAILED';
            const errorField = registerData?.field;
            
            clearTimeout(timeoutId);
            setError({
              type: errorType,
              message: registerData?.message || 'Failed to create agent profile',
              field: errorField
            });
            setLoading(false);
            return;
          }

          // Fetch the created/updated profile
          const { data: newProfile } = await supabase
            .from('agent_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (newProfile) {
            setAgentProfile(newProfile);
            clearTimeout(timeoutId);
            toast({
              title: 'Welcome!',
              description: 'Agent profile ready — welcome!',
            });
          } else {
            clearTimeout(timeoutId);
            setError({
              type: 'CREATE_FAILED',
              message: 'Profile was created but could not be loaded. Please refresh.'
            });
            setLoading(false);
          }
        } catch (error) {
          console.error('[AgentDashboard] Unexpected registration error:', error);
          clearTimeout(timeoutId);
          setError({
            type: 'UNEXPECTED',
            message: 'An unexpected error occurred. Please try again.'
          });
          setLoading(false);
        }
      } else {
        console.log('[AgentDashboard] Profile loaded:', profile.id);
        setAgentProfile(profile);
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('[AgentDashboard] Unexpected error:', error);
      clearTimeout(timeoutId);
      setError({
        type: 'UNEXPECTED',
        message: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setRetryCount(prev => prev + 1);
    
    // Exponential backoff
    const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
    setTimeout(() => {
      checkAgentAccess();
    }, delay);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/agent/login');
  };

  const handleStartNewBooking = () => {
    // Simply navigate to the public home page for search
    navigate('/');
    toast({
      title: 'Starting New Booking',
      description: 'You can now search for flights, hotels, or cars',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Setting up your agent profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Setup Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
            {error.field && (
              <p className="text-sm text-muted-foreground">
                Missing or invalid field: <strong>{error.field}</strong>
              </p>
            )}
            <div className="flex gap-2">
              <Button onClick={handleRetry} className="flex-1">
                Retry {retryCount > 0 && `(${retryCount})`}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Go Home
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              If this persists, contact support at help@journeyjet.com
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!agentProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Access Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Unable to load agent profile. Please try logging in again.
            </p>
            <Button onClick={() => navigate('/agent/login')} className="w-full">
              Back to Login
            </Button>
          </CardContent>
        </Card>
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
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">My Bookings</span>
              </TabsTrigger>
              <TabsTrigger value="clients" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Client Details</span>
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

            <TabsContent value="clients">
              <AgentClientDetails agentId={agentProfile.id} />
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
