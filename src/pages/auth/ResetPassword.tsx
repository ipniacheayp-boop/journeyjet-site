import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/components/auth/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const passwordRules = [
  { test: (value: string) => value.length >= 8, label: "At least 8 characters" },
  { test: (value: string) => /[A-Z]/.test(value), label: "One uppercase letter" },
  { test: (value: string) => /[0-9]/.test(value), label: "One number" },
];

const ResetPassword = () => {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setHasRecoverySession(true);
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) setHasRecoverySession(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const validate = () => {
    const nextErrors: typeof errors = {};
    if (!password) nextErrors.password = "Password is required.";
    else if (!passwordRules.every((rule) => rule.test(password)))
      nextErrors.password = "Password does not meet requirements.";
    if (password !== confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await updatePassword(password);
      toast.success("Password updated. Please sign in.");
      await supabase.auth.signOut();
      navigate("/auth/signin", { replace: true });
    } catch (error: any) {
      toast.error(error?.message || "Could not update password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Pick a strong password to keep your account secure."
      footer={
        <>
          Back to{" "}
          <Link to="/auth/signin" className="font-semibold text-primary hover:underline">
            sign in
          </Link>
        </>
      }
    >
      {!hasRecoverySession ? (
        <div className="space-y-3 text-center">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            This page must be opened from the password reset link in your email. If your link expired, request a new one.
          </p>
          <Button asChild className="w-full">
            <Link to="/auth/forgot-password">Send a new reset link</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="reset-password">New password</Label>
            <Input
              id="reset-password"
              type="password"
              autoComplete="new-password"
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
            {errors.password ? <p className="text-xs text-destructive">{errors.password}</p> : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reset-confirm">Confirm new password</Label>
            <Input
              id="reset-confirm"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={submitting}
              aria-invalid={!!errors.confirmPassword}
            />
            {errors.confirmPassword ? (
              <p className="text-xs text-destructive">{errors.confirmPassword}</p>
            ) : null}
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Update password
          </Button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ResetPassword;
