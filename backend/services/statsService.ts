/**
 * Stats Service
 * =============
 * Handles user statistics, quiz results, and streak tracking.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface QuizResult {
  id?: string;
  user_id: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Mix";
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  time_taken_seconds?: number;
  completed_at?: string;
}

export interface UserStats {
  user_id: string;
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

export interface RecentQuiz {
  id: string;
  topic: string;
  difficulty: string;
  score_percentage: number;
  total_questions: number;
  correct_answers: number;
  completed_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// SUPABASE CLIENT
// ═══════════════════════════════════════════════════════════════════════════

let supabaseAdmin: SupabaseClient | null = null;

const getSupabaseAdmin = (): SupabaseClient => {
  if (!supabaseAdmin) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        "Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env"
      );
    }

    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdmin;
};

// ═══════════════════════════════════════════════════════════════════════════
// QUIZ RESULTS FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Save a quiz result
 * The database trigger will automatically update user_stats
 */
export const saveQuizResult = async (
  result: Omit<QuizResult, "id" | "completed_at">
): Promise<QuizResult> => {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("quiz_results")
    .insert({
      user_id: result.user_id,
      topic: result.topic,
      difficulty: result.difficulty,
      total_questions: result.total_questions,
      correct_answers: result.correct_answers,
      score_percentage: result.score_percentage,
      time_taken_seconds: result.time_taken_seconds || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }

  return data as QuizResult;
};

/**
 * Get recent quiz results for a user
 */
export const getRecentQuizzes = async (
  userId: string,
  limit: number = 5
): Promise<RecentQuiz[]> => {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("quiz_results")
    .select(
      "id, topic, difficulty, score_percentage, total_questions, correct_answers, completed_at"
    )
    .eq("user_id", userId)
    .order("completed_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent quizzes:", error);
    return [];
  }

  return (data || []) as RecentQuiz[];
};

// ═══════════════════════════════════════════════════════════════════════════
// USER STATS FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get user stats
 * Returns default values if no stats exist
 */
export const getUserStats = async (userId: string): Promise<UserStats> => {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    // Return default stats
    return {
      user_id: userId,
      total_quizzes: 0,
      total_questions_answered: 0,
      total_correct_answers: 0,
      average_score: 0,
      best_score: 0,
      worst_score: 0,
      current_streak: 0,
      longest_streak: 0,
      last_quiz_date: null,
      favorite_topic: null,
      favorite_difficulty: null,
      total_time_spent_seconds: 0,
    };
  }

  return data as UserStats;
};

/**
 * Get complete profile data (stats + recent quizzes)
 */
export const getProfileData = async (userId: string) => {
  const [stats, recentQuizzes] = await Promise.all([
    getUserStats(userId),
    getRecentQuizzes(userId, 5),
  ]);

  return {
    stats,
    recentQuizzes,
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Format time in seconds to readable string
 */
export const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
};

/**
 * Calculate score percentage
 */
export const calculateScorePercentage = (
  correct: number,
  total: number
): number => {
  if (total === 0) return 0;
  return Math.round((correct / total) * 10000) / 100; // 2 decimal places
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  saveQuizResult,
  getRecentQuizzes,
  getUserStats,
  getProfileData,
  formatTime,
  calculateScorePercentage,
};
