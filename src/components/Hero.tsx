import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import SignUp from "./SignUp";
import SignIn from "./SignIn";

const Hero = () => {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

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

  // Show popup when component mounts
  useEffect(() => {
    setShowPopup(true);
  }, []);

  return (
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
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center font-bold text-white text-lg"></div>
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
              <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition">
                Get it now
              </button>
            </div>
            {/* Right: Topic selection */}
            <div className="flex flex-col items-center">
              <div className="mt-28 text-white/80 mb-4 text-center">
                HI Aditya! WHAT TOPIC ARE YOU
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
      {isSignUpOpen && <SignUp isOpen={isSignUpOpen} onClose={closeModals} />}
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
          <div className="relative bg-yellow-400 border-4 border-yellow-600 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 animate-pulse">
            <div className="text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-2xl font-bold text-yellow-900 mb-4">Under Development</h3>
              <p className="text-yellow-800 text-lg mb-6">
                Backend is currently under development. Please enjoy the frontend demo for now!
              </p>
              <p className="text-yellow-700 font-semibold">
                We'll be back with a fully functional app in 1-2 weeks! 🚀
              </p>
            </div>
            
            {/* Close button */}
            <button
              onClick={() => setShowPopup(false)}
              className="cursor-pointer absolute top-4 right-4 text-yellow-700 hover:text-yellow-900 transition-colors text-2xl font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hero;
