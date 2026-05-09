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
        // Session-from-URL is handled once by the Supabase client on load (`detectSessionInUrl`).
        // Do not call `exchangeCodeForSession` here: it expects the raw `code` string (not the full
        // URL), must pair with the PKCE verifier from the same browser session, and duplicates the
        // client's initializer — leading to "auth code and code verifier should be non-empty".

        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (data.session) {
          finishWithSession(next);
          return;
        }

        // Otherwise, listen briefly for the session to appear (covers magic links
        // and slow OAuth providers).
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
