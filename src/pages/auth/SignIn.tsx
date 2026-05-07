import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import AuthLayout from "@/components/auth/AuthLayout";
import GoogleButton from "@/components/auth/GoogleButton";
import { useAuth } from "@/contexts/AuthContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const friendlyError = (message?: string) => {
  if (!message) return "Something went wrong. Please try again.";
  if (/invalid login credentials/i.test(message)) return "Invalid email or password.";
  if (/email not confirmed/i.test(message)) return "Please confirm your email before signing in.";
  if (/rate limit/i.test(message)) return "Too many attempts. Please wait a moment and try again.";
  return message;
};

const SignIn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading, signIn, signInWithGoogle } = useAuth();

  const next = searchParams.get("next") || "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (!authLoading && user) {
      navigate(next, { replace: true });
    }
  }, [authLoading, user, next, navigate]);

  const validate = () => {
    const nextErrors: typeof errors = {};
    if (!email) nextErrors.email = "Email is required.";
    else if (!EMAIL_REGEX.test(email)) nextErrors.email = "Please enter a valid email.";
    if (!password) nextErrors.password = "Password is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await signIn({ email, password, rememberMe: remember });
      toast.success("Welcome back!");
      navigate(next, { replace: true });
    } catch (error: any) {
      toast.error(friendlyError(error?.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle(`/auth/callback?next=${encodeURIComponent(next)}`);
    } catch (error: any) {
      toast.error(friendlyError(error?.message));
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue planning your next trip."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            to={`/auth/signup${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="font-semibold text-primary hover:underline"
          >
            Create account
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        <GoogleButton onClick={handleGoogle} loading={googleLoading} disabled={submitting} />

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs uppercase tracking-widest text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            or
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="signin-email">Email</Label>
            <Input
              id="signin-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={submitting}
              aria-invalid={!!errors.email}
            />
            {errors.email ? (
              <p className="text-xs text-destructive">{errors.email}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="signin-password">Password</Label>
              <Link to="/auth/forgot-password" className="text-xs font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="signin-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={submitting}
              aria-invalid={!!errors.password}
            />
            {errors.password ? (
              <p className="text-xs text-destructive">{errors.password}</p>
            ) : null}
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Checkbox checked={remember} onCheckedChange={(value) => setRemember(value === true)} />
            Remember me on this device
          </label>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign in
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignIn;
