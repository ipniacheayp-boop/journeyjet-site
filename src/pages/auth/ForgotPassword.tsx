import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SEOHead from "@/components/SEOHead";
import AuthLayout from "@/components/auth/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPassword = () => {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!email) {
      setError("Email is required.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    try {
      await sendPasswordReset(email);
      setSubmitted(true);
      toast.success("Password reset email sent.");
    } catch (err: any) {
      toast.error(err?.message || "Could not send reset email. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Reset Password | Tripile.com"
        description="Request a secure password reset link for your Tripile account."
        canonicalUrl="https://tripile.com/auth/forgot-password"
        noIndex
      />
      <AuthLayout
        title="Reset your password"
        subtitle="Enter your account email and we'll send you a secure reset link."
        footer={
          <>
            Remembered your password?{" "}
            <Link to="/auth/signin" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </>
        }
      >
        {submitted ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <MailCheck className="h-6 w-6" />
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              We sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the link to set a new
              password.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/auth/signin">Back to sign in</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={submitting}
                aria-invalid={!!error}
              />
              {error ? <p className="text-xs text-destructive">{error}</p> : null}
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Send reset link
            </Button>
          </form>
        )}
      </AuthLayout>
    </>
  );
};

export default ForgotPassword;
