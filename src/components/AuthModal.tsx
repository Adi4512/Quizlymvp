import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, auth } from '../lib/supabase';

const AuthModal = () => {
  const navigate = useNavigate();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });
  const [signUpData, setSignUpData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [signInLoading, setSignInLoading] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [signUpError, setSignUpError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setSignInLoading(true);
    setSignInError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) {
        setSignInError(error.message);
        setSignInLoading(false);
      }
    } catch (err) {
      setSignInError('An unexpected error occurred. Please try again.');
      setSignInLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInLoading(true);
    setSignInError(null);

    try {
      const { data, error } = await auth.signIn(
        signInData.email,
        signInData.password
      );

      if (error) {
        setSignInError(error.message);
      } else {
        // Successfully signed in - user state will be updated by the auth listener
        setShowSignIn(false);
        setSignInData({ email: '', password: '' });
      }
    } catch (err) {
      setSignInError('An unexpected error occurred. Please try again.');
    } finally {
      setSignInLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setSignUpLoading(true);
    setSignUpError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) {
        setSignUpError(error.message);
        setSignUpLoading(false);
      }
    } catch (err) {
      setSignUpError('An unexpected error occurred. Please try again.');
      setSignUpLoading(false);
    }
  };

  const validateSignUpForm = () => {
    if (signUpData.password !== signUpData.confirmPassword) {
      setSignUpError('Passwords do not match');
      return false;
    }
    if (signUpData.password.length < 6) {
      setSignUpError('Password must be at least 6 characters long');
      return false;
    }
    if (signUpData.username.length < 3) {
      setSignUpError('Username must be at least 3 characters long');
      return false;
    }
    return true;
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignUpForm()) return;

    setSignUpLoading(true);
    setSignUpError(null);

    try {
      const { error } = await auth.signUp(
        signUpData.email,
        signUpData.password,
        signUpData.username
      );

      if (error) {
        setSignUpError(error.message);
      } else {
        // Successfully signed up - user state will be updated by the auth listener
        setShowSignUp(false);
        setSignUpData({ username: '', email: '', password: '', confirmPassword: '' });
      }
    } catch (err) {
      setSignUpError('An unexpected error occurred. Please try again.');
    } finally {
      setSignUpLoading(false);
    }
  };

  const handleSignInInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignInData(prev => ({
      ...prev,
      [name]: value
    }));
    if (signInError) setSignInError(null);
  };

  const handleSignUpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignUpData(prev => ({
      ...prev,
      [name]: value
    }));
    if (signUpError) setSignUpError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="relative bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/40">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome to Quizethic AI</h2>
          <p className="text-white/80">Sign in to access your dashboard and start quizzing!</p>
        </div>

        {!showSignIn && !showSignUp ? (
          <div className="space-y-4">
            <button 
              onClick={() => setShowSignIn(true)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-colors"
            >
              Sign In
            </button>
            
            <button 
              onClick={() => setShowSignUp(true)}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-colors"
            >
              Create Account
            </button>
            
            <div className="text-center">
              <p className="text-white/60 text-sm">
                Join thousands of users testing their knowledge!
              </p>
            </div>
          </div>
        ) : showSignIn ? (
          <div className="space-y-4">
            {signInError && (
              <div className="p-3 bg-red-500/20 border border-red-400/30 rounded-lg text-red-200 text-sm">
                {signInError}
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={signInLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 rounded-xl shadow-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            
            <div className="flex items-center justify-center my-4">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="px-4 text-white/60 text-sm">Or continue with email</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={signInData.email}
                onChange={handleSignInInputChange}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-purple-400 transition-colors"
                required
                disabled={signInLoading}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={signInData.password}
                onChange={handleSignInInputChange}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-purple-400 transition-colors"
                required
                disabled={signInLoading}
              />
              <button
                type="submit"
                disabled={signInLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 rounded-xl shadow-lg transition-colors disabled:cursor-not-allowed"
              >
                {signInLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

                          <div className="text-center">
                <p className="text-white/60 text-sm mb-2">
                  Don't have an account?{' '}
                  <button 
                    onClick={() => {
                      setShowSignIn(false);
                      setShowSignUp(true);
                      setSignInData({ email: '', password: '' });
                      setSignInError(null);
                    }}
                    className="text-cyan-300 hover:text-purple-200 underline transition-colors"
                  >
                    Sign Up
                  </button>
                </p>
                <button 
                  onClick={() => {
                    setShowSignIn(false);
                    setSignInData({ email: '', password: '' });
                    setSignInError(null);
                  }}
                  className="text-cyan-300 hover:text-purple-200 underline transition-colors text-sm"
                >
                  ← Back
                </button>
              </div>
          </div>
        ) : (
          <div className="space-y-4">
            {signUpError && (
              <div className="p-3 bg-red-500/20 border border-red-400/30 rounded-lg text-red-200 text-sm">
                {signUpError}
              </div>
            )}

            <button
              onClick={handleGoogleSignUp}
              disabled={signUpLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 rounded-xl shadow-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            
            <div className="flex items-center justify-center my-4">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="px-4 text-white/60 text-sm">Or continue with email</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={signUpData.username}
                onChange={handleSignUpInputChange}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-purple-400 transition-colors"
                required
                disabled={signUpLoading}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={signUpData.email}
                onChange={handleSignUpInputChange}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-purple-400 transition-colors"
                required
                disabled={signUpLoading}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={signUpData.password}
                onChange={handleSignUpInputChange}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-purple-400 transition-colors"
                required
                disabled={signUpLoading}
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={signUpData.confirmPassword}
                onChange={handleSignUpInputChange}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-purple-400 transition-colors"
                required
                disabled={signUpLoading}
              />
              <button
                type="submit"
                disabled={signUpLoading}
                className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 text-white font-semibold py-3 rounded-xl shadow-lg transition-colors disabled:cursor-not-allowed"
              >
                {signUpLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

                          <div className="text-center">
                <p className="text-white/60 text-sm mb-2">
                  Already have an account?{' '}
                  <button 
                    onClick={() => {
                      setShowSignUp(false);
                      setShowSignIn(true);
                      setSignUpData({ username: '', email: '', password: '', confirmPassword: '' });
                      setSignUpError(null);
                    }}
                    className="text-cyan-300 hover:text-purple-200 underline transition-colors"
                  >
                    Sign In
                  </button>
                </p>
                <button 
                  onClick={() => {
                    setShowSignUp(false);
                    setSignUpData({ username: '', email: '', password: '', confirmPassword: '' });
                    setSignUpError(null);
                  }}
                  className="text-cyan-300 hover:text-purple-200 underline transition-colors text-sm"
                >
                  ← Back
                </button>
              </div>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
