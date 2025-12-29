"use client";

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ─────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────
interface QuestionMetric {
  question: string;
  correctAnswer: string;
  userAnswer: string | null;
  timeTaken: number; // seconds
  difficulty?: "Easy" | "Medium" | "Hard";
}

interface MetricsState {
  questions: QuestionMetric[];
  totalTime: number; // seconds
}

// ─────────────────────────────────────────────────────────────
// THEME COLORS (muted purple/indigo/cyan palette)
// ─────────────────────────────────────────────────────────────
const COLORS = {
  correct: "#22c55e", // green-500
  incorrect: "#ef4444", // red-500
  primary: "#8b5cf6", // violet-500
  secondary: "#6366f1", // indigo-500
  accent: "#06b6d4", // cyan-500
  muted: "#64748b", // slate-500
};

// Metric explanations for the info tooltip
const METRIC_INFO = [
  {
    metric: "Accuracy",
    description: "Percentage of questions you answered correctly",
  },
  {
    metric: "Speed",
    description: "How quickly you answered (faster = higher score)",
  },
  {
    metric: "Consistency",
    description: "How steady your pace was (lower time variation = higher)",
  },
  {
    metric: "Error Rate",
    description:
      "Percentage of questions answered incorrectly (lower = better)",
  },
  {
    metric: "Completion",
    description: "Percentage of questions you attempted",
  },
];

export default function Metrics() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMetricInfo, setShowMetricInfo] = useState(false);

  // Extract state from navigation
  const state = location.state as MetricsState | null;

  // ─────────────────────────────────────────────────────────────
  // REDIRECT IF NO DATA
  // ─────────────────────────────────────────────────────────────
  if (!state || !state.questions || state.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4">
        <div className="text-white text-xl mb-4">No quiz data available</div>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg border border-white/30 transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const { questions, totalTime } = state;

  // ─────────────────────────────────────────────────────────────
  // COMPUTE METRICS
  // ─────────────────────────────────────────────────────────────
  const totalQuestions = questions.length;
  const correctCount = questions.filter(
    (q) => q.userAnswer === q.correctAnswer
  ).length;
  const accuracyPercentage = Math.round((correctCount / totalQuestions) * 100);
  const averageTimePerQuestion = Math.round(totalTime / totalQuestions);

  // ─────────────────────────────────────────────────────────────
  // CHART DATA PREPARATION
  // ─────────────────────────────────────────────────────────────

  // Line chart: Time per question
  const speedLineData = questions.map((q, idx) => ({
    question: `Q${idx + 1}`,
    time: q.timeTaken,
  }));

  // Radar chart: Overall performance metrics

  // Speed score: normalized (assuming 30s per question is average, faster = better)
  const avgTimeNormalized = Math.max(
    0,
    Math.min(100, 100 - (averageTimePerQuestion / 30) * 50)
  );

  // Consistency: based on standard deviation of response times
  // Lower std deviation = more consistent pacing = higher score
  const timings = questions.map((q) => q.timeTaken);
  const avgTime = timings.reduce((a, b) => a + b, 0) / timings.length;
  const stdDev = Math.sqrt(
    timings.reduce((sum, t) => sum + Math.pow(t - avgTime, 2), 0) /
      timings.length
  );
  // Normalize: if stdDev is 0-2s = excellent (90-100), 2-5s = good (70-90), 5-10s = fair (50-70), >10s = poor
  const consistencyScore = Math.max(0, Math.min(100, 100 - stdDev * 5));

  // Error Rate: percentage of incorrect answers (inverted for radar - lower error = higher score)
  const incorrectCount = totalQuestions - correctCount;
  const errorRate = Math.round((incorrectCount / totalQuestions) * 100);
  // Invert for radar display (100 - errorRate so lower errors = higher score)
  const errorScoreInverted = 100 - errorRate;

  // Completion: percentage of questions attempted
  const attemptedCount = questions.filter((q) => q.userAnswer !== null).length;
  const completionRate = Math.round((attemptedCount / totalQuestions) * 100);

  const radarData = [
    { metric: "Accuracy", value: accuracyPercentage, fullMark: 100 },
    { metric: "Speed", value: Math.round(avgTimeNormalized), fullMark: 100 },
    {
      metric: "Consistency",
      value: Math.round(consistencyScore),
      fullMark: 100,
    },
    { metric: "Error Rate", value: errorScoreInverted, fullMark: 100 },
    { metric: "Completion", value: completionRate, fullMark: 100 },
  ];

  // ─────────────────────────────────────────────────────────────
  // FORMAT TIME HELPER
  // ─────────────────────────────────────────────────────────────
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ════════════════════════════════════════════════════════════
            HEADER
        ════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Quiz Performance
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Detailed analysis of your quiz attempt
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg border border-white/30 transition-colors text-sm whitespace-nowrap"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════
            1️⃣ SCORE SUMMARY CARD
        ════════════════════════════════════════════════════════════ */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Score Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Accuracy */}
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div
                  className={`text-3xl font-bold ${
                    accuracyPercentage >= 70
                      ? "text-green-400"
                      : accuracyPercentage >= 40
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {accuracyPercentage}%
                </div>
                <p className="text-white/60 text-xs mt-4">Accuracy</p>
              </div>

              {/* Correct / Total */}
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-white">
                  {correctCount}
                  <span className="text-white/40 text-lg">
                    /{totalQuestions}
                  </span>
                </div>
                <p className="text-white/60 text-xs mt-1">Correct</p>
              </div>

              {/* Avg Time */}
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-cyan-400">
                  {averageTimePerQuestion}
                  <span className="text-lg">s</span>
                </div>
                <p className="text-white/60 text-xs mt-1">Avg Time/Q</p>
              </div>

              {/* Total Time */}
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-violet-400">
                  {formatTime(totalTime)}
                </div>
                <p className="text-white/60 text-xs mt-1">Total Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ════════════════════════════════════════════════════════════
            2️⃣ PERFORMANCE RADAR CHART
        ════════════════════════════════════════════════════════════ */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
          <CardHeader className="pb-0">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-white text-lg">
                  Performance Overview
                </CardTitle>
                <p className="text-white/50 text-xs">
                  Multi-dimensional analysis of your quiz attempt
                </p>
              </div>
              {/* Info icon with tooltip */}
              <div className="relative">
                <button
                  onClick={() => setShowMetricInfo(!showMetricInfo)}
                  onMouseEnter={() => setShowMetricInfo(true)}
                  onMouseLeave={() => setShowMetricInfo(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors"
                  aria-label="What do these metrics mean?"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
                {/* Tooltip/Popover */}
                {showMetricInfo && (
                  <div className="absolute right-0 top-10 z-50 w-64 bg-slate-900/95 backdrop-blur-md border border-white/20 rounded-lg shadow-xl p-3 animate-in fade-in duration-200">
                    <p className="text-white text-xs font-semibold mb-2">
                      What do these metrics mean?
                    </p>
                    <div className="space-y-2">
                      {METRIC_INFO.map((info) => (
                        <div key={info.metric} className="text-xs">
                          <span className="text-violet-400 font-medium">
                            {info.metric}:
                          </span>{" "}
                          <span className="text-white/70">
                            {info.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 px-2 sm:px-6">
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                  data={radarData}
                  margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
                >
                  <PolarGrid
                    stroke="rgba(255,255,255,0.15)"
                    gridType="polygon"
                  />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                    stroke="rgba(255,255,255,0.2)"
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 8 }}
                    stroke="rgba(255,255,255,0.1)"
                    tickCount={5}
                  />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke={COLORS.primary}
                    fill={COLORS.primary}
                    fillOpacity={0.4}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(30,30,60,0.95)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value: number) => [`${value}%`, "Score"]}
                  />
                </RadarChart>
              </ResponsiveContainer>

              {/* Performance Badge */}
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    accuracyPercentage >= 70
                      ? "bg-green-500/20 text-green-300 border border-green-500/30"
                      : accuracyPercentage >= 40
                      ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                      : "bg-red-500/20 text-red-300 border border-red-500/30"
                  }`}
                >
                  {accuracyPercentage >= 70
                    ? "🏆 Excellent"
                    : accuracyPercentage >= 40
                    ? "👍 Good Effort"
                    : "📚 Needs Practice"}
                </span>
              </div>

              {/* Metric breakdown */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-4 w-full text-center">
                {radarData.map((item) => (
                  <div
                    key={item.metric}
                    className="bg-white/5 rounded-lg p-2 sm:p-3"
                  >
                    <div className="text-base sm:text-lg font-bold text-white">
                      {item.value}%
                    </div>
                    <p className="text-white/50 text-[10px] sm:text-xs leading-tight">
                      {item.metric}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ════════════════════════════════════════════════════════════
            3️⃣ SPEED ANALYTICS
        ════════════════════════════════════════════════════════════ */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Speed Analysis</CardTitle>
            <p className="text-white/50 text-xs">
              Time taken per question (seconds)
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={speedLineData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="question"
                  stroke="rgba(255,255,255,0.4)"
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(30,30,60,0.95)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number) => [`${value}s`, "Time"]}
                />
                <Line
                  type="monotone"
                  dataKey="time"
                  stroke={COLORS.accent}
                  strokeWidth={2}
                  dot={{ fill: COLORS.accent, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: COLORS.primary }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ════════════════════════════════════════════════════════════
            FOOTER ACTIONS
        ════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg border border-white/30 transition-colors"
          >
            Generate New Quiz
          </button>
          <button
            onClick={() => navigate("/quiz")}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
