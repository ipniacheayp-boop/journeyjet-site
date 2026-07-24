import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import SEOHead from "@/components/SEOHead";
import AuthLayout from "@/components/auth/AuthLayout";
import GoogleButton from "@/components/auth/GoogleButton";
import { useAuth } from "@/contexts/AuthContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordRules = [
  { test: (value: string) => value.length >= 8, label: "At least 8 characters" },
  { test: (value: string) => /[A-Z]/.test(value), label: "One uppercase letter" },
  { test: (value: string) => /[0-9]/.test(value), label: "One number" },
];

const friendlyError = (message?: string) => {
  if (!message) return "Something went wrong. Please try again.";
  if (/already registered/i.test(message)) return "This email is already registered. Try signing in instead.";
  if (/rate limit/i.test(message)) return "Too many attempts. Please wait a moment and try again.";
  return message;
};

const SignUp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading, signUp, signInWithGoogle } = useAuth();

  const next = searchParams.get("next") || "/account";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [marketingSmsOptIn, setMarketingSmsOptIn] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; phone?: string; password?: string; confirmPassword?: string }>({});

  useEffect(() => {
    if (!authLoading && user) {
      navigate(next, { replace: true });
    }
  }, [authLoading, user, next, navigate]);

  const validate = () => {
    const nextErrors: typeof errors = {};
    if (!fullName.trim()) nextErrors.fullName = "Please enter your name.";
    if (!email) nextErrors.email = "Email is required.";
    else if (!EMAIL_REGEX.test(email)) nextErrors.email = "Please enter a valid email.";
    if (!phoneNumber.trim()) nextErrors.phone = "Mobile number is required.";
    else if (!/^\d{6,15}$/.test(phoneNumber.replace(/\D/g, ""))) nextErrors.phone = "Enter a valid mobile number.";
    if (!/^\+\d{1,4}$/.test(countryCode)) nextErrors.phone = "Enter a valid country code (e.g. +1).";
    if (!password) nextErrors.password = "Password is required.";
    else if (!passwordRules.every((rule) => rule.test(password))) nextErrors.password = "Password does not meet requirements.";
    if (confirmPassword !== password) nextErrors.confirmPassword = "Passwords do not match.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { requiresEmailConfirmation } = await signUp({
        email,
        password,
        fullName,
        phoneNumber: phoneNumber.replace(/\D/g, ""),
        countryCode,
        marketingSmsOptIn,
      });
      if (requiresEmailConfirmation) {
        toast.success("Account created! Check your email to sign in.");
        navigate(`/auth/signin?next=${encodeURIComponent(next)}`, { replace: true });
      } else {
        toast.success("Account created! Verify your email to continue.");
        navigate(`/auth/verify-email?next=${encodeURIComponent(next)}`, { replace: true });
      }
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
    <>
      <SEOHead
        title="Create Account | Tripile.com"
        description="Create a Tripile account to manage bookings and unlock member fares."
        canonicalUrl="https://tripile.com/auth/signup"
        noIndex
      />
      <AuthLayout
        title="Create your account"
        subtitle="Join Tripile to unlock member fares and personalized travel deals."
        footer={
          <>
            Already have an account?{" "}
            <Link
              to={`/auth/signin${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="font-semibold text-primary hover:underline"
            >
              Sign in
            </Link>
          </>
        }
      >
        <div className="space-y-5">
          <GoogleButton onClick={handleGoogle} loading={googleLoading} disabled={submitting} label="Sign up with Google" />

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs uppercase tracking-widest text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              or sign up with email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="signup-name">Full name</Label>
              <Input
                id="signup-name"
                autoComplete="name"
                placeholder="Jane Doe"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                disabled={submitting}
                aria-invalid={!!errors.fullName}
              />
              {errors.fullName ? (
                <p className="text-xs text-destructive">{errors.fullName}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
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
              <Label htmlFor="signup-phone">Mobile number</Label>
              <div className="flex gap-2">
                <Input
                  id="signup-country"
                  className="w-20"
                  autoComplete="tel-country-code"
                  placeholder="+1"
                  value={countryCode}
                  onChange={(event) => setCountryCode(event.target.value)}
                  disabled={submitting}
                  aria-label="Country code"
                />
                <Input
                  id="signup-phone"
                  type="tel"
                  autoComplete="tel-national"
                  placeholder="555 123 4567"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  disabled={submitting}
                  aria-invalid={!!errors.phone}
                />
              </div>
              {errors.phone ? (
                <p className="text-xs text-destructive">{errors.phone}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a strong password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={submitting}
                aria-invalid={!!errors.password}
              />
              <ul className="mt-1 space-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                {passwordRules.map((rule) => {
                  const passed = rule.test(password);
                  return (
                    <li
                      key={rule.label}
                      className={passed ? "text-emerald-600 dark:text-emerald-400" : undefined}
                    >
                      {passed ? "✓" : "•"} {rule.label}
                    </li>
                  );
                })}
              </ul>
              {errors.password ? (
                <p className="text-xs text-destructive">{errors.password}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="signup-confirm">Confirm password</Label>
              <Input
                id="signup-confirm"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={submitting}
                aria-invalid={!!errors.confirmPassword}
              />
              {errors.confirmPassword ? (
                <p className="text-xs text-destructive">{errors.confirmPassword}</p>
              ) : null}
            </div>

            <div className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/40">
              <Checkbox
                id="signup-marketing-sms"
                checked={marketingSmsOptIn}
                onCheckedChange={(checked) => setMarketingSmsOptIn(checked === true)}
                disabled={submitting}
                className="mt-0.5"
              />
              <Label
                htmlFor="signup-marketing-sms"
                className="text-xs font-normal leading-relaxed text-slate-600 dark:text-slate-300"
              >
                I agree to receive marketing text messages from Tripile about travel deals and offers.
                Msg &amp; data rates may apply. Msg frequency varies. Reply STOP to unsubscribe, HELP for help.
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create account
            </Button>

            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              By creating an account you agree to our {" "}
              <Link to="/terms" className="underline hover:text-primary">Terms</Link> and {" "}
              <Link to="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
            </p>
          </form>
        </div>
      </AuthLayout>
    </>
  );
};

export default SignUp;
