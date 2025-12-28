import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
// import Footer from "./Footer";
import { Highlighter } from "@/components/magicui/highlighter";

import { supabase } from "../lib/supabase";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import LottieLoader from "./LottieLoader";

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

  const handleTopicClick = (topic: string) => {
    navigate(`/dashboard?topic=${encodeURIComponent(topic)}`);
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
        console.error("Error checking auth status:", error);
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <LottieLoader size="xlarge" text="Loading..." />
      </div>
    );
  }

  return (
    <>
      {/* ============================================= */}
      {/* MOBILE VERSION - Hidden on md and above */}
      {/* ============================================= */}
      <div className="md:hidden relative min-h-screen w-full bg-gradient-to-br from-[#C084FC] via-[#A855F7] to-[#7E22CE] overflow-hidden font-['Outfit',sans-serif]">
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <img
              src="/static/quizethic-favicon.svg"
              alt="Quizethic AI Logo"
              className="w-8 h-8 rounded-xl"
            />
            <span className="font-bold text-base text-white drop-shadow">
              Quizethic AI
            </span>
          </div>
          <button
            onClick={openSignIn}
            className="px-4 py-2 text-sm font-medium text-[#7E22CE] bg-white/90 rounded-full hover:bg-white transition-colors shadow-sm"
          >
            Log in
          </button>
        </div>

        {/* Mobile Main Content */}
        <div className="px-5 pb-24">
          {/* Hero Section */}
          <div className="mt-4 mb-6">
            <h1 className="text-[2.25rem] leading-[1.1] font-bold text-white mb-4">
              Create Smart
              <br />
              <span className="text-cyan-300">Quizzes</span> on Any
              <br />
              Topic.
            </h1>
            <p className="text-white/90 text-base leading-relaxed mb-6">
              Create quizzes on anything.{" "}
              <span className="bg-[#EC4899] px-2 py-0.5 rounded text-white font-medium">
                No hassle.
              </span>
              <br />
              Just your ideas,{" "}
              <span className="bg-cyan-400 px-2 py-0.5 rounded text-[#1E1B4B] font-medium">
                powered by AI.
              </span>
            </p>
            <button
              onClick={async () => {
                const {
                  data: { session },
                } = await supabase.auth.getSession();
                if (session?.user) {
                  navigate("/dashboard");
                } else {
                  openSignUp();
                }
              }}
              className="w-full cursor-pointer bg-gradient-to-r from-[#7E22CE] to-[#6366F1] text-white font-semibold px-6 py-4 rounded-2xl shadow-xl transition-all duration-300 text-base flex items-center justify-center gap-2"
            >
              <span className="text-yellow-400">⚡</span>
              Create Your AI Quiz Now
            </button>
          </div>

          {/* Mobile Waitlist Card */}
          <div className="mb-6">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-5 border border-white/30 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🚀</span>
                <h2 className="text-white font-semibold text-base">
                  Join the Waitlist
                </h2>
              </div>
              <p className="text-white/80 text-sm mb-4 leading-relaxed">
                Your shortcut to smarter prep starts here — join before launch.
              </p>
              <Joinwaitlist />
            </div>
          </div>

          {/* Mobile Topics Section */}
          <div className="mb-4">
            <p className="text-white/60 text-xs font-medium tracking-wider uppercase mb-1">
              HI BRAINIAC!
            </p>
            <h3 className="text-white font-semibold text-lg">
              What topic are you interested in?
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-3 pb-4">
            <button
              onClick={() => handleTopicClick("Art")}
              className="cursor-pointer flex flex-col items-center justify-center bg-gradient-to-br from-rose-400/30 to-pink-500/30 rounded-2xl p-3 h-20 text-white/90 transition-all duration-200 active:scale-95 border border-white/20"
            >
              <span className="mb-1.5 text-xl">🎨</span>
              <span className="text-xs font-medium">Art</span>
            </button>
            <button
              onClick={() => handleTopicClick("Science")}
              className="flex flex-col items-center justify-center bg-gradient-to-br from-emerald-400/30 to-teal-500/30 rounded-2xl p-3 h-20 text-white/90 transition-all duration-200 active:scale-95 border border-white/20"
            >
              <span className="mb-1.5 text-xl">🧪</span>
              <span className="text-xs font-medium">Science</span>
            </button>
            <button
              onClick={() => handleTopicClick("Weather")}
              className="flex flex-col items-center justify-center bg-gradient-to-br from-amber-400/30 to-orange-500/30 rounded-2xl p-3 h-20 text-white/90 transition-all duration-200 active:scale-95 border border-white/20"
            >
              <span className="mb-1.5 text-xl">☀️</span>
              <span className="text-xs font-medium">Weather</span>
            </button>
            <button
              onClick={() => handleTopicClick("Physics")}
              className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-400/30 to-indigo-500/30 rounded-2xl p-3 h-20 text-white/90 transition-all duration-200 active:scale-95 border border-white/20"
            >
              <span className="mb-1.5 text-xl">⚛️</span>
              <span className="text-xs font-medium">Physics</span>
            </button>
            <button
              onClick={() => handleTopicClick("Geography")}
              className="flex flex-col items-center justify-center bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-2xl p-3 h-20 text-white/90 transition-all duration-200 active:scale-95 border border-white/20"
            >
              <span className="mb-1.5 text-xl">🌍</span>
              <span className="text-xs font-medium">Geography</span>
            </button>
            <button
              onClick={() => handleTopicClick("Math")}
              className="flex flex-col items-center justify-center bg-gradient-to-br from-pink-400/30 to-rose-500/30 rounded-2xl p-3 h-20 text-white/90 transition-all duration-200 active:scale-95 border border-white/20"
            >
              <span className="mb-1.5 text-xl">🔢</span>
              <span className="text-xs font-medium">Math</span>
            </button>
            <button
              onClick={() => handleTopicClick("Language")}
              className="flex flex-col items-center justify-center bg-gradient-to-br from-violet-400/30 to-purple-500/30 rounded-2xl p-3 h-20 text-white/90 transition-all duration-200 active:scale-95 border border-white/20"
            >
              <span className="mb-1.5 text-base font-bold">文A</span>
              <span className="text-xs font-medium">Language</span>
            </button>
            <button
              onClick={() => handleTopicClick("Astronomy")}
              className="flex flex-col items-center justify-center bg-gradient-to-br from-indigo-400/30 to-blue-500/30 rounded-2xl p-3 h-20 text-white/90 transition-all duration-200 active:scale-95 border border-white/20"
            >
              <span className="mb-1.5 text-xl">🔭</span>
              <span className="text-xs font-medium">Astronomy</span>
            </button>
            <button
              onClick={() => handleTopicClick("")}
              className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-400/20 to-gray-500/20 rounded-2xl p-3 h-20 text-white/90 transition-all duration-200 active:scale-95 border-2 border-dashed border-white/30"
            >
              <span className="mb-1.5 text-xl">+</span>
              <span className="text-xs font-medium">More</span>
            </button>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#1E1B4B]/95 to-[#312E81]/95 backdrop-blur-lg border-t border-white/10 px-4 py-2 z-50">
          <div className="flex items-center justify-around max-w-md mx-auto">
            <button className="flex flex-col items-center py-2 px-4 text-white">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </button>
            <button className="flex flex-col items-center py-2 px-4 text-white/60">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
            <button
              onClick={openSignUp}
              className="flex items-center justify-center w-14 h-14 -mt-6 bg-gradient-to-br from-[#EC4899] to-[#DB2777] rounded-full shadow-lg shadow-pink-500/40"
            >
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <button className="flex flex-col items-center py-2 px-4 text-white/60">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              onClick={openSignIn}
              className="flex flex-col items-center py-2 px-4 text-white/60"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </nav>
      </div>

      {/* ============================================= */}
      {/* DESKTOP VERSION - Original code, hidden on mobile */}
      {/* ============================================= */}
      <div className="hidden md:block relative h-screen w-full bg-[url('/static/bg.webp')] bg-cover bg-no-repeat bg-center overflow-hidden">
        {/* Background abstract shapes (placeholders) */}

        {/* Glassmorphic Card */}
        <div className="relative z-10 mx-auto mt-4 sm:mt-8 md:mt-20 w-[95%] sm:w-[90%] md:w-[80%] max-w-[1200px]">
          <div
            id="blur"
            className="relative overflow-hidden bg-white/30 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 lg:p-12 w-full h-full border-t border-l border-r border-white/40 flex flex-col"
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
              {/* <nav className="hidden md:flex gap-6 lg:gap-8 text-white font-inter font-semibold text-sm lg:text-base order-2">
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
            </nav> */}

              {/* Waitlist - Positioned for mobile */}
              <div className="order-2 sm:order-3 md:absolute md:right-0 md:top-20 md:z-20 md:mr-[400px] drop-shadow-lg w-full sm:w-auto">
                <Joinwaitlist />
              </div>

              {/* Sign up buttons - Responsive layout */}
              <div className="relative z-10 order-3 sm:order-4 flex flex-row gap-3 sm:gap-4">
                <InteractiveHoverButton
                  onClick={openSignUp}
                  className="font-medium min-w-[100px] sm:min-w-[120px] text-center text-sm sm:text-base opacity-90 hover:opacity-100 transition-opacity"
                >
                  Sign up
                </InteractiveHoverButton>
                <InteractiveHoverButton
                  onClick={openSignIn}
                  className="font-medium min-w-[100px] sm:min-w-[120px] text-center text-sm sm:text-base opacity-90 hover:opacity-100 transition-opacity"
                >
                  Sign in
                </InteractiveHoverButton>
              </div>
            </div>

            {/* Main Content */}
            <div className="mt-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
              {/* Left: Title, subtitle, CTA */}
              <div className="max-w-lg w-full lg:w-auto">
                <h1 className="mb-10 text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-bold text-white  sm:mb-4 drop-shadow leading-tight mt-16">
                  Create Smart Quizzes
                  <br />
                  on Any Topic in Seconds
                </h1>
                <p className="text-white mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed font-medium drop-shadow-sm">
                  <Highlighter action="underline" isView={true} color="#6366F1">
                    Create quizzes
                  </Highlighter>{" "}
                  on anything.{" "}
                  <Highlighter action="highlight" isView={true} color="#FF6B9D">
                    No hassle.
                  </Highlighter>{" "}
                  <br />
                  Just{" "}
                  <Highlighter action="underline" isView={true} color="#F59E0B">
                    your ideas,
                  </Highlighter>{" "}
                  &nbsp;
                  <Highlighter action="highlight" isView={true} color="#22D3EE">
                    powered by AI.
                  </Highlighter>
                </p>

                <button
                  onClick={async () => {
                    // Check if user is authenticated
                    const {
                      data: { session },
                    } = await supabase.auth.getSession();
                    if (session?.user) {
                      navigate("/dashboard");
                    } else {
                      // User not authenticated, show sign-up modal
                      openSignUp();
                    }
                  }}
                  className="mt-10  cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-2xl transition-all duration-300 text-sm sm:text-base w-full sm:w-auto transform hover:scale-105 hover:shadow-purple-500/25"
                >
                  Create Your AI Quiz Now
                </button>
              </div>
              {/* Right: Topic selection */}
              <div className="flex flex-col items-center w-full lg:w-auto">
                <div className="mt-8 sm:mt-12 lg:mt-16 text-white/70 mb-4 sm:mb-6 text-center text-sm sm:text-base">
                  HI Brainiac! WHAT TOPIC ARE YOU
                  <br />
                  INTERESTED IN?
                </div>
                <div className=" grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 w-full max-w-sm lg:max-w-none">
                  {/* Topic buttons (placeholders for icons) */}
                  <button
                    onClick={() => handleTopicClick("Art")}
                    className="cursor-pointer flex flex-col items-center bg-white/15 hover:bg-white/25 rounded-lg sm:rounded-xl p-3 sm:p-4 w-full h-20 sm:h-24 text-white/90 transition-all duration-200 hover:scale-105 border border-white/10"
                  >
                    <span className="mb-1 sm:mb-2 text-lg sm:text-xl">🎨</span>
                    <span className="text-xs sm:text-sm font-medium">Art</span>
                  </button>
                  <button
                    onClick={() => handleTopicClick("Science")}
                    className="cursor-pointer flex flex-col items-center bg-white/15 hover:bg-white/25 rounded-lg sm:rounded-xl p-3 sm:p-4 w-full h-20 sm:h-24 text-white/90 transition-all duration-200 hover:scale-105 border border-white/10"
                  >
                    <span className="mb-1 sm:mb-2 text-lg sm:text-xl">🔬</span>
                    <span className="text-xs sm:text-sm font-medium">
                      Science
                    </span>
                  </button>
                  <button
                    onClick={() => handleTopicClick("Weather")}
                    className="cursor-pointer flex flex-col items-center bg-white/15 hover:bg-white/25 rounded-lg sm:rounded-xl p-3 sm:p-4 w-full h-20 sm:h-24 text-white/90 transition-all duration-200 hover:scale-105 border border-white/10"
                  >
                    <span className="mb-1 sm:mb-2 text-lg sm:text-xl">⛅</span>
                    <span className="text-xs sm:text-sm font-medium">
                      Weather
                    </span>
                  </button>
                  <button
                    onClick={() => handleTopicClick("Physics")}
                    className="cursor-pointer flex flex-col items-center bg-white/15 hover:bg-white/25 rounded-lg sm:rounded-xl p-3 sm:p-4 w-full h-20 sm:h-24 text-white/90 transition-all duration-200 hover:scale-105 border border-white/10"
                  >
                    <span className="mb-1 sm:mb-2 text-lg sm:text-xl">⚛️</span>
                    <span className="text-xs sm:text-sm font-medium">
                      Physics
                    </span>
                  </button>
                  <button
                    onClick={() => handleTopicClick("Geography")}
                    className="cursor-pointer flex flex-col items-center bg-white/15 hover:bg-white/25 rounded-lg sm:rounded-xl p-3 sm:p-4 w-full h-20 sm:h-24 text-white/90 transition-all duration-200 hover:scale-105 border border-white/10"
                  >
                    <span className="mb-1 sm:mb-2 text-lg sm:text-xl">🌍</span>
                    <span className="text-xs sm:text-sm font-medium">
                      Geography
                    </span>
                  </button>
                  <button
                    onClick={() => handleTopicClick("Math")}
                    className="cursor-pointer flex flex-col items-center bg-white/15 hover:bg-white/25 rounded-lg sm:rounded-xl p-3 sm:p-4 w-full h-20 sm:h-24 text-white/90 transition-all duration-200 hover:scale-105 border border-white/10"
                  >
                    <span className="mb-1 sm:mb-2 text-lg sm:text-xl">➗</span>
                    <span className="text-xs sm:text-sm font-medium">Math</span>
                  </button>
                  <button
                    onClick={() => handleTopicClick("Language")}
                    className="cursor-pointer flex flex-col items-center bg-white/15 hover:bg-white/25 rounded-lg sm:rounded-xl p-3 sm:p-4 w-full h-20 sm:h-24 text-white/90 transition-all duration-200 hover:scale-105 border border-white/10"
                  >
                    <span className="mb-1 sm:mb-2 text-lg sm:text-xl">🗣️</span>
                    <span className="text-xs sm:text-sm font-medium">
                      Language
                    </span>
                  </button>
                  <button
                    onClick={() => handleTopicClick("Astronomy")}
                    className="cursor-pointer flex flex-col items-center bg-white/15 hover:bg-white/25 rounded-lg sm:rounded-xl p-3 sm:p-4 w-full h-20 sm:h-24 text-white/90 transition-all duration-200 hover:scale-105 border border-white/10"
                  >
                    <span className="mb-1 sm:mb-2 text-lg sm:text-xl">🔭</span>
                    <span className="text-xs sm:text-sm font-medium">
                      Astronomy
                    </span>
                  </button>
                  <button
                    onClick={() => handleTopicClick("Health")}
                    className="cursor-pointer flex flex-col items-center bg-white/15 hover:bg-white/25 rounded-lg sm:rounded-xl p-3 sm:p-4 w-full h-20 sm:h-24 text-white/90 transition-all duration-200 hover:scale-105 border border-white/10"
                  >
                    <span className="mb-1 sm:mb-2 text-lg sm:text-xl">❤️</span>
                    <span className="text-xs sm:text-sm font-medium">
                      Health
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <div className="absolute left-40 bottom-0 w-full h-64 bg-[url('/static/bottom.webp')] bg-no-repeat bg-left-bottom bg-contain pointer-events-none z-[-1]"></div>
            <div className="absolute right-0 top-0 w-full h-52 bg-[url('/static/top.webp')] bg-no-repeat bg-right-top bg-contain pointer-events-none z-[-1]"></div>
          </div>
        </div>

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
                <div className="text-lg sm:text-xl mb-3 sm:mb-4 text-white">
                  🤖 + 📚 = 🏆
                </div>
                <h3 className="text-sm sm:text-base text-white mb-2 leading-relaxed">
                  Beat the competition—join now for exclusive early access to
                  AI-powered quizzes.
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

      {/* Shared Modals - Work for both mobile and desktop */}
      {isSignUpOpen && (
        <SignUp
          isOpen={isSignUpOpen}
          onClose={closeModals}
          onSwitchToSignIn={openSignIn}
        />
      )}
      {isSignInOpen && (
        <SignIn
          isOpen={isSignInOpen}
          onClose={closeModals}
          onSwitchToSignUp={openSignUp}
        />
      )}

      {/* <Footer /> */}
    </>
  );
};

export default Hero;
