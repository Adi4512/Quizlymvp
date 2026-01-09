import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, UserTier } from "../lib/supabase";
import { getRandomTopics } from "../lib/topics";
import AuthModal from "./AuthModal";
import LottieLoader from "./LottieLoader";
import { SideNavbar } from "./SideNavbar";
import { Modal, useModal } from "./ui/modal";

// Usage status from backend
interface UsageStatus {
  tier: UserTier;
  quizzesToday: number;
  dailyLimit: number;
  remaining: number;
  canGenerate: boolean;
  isUnlimited: boolean;
}
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
import {
  IconHome,
  IconDashboard,
  IconUserBolt,
  IconSettings,
  IconArrowLeft,
  IconMenu2,
  IconX,
  IconCreditCard,
  IconInfoCircle,
  IconMail,
} from "@tabler/icons-react";

import QuoteBox from "./QuoteBox";

interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    display_name?: string;
    username?: string;
    avatar_url?: string;
    picture?: string;
    name?: string;
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "Easy" | "Medium" | "Hard" | "Mix" | null
  >("Medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [popularTopics, setPopularTopics] = useState<string[]>(
    getRandomTopics(5)
  );
  const [topicsKey, setTopicsKey] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Usage tracking state
  const [usageStatus, setUsageStatus] = useState<UsageStatus | null>(null);
  const [, setUsageLoading] = useState(false);

  // Modal for notifications
  const { modalProps, showWarning, showError } = useModal();

  // Mobile menu links
  const mobileMenuLinks = [
    { label: "Home", icon: IconHome, path: "/" },
    { label: "Dashboard", icon: IconDashboard, path: "/dashboard" },
    { label: "Profile", icon: IconUserBolt, path: "/profile" },
    { label: "Settings", icon: IconSettings, path: "/settings" },
    { label: "Pricing", icon: IconCreditCard, path: "/pricing" },
    { label: "About Us", icon: IconInfoCircle, path: "/about" },
    { label: "Contact Us", icon: IconMail, path: "/contactus" },
  ];

  const handleMobileLogout = async () => {
    try {
      await supabase.auth.signOut();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Loading steps for quiz generation
  const loadingSteps = [
    { text: "Analyzing syllabus...", icon: "📚" },
    { text: "Identifying key concepts...", icon: "🔍" },
    { text: "Curating questions...", icon: "✨" },
    { text: "Finalizing your quiz...", icon: "🎯" },
  ];

  // Read topic from URL query parameter and set search query
  useEffect(() => {
    const topic = searchParams.get("topic");
    if (topic) {
      setSearchQuery(topic);
    }
  }, [searchParams]);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user as User);
      }

      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        setUser(session.user as User);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch usage status from backend
  const fetchUsageStatus = useCallback(async (userId: string) => {
    if (!userId) return;

    setUsageLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/user/status/${userId}`);
      if (response.data.success) {
        setUsageStatus(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch usage status:", error);
      // Set default free tier status on error
      setUsageStatus({
        tier: "free",
        quizzesToday: 0,
        dailyLimit: 5,
        remaining: 5,
        canGenerate: true,
        isUnlimited: false,
      });
    } finally {
      setUsageLoading(false);
    }
  }, []);

  // Fetch usage status when user changes
  useEffect(() => {
    if (user?.id) {
      fetchUsageStatus(user.id);
    }
  }, [user?.id, fetchUsageStatus]);

  // Enforce free tier restrictions: Medium difficulty, 10 questions
  useEffect(() => {
    if (usageStatus && usageStatus.tier === "free") {
      setSelectedDifficulty("Medium");
      setNumberOfQuestions(10);
    }
  }, [usageStatus?.tier]);

  // Cleanup progress interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Rotate entire topic list every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPopularTopics(getRandomTopics(5));
      setTopicsKey((k) => k + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Cycle through loading steps when generating
  useEffect(() => {
    if (!showProgressBar) {
      setLoadingStep(0);
      return;
    }

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < loadingSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 3000); // Change step every 8 seconds

    return () => clearInterval(stepInterval);
  }, [showProgressBar, loadingSteps.length]);

  const handleGenerateQuiz = async () => {
    if (!searchQuery.trim()) {
      showWarning("Enter a Topic", "Please enter a quiz topic to get started.");
      return;
    }

    // Check if user can generate (tier limit check)
    if (usageStatus && !usageStatus.canGenerate) {
      showWarning(
        "Daily Limit Reached",
        `You've used all ${usageStatus.dailyLimit} free quizzes today.\n\nUpgrade to Pro for unlimited quizzes!`,
        {
          primaryAction: {
            label: "Upgrade to Pro",
            onClick: () => navigate("/pricing"),
          },
          secondaryAction: { label: "Maybe Later", onClick: () => {} },
        }
      );
      return;
    }

    setIsGenerating(true);
    setShowProgressBar(true);
    setProgressValue(0);

    // Start progress animation from 0 to 99
    progressIntervalRef.current = setInterval(() => {
      setProgressValue((prev) => {
        if (prev >= 99) {
          return 99; // Keep at 99 until API responds
        }
        // Increment by random number between 5-10
        const randomIncrement = Math.floor(Math.random() * 2) + 2;
        return Math.min(prev + randomIncrement, 99);
      });
    }, 1000); // Update every second

    try {
      // Call backend API with userId for tier tracking
      const response = await axios.post(`${API_URL}/api/generate`, {
        prompt: searchQuery.trim(),
        difficulty: selectedDifficulty || "Mix",
        numberOfQuestions: numberOfQuestions || 10,
        userId: user?.id, // Pass userId for usage tracking
      });

      const data = response.data;

      // Update usage status from response
      if (data.usage) {
        setUsageStatus(data.usage);
      }

      // Clear interval and complete progress
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setProgressValue(100);

      // Small delay to show 100% before navigating
      setTimeout(() => {
        setShowProgressBar(false);
        navigate("/quiz", { state: { response: data.response } });
      }, 500);
    } catch (error: any) {
      console.error("Error generating quiz:", error);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setShowProgressBar(false);
      setProgressValue(0);

      // Handle 403 - Daily limit reached
      if (
        error.response?.status === 403 &&
        error.response?.data?.upgradeRequired
      ) {
        const status = error.response.data.status;
        setUsageStatus(status); // Update local state
        showWarning(
          "Daily Limit Reached",
          `You've used all ${
            status?.dailyLimit || 5
          } free quizzes today.\n\nUpgrade to Pro for unlimited quizzes!`,
          {
            primaryAction: {
              label: "Upgrade to Pro",
              onClick: () => navigate("/pricing"),
            },
            secondaryAction: { label: "Maybe Later", onClick: () => {} },
          }
        );
        return;
      }

      showError(
        "Generation Failed",
        "We couldn't generate your quiz. Please check your connection and try again.",
        {
          primaryAction: { label: "Try Again", onClick: () => {} },
        }
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTopicClick = (topicName: string) => {
    setSearchQuery(topicName);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <LottieLoader size="xlarge" />
      </div>
    );
  }

  if (!user) {
    return <AuthModal />;
  }

  return (
    <div className="h-screen w-screen overflow-x-hidden">
      <div className="h-full flex flex-col md:flex-row overflow-hidden">
        {/* Video Background */}
        <div className="fixed inset-0 w-full h-full" style={{ zIndex: -1 }}>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Video failed to load:", e);
            }}
          >
            <source src="/static/dashboardvid.webm" type="video/webm" />
            <source src="/static/dashboardvid.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Overlay for better text readability */}
        <div className="fixed inset-0 bg-black/40" style={{ zIndex: 0 }}></div>

        {/* Desktop Sidebar - hidden on mobile */}
        <div
          className="hidden md:block relative shrink-0"
          style={{ zIndex: 10 }}
        >
          <SideNavbar />
        </div>

        {/* Mobile Header Bar */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-[60] px-4 py-3 bg-blur/40 backdrop-blur-lg">
          <button
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <IconMenu2 className="text-white h-5 w-5" />
          </button>
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden fixed inset-0 bg-black/70 z-[70]"
                onClick={() => setMobileMenuOpen(false)}
              />
              {/* Drawer */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="md:hidden fixed left-0 top-0 h-full w-[280px] bg-[#0f0f1a] z-[80] flex flex-col border-r border-white/10 shadow-2xl"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <img
                      src="/static/quizethic-favicon.svg"
                      className="h-6 w-6"
                      alt="Logo"
                    />
                    <span className="text-white font-semibold">
                      Quizethic AI
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <IconX className="text-white h-5 w-5" />
                  </button>
                </div>

                {/* Menu Links */}
                <nav className="flex-1 p-4 space-y-2">
                  {mobileMenuLinks.map((link) => (
                    <button
                      key={link.label}
                      onClick={() => {
                        navigate(link.path);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <link.icon className="h-5 w-5" />
                      <span>{link.label}</span>
                    </button>
                  ))}
                  <button
                    onClick={handleMobileLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <IconArrowLeft className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </nav>

                {/* User Info */}
                <div className="p-4 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    {user?.user_metadata?.avatar_url ||
                    user?.user_metadata?.picture ? (
                      <img
                        src={
                          user?.user_metadata?.avatar_url ||
                          user?.user_metadata?.picture
                        }
                        className="h-10 w-10 rounded-full border-2 border-white/20"
                        alt="Avatar"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center border-2 border-white/20">
                        <span className="text-white font-semibold">
                          {user?.user_metadata?.full_name?.charAt(0) ||
                            user?.user_metadata?.display_name?.charAt(0) ||
                            user?.user_metadata?.username?.charAt(0) ||
                            user?.email?.charAt(0).toUpperCase() ||
                            "U"}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {user?.user_metadata?.full_name ||
                          user?.user_metadata?.display_name ||
                          user?.user_metadata?.username ||
                          user?.user_metadata?.name ||
                          "User"}
                      </p>
                      <p className="text-white/60 text-sm truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main
          className="flex-1 relative overflow-y-auto px-4 sm:px-4 lg:px-8 py-6 pt-20 md:pt-6 sm:py-6 lg:py-8"
          style={{ zIndex: 1 }}
        >
          {/* Welcome Section */}
          <div className="mb-10 sm:mb-10 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-5 leading-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
                Practice Smarter,
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
                Not Harder
              </span>
            </h1>
            <p className="text-white/80 text-base sm:text-xl lg:text-2xl leading-relaxed font-light max-w-2xl mx-auto md:mx-0">
              Choose your topic and difficulty -{" "}
              <span className="text-white font-medium">
                we'll handle the rest.
              </span>
            </p>

            {/* Usage Status Indicator */}
            {usageStatus && (
              <div className="mt-4 flex flex-wrap items-center gap-3 justify-center md:justify-start">
                {/* Tier Badge */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                    usageStatus.tier === "pro"
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                      : usageStatus.tier === "enterprise"
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                      : "bg-white/20 text-white/80 border border-white/30"
                  }`}
                >
                  {usageStatus.tier === "free"
                    ? "Free Plan"
                    : `${usageStatus.tier} Plan`}
                </span>

                {/* Upgrade CTA for Free Users */}
                {usageStatus.tier === "free" && (
                  <span
                    onClick={() => navigate("/pricing")}
                    className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-white/20 text-white/80 border border-white/30 hover:bg-white/30 hover:text-white cursor-pointer transition-colors"
                  >
                    Go Pro
                  </span>
                )}

                {/* Usage Counter (only for free tier) */}
                {!usageStatus.isUnlimited && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/20">
                      <span className="text-white/70 text-xs">Today:</span>
                      <span
                        className={`text-sm font-semibold ${
                          usageStatus.remaining <= 1
                            ? "text-red-400"
                            : usageStatus.remaining <= 2
                            ? "text-yellow-400"
                            : "text-green-400"
                        }`}
                      >
                        {usageStatus.quizzesToday}/{usageStatus.dailyLimit}
                      </span>
                      <span className="text-white/50 text-xs">quizzes</span>
                    </div>

                    {usageStatus.remaining <= 2 &&
                      usageStatus.remaining > 0 && (
                        <span className="text-yellow-400 text-xs">
                          {usageStatus.remaining} left
                        </span>
                      )}

                    {usageStatus.remaining === 0 && (
                      <button
                        onClick={() => navigate("/pricing")}
                        className="text-xs px-2 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:opacity-90 transition-opacity"
                      >
                        Upgrade
                      </button>
                    )}
                  </div>
                )}

                {/* Unlimited badge for Pro/Enterprise */}
                {usageStatus.isUnlimited && (
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Unlimited quizzes
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Search Bar with Difficulty Selector */}
          <div className="flex justify-center mb-8 sm:mb-6">
            <div className="w-full max-w-4xl flex flex-col gap-4 sm:flex-row sm:gap-4">
              {/* Search Bar */}
              <div className="flex-1 bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:px-4 sm:py-2 border border-white/30 shadow-lg">
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Input Field */}
                  <input
                    id="quiz-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        searchQuery.trim() &&
                        selectedDifficulty
                      ) {
                        handleGenerateQuiz();
                      }
                    }}
                    placeholder="Search a quiz topic..."
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/60 text-sm sm:text-base py-2"
                  />

                  {/* Search Button */}
                  <InteractiveHoverButton
                    onClick={handleGenerateQuiz}
                    disabled={
                      !searchQuery.trim() || !selectedDifficulty || isGenerating
                    }
                  >
                    {isGenerating ? <>...</> : <>Go</>}
                  </InteractiveHoverButton>
                </div>
              </div>

              {/* Selectors Row - side by side on mobile */}
              <div className="flex flex-row gap-3 sm:contents">
                {/* Difficulty Selector */}
                <Select
                  value={selectedDifficulty || undefined}
                  onValueChange={(value) =>
                    setSelectedDifficulty(
                      value as "Easy" | "Medium" | "Hard" | "Mix"
                    )
                  }
                  disabled={usageStatus?.tier === "free"}
                >
                  <SelectTrigger className="flex-1 sm:flex-none sm:w-[180px]">
                    <SelectValue placeholder="Choose a level" />
                    {usageStatus?.tier === "free" && (
                      <span className="ml-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <svg
                          className="w-2 h-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        PRO
                      </span>
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                    <SelectItem value="Mix">Mix</SelectItem>
                  </SelectContent>
                </Select>

                {/* Number of Questions Selector */}
                <Select
                  value={numberOfQuestions.toString()}
                  onValueChange={(value) =>
                    setNumberOfQuestions(parseInt(value))
                  }
                  disabled={usageStatus?.tier === "free"}
                >
                  <SelectTrigger className="flex-1 sm:flex-none sm:w-[180px]">
                    <SelectValue placeholder="Questions" />
                    {usageStatus?.tier === "free" && (
                      <span className="ml-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <svg
                          className="w-2 h-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        PRO
                      </span>
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Questions</SelectItem>
                    <SelectItem value="10">10 Questions</SelectItem>
                    <SelectItem value="15">15 Questions</SelectItem>
                    <SelectItem value="20">20 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Popular Tags */}
          <div className="mb-8 sm:mb-8 mt-24 sm:mt-10">
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base sm:ml-0 ml-2">
              Popular Tags
            </h3>
            {/* Fixed height container to prevent layout shift - only on mobile */}
            <div className="h-[88px] sm:h-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={topicsKey}
                  className="flex flex-wrap gap-2 sm:gap-3 max-w-xs sm:max-w-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  {popularTopics.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTopicClick(tag)}
                      className="bg-white/15 cursor-pointer hover:bg-white/25 backdrop-blur-sm border border-white/20 rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-white text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-105"
                    >
                      {tag}
                    </button>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="sm:mt-14 flex justify-center pb-6 mt-24">
            <QuoteBox />
          </div>
        </main>
      </div>

      {showProgressBar && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-8 sm:p-12 border border-white/30 shadow-2xl flex flex-col items-center gap-6 w-[340px] sm:w-[400px]"
          >
            <AnimatedCircularProgressBar
              value={Math.round(progressValue)}
              gaugePrimaryColor="#8b5cf6"
              gaugeSecondaryColor="rgba(255, 255, 255, 0.1)"
              className="size-32 sm:size-40"
            />

            {/* Animated Loading Steps */}
            <div className="text-center space-y-4 w-full">
              <div className="h-10 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={loadingStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="flex items-center justify-center gap-3"
                  >
                    <span className="text-2xl">
                      {loadingSteps[loadingStep].icon}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-white whitespace-nowrap">
                      {loadingSteps[loadingStep].text}
                    </h3>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Step indicators */}
              <div className="flex justify-center gap-2 mt-4">
                {loadingSteps.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index <= loadingStep
                        ? "bg-purple-500 w-6"
                        : "bg-white/20 w-3"
                    }`}
                    initial={false}
                    animate={{
                      width: index <= loadingStep ? 24 : 12,
                      backgroundColor:
                        index <= loadingStep
                          ? "#8b5cf6"
                          : "rgba(255,255,255,0.2)",
                    }}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>

              <p className="text-white/50 text-xs sm:text-sm mt-2">
                This may take 20-60 seconds
              </p>
              <p className="text-white/60 text-[10px] sm:text-xs mt-3">
                * Quizzes with 20 questions, Hard difficulty, or very specific
                topics may take longer than 60 seconds to generate.
                <br />
                Thank you for your patience.
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Notification Modal */}
      <Modal {...modalProps} />
    </div>
  );
};

export default Dashboard;
