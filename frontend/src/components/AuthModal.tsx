import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, auth } from "../lib/supabase";
import Spline from "@splinetool/react-spline";
import LottieLoader from "./LottieLoader";

const AuthModal = () => {
  const navigate = useNavigate();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });
  const [signUpData, setSignUpData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [signInLoading, setSignInLoading] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile device for performance optimization
    const checkMobile = () => {
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();

    // Set a timeout to show the modal content even if Spline/video takes too long to load
    const timeout = setTimeout(
      () => {
        if (isMobile) {
          setVideoLoaded(true);
        } else {
          setSplineLoaded(true);
        }
      },
      isMobile ? 1000 : 2000
    ); // Faster timeout for mobile

    return () => clearTimeout(timeout);
  }, []);

  const handleGoogleSignIn = async () => {
    setSignInLoading(true);
    setSignInError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          scopes: "openid email profile",
        },
      });
      if (error) {
        setSignInError(error.message);
        setSignInLoading(false);
      }
    } catch (err) {
      setSignInError("An unexpected error occurred. Please try again.");
      setSignInLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInLoading(true);
    setSignInError(null);

    try {
      const { error } = await auth.signIn(
        signInData.email,
        signInData.password
      );

      if (error) {
        setSignInError(error.message);
      } else {
        // Successfully signed in - user state will be updated by the auth listener
        setShowSignIn(false);
        setSignInData({ email: "", password: "" });
      }
    } catch (err) {
      setSignInError("An unexpected error occurred. Please try again.");
    } finally {
      setSignInLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setSignUpLoading(true);
    setSignUpError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          scopes: "openid email profile",
        },
      });
      if (error) {
        setSignUpError(error.message);
        setSignUpLoading(false);
      }
    } catch (err) {
      setSignUpError("An unexpected error occurred. Please try again.");
      setSignUpLoading(false);
    }
  };

  const validateSignUpForm = () => {
    if (signUpData.password !== signUpData.confirmPassword) {
      setSignUpError("Passwords do not match");
      return false;
    }
    if (signUpData.password.length < 6) {
      setSignUpError("Password must be at least 6 characters long");
      return false;
    }
    if (signUpData.username.length < 3) {
      setSignUpError("Username must be at least 3 characters long");
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
        setSignUpData({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      setSignUpError("An unexpected error occurred. Please try again.");
    } finally {
      setSignUpLoading(false);
    }
  };

  const handleSignInInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignInData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (signInError) setSignInError(null);
  };

  const handleSignUpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignUpData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (signUpError) setSignUpError(null);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#0B0B0F]"
        style={{ zIndex: -2 }}
      ></div>

      {/* Background content - Spline for desktop, video for mobile */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          zIndex: -1,
          pointerEvents: "none", // Allow clicks to pass through
        }}
      >
        {isMobile ? (
          // Video background for mobile devices
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            onLoadedData={() => setVideoLoaded(true)}
            onError={() => setVideoLoaded(true)} // Fallback if video fails to load
          >
            <source src="/static/radial-glassmp4.mp4" type="video/mp4" />
          </video>
        ) : (
          // Spline background for desktop devices
          <Spline
            scene="https://prod.spline.design/03V8AhkNUD7ZlrjS/scene.splinecode"
            style={{
              width: "100%",
              height: "100%",
            }}
            onLoad={() => setSplineLoaded(true)}
          />
        )}
      </div>

      {/* Overlay for better text readability - stronger on mobile */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 0,
          background: isMobile ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.2)",
        }}
      ></div>

      {/* Loading indicator */}
      {((isMobile && !videoLoaded) || (!isMobile && !splineLoaded)) && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 2 }}
        >
          <LottieLoader size="xlarge" />
        </div>
      )}

      <div
        className={`relative bg-white/20 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-md border border-white/40 transition-opacity duration-500 ${
          (isMobile ? videoLoaded : splineLoaded) ? "opacity-100" : "opacity-0"
        }`}
        style={{
          zIndex: 1,
          pointerEvents: "auto", // Ensure modal is interactive
        }}
      >
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
            Welcome to Quizethic AI
          </h2>
          <p className="text-white/80 text-sm sm:text-base">
            Sign in to access your dashboard and start quizzing!
          </p>
        </div>

        {!showSignIn && !showSignUp ? (
          <div className="space-y-3 sm:space-y-4">
            <button
              onClick={() => setShowSignIn(true)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 sm:py-3 rounded-lg sm:rounded-xl shadow-lg transition-colors text-sm sm:text-base"
            >
              Sign In
            </button>

            <button
              onClick={() => setShowSignUp(true)}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2.5 sm:py-3 rounded-lg sm:rounded-xl shadow-lg transition-colors text-sm sm:text-base"
            >
              Create Account
            </button>

            <div className="text-center">
              <p className="text-white/60 text-xs sm:text-sm">
                Join thousands of users testing their knowledge!
              </p>
            </div>
            <div className="text-center">
              <p className="text-white/60 text-xs sm:text-sm">
                <button
                  onClick={() => navigate("/")}
                  className="cursor-pointer hover:scale-105 text-cyan-300 hover:text-purple-6x00 underline transition-colors text-xs sm:text-sm"
                >
                  ← Back
                </button>
              </p>
            </div>
          </div>
        ) : showSignIn ? (
          <div className="space-y-3 sm:space-y-4">
            {signInError && (
              <div className="p-2 sm:p-3 bg-red-500/20 border border-red-400/30 rounded-lg text-red-200 text-xs sm:text-sm">
                {signInError}
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={signInLoading}
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

            <div className="flex items-center justify-center my-3 sm:my-4">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="px-3 sm:px-4 text-white/60 text-xs sm:text-sm">
                Or continue with email
              </span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            <form
              onSubmit={handleEmailSignIn}
              className="space-y-3 sm:space-y-4"
            >
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={signInData.email}
                onChange={handleSignInInputChange}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/20 border border-white/30 rounded-lg sm:rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-purple-400 transition-colors text-sm sm:text-base"
                required
                disabled={signInLoading}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={signInData.password}
                onChange={handleSignInInputChange}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/20 border border-white/30 rounded-lg sm:rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-purple-400 transition-colors text-sm sm:text-base"
                required
                disabled={signInLoading}
              />
              <button
                type="submit"
                disabled={signInLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-2.5 sm:py-3 rounded-lg sm:rounded-xl shadow-lg transition-colors disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {signInLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <div className="text-center">
              <p className="text-white/60 text-xs sm:text-sm mb-2">
                Don't have an account?{" "}
                <button
                  onClick={() => {
                    setShowSignIn(false);
                    setShowSignUp(true);
                    setSignInData({ email: "", password: "" });
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
                  setSignInData({ email: "", password: "" });
                  setSignInError(null);
                }}
                className="text-cyan-300 hover:text-purple-200 underline transition-colors text-xs sm:text-sm"
              >
                ← Back
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {signUpError && (
              <div className="p-2 sm:p-3 bg-red-500/20 border border-red-400/30 rounded-lg text-red-200 text-xs sm:text-sm">
                {signUpError}
              </div>
            )}

            <button
              onClick={handleGoogleSignUp}
              disabled={signUpLoading}
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

            <div className="flex items-center justify-center my-3 sm:my-4">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="px-3 sm:px-4 text-white/60 text-xs sm:text-sm">
                Or continue with email
              </span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            <form
              onSubmit={handleEmailSignUp}
              className="space-y-3 sm:space-y-4"
            >
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={signUpData.username}
                onChange={handleSignUpInputChange}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/20 border border-white/30 rounded-lg sm:rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-purple-400 transition-colors text-sm sm:text-base"
                required
                disabled={signUpLoading}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={signUpData.email}
                onChange={handleSignUpInputChange}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/20 border border-white/30 rounded-lg sm:rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-purple-400 transition-colors text-sm sm:text-base"
                required
                disabled={signUpLoading}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={signUpData.password}
                onChange={handleSignUpInputChange}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/20 border border-white/30 rounded-lg sm:rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-purple-400 transition-colors text-sm sm:text-base"
                required
                disabled={signUpLoading}
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={signUpData.confirmPassword}
                onChange={handleSignUpInputChange}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/20 border border-white/30 rounded-lg sm:rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-purple-400 transition-colors text-sm sm:text-base"
                required
                disabled={signUpLoading}
              />
              <button
                type="submit"
                disabled={signUpLoading}
                className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 text-white font-semibold py-2.5 sm:py-3 rounded-lg sm:rounded-xl shadow-lg transition-colors disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {signUpLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="text-center">
              <p className="text-white/60 text-xs sm:text-sm mb-2">
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setShowSignUp(false);
                    setShowSignIn(true);
                    setSignUpData({
                      username: "",
                      email: "",
                      password: "",
                      confirmPassword: "",
                    });
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
                  setSignUpData({
                    username: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                  });
                  setSignUpError(null);
                }}
                className="text-cyan-300 hover:text-purple-200 underline transition-colors text-xs sm:text-sm"
              >
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={() => navigate("/")}
          className="cursor-pointer absolute top-3 right-3 sm:top-4 sm:right-4 text-white/60 hover:text-white transition-colors text-lg sm:text-xl"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
