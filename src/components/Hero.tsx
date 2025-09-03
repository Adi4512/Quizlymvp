import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import Footer from "./Footer";
import { supabase } from "../lib/supabase";

const Hero = () => {
  const navigate = useNavigate();
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const openSignUp = () => {
    setIsSignInOpen(false);
    setIsSignUpOpen(true);
  };

  const openSignIn = () => {
    setIsSignUpOpen(false);
    setIsSignInOpen(true);
  };

  const closeModals = () => {
    setIsSignUpOpen(false);
    setIsSignInOpen(false);
  };

  // Check authentication status and show popup when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Always show the landing page, regardless of auth status
        // The dashboard will handle its own auth check
        setIsCheckingAuth(false);
        setShowPopup(true);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsCheckingAuth(false);
        setShowPopup(true);
      }
    };

    checkAuth();
  }, []);

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="relative min-h-screen w-full bg-[url('/static/bg.png')] overflow-hidden">
      {/* Background abstract shapes (placeholders) */}

      {/* Glassmorphic Card */}
      <div className="absolute left-1/2 -translate-x-1/2 top-20 bottom-0 z-10 w-[80%] max-w-full">
        <div
          id="blur"
          className="bg-white/30 backdrop-blur-lg  rounded-3xl shadow-xl p-12 w-full h-full border-t border-l border-r border-white/40 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-14 mt-[-15px]">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img 
                src="/static/quizethic-favicon.svg" 
                alt="Quizethic AI Logo" 
                className="w-10 h-10 rounded-full"
              />
              <span className="font-bold text-lg text-white drop-shadow">
                Quizethic AI
              </span>
            </div>
            {/* Navigation */}
            <nav className="flex gap-8 text-white font-inter font-semibold text-base">
              <NavLink to="home" className="hover:text-white">
                Home
              </NavLink>
              <NavLink to="library" className="hover:text-white">
                Library
              </NavLink>
              <NavLink to="courses" className="hover:text-white">
                Courses
              </NavLink>
              <NavLink to="test" className="hover:text-white">
                Test
              </NavLink>
            </nav>
            {/* Sign up button */}
            <div className="relative z-10">
              <button 
                onClick={openSignUp}
                className="mr-4  border border-white/50 px-6 py-2 rounded-full text-white font-semibold hover:bg-white/50 transition z-[9999]"
              >
                Sign up
              </button>
              <button 
                onClick={openSignIn}
                className="border border-white/50 px-6 py-2 rounded-full text-white font-semibold hover:bg-white/50 transition z-[9999]"
              >
                Sign in
              </button>
            </div>
          </div>
          {/* Main Content */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            {/* Left: Title, subtitle, CTA */}
            <div className="max-w-lg">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow">
                Unleash Your Inner
                <br />
                Wizard of Wisdom
              </h1>
              <p className="text-white/80 mb-6">
                Embark on a Journey of Knowledge Exploration with Our Extensive
                Collection of Interactive Quizzes.
              </p>
              <button 
                onClick={async () => {
                  // Check if user is authenticated
                  const { data: { session } } = await supabase.auth.getSession();
                  if (session?.user) {
                    navigate('/dashboard');
                  } else {
                    // User not authenticated, show sign-up modal
                    openSignUp();
                  }
                }}
                className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition"
              >
                Create Your AI Quiz Now
              </button>
            </div>
            {/* Right: Topic selection */}
            <div className="flex flex-col items-center">
              <div className="mt-28 text-white/80 mb-4 text-center">
                HI Brainiac! WHAT TOPIC ARE YOU
                <br />
                INTERESTED IN?
              </div>
              <div className="grid grid-cols-3 gap-4">
                {/* Topic buttons (placeholders for icons) */}
                <button className="flex flex-col items-center bg-white/20 hover:bg-white/30 rounded-xl p-4 w-28 h-24 text-white">
                  <span className="mb-2">🎨</span>
                  <span>Art</span>
                </button>
                <button className="flex flex-col items-center bg-white/20 hover:bg-white/30 rounded-xl p-4 w-28 h-24 text-white">
                  <span className="mb-2">🔬</span>
                  <span>Science</span>
                </button>
                <button className="flex flex-col items-center bg-white/20 hover:bg-white/30 rounded-xl p-4 w-28 h-24 text-white">
                  <span className="mb-2">⛅</span>
                  <span>Weather</span>
                </button>
                <button className="flex flex-col items-center bg-white/20 hover:bg-white/30 rounded-xl p-4 w-28 h-24 text-white">
                  <span className="mb-2">⚛️</span>
                  <span>Physics</span>
                </button>
                <button className="flex flex-col items-center bg-white/20 hover:bg-white/30 rounded-xl p-4 w-28 h-24 text-white">
                  <span className="mb-2">🌍</span>
                  <span>Geography</span>
                </button>
                <button className="flex flex-col items-center bg-white/20 hover:bg-white/30 rounded-xl p-4 w-28 h-24 text-white">
                  <span className="mb-2">➗</span>
                  <span>Math</span>
                </button>
                <button className="flex flex-col items-center bg-white/20 hover:bg-white/30 rounded-xl p-4 w-28 h-24 text-white">
                  <span className="mb-2">🗣️</span>
                  <span>Language</span>
                </button>
                <button className="flex flex-col items-center bg-white/20 hover:bg-white/30 rounded-xl p-4 w-28 h-24 text-white">
                  <span className="mb-2">🔭</span>
                  <span>Astronomy</span>
                </button>
                <button className="flex flex-col items-center bg-white/20 hover:bg-white/30 rounded-xl p-4 w-28 h-24 text-white">
                  <span className="mb-2">❤️</span>
                  <span>Health</span>
                </button>
              </div>
            </div>
          </div>
          <div className="absolute left-40 bottom-0 w-full h-64 bg-[url('/static/bottom.png')] bg-no-repeat bg-left-bottom bg-contain pointer-events-none z-[-1]"></div>
          <div className="absolute right-0 top-0 w-full h-52 bg-[url('/static/top.png')] bg-no-repeat bg-right-top bg-contain pointer-events-none z-[-1]"></div>
        </div>
      </div>
      {isSignUpOpen && <SignUp isOpen={isSignUpOpen} onClose={closeModals} onSwitchToSignIn={openSignIn} />}
      {isSignInOpen && <SignIn isOpen={isSignInOpen} onClose={closeModals} onSwitchToSignUp={openSignUp} />}
      
      {/* Development Notice Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPopup(false)}
          />
          
          {/* Popup */}
          <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-300 rounded-2xl shadow-2xl p-8 w-full max-w-lg mx-4">
            <div className="text-center">
              <div className="text-5xl mb-4">🔄</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Project in Early Development</h3>
              <div className="space-y-3 text-gray-700">
                <p className="text-sm">
                  This is a prototype demonstration showcasing the initial UI/UX design.
                </p>
                <div className="bg-blue-100 rounded-lg p-3 border border-blue-200">
                  <p className="text-xs text-blue-800 font-medium">
                    <span className="font-bold">Current Status:</span> 15% Complete
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Frontend: Basic UI Components | Backend: Auth completed , Database connection pending | AI Integration: Planned
                  </p>
                </div>
                <p className="text-sm">
                  Full development roadmap includes authentication, AI-powered quiz generation, 
                  payment processing, and comprehensive user management.
                </p>
              </div>
            </div>
            
            {/* Close button */}
            <button
              onClick={() => setShowPopup(false)}
              className="cursor-pointer absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors text-xl font-bold bg-white/80 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* Footer only shows on landing page */}
     
    </div>
    
     <Footer />
     
     </>
  );
};

export default Hero;
