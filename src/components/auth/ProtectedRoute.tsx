import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, redirectTo = "/auth/signin", requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading, isAdmin, emailVerified } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    const from = `${location.pathname}${location.search}`;
    const redirectUrl = `${redirectTo}?next=${encodeURIComponent(from)}`;
    return <Navigate to={redirectUrl} replace />;
  }

  // OAuth users (Google/Apple) already have verified emails via the provider.
  const isOAuthUser = Boolean(user.app_metadata?.provider && user.app_metadata.provider !== "email");
  if (!isOAuthUser && !emailVerified && location.pathname !== "/auth/verify-email") {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to={`/auth/verify-email?next=${encodeURIComponent(from)}`} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
