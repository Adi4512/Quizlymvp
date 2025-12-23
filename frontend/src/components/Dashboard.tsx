import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { supabase } from "../lib/supabase";
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "Easy" | "Medium" | "Hard" | "Mix" | null
  >(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
        const randomIncrement = Math.floor(Math.random() * 6) + 5; // Random between 5-10
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
    <>
      <div className="min-h-screen flex">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
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
        <div
          className="absolute inset-0 bg-black/40"
          style={{ zIndex: 0 }}
        ></div>

        {/* Sidebar */}
        <div className="relative" style={{ zIndex: 1 }}>
          <SideNavbar />
        </div>

        {/* Main Content */}
        <main
          className="flex-1 relative overflow-y-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8"
          style={{ zIndex: 1 }}
        >
          {/* Welcome Section */}
          <div className="mb-8 sm:mb-10 ">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-5 leading-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
                Practice Smarter,
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
                Not Harder
              </span>
            </h1>
            <p className="text-white/80 text-lg sm:text-xl lg:text-2xl leading-relaxed font-light max-w-2xl ">
              Choose your topic and difficulty -{" "}
              <span className="text-white font-medium">
                we'll handle the rest.
              </span>
            </p>
          </div>

          {/* Search Bar with Difficulty Selector */}
          <div className="flex justify-center mb-6">
            <div className="w-full max-w-4xl flex flex-col sm:flex-row gap-3 sm:gap-4">
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

              {/* Difficulty Selector */}
              <Select
                value={selectedDifficulty || undefined}
                onValueChange={(value) =>
                  setSelectedDifficulty(
                    value as "Easy" | "Medium" | "Hard" | "Mix"
                  )
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Choose a level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                  <SelectItem value="Mix">Mix</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Popular Tags */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
              Popular Tags
            </h3>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {["JavaScript", "Python", "React", "MERN", "AI & ML"].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTopicClick(tag)}
                    className="bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-white text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-105"
                  >
                    {tag}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Start Quiz Button */}
          <div className="mt-8 sm:mt-20 flex justify-center">
            {" "}
            <QuoteBox />
          </div>
        </main>
      </div>

      {/* Progress Bar Modal */}
      {showProgressBar && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 sm:p-12 border border-white/30 shadow-2xl flex flex-col items-center gap-6">
            <AnimatedCircularProgressBar
              value={Math.round(progressValue)}
              gaugePrimaryColor="#8b5cf6"
              gaugeSecondaryColor="rgba(255, 255, 255, 0.1)"
              className="size-32 sm:size-40"
            />
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Generating Quiz...
              </h3>
              <p className="text-white/70 text-sm sm:text-base">
                This may take 20-60 seconds
              </p>
            </div>
          </div>
        </div>
      )}

      {showPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPopup(false)}
          />

          {/* Popup */}
          <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-300 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-lg mx-2 sm:mx-4">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl mb-3 sm:mb-4">
                🚧
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 leading-tight">
                Dashboard Under Development
              </h3>
              <div className="space-y-2 sm:space-y-3 text-gray-700">
                <p className="text-xs sm:text-sm leading-relaxed">
                  The current dashboard is not a replica of the original design.
                  We are actively working on the backend infrastructure.
                </p>
                <div className="bg-blue-100 rounded-lg p-2 sm:p-3 border border-blue-200">
                  <p className="text-xs text-blue-800 font-medium">
                    <span className="font-bold">Current Status:</span> Backend
                    Development in Progress
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    UI: Testing Interface | Backend: Core Development |
                    Features: Coming Soon
                  </p>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed">
                  This UI is just for testing purposes. Thank you for your
                  patience as we build something amazing!
                </p>
                <div className="bg-green-100 rounded-lg p-2 sm:p-3 border border-green-200">
                  <p className="text-xs sm:text-sm text-green-800 font-medium">
                    🚀 <span className="font-bold">Join the Waitlist!</span>
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Get early access and exclusive updates before we launch
                  </p>
                </div>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowPopup(false)}
              className="cursor-pointer absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-500 hover:text-gray-700 transition-colors text-lg sm:text-xl font-bold bg-white/80 hover:bg-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
