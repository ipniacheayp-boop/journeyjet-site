import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase, getPkceVerifierStorageKey } from "@/integrations/supabase/client";

/** Same merge rule as GoTrue `parseParametersFromURL`: query overrides hash. */
function parseAuthParamsFromLocation(): Record<string, string> {
  const result: Record<string, string> = {};
  try {
    const url = new URL(window.location.href);
    if (url.hash.startsWith("#")) {
      new URLSearchParams(url.hash.slice(1)).forEach((value, key) => {
        result[key] = value;
      });
    }
    url.searchParams.forEach((value, key) => {
      result[key] = value;
    });
  } catch {
    /* ignore */
  }
  return result;
}

function decodeOAuthParam(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value;
  }
}

function friendlyAuthMessage(raw: string): string {
  const lower = raw.toLowerCase();
  if (
    lower.includes("code verifier") ||
    lower.includes("auth code") ||
    lower.includes("implicit grant flow url") ||
    lower.includes("pkce")
  ) {
    return "This confirmation link could not be completed. Try: request a new confirmation email from the sign-in page, open the link on the same browser you used to sign up, and ensure your published site uses the latest version of the app.";
  }
  return raw;
}

const EMAIL_OTP_TYPES = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
] as const;

type EmailOtpType = (typeof EMAIL_OTP_TYPES)[number];

function isEmailOtpType(t: string): t is EmailOtpType {
  return (EMAIL_OTP_TYPES as readonly string[]).includes(t);
}

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next = searchParams.get("next") || "/account";

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    const finishWithSession = (path: string) => {
      if (cancelled) return;
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      unsubscribe?.();
      toast.success("Signed in successfully");
      navigate(path, { replace: true });
    };

    const finalize = async () => {
      const params = parseAuthParamsFromLocation();
      const oauthErrorRaw =
        params.error_description ||
        params.error ||
        searchParams.get("error_description") ||
        searchParams.get("error");

      if (oauthErrorRaw) {
        setError(friendlyAuthMessage(decodeOAuthParam(oauthErrorRaw)));
        return;
      }

      try {
        const { error: initError } = await supabase.auth.initialize();

        const tryFinishIfSession = async (): Promise<boolean> => {
          const { data, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
          if (data.session) {
            finishWithSession(next);
            return true;
          }
          return false;
        };

        if (await tryFinishIfSession()) return;

        const token_hash = params.token_hash;
        const typeParam = params.type;
        if (token_hash && typeParam && isEmailOtpType(typeParam)) {
          const { error: otpError } = await supabase.auth.verifyOtp({
            token_hash,
            type: typeParam,
          });
          if (otpError) throw otpError;
          if (await tryFinishIfSession()) return;
        }

        const code = params.code;
        if (code && localStorage.getItem(getPkceVerifierStorageKey())) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          if (await tryFinishIfSession()) return;
        }

        if (initError?.message) {
          setError(friendlyAuthMessage(initError.message));
          return;
        }

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session) finishWithSession(next);
        });
        unsubscribe = () => subscription.unsubscribe();

        timeoutId = setTimeout(() => {
          if (cancelled) return;
          unsubscribe?.();
          setError(
            "We couldn't complete sign in. Add your site URL and `/auth/callback` under Supabase Authentication → URL Configuration, then try again or request a new confirmation email.",
          );
        }, 9000);
      } catch (err: unknown) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Authentication failed.";
        setError(friendlyAuthMessage(message));
      }
    };

    void finalize();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      unsubscribe?.();
    };
  }, [navigate, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-sm text-muted-foreground">
      {error ? (
        <>
          <p className="max-w-md text-destructive">{error}</p>
          <button
            type="button"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            onClick={() => navigate("/auth/signin", { replace: true })}
          >
            Back to sign in
          </button>
        </>
      ) : (
        <>
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          Finishing sign in...
        </>
      )}
    </div>
  );
};

export default AuthCallback;
