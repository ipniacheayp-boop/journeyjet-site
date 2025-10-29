import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plane, Loader2, Mail } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Get intended role from URL query param (e.g., ?role=admin or ?role=agent)
  const intendedRole = searchParams.get('role') || 'user';

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');

  // Agent-specific fields
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [gstNumber, setGstNumber] = useState('');

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await handleRoleBasedRedirect(session.user.id);
    }
  };

  const handleRoleBasedRedirect = async (userId: string) => {
    try {
      // Fetch user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      const userRole = roleData?.role || 'user';

      // Redirect based on role
      switch (userRole) {
        case 'admin':
          navigate('/admin');
          break;
        case 'agent':
          navigate('/agent/dashboard');
          break;
        default:
          navigate('/');
          break;
      }
    } catch (error) {
      console.error('Error fetching role:', error);
      navigate('/');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (authError) throw authError;

      // Check if user has the intended role (for admin/agent access)
      if (intendedRole !== 'user') {
        const { data: roles, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', authData.user.id)
          .single();

        if (roleError || roles?.role !== intendedRole) {
          await supabase.auth.signOut();
          throw new Error(`This account does not have ${intendedRole} access`);
        }
      }

      toast({ title: 'Login successful!', description: 'Redirecting...' });
      await handleRoleBasedRedirect(authData.user.id);
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: 'Google login failed',
        description: error.message,
        variant: 'destructive',
      });
      setGoogleLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (intendedRole === 'agent') {
        // Agent registration
        if (!companyName || !contactPerson || !phone) {
          throw new Error('Please fill in all required fields');
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: registerEmail,
          password: registerPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/agent/dashboard`,
            data: {
              name: contactPerson,
            },
          },
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('Failed to create user');

        // Call agent registration edge function
        const { error: functionError } = await supabase.functions.invoke('agent-register', {
          body: {
            userId: authData.user.id,
            companyName,
            contactPerson,
            phone,
            gstNumber: gstNumber || null,
          },
        });

        if (functionError) throw functionError;

        toast({
          title: 'Registration successful!',
          description: 'Your account is pending admin verification. You will be notified once approved.',
        });
      } else {
        // Regular user registration
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: registerEmail,
          password: registerPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              name: registerName,
            },
          },
        });

        if (authError) throw authError;

        // Create user role
        if (authData.user) {
          await supabase
            .from('user_roles')
            .insert({
              user_id: authData.user.id,
              role: 'user',
            });
        }

        toast({
          title: 'Registration successful!',
          description: 'Please check your email to verify your account.',
        });
      }

      // Clear form
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterName('');
      setCompanyName('');
      setContactPerson('');
      setPhone('');
      setGstNumber('');
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleTitle = () => {
    switch (intendedRole) {
      case 'admin':
        return 'Admin Portal';
      case 'agent':
        return 'Agent Portal - B2B Travel Partner';
      default:
        return 'Welcome Back';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Plane className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">{getRoleTitle()}</CardTitle>
          <CardDescription>
            {intendedRole === 'agent' ? 'Login or Register as a Travel Agent' : 'Login or Create an Account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">
                {intendedRole === 'agent' ? 'Register' : 'Sign Up'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              {/* Google Sign-In */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Login
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                {intendedRole === 'agent' ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Company Name *</Label>
                      <Input
                        id="company-name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-person">Contact Person *</Label>
                      <Input
                        id="contact-person"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gst">GST Number (Optional)</Label>
                      <Input
                        id="gst"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email *</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password *</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {intendedRole === 'agent' ? 'Register as Agent' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-4 text-center text-sm space-y-2">
            {intendedRole === 'admin' && (
              <Link to="/login?role=user" className="text-primary hover:underline block">
                Login as Regular User
              </Link>
            )}
            {intendedRole === 'agent' && (
              <Link to="/login?role=user" className="text-primary hover:underline block">
                Login as Regular User
              </Link>
            )}
            <Link to="/" className="text-muted-foreground hover:text-primary block">
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
