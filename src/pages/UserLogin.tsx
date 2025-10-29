import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, User, Briefcase, Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type UserRole = "user" | "agent" | "admin";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up flow (only for regular users)
        if (selectedRole !== "user") {
          throw new Error("Please use the appropriate registration for Agents");
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;

        toast({
          title: "Success!",
          description: "Account created successfully. You can now sign in.",
        });
        setIsSignUp(false);
      } else {
        // Sign in flow
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Store role in localStorage
        localStorage.setItem("userRole", selectedRole);

        // Check role based on selection
        if (selectedRole === "admin") {
          // Check if user is admin
          const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');

          if (adminError) {
            console.error('Error checking admin status:', adminError);
            throw new Error('Failed to verify admin status');
          }

          if (!isAdmin) {
            await supabase.auth.signOut();
            localStorage.removeItem("userRole");
            throw new Error('Admin access required. Please select the correct role.');
          }

          toast({
            title: "Admin login successful!",
            description: "Redirecting to dashboard...",
          });

          setTimeout(() => {
            navigate("/admin");
          }, 500);
        } else if (selectedRole === "agent") {
          // Check if user has agent role
          const { data: roles, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', authData.user.id)
            .single();

          if (roleError || roles?.role !== 'agent') {
            await supabase.auth.signOut();
            localStorage.removeItem("userRole");
            throw new Error('This account is not registered as an agent');
          }

          toast({
            title: "Agent login successful!",
            description: "Redirecting to dashboard...",
          });

          setTimeout(() => {
            navigate("/agent/dashboard");
          }, 500);
        } else {
          // Regular user login
          toast({
            title: "Sign in successful!",
            description: "Redirecting...",
          });

          setTimeout(() => {
            navigate("/search-results");
          }, 500);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/search-results`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {isSignUp ? "Create an account" : "Welcome back"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Enter your details to create your account"
              : "Select your role and enter your credentials"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Role Selection - Only show during login */}
          {!isSignUp && (
            <div className="mb-6">
              <p className="text-sm font-medium mb-3">Login as:</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={selectedRole === "user" ? "default" : "outline"}
                  className="flex flex-col items-center py-6 h-auto"
                  onClick={() => setSelectedRole("user")}
                  disabled={loading}
                >
                  <User className="h-5 w-5 mb-1" />
                  <span className="text-xs">User</span>
                </Button>
                <Button
                  type="button"
                  variant={selectedRole === "agent" ? "default" : "outline"}
                  className="flex flex-col items-center py-6 h-auto"
                  onClick={() => setSelectedRole("agent")}
                  disabled={loading}
                >
                  <Briefcase className="h-5 w-5 mb-1" />
                  <span className="text-xs">Agent</span>
                </Button>
                <Button
                  type="button"
                  variant={selectedRole === "admin" ? "default" : "outline"}
                  className="flex flex-col items-center py-6 h-auto"
                  onClick={() => setSelectedRole("admin")}
                  disabled={loading}
                >
                  <Shield className="h-5 w-5 mb-1" />
                  <span className="text-xs">Admin</span>
                </Button>
              </div>
            </div>
          )}

          {/* Social Login Buttons - Only for regular users */}
          {!isSignUp && selectedRole === "user" && (
            <>
              <div className="mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full bg-background hover:bg-accent"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
              </Button>
            </div>

            {/* Separator */}
            <div className="relative mb-6">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-background px-2 text-xs text-muted-foreground">or</span>
              </div>
            </div>
          </>
        )}

          {/* Email/Password Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </form>

          {/* Privacy Notice */}
          <p className="mt-4 text-xs text-center text-muted-foreground">
            We only use your name and email for authentication.
          </p>

          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:underline"
              disabled={loading}
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Agent Registration Link */}
          {!isSignUp && selectedRole === "agent" && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <span>Don't have an agent account? </span>
              <a href="/agent/login" className="text-primary hover:underline">
                Register here
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserLogin;
