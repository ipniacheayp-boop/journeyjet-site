import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "user" | "admin" | "agent";

interface SignUpInput {
  email: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
  countryCode?: string;
}

interface SignInInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  userRole: AppRole | null;
  loading: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  signIn: (input: SignInInput) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<{ requiresEmailConfirmation: boolean }>;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  sendPasswordReset: (email: string, redirectTo?: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAdminStatus: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_STORAGE_KEY = "userRole";
const REMEMBER_KEY = "tripile.rememberMe";

const readStoredRole = (): AppRole | null => {
  const stored = localStorage.getItem(ROLE_STORAGE_KEY);
  if (stored === "admin" || stored === "agent" || stored === "user") return stored;
  return null;
};

const PROFILE_UPSERT_TIMEOUT_MS = 4000;

const upsertProfile = async (user: User) => {
  const profile = {
    id: user.id,
    email: user.email ?? null,
    name:
      (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      user.email?.split("@")[0] ||
      null,
    profile_image:
      (user.user_metadata?.avatar_url as string | undefined) ||
      (user.user_metadata?.picture as string | undefined) ||
      null,
    login_method: user.app_metadata?.provider || "email",
    last_login: new Date().toISOString(),
  };
  try {
    await Promise.race([
      supabase.from("profiles").upsert(profile, { onConflict: "id" }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("profile-upsert-timeout")), PROFILE_UPSERT_TIMEOUT_MS),
      ),
    ]);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[AuthContext] profile upsert failed (non-fatal)", error);
    }
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refreshAdminStatus = useCallback(async () => {
    try {
      const { data } = await supabase.rpc("is_admin");
      setIsAdmin(Boolean(data));
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("[AuthContext] is_admin check failed", error);
      }
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        setUserRole(readStoredRole() ?? "user");
        await upsertProfile(nextSession.user);
        // Defer admin RPC slightly so token is stored.
        setTimeout(() => {
          void refreshAdminStatus();
        }, 0);
      } else {
        setIsAdmin(false);
        setUserRole(null);
        localStorage.removeItem(ROLE_STORAGE_KEY);
      }
    });

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        setSession(data.session);
        setUser(data.session?.user ?? null);
        if (data.session?.user) {
          setUserRole(readStoredRole() ?? "user");
          await upsertProfile(data.session.user);
          await refreshAdminStatus();
        }
      })
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.warn("[AuthContext] getSession failed", error);
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, [refreshAdminStatus]);

  const signUp = useCallback<AuthContextType["signUp"]>(async ({ email, password, fullName }) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: fullName ? { full_name: fullName.trim() } : undefined,
      },
    });
    if (error) throw error;

    // If email confirmations are disabled, Supabase returns a session immediately.
    return { requiresEmailConfirmation: !data.session };
  }, []);

  const signIn = useCallback<AuthContextType["signIn"]>(async ({ email, password, rememberMe }) => {
    if (rememberMe) {
      localStorage.setItem(REMEMBER_KEY, "true");
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
    localStorage.setItem(ROLE_STORAGE_KEY, "user");
    setUserRole("user");
  }, []);

  const signInWithGoogle = useCallback<AuthContextType["signInWithGoogle"]>(async (redirectTo) => {
    // Google checks redirect_uri against Cloud Console. With Supabase, that URI is always
    // https://<project-ref>.supabase.co/auth/v1/callback (set there + matching Web client in
    // Supabase → Providers → Google). `redirectTo` below is only where users return after auth.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${redirectTo ?? "/auth/callback"}`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) throw error;
  }, []);

  const sendPasswordReset = useCallback<AuthContextType["sendPasswordReset"]>(async (email, redirectTo) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}${redirectTo ?? "/auth/reset-password"}`,
    });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback<AuthContextType["updatePassword"]>(async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }, []);

  const signOut = useCallback<AuthContextType["signOut"]>(async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setUserRole(null);
      localStorage.removeItem(ROLE_STORAGE_KEY);
      localStorage.removeItem(REMEMBER_KEY);
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      isAdmin,
      userRole,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      sendPasswordReset,
      updatePassword,
      signOut,
      refreshAdminStatus,
    }),
    [
      user,
      session,
      isAdmin,
      userRole,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      sendPasswordReset,
      updatePassword,
      signOut,
      refreshAdminStatus,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
