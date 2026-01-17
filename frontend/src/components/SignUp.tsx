import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, supabase } from "../lib/supabase";

interface SignUpProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignIn: () => void;
}

const SignUp = ({ isOpen, onClose, onSwitchToSignIn }: SignUpProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters long");
      return false;
    }
    return true;
  };

  const handleGoogleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        // For OAuth, we'll handle the redirect in the auth callback
        // The user will be redirected to Google and then back to our app
        setLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await auth.signUp(
        formData.email,
        formData.password,
        formData.username
      );

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Show success message for a few seconds then redirect to dashboard
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setFormData({
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
          });
          // The auth state change listener in Hero will handle the redirect
          // But also navigate here as fallback
          navigate("/dashboard", { replace: true });
        }, 3000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white/20 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-md border border-white/40">
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
            Join Quizethic AI
          </h2>
          <p className="text-white/80 text-sm sm:text-base">
            Start your knowledge journey today
          </p>
        </div>

        {success ? (
          <div className="text-center py-6 sm:py-8">
            <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">
              🎉
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
              Welcome aboard!
            </h3>
            <p className="text-white/80 text-sm sm:text-base">
              Please check your email to verify your account.
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-500/20 border border-red-400/30 rounded-lg text-red-200 text-xs sm:text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-2.5 sm:py-3 rounded-lg sm:rounded-xl shadow-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>
              </div>
              <div>
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/20 border border-white/30 rounded-lg sm:rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-purple-400 transition-colors text-sm sm:text-base"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/20 border border-white/30 rounded-lg sm:rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-purple-400 transition-colors text-sm sm:text-base"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/20 border border-white/30 rounded-lg sm:rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-purple-400 transition-colors text-sm sm:text-base"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/20 border border-white/30 rounded-lg sm:rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-purple-400 transition-colors text-sm sm:text-base"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-2.5 sm:py-3 rounded-lg sm:rounded-xl shadow-lg transition-colors disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="text-center mt-4 sm:mt-6">
              <p className="text-white/60 text-xs sm:text-sm">
                Already have an account?{" "}
                <button
                  onClick={onSwitchToSignIn}
                  className="text-cyan-300 hover:text-purple-200 underline transition-colors"
                >
                  Sign In
                </button>
              </p>
            </div>
          </>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/60 hover:text-white transition-colors text-lg sm:text-xl"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default SignUp;
