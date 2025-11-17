import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useRequireAuth = (redirectPath: string = '/user/login') => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      toast.error('Please sign in to continue');
      navigate(redirectPath, { replace: true });
    }
  }, [user, loading, navigate, redirectPath]);

  return { user, loading };
};
