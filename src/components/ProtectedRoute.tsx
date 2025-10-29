import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'agent' | 'user';
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  requiredRole,
  redirectTo = '/login'
}: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    checkAccess();
  }, [requiredRole]);

  const checkAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // If no specific role required, just check authentication
      if (!requiredRole) {
        setHasAccess(true);
        setLoading(false);
        return;
      }

      // Check user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      const userRole = roleData?.role;

      // Admin has access to everything
      if (userRole === 'admin') {
        setHasAccess(true);
      } else if (requiredRole === userRole) {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
    } catch (error) {
      console.error('Error checking access:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAccess) {
    const redirectPath = requiredRole ? `${redirectTo}?role=${requiredRole}` : redirectTo;
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
