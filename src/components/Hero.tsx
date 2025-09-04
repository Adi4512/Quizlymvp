import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import Footer from "./Footer";
import { supabase } from "../lib/supabase";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";

import Joinwaitlist from "./Joinwaitlist";

const Hero = () => {
  const navigate = useNavigate();
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isWaitlistPopupOpen, setIsWaitlistPopupOpen] = useState(false);

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

  const closeWaitlistPopup = () => {
    setIsWaitlistPopupOpen(false);
  };

  // Check authentication status and show popup when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await supabase.auth.getSession();
        
        // Always show the landing page, regardless of auth status
        // The dashboard will handle its own auth check
        setIsCheckingAuth(false);
        
        // Show waitlist popup after a short delay
        setTimeout(() => {
          setIsWaitlistPopupOpen(true);
        }, 1000);
       
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsCheckingAuth(false);
       
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
      <div className="absolute left-1/2 -translate-x-1/2 top-4 sm:top-8 md:top-20 bottom-0 z-10 w-[95%] sm:w-[90%] md:w-[80%] max-w-full">
        <div
          id="blur"
          className="relative bg-white/30 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 lg:p-12 w-full h-full border-t border-l border-r border-white/40 flex flex-col"
        >
          {/* Header */}
          
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 md:mb-14 mt-[-5px] sm:mt-[-10px] md:mt-[-15px] gap-4 sm:gap-0">
            {/* Logo */}
            
            <div className="flex items-center gap-2 order-1 sm:order-1">
              <img 
                src="/static/quizethic-favicon.svg" 
                alt="Quizethic AI Logo" 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
              />
              <span className="font-bold text-base sm:text-lg text-white drop-shadow">
                Quizethic AI
              </span>
              
            </div>
            
            {/* Navigation - Hidden on mobile, shown on larger screens */}
            <nav className="hidden md:flex gap-6 lg:gap-8 text-white font-inter font-semibold text-sm lg:text-base order-2">
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
            
            {/* Waitlist - Positioned for mobile */}
            <div className="order-2 sm:order-3 md:absolute md:right-6 md:top-25 md:z-20 md:mr-[400px] drop-shadow-lg w-full sm:w-auto">
              <Joinwaitlist />
            </div>
            
            {/* Sign up buttons - Responsive layout */}
            <div className="relative z-10 order-3 sm:order-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
              <button 
                onClick={openSignUp}
                className="font-semibold min-w-[100px] sm:min-w-[120px] text-center text-sm sm:text-base"
               
              >
               <InteractiveHoverButton>Sign up</InteractiveHoverButton>
              </button>
              <button 
              className="font-semibold min-w-[100px] sm:min-w-[120px] text-center text-sm sm:text-base"
                onClick={openSignIn}
              
              >
                 <InteractiveHoverButton>Sign in</InteractiveHoverButton>
              </button>
            </div>
          </div>

     
        
          {/* Main Content */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
            {/* Left: Title, subtitle, CTA */}
            <div className="max-w-lg w-full lg:w-auto">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 drop-shadow leading-tight">
                Unleash Your Inner
                <br />
                Wizard of Wisdom
              </h1>
              <p className="text-white/80 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
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
                className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg transition text-sm sm:text-base w-full sm:w-auto"
              >
                Create Your AI Quiz Now
              </button>
            </div>
            {/* Right: Topic selection */}
            <div className="flex flex-col items-center w-full lg:w-auto">
              <div className="mt-8 sm:mt-12 lg:mt-28 text-white/80 mb-3 sm:mb-4 text-center text-sm sm:text-base">
                HI Brainiac! WHAT TOPIC ARE YOU
                <br />
                INTERESTED IN?
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 w-full max-w-sm lg:max-w-none">
                {/* Topic buttons (placeholders for icons) */}
                <button className="flex flex-col items-center bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl p-3 sm:p-4 w-full h-20 sm:h-24 text-white transition-all duration-200 hover:scale-105">
                  <span className="mb-1 sm:mb-2 text-lg sm:text-xl">🎨</span>
                  <span className="text-xs sm:text-sm font-medium">Art</span>
                </button>
                <button className="flex flex-col items-center bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl p-3 sm:p-4 w-full h-20 sm:h-24 text-white transition-all duration-200 hover:scale-105">
                  <span className="mb-1 sm:mb-2 text-lg sm:text-xl">🔬</span>
                  <span className="text-xs sm:text-sm font-medium">Science</span>
                </button>
                <button className="flex flex-col items-center bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl p-3 sm:p-4 w-full h-20 sm:h-24 text-white transition-all duration-200 hover:scale-105">
                  <span className="mb-1 sm:mb-2 text-lg sm:text-xl">⛅</span>
                  <span className="text-xs sm:text-sm font-medium">Weather</span>
                </button>
                <button className="flex flex-col items-center bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl p-3 sm:p-4 w-full h-20 sm:h-24 text-white transition-all duration-200 hover:scale-105">
                  <span className="mb-1 sm:mb-2 text-lg sm:text-xl">⚛️</span>
                  <span className="text-xs sm:text-sm font-medium">Physics</span>
                </button>
                <button className="flex flex-col items-center bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl p-3 sm:p-4 w-full h-20 sm:h-24 text-white transition-all duration-200 hover:scale-105">
                  <span className="mb-1 sm:mb-2 text-lg sm:text-xl">🌍</span>
                  <span className="text-xs sm:text-sm font-medium">Geography</span>
                </button>
                <button className="flex flex-col items-center bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl p-3 sm:p-4 w-full h-20 sm:h-24 text-white transition-all duration-200 hover:scale-105">
                  <span className="mb-1 sm:mb-2 text-lg sm:text-xl">➗</span>
                  <span className="text-xs sm:text-sm font-medium">Math</span>
                </button>
                <button className="flex flex-col items-center bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl p-3 sm:p-4 w-full h-20 sm:h-24 text-white transition-all duration-200 hover:scale-105">
                  <span className="mb-1 sm:mb-2 text-lg sm:text-xl">🗣️</span>
                  <span className="text-xs sm:text-sm font-medium">Language</span>
                </button>
                <button className="flex flex-col items-center bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl p-3 sm:p-4 w-full h-20 sm:h-24 text-white transition-all duration-200 hover:scale-105">
                  <span className="mb-1 sm:mb-2 text-lg sm:text-xl">🔭</span>
                  <span className="text-xs sm:text-sm font-medium">Astronomy</span>
                </button>
                <button className="flex flex-col items-center bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl p-3 sm:p-4 w-full h-20 sm:h-24 text-white transition-all duration-200 hover:scale-105">
                  <span className="mb-1 sm:mb-2 text-lg sm:text-xl">❤️</span>
                  <span className="text-xs sm:text-sm font-medium">Health</span>
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
      
      {/* Waitlist Popup Modal */}
      {isWaitlistPopupOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeWaitlistPopup}
          />
          
          <div className="relative bg-gradient-to-br from-purple-900/95 to-indigo-900/95 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-md mx-2 sm:mx-4">
            <button
              onClick={closeWaitlistPopup}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/70 hover:text-white transition-colors text-lg sm:text-xl font-bold bg-white/10 hover:bg-white/20 rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center"
            >
              ✕
            </button>
            
            <div className="text-center mb-4 sm:mb-6">
              <div className="text-lg sm:text-xl mb-3 sm:mb-4 text-white">🤖 + 📚 = 🏆</div>
              <h3 className="text-sm sm:text-base text-white mb-2 leading-relaxed">
                Beat the competition—join now for exclusive early access to AI-powered quizzes.
              </h3>
            </div>
            
            <Joinwaitlist onSuccess={closeWaitlistPopup} />
          </div>
        </div>
      )}
      
      {/* Development Notice Popup */}
      {/*
      {showPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPopup(false)}
          />
          
          <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-300 rounded-2xl shadow-2xl p-8 w-full max-w-lg mx-4">
            <div className="text-center">
              <div className="text-5xl mb-4">🔄</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Project in Early Development</h3>
              <div className="space-y-3 text-gray-700">
                <p className="text-sm">
                  This is a prototype demonstration showcasing the initial UI/UX design and some functionality.
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
            
            <button
              onClick={() => setShowPopup(false)}
              className="cursor-pointer absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors text-xl font-bold bg-white/80 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      */}
      
      {/* Footer only shows on landing page */}
     
    </div>
    
     <Footer />
     
     </>
  );
};

export default Hero;
