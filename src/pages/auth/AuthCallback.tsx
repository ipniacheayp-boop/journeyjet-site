import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next = searchParams.get("next") || "/account";
    const oauthError = searchParams.get("error_description") || searchParams.get("error");
    const code = searchParams.get("code");

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
      if (oauthError) {
        setError(decodeURIComponent(oauthError));
        return;
      }

      try {
        // 1. PKCE flow (Google OAuth uses this with flowType: 'pkce'):
        //    Supabase appends ?code=... to our redirect URL. Exchange it for a session
        //    explicitly so we don't depend on the auto-detection race.
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (exchangeError) throw exchangeError;
        }

        // 2. After exchanging (or if implicit flow already populated the session),
        //    read the session.
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (data.session) {
          finishWithSession(next);
          return;
        }

        // 3. Otherwise, listen briefly for the session to appear (covers magic links
        //    and slow OAuth providers).
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
            "We couldn't complete sign in. Make sure Google Sign-In is enabled in Supabase and that this URL is in the redirect allow-list, then try again.",
          );
        }, 9000);
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message || "Authentication failed.");
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
