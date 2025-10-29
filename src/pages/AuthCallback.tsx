import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // Get session after OAuth callback
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session) {
        // Check user role and redirect accordingly
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        // If no role exists, create default user role
        if (!roleData) {
          await supabase
            .from('user_roles')
            .insert({
              user_id: session.user.id,
              role: 'user',
            });
          navigate('/');
          return;
        }

        // Redirect based on role
        switch (roleData.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'agent':
            navigate('/agent/dashboard');
            break;
          default:
            navigate('/');
            break;
        }
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error in auth callback:', error);
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
