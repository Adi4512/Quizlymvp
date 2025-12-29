import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { getRandomTopics } from "../lib/topics";
import AuthModal from "./AuthModal";
import LottieLoader from "./LottieLoader";
import { SideNavbar } from "./SideNavbar";
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
} from "@tabler/icons-react";

import QuoteBox from "./QuoteBox";

interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
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
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "Easy" | "Medium" | "Hard" | "Mix" | null
  >("Medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [popularTopics, setPopularTopics] = useState<string[]>(
    getRandomTopics(5)
  );
  const [topicsKey, setTopicsKey] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile menu links
  const mobileMenuLinks = [
    { label: "Home", icon: IconHome, path: "/" },
    { label: "Dashboard", icon: IconDashboard, path: "/dashboard" },
    { label: "Profile", icon: IconUserBolt, path: "/profile" },
    { label: "Settings", icon: IconSettings, path: "/settings" },
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
      setShowPopup(true);
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
      alert("Please enter something");
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
        const randomIncrement = Math.floor(Math.random() * 3) + 3; // Random between 5-10
        return Math.min(prev + randomIncrement, 99);
      });
    }, 1000); // Update every second

    try {
      // Call backend API
      const response = await axios.post(
        "https://quizlymvp.onrender.com/api/generate",
        {
          prompt: searchQuery.trim(),
          difficulty: selectedDifficulty || "Mix",
          numberOfQuestions: numberOfQuestions || 10,
        }
      );

      const data = response.data;

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
    } catch (error) {
      console.error("Error generating quiz:", error);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setShowProgressBar(false);
      setProgressValue(0);
      alert("Failed to generate quiz. Please try again.");
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
                            user?.email?.charAt(0).toUpperCase() ||
                            "U"}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {user?.user_metadata?.full_name ||
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
                >
                  <SelectTrigger className="flex-1 sm:flex-none sm:w-[180px]">
                    <SelectValue placeholder="Choose a level" />
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
                  value={numberOfQuestions.toString() || "5"}
                  onValueChange={(value) =>
                    setNumberOfQuestions(parseInt(value))
                  }
                >
                  <SelectTrigger className="flex-1 sm:flex-none sm:w-[180px]">
                    <SelectValue placeholder="Questions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
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
    </div>
  );
};

export default Dashboard;
