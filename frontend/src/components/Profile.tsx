/**
 * Profile Component
 * =================
 * Displays user stats, quiz history, and streak information.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { motion } from "framer-motion";
import axios from "axios";
import { supabase, getTierFromUser, UserTier } from "../lib/supabase";
import { API_URL } from "../lib/api";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    display_name?: string;
    username?: string;
    avatar_url?: string;
    picture?: string;
  };
}

interface UserStats {
  total_quizzes: number;
  total_questions_answered: number;
  total_correct_answers: number;
  average_score: number;
  best_score: number;
  worst_score: number;
  current_streak: number;
  longest_streak: number;
  last_quiz_date: string | null;
  favorite_topic: string | null;
  favorite_difficulty: string | null;
  total_time_spent_seconds: number;
}

interface RecentQuiz {
  id: string;
  topic: string;
  difficulty: string;
  score_percentage: number;
  total_questions: number;
  correct_answers: number;
  completed_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const formatTime = (seconds: number): string => {
  if (!seconds || seconds === 0) return "0m";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
};

const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case "Easy":
      return "bg-green-500/20 text-green-400";
    case "Medium":
      return "bg-yellow-500/20 text-yellow-400";
    case "Hard":
      return "bg-red-500/20 text-red-400";
    default:
      return "bg-purple-500/20 text-purple-400";
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userTier, setUserTier] = useState<UserTier>("free");
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentQuizzes, setRecentQuizzes] = useState<RecentQuiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Get user session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          navigate("/");
          return;
        }

        setUser(session.user as User);
        setUserTier(getTierFromUser(session.user));

        // Fetch profile data from backend
        const response = await axios.get(
          `${API_URL}/api/user/profile/${session.user.id}`
        );

        if (response.data.success) {
          setStats(response.data.stats);
          setRecentQuizzes(response.data.recentQuizzes || []);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.display_name ||
    user?.user_metadata?.username ||
    user?.email?.split("@")[0] ||
    "User";

  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <AppLayout user={user}>
      {/* Video Background */}
      <div className="fixed inset-0 w-full h-full" style={{ zIndex: -1 }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/static/dashboardvid.webm" type="video/webm" />
          <source src="/static/dashboardvid.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" style={{ zIndex: 0 }}></div>

      {/* Main Content */}
      <main
        className="relative h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8"
        style={{ zIndex: 1 }}
      >
        <div className="max-w-6xl mx-auto space-y-3">
          {/* Profile Header */}
          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Avatar */}
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-20 h-20 rounded-full border-4 border-purple-500/50"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold text-white">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-bold text-white">{userName}</h1>
                <p className="text-white/60">{user?.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  {/* Tier Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                      userTier === "pro"
                        ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                        : userTier === "enterprise"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                        : "bg-white/20 text-white/80"
                    }`}
                  >
                    {userTier} Plan
                  </span>

                  {/* Streak Badge */}
                  {stats && stats.current_streak > 0 && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 flex items-center gap-1">
                      🔥 {stats.current_streak} day streak
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-white">
                    {stats?.total_quizzes || 0}
                  </div>
                  <div className="text-xs text-white/60">Quizzes</div>
                </div>
                <div>
                  <div
                    className={`text-3xl font-bold ${getScoreColor(
                      stats?.average_score || 0
                    )}`}
                  >
                    {stats?.average_score?.toFixed(0) || 0}%
                  </div>
                  <div className="text-xs text-white/60">Avg Score</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-400">
                    {stats?.longest_streak || 0}
                  </div>
                  <div className="text-xs text-white/60">Best Streak</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Questions */}
            <motion.div
              className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {stats?.total_questions_answered || 0}
                  </div>
                  <div className="text-xs text-white/60">
                    Questions Answered
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Correct Answers */}
            <motion.div
              className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {stats?.total_correct_answers || 0}
                  </div>
                  <div className="text-xs text-white/60">Correct Answers</div>
                </div>
              </div>
            </motion.div>

            {/* Best Score */}
            <motion.div
              className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <svg
                    className="w-6 h-6 text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </div>
                <div>
                  <div
                    className={`text-2xl font-bold ${getScoreColor(
                      stats?.best_score || 0
                    )}`}
                  >
                    {stats?.best_score?.toFixed(0) || 0}%
                  </div>
                  <div className="text-xs text-white/60">Best Score</div>
                </div>
              </div>
            </motion.div>

            {/* Time Spent */}
            <motion.div
              className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <svg
                    className="w-6 h-6 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {formatTime(stats?.total_time_spent_seconds || 0)}
                  </div>
                  <div className="text-xs text-white/60">Time Learning</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Activity & Favorites */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Quizzes */}
            <motion.div
              className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Recent Activity
              </h2>

              {recentQuizzes.length > 0 ? (
                <div className="space-y-3">
                  {recentQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">
                          {quiz.topic}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${getDifficultyColor(
                              quiz.difficulty
                            )}`}
                          >
                            {quiz.difficulty}
                          </span>
                          <span className="text-white/50 text-xs">
                            {formatDate(quiz.completed_at)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-bold ${getScoreColor(
                            quiz.score_percentage
                          )}`}
                        >
                          {quiz.score_percentage.toFixed(0)}%
                        </div>
                        <div className="text-xs text-white/50">
                          {quiz.correct_answers}/{quiz.total_questions}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📚</div>
                  <p className="text-white/60">No quizzes yet</p>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Take your first quiz
                  </button>
                </div>
              )}
            </motion.div>

            {/* Favorites & Insights */}
            <motion.div
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Insights
              </h2>

              <div className="space-y-4">
                {/* Favorite Topic */}
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-xs text-white/50 mb-1">
                    Favorite Topic
                  </div>
                  <div className="text-white font-medium">
                    {stats?.favorite_topic || "Not enough data"}
                  </div>
                </div>

                {/* Preferred Difficulty */}
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-xs text-white/50 mb-1">
                    Preferred Difficulty
                  </div>
                  <div className="text-white font-medium">
                    {stats?.favorite_difficulty || "Not enough data"}
                  </div>
                </div>

                {/* Accuracy */}
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-xs text-white/50 mb-1">
                    Overall Accuracy
                  </div>
                  <div
                    className={`text-lg font-bold ${getScoreColor(
                      stats?.total_questions_answered
                        ? (stats.total_correct_answers /
                            stats.total_questions_answered) *
                            100
                        : 0
                    )}`}
                  >
                    {stats?.total_questions_answered
                      ? (
                          (stats.total_correct_answers /
                            stats.total_questions_answered) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </div>
                </div>

                {/* Last Active */}
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-xs text-white/50 mb-1">Last Quiz</div>
                  <div className="text-white font-medium">
                    {stats?.last_quiz_date
                      ? formatDate(stats.last_quiz_date)
                      : "Never"}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
};

export default Profile;
