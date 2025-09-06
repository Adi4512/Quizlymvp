import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LottieLoader from './LottieLoader';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/');
          return;
        }

        if (data.session) {
          // Extract user profile data from Google
          const user = data.session.user;
          console.log('User data from Google:', user);
          
          // The user metadata should now contain:
          // - full_name
          // - avatar_url
          // - email
          
          // User is authenticated, redirect to dashboard
          navigate('/dashboard');
        } else {
          // No session, redirect to home
          navigate('/');
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        navigate('/');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <LottieLoader size="xlarge" text="Completing sign in..." />
    </div>
  );
};

export default AuthCallback;
