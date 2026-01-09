import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
// import Footer from "./Footer";
import { Highlighter } from "@/components/magicui/highlighter";

import { supabase } from "../lib/supabase";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import LottieLoader from "./LottieLoader";

import Navbar from "./Navbar";

const Hero = () => {
  const navigate = useNavigate();
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
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
        <div className="flex items-center justify-between px-5 pt-6 mt-4 pb-4">
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
              <Highlighter action="box" isView={true} color="#EC4899">
                No hassle.
              </Highlighter>
              <br />
              Just your ideas,{" "}
              <Highlighter action="highlight" isView={true} color="#22D3EE">
                powered by AI.
              </Highlighter>
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
              className="w-full mt-8 cursor-pointer bg-gradient-to-r from-[#7E22CE] to-[#6366F1] text-white font-semibold px-6 py-4 rounded-2xl shadow-xl transition-all duration-300 text-base flex items-center justify-center gap-2"
            >
              <span className="text-yellow-400">⚡</span>
              Create Your AI Quiz Now
            </button>
          </div>

          {/* Mobile Topics Section */}
          <div className="mb-4 text-center mt-12">
            <p className="text-xs uppercase tracking-[0.2em] text-purple-200/60 font-medium">
              Every preparation starts with a choice
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 pb-4">
            <button
              onClick={() => handleTopicClick("UPSC GS-1")}
              className="cursor-pointer flex flex-col items-center justify-center bg-gradient-to-br from-rose-400/30 to-pink-500/30 rounded-2xl p-2 h-[72px] text-white/90 transition-all duration-200 active:scale-95 border border-white/20"
            >
              <span className="mb-1 text-lg">📜</span>
              <span className="text-[10px] font-medium text-center leading-tight">
                UPSC GS-1
              </span>
            </button>
            <button
              onClick={() => handleTopicClick("MERN stack")}
              className="cursor-pointer flex flex-col items-center justify-center bg-gradient-to-br from-amber-400/30 to-orange-500/30 rounded-2xl p-2 h-[72px] text-white/90 transition-all duration-200 active:scale-95 border border-white/20"
            >
              <span className="mb-1 text-lg">🌐</span>
              <span className="text-[10px] font-medium text-center leading-tight">
                MERN
              </span>
            </button>
            <button
              onClick={() => handleTopicClick("CLAT Logical Reasoning")}
              className="cursor-pointer flex flex-col items-center justify-center bg-gradient-to-br from-emerald-400/30 to-teal-500/30 rounded-2xl p-2 h-[72px] text-white/90 transition-all duration-200 active:scale-95 border border-white/20"
            >
              <span className="mb-1 text-lg">⚖️</span>
              <span className="text-[10px] font-medium text-center leading-tight">
                CLAT
              </span>
            </button>
            <button
              onClick={() => handleTopicClick("CSAT Logical Reasoning")}
              className="cursor-pointer flex flex-col items-center justify-center bg-gradient-to-br from-purple-400/30 to-violet-500/30 rounded-2xl p-2 h-[72px] text-white/90 transition-all duration-200 active:scale-95 border border-white/20"
            >
              <span className="mb-1 text-lg">🧠</span>
              <span className="text-[10px] font-medium text-center leading-tight">
                CSAT
              </span>
            </button>
            <button
              onClick={() => handleTopicClick("EU EPSO Reasoning")}
              className="cursor-pointer flex flex-col items-center justify-center bg-gradient-to-br from-blue-400/30 to-indigo-500/30 rounded-2xl p-2 h-[72px] text-white/90 transition-all duration-200 active:scale-95 border border-white/20"
            >
              <span className="mb-1 text-lg">🧩</span>
              <span className="text-[10px] font-medium text-center leading-tight">
                EU EPSO
              </span>
            </button>
            <button
              onClick={() => handleTopicClick("JEE Advanced Physics")}
              className="cursor-pointer flex flex-col items-center justify-center bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-2xl p-2 h-[72px] text-white/90 transition-all duration-200 active:scale-95 border border-white/20"
            >
              <span className="mb-1 text-lg">⚛️</span>
              <span className="text-[10px] font-medium text-center leading-tight">
                JEE Physics
              </span>
            </button>
            <button
              onClick={() => handleTopicClick("NDA Mathematics")}
              className="cursor-pointer flex flex-col items-center justify-center bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-2xl p-2 h-[72px] text-white/90 transition-all duration-200 active:scale-95 border border-white/20"
            >
              <span className="mb-1 text-lg">📐</span>
              <span className="text-[10px] font-medium text-center leading-tight">
                NDA Math
              </span>
            </button>
            <button
              onClick={() => handleTopicClick("SSC CGL Quant")}
              className="cursor-pointer flex flex-col items-center justify-center bg-gradient-to-br from-pink-400/30 to-rose-500/30 rounded-2xl p-2 h-[72px] text-white/90 transition-all duration-200 active:scale-95 border border-white/20"
            >
              <span className="mb-1 text-lg">➗</span>
              <span className="text-[10px] font-medium text-center leading-tight">
                SSC CGL
              </span>
            </button>
            <button
              onClick={() => handleTopicClick("GAOKAO Mathematics")}
              className="cursor-pointer flex flex-col items-center justify-center bg-gradient-to-br from-red-400/30 to-orange-500/30 rounded-2xl p-2 h-[72px] text-white/90 transition-all duration-200 active:scale-95 border border-white/20"
            >
              <span className="mb-1 text-lg">🇨🇳🧮</span>
              <span className="text-[10px] font-medium text-center leading-tight">
                GAOKAO
              </span>
            </button>
            <button
              onClick={() => handleTopicClick("SAT Math (Hard)")}
              className="cursor-pointer flex flex-col items-center justify-center bg-gradient-to-br from-indigo-400/30 to-purple-500/30 rounded-2xl p-2 h-[72px] text-white/90 transition-all duration-200 active:scale-95 border border-white/20"
            >
              <span className="mb-1 text-lg">📈</span>
              <span className="text-[10px] font-medium text-center leading-tight">
                SAT Math
              </span>
            </button>
            <button
              onClick={() => handleTopicClick("GRE Quantitative")}
              className="cursor-pointer flex flex-col items-center justify-center bg-gradient-to-br from-teal-400/30 to-cyan-500/30 rounded-2xl p-2 h-[72px] text-white/90 transition-all duration-200 active:scale-95 border border-white/20"
            >
              <span className="mb-1 text-lg">📊</span>
              <span className="text-[10px] font-medium text-center leading-tight">
                GRE Quant
              </span>
            </button>
            <button
              onClick={() => handleTopicClick("Korean CSAT Math")}
              className="cursor-pointer flex flex-col items-center justify-center bg-gradient-to-br from-sky-400/30 to-blue-500/30 rounded-2xl p-2 h-[72px] text-white/90 transition-all duration-200 active:scale-95 border border-white/20"
            >
              <span className="mb-1 text-lg">🇰🇷📐</span>
              <span className="text-[10px] font-medium text-center leading-tight">
                Korean CSAT
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t border-white/10 px-4 py-2 z-50">
          <div className="flex items-center justify-around max-w-md mx-auto">
            {/* Home - Current page */}
            <button className="flex flex-col items-center py-2 px-4 text-white">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </button>
            {/* Pricing */}
            <button
              onClick={() => navigate("/pricing")}
              className="flex flex-col items-center py-2 px-4 text-white/60"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {/* Create Quiz - Center button */}
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center justify-center w-14 h-14 -mt-8 bg-gradient-to-br from-[#EC4899] to-[#2e0919] rounded-full shadow-lg shadow-purple-600/20"
            >
              <span className="text-2xl">⚡</span>
            </button>
            {/* About */}
            <button
              onClick={() => navigate("/about")}
              className="flex flex-col items-center py-2 px-4 text-white/60"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {/* Profile/Sign In */}
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

              {/* Center Navigation */}
              <div className="order-2 sm:order-2 ">
                <Navbar />
              </div>

              {/* Sign up buttons - Responsive layout */}
              <div className="relative z-10 order-3 sm:order-3 flex flex-row gap-3 sm:gap-4">
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
            <div className="mt-14 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
              {/* Left: Title, subtitle, CTA */}
              <div className="max-w-lg w-full lg:w-auto">
                <h1 className=" text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold text-white  sm:mb-4 drop-shadow leading-tight ">
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
                <div className="mt-8 sm:mt-12 lg:mt-16 mb-4 sm:mb-6 text-center">
                  <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-purple-200/90 font-medium">
                    <Highlighter
                      action="underline"
                      isView={true}
                      color="#A855F7"
                    >
                      Every preparation
                    </Highlighter>{" "}
                    starts with a choice
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 w-full max-w-sm lg:max-w-xl">
                  {/* Topic buttons */}
                  <button
                    onClick={() => handleTopicClick("UPSC GS-1")}
                    className="cursor-pointer flex flex-col items-center bg-orange-500/30 hover:bg-orange-500/40 rounded-lg sm:rounded-xl p-2 sm:p-3 w-full h-18 sm:h-20 text-white transition-all duration-200 hover:scale-105 border border-orange-400/30"
                  >
                    <span className="mb-1 text-lg sm:text-xl">📜</span>
                    <span className="text-[10px] sm:text-xs font-medium text-center">
                      UPSC GS-1
                    </span>
                  </button>

                  <button
                    onClick={() => handleTopicClick("MERN")}
                    className="cursor-pointer flex flex-col items-center bg-green-500/30 hover:bg-green-500/40 rounded-lg sm:rounded-xl p-2 sm:p-3 w-full h-18 sm:h-20 text-white transition-all duration-200 hover:scale-105 border border-green-400/30"
                  >
                    <span className="mb-1 text-lg sm:text-xl">🌐</span>
                    <span className="text-[10px] sm:text-xs font-medium text-center">
                      MERN
                    </span>
                  </button>
                  <button
                    onClick={() => handleTopicClick("CSAT Logical Reasoning")}
                    className="cursor-pointer flex flex-col items-center bg-pink-500/30 hover:bg-pink-500/40 rounded-lg sm:rounded-xl p-2 sm:p-3 w-full h-18 sm:h-20 text-white transition-all duration-200 hover:scale-105 border border-pink-400/30"
                  >
                    <span className="mb-1 text-lg sm:text-xl">🧠</span>
                    <span className="text-[10px] sm:text-xs font-medium text-center">
                      CSAT Reasoning
                    </span>
                  </button>
                  <button
                    onClick={() => handleTopicClick("EU EPSO Reasoning")}
                    className="cursor-pointer flex flex-col items-center bg-blue-500/30 hover:bg-blue-500/40 rounded-lg sm:rounded-xl p-2 sm:p-3 w-full h-18 sm:h-20 text-white transition-all duration-200 hover:scale-105 border border-blue-400/30"
                  >
                    <span className="mb-1 text-lg sm:text-xl">🧩</span>
                    <span className="text-[10px] sm:text-xs font-medium text-center">
                      EU EPSO
                    </span>
                  </button>
                  <button
                    onClick={() => handleTopicClick("JEE Advanced Physics")}
                    className="cursor-pointer flex flex-col items-center bg-cyan-500/30 hover:bg-cyan-500/40 rounded-lg sm:rounded-xl p-2 sm:p-3 w-full h-18 sm:h-20 text-white transition-all duration-200 hover:scale-105 border border-cyan-400/30"
                  >
                    <span className="mb-1 text-lg sm:text-xl">⚛️</span>
                    <span className="text-[10px] sm:text-xs font-medium text-center">
                      JEE Physics
                    </span>
                  </button>

                  <button
                    onClick={() => handleTopicClick("GAOKAO Mathematics")}
                    className="cursor-pointer flex flex-col items-center bg-red-500/30 hover:bg-red-500/40 rounded-lg sm:rounded-xl p-2 sm:p-3 w-full h-18 sm:h-20 text-white transition-all duration-200 hover:scale-105 border border-red-400/30"
                  >
                    <span className="mb-1 text-lg sm:text-xl">🇨🇳🧮</span>
                    <span className="text-[10px] sm:text-xs font-medium text-center">
                      GAOKAO
                    </span>
                  </button>
                  <button
                    onClick={() => handleTopicClick("SAT Math (Hard)")}
                    className="cursor-pointer flex flex-col items-center bg-violet-500/30 hover:bg-violet-500/40 rounded-lg sm:rounded-xl p-2 sm:p-3 w-full h-18 sm:h-20 text-white transition-all duration-200 hover:scale-105 border border-violet-400/30"
                  >
                    <span className="mb-1 text-lg sm:text-xl">📈</span>
                    <span className="text-[10px] sm:text-xs font-medium text-center">
                      SAT Math
                    </span>
                  </button>
                  <button
                    onClick={() => handleTopicClick("GRE Quantitative")}
                    className="cursor-pointer flex flex-col items-center bg-amber-500/30 hover:bg-amber-500/40 rounded-lg sm:rounded-xl p-2 sm:p-3 w-full h-18 sm:h-20 text-white transition-all duration-200 hover:scale-105 border border-amber-400/30"
                  >
                    <span className="mb-1 text-lg sm:text-xl">📊</span>
                    <span className="text-[10px] sm:text-xs font-medium text-center">
                      GRE Quant
                    </span>
                  </button>
                  <button
                    onClick={() => handleTopicClick("Korean CSAT Math")}
                    className="cursor-pointer flex flex-col items-center bg-indigo-500/30 hover:bg-indigo-500/40 rounded-lg sm:rounded-xl p-2 sm:p-3 w-full h-18 sm:h-20 text-white transition-all duration-200 hover:scale-105 border border-indigo-400/30"
                  >
                    <span className="mb-1 text-lg sm:text-xl">🇰🇷📐</span>
                    <span className="text-[10px] sm:text-xs font-medium text-center">
                      Korean CSAT
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <div className="absolute left-40 bottom-0 w-full h-64 bg-[url('/static/bottom.webp')] bg-no-repeat bg-left-bottom bg-contain pointer-events-none z-[-1]"></div>
            <div className="absolute right-0 top-0 w-full h-52 bg-[url('/static/top.webp')] bg-no-repeat bg-right-top bg-contain pointer-events-none z-[-1]"></div>
          </div>
        </div>

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
