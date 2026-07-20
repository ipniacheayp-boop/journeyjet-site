import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import SEOHead from "@/components/SEOHead";
import AuthLayout from "@/components/auth/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const RESEND_COOLDOWN = 30;

const errorMessage = (code?: string) => {
  switch (code) {
    case "invalid_code": return "That code is incorrect. Please try again.";
    case "invalid_code_format": return "Please enter the full 6-digit code.";
    case "expired": return "This code has expired. Please request a new one.";
    case "too_many_attempts": return "Too many attempts. Request a new code.";
    case "no_code": return "No code found. Please request a new one.";
    case "already_used": return "This code was already used. Request a new one.";
    case "cooldown": return "Please wait a moment before requesting another code.";
    default: return "Something went wrong. Please try again.";
  }
};

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/account";
  const { user, loading, emailVerified, refreshProfile, signOut } = useAuth();

  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const autoSent = useRef(false);

  useEffect(() => {
    if (!loading && !user) navigate(`/auth/signin?next=${encodeURIComponent(`/auth/verify-email?next=${next}`)}`, { replace: true });
  }, [loading, user, navigate, next]);

  useEffect(() => {
    if (!loading && user && emailVerified) navigate(next, { replace: true });
  }, [loading, user, emailVerified, navigate, next]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendCode = useCallback(async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("otp-send", {
        body: { purpose: "email_verify" },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success("Verification code sent to your email.");
      setCooldown(RESEND_COOLDOWN);
    } catch (err: any) {
      const msg = typeof err?.message === "string" ? err.message : "";
      toast.error(errorMessage(msg));
      if (msg === "cooldown") setCooldown(RESEND_COOLDOWN);
    } finally {
      setSending(false);
    }
  }, []);

  useEffect(() => {
    if (!user || autoSent.current || emailVerified) return;
    autoSent.current = true;
    void sendCode();
  }, [user, emailVerified, sendCode]);

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error("Please enter the full 6-digit code.");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("otp-verify", {
        body: { purpose: "email_verify", code },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success("Email verified!");
      await refreshProfile();
      navigate(next, { replace: true });
    } catch (err: any) {
      toast.error(errorMessage(err?.message));
      setCode("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead title="Verify Email | Tripile.com" description="Enter the 6-digit code sent to your email." canonicalUrl="https://tripile.com/auth/verify-email" noIndex />
      <AuthLayout
        title="Verify your email"
        subtitle={user?.email ? `We sent a 6-digit code to ${user.email}. It expires in 5 minutes.` : "Enter the 6-digit code we sent you."}
        footer={
          <button onClick={() => void signOut()} className="text-primary hover:underline">
            Use a different account
          </button>
        }
      >
        <div className="space-y-5">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={code} onChange={setCode} disabled={submitting}>
              <InputOTPGroup>
                {[0,1,2,3,4,5].map((i) => <InputOTPSlot key={i} index={i} />)}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button className="w-full" onClick={handleVerify} disabled={submitting || code.length !== 6}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Verify
          </Button>

          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            Didn&apos;t get the code?{" "}
            <button
              type="button"
              onClick={sendCode}
              disabled={sending || cooldown > 0}
              className="font-semibold text-primary disabled:text-slate-400 disabled:cursor-not-allowed hover:underline"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : sending ? "Sending..." : "Resend code"}
            </button>
          </div>
        </div>
      </AuthLayout>
    </>
  );
};

export default VerifyEmail;
