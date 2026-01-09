import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import {
  IconHome,
  IconDashboard,
  IconUserBolt,
  IconSettings,
  IconMenu2,
  IconX,
  IconCreditCard,
  IconInfoCircle,
  IconMail,
} from "@tabler/icons-react";

const About = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const features = [
    {
      icon: "/static/ai-icon.png",
      fallbackIcon: (
        <div className="w-12 h-12 grid grid-cols-2 gap-1">
          <div className="bg-blue-400 rounded-md flex items-center justify-center text-white text-xs font-bold">
            AI
          </div>
          <div className="bg-green-400 rounded-md"></div>
          <div className="bg-purple-400 rounded-md"></div>
          <div className="bg-pink-400 rounded-md"></div>
        </div>
      ),
      title: "Adaptive AI Learning",
      description:
        "Our platform continuously analyzes your performance, delivering custom quizzes that focus on your weak points for maximum improvement.",
    },
    {
      icon: "/static/trophy-icon.png",
      fallbackIcon: (
        <div className="w-12 h-12 flex items-center justify-center">
          <svg viewBox="0 0 48 48" className="w-10 h-10">
            <path
              d="M24 4L28 16H40L30 24L34 36L24 28L14 36L18 24L8 16H20L24 4Z"
              fill="#FBBF24"
            />
            <circle cx="24" cy="20" r="4" fill="#F59E0B" />
          </svg>
        </div>
      ),
      title: "Effective Exam Mastery",
      description:
        "Master any topic with structured learning paths and real-time feedback, designed to boost your confidence and scores.",
    },
    {
      icon: "/static/brain-icon.png",
      fallbackIcon: (
        <div className="w-12 h-12 flex items-center justify-center">
          <svg viewBox="0 0 48 48" className="w-10 h-10">
            <ellipse cx="24" cy="26" rx="14" ry="12" fill="#F9A8D4" />
            <ellipse cx="24" cy="22" rx="11" ry="9" fill="#EC4899" />
            <path
              d="M17 22C17 22 19 17 24 17C29 17 31 22 31 22"
              stroke="#FDF2F8"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
      ),
      title: "Personalized Growth",
      description:
        "Track your progress over time and unlock your full potential with insights tailored to your unique learning journey.",
    },
  ];

  return (
    <div className=" min-h-screen w-full relative overflow-hidden">
      {/* Top Section - Purple gradient background */}
      <div className="bg-gradient-to-br  from-[#C084FC] via-[#A855F7] to-[#9333EA] relative">
        {/* Glowing Brain Image - Top Right */}
        <div className=" absolute -top-10 -right-10 md:-right-5 w-[250px] h-[300px] md:w-[350px] md:h-[400px] lg:w-[450px] lg:h-[500px] pointer-events-none z-0">
          <img
            src="/static/glowingbrain.webp"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>

        {/* Desktop Header */}
        <header className=" hidden md:flex items-center px-8 lg:px-16 pt-4 pb-2 relative z-10">
          <div className="flex-1">
            <button
              onClick={() => navigate("/")}
              className="cursor-pointer flex items-center gap-2"
            >
              <img
                src="/static/quizethic-favicon.svg"
                alt="Quizethic AI Logo"
                className="w-10 h-10 rounded-xl"
              />
              <span className="font-bold text-lg text-white drop-shadow">
                Quizethic AI
              </span>
            </button>
          </div>
          <div className="mb-10 flex-1 flex justify-center">
            <Navbar />
          </div>
          <div className="flex-1"></div>
        </header>

        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-5 pt-4 pb-2 relative z-10">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition-colors"
          >
            <IconMenu2 className="text-white h-5 w-5" />
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <img
              src="/static/quizethic-favicon.svg"
              alt="Quizethic AI Logo"
              className="w-8 h-8 rounded-xl"
            />
            <span className="font-bold text-base text-white drop-shadow">
              Quizethic AI
            </span>
          </button>
          <div className="w-10" /> {/* Spacer for centering */}
        </header>

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
                    <span className="text-white font-semibold">Quizethic AI</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <IconX className="text-white h-5 w-5" />
                  </button>
                </div>

                {/* Menu Links */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Hero Content on Purple */}
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-1 pb-1 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
            About Quizethic AI
          </h1>
          <p className="text-white/90 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Your AI-powered companion for smarter exam preparation. We're
            revolutionizing how students prepare for competitive exams
            worldwide.
          </p>
        </div>

        {/* Our Mission Card - overlapping the divider */}
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-0">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-xl border border-white/50 translate-y-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-md">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h2 className="text-gray-800 font-bold text-lg sm:text-xl">
                  Our Mission
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                We believe everyone deserves access to high-quality exam
                preparation. Quizethic AI uses advanced artificial intelligence
                to create personalized quizzes that adapt to your learning style
                and help you master any topic efficiently. Our goal is to make
                exam preparation accessible, affordable, and effective for
                students everywhere.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Divider Line - Full width */}
      <div className="w-full h-[2px] bg-gradient-to-r from-purple-300 via-purple-400 to-purple-300"></div>

      {/* Bottom Section - White with purple shade background */}
      <div className="bg-gradient-to-b from-[#F3E8FF] via-[#EDE9FE] to-[#E9D5FF] px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* What Makes Us Different */}
          <h2 className="text-gray-800 font-bold text-xl sm:text-2xl mb-6">
            What Makes Us Different
          </h2>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-md border border-white/60 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="mb-3">{feature.fallbackIcon}</div>
                <h3 className="text-gray-800 font-semibold text-base mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <button
              onClick={() => navigate("/")}
              className="text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
