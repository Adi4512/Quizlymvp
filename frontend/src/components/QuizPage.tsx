import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { supabase } from "../lib/supabase";
import { API_URL } from "../lib/api";

interface Question {
  questionNumber: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  explanation?: string;
}

interface QuizData {
  topic: string;
  difficulty: string;
  totalQuestions: number;
  questions: Question[];
}

const QuizPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const response = location.state?.response || "";

  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [elapsedTime, setElapsedTime] = useState(0);
  const [finalTime, setFinalTime] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Track when each question was answered (for per-question timing)
  const [answerTimestamps, setAnswerTimestamps] = useState<
    Record<number, number>
  >({});
  const [resultSaved, setResultSaved] = useState(false);

  const handleOptionClick = (questionNumber: number, option: string) => {
    // Only allow selection if not already answered
    if (selectedAnswers[questionNumber]) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionNumber]: option }));
    // Record the timestamp when this question was answered
    setAnswerTimestamps((prev) => ({ ...prev, [questionNumber]: elapsedTime }));
  };

  const getOptionStyle = (
    questionNumber: number,
    optionKey: string,
    correctAnswer: string
  ) => {
    const selected = selectedAnswers[questionNumber];

    // If no answer selected yet, show default hoverable style
    if (!selected) {
      return "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40 cursor-pointer transition-all";
    }

    // After selection, show results
    if (optionKey === correctAnswer) {
      return "bg-green-500/30 border-green-400 text-white"; // Correct answer always green
    }
    if (optionKey === selected && selected !== correctAnswer) {
      return "bg-red-500/30 border-red-400 text-white"; // Wrong selection shows red
    }
    return "bg-white/5 border-white/10 text-white/60"; // Other options fade out
  };

  // Calculate score
  const totalQuestions = quizData?.questions.length || 0;
  const answeredQuestions = Object.keys(selectedAnswers).length;
  const correctAnswers =
    quizData?.questions.filter(
      (q) => selectedAnswers[q.questionNumber] === q.correctAnswer
    ).length || 0;
  const allAnswered =
    answeredQuestions === totalQuestions && totalQuestions > 0;
  const scorePercentage =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

  const getScoreMessage = () => {
    if (scorePercentage === 100)
      return { emoji: "🏆", message: "Perfect Score! Outstanding!" };
    if (scorePercentage >= 80)
      return { emoji: "🌟", message: "Excellent Work!" };
    if (scorePercentage >= 60) return { emoji: "👍", message: "Good Job!" };
    if (scorePercentage >= 40)
      return { emoji: "💪", message: "Keep Practicing!" };
    return { emoji: "📚", message: "More Practice Needed!" };
  };

  useEffect(() => {
    if (!response) {
      navigate("/dashboard");
      return;
    }

    try {
      // Extract JSON from response (might be wrapped in markdown code blocks)
      let jsonString = response.trim();

      // Remove markdown code blocks if present
      if (jsonString.includes("```json")) {
        jsonString = jsonString.split("```json")[1].split("```")[0].trim();
      } else if (jsonString.includes("```")) {
        jsonString = jsonString.split("```")[1].split("```")[0].trim();
      }

      // Parse JSON
      const parsed = JSON.parse(jsonString);
      setQuizData(parsed);
    } catch (error) {
      console.error("Error parsing quiz data:", error);
      console.log("Raw response:", response);
    }
  }, [response, navigate]);

  // Timer effect - starts when quiz loads, stops when all answered
  useEffect(() => {
    if (quizData && !allAnswered && finalTime === null) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quizData, allAnswered, finalTime]);

  // Stop timer and save final time when all questions answered
  useEffect(() => {
    if (allAnswered && finalTime === null) {
      setFinalTime(elapsedTime);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [allAnswered, elapsedTime, finalTime]);

  // Save quiz result to database when completed
  useEffect(() => {
    const saveQuizResult = async () => {
      if (!allAnswered || resultSaved || !quizData) return;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) return;

        await axios.post(`${API_URL}/api/quiz/result`, {
          userId: session.user.id,
          topic: quizData.topic,
          difficulty: quizData.difficulty,
          totalQuestions: totalQuestions,
          correctAnswers: correctAnswers,
          timeTakenSeconds: finalTime || elapsedTime,
        });

        setResultSaved(true);
        console.log("✅ Quiz result saved");
      } catch (error) {
        console.error("Failed to save quiz result:", error);
        // Don't block user experience if save fails
      }
    };

    saveQuizResult();
  }, [
    allAnswered,
    resultSaved,
    quizData,
    totalQuestions,
    correctAnswers,
    finalTime,
    elapsedTime,
  ]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
      mins: mins.toString().padStart(2, "0"),
      secs: secs.toString().padStart(2, "0"),
    };
  };

  const displayTime = finalTime !== null ? finalTime : elapsedTime;
  const { mins, secs } = formatTime(displayTime);

  if (!quizData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading quiz...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 sm:p-6 mb-6 border border-white/30 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {quizData.topic.toUpperCase()}
            </h1>
            <p className="text-white/80 text-sm sm:text-base">
              Difficulty: {quizData.difficulty} | Total Questions:{" "}
              {quizData.totalQuestions}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className="flex items-center bg-white/10 px-4 py-2 rounded-lg border border-white/20">
              <span className="text-white/60 mr-2">⏱️</span>
              <span className="font-mono text-xl text-white tabular-nums">
                {mins}:{secs}
              </span>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="cursor-pointer px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg border border-white/30 transition-colors text-sm sm:text-base whitespace-nowrap"
            >
              ← Generate New Quiz
            </button>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {quizData.questions.map((question) => (
            <div
              key={question.questionNumber}
              className="bg-white/20 backdrop-blur-md rounded-xl p-6 sm:p-8 border border-white/30 shadow-lg"
            >
              {/* Question */}
              <div className="mb-4">
                <span className="text-white/60 text-sm mr-2">
                  Q{question.questionNumber}.
                </span>
                <span className="text-xl sm:text-2xl font-semibold text-white">
                  {question.question}
                </span>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-4">
                {Object.entries(question.options).map(([key, value]) => (
                  <div
                    key={key}
                    onClick={() =>
                      handleOptionClick(question.questionNumber, key)
                    }
                    className={`p-4 rounded-lg border-2 ${getOptionStyle(
                      question.questionNumber,
                      key,
                      question.correctAnswer
                    )}`}
                  >
                    <span className="font-semibold mr-3">{key}.</span>
                    {value}
                    {/* Show check/cross icons after selection */}
                    {selectedAnswers[question.questionNumber] &&
                      key === question.correctAnswer && (
                        <span className="float-right text-green-400">✓</span>
                      )}
                    {selectedAnswers[question.questionNumber] === key &&
                      key !== question.correctAnswer && (
                        <span className="float-right text-red-400">✗</span>
                      )}
                  </div>
                ))}
              </div>

              {/* Result feedback */}
              {selectedAnswers[question.questionNumber] && (
                <div
                  className={`p-3 rounded-lg mb-3 ${
                    selectedAnswers[question.questionNumber] ===
                    question.correctAnswer
                      ? "bg-green-500/20 border border-green-400/30"
                      : "bg-red-500/20 border border-red-400/30"
                  }`}
                >
                  <p
                    className={`font-semibold ${
                      selectedAnswers[question.questionNumber] ===
                      question.correctAnswer
                        ? "text-green-300"
                        : "text-red-300"
                    }`}
                  >
                    {selectedAnswers[question.questionNumber] ===
                    question.correctAnswer
                      ? "🎉 Correct!"
                      : `❌ Incorrect! The correct answer is ${question.correctAnswer}.`}
                  </p>
                </div>
              )}

              {/* Explanation - only show after selection */}
              {selectedAnswers[question.questionNumber] &&
                question.explanation && (
                  <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 mt-4">
                    <p className="text-blue-200 text-sm sm:text-base">
                      <span className="font-semibold">Explanation: </span>
                      {question.explanation}
                    </p>
                  </div>
                )}
            </div>
          ))}
        </div>

        {/* Score Card - Show when all questions are answered */}
        {allAnswered && (
          <div className="bg-gradient-to-r from-indigo-500/30 to-purple-500/30 backdrop-blur-md rounded-xl p-6 sm:p-8 mt-8 border border-white/30 shadow-lg">
            <div className="text-center">
              <div className="text-6xl mb-4">{getScoreMessage().emoji}</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Quiz Completed!
              </h2>
              <p className="text-xl text-white/80 mb-4">
                {getScoreMessage().message}
              </p>

              {/* Score Display */}
              <div className="flex justify-center items-center gap-6 sm:gap-8 my-6 flex-wrap">
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-white">
                    {correctAnswers}/{totalQuestions}
                  </div>
                  <p className="text-white/60 text-sm mt-1">Correct Answers</p>
                </div>
                <div className="h-16 w-px bg-white/30 hidden sm:block"></div>
                <div className="text-center">
                  <div
                    className={`text-4xl sm:text-5xl font-bold ${
                      scorePercentage >= 60
                        ? "text-green-400"
                        : scorePercentage >= 40
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {scorePercentage}%
                  </div>
                  <p className="text-white/60 text-sm mt-1">Score</p>
                </div>
                <div className="h-16 w-px bg-white/30 hidden sm:block"></div>
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-cyan-400 font-mono tabular-nums">
                    {formatTime(finalTime || 0).mins}:
                    {formatTime(finalTime || 0).secs}
                  </div>
                  <p className="text-white/60 text-sm mt-1">Time Taken</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md mx-auto bg-white/10 rounded-full h-4 mb-6">
                <div
                  className={`h-4 rounded-full transition-all duration-500 ${
                    scorePercentage >= 60
                      ? "bg-green-500"
                      : scorePercentage >= 40
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${scorePercentage}%` }}
                ></div>
              </div>

              <button
                onClick={() => navigate("/dashboard")}
                className="cursor-pointer px-8 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg border border-white/30 transition-colors"
              >
                Generate New Quiz
              </button>
              <button
                onClick={() => {
                  // Build metrics data from quiz results
                  const metricsData = {
                    questions: quizData.questions.map((q, idx) => {
                      // Calculate time taken for this question
                      const prevTimestamp =
                        idx === 0 ? 0 : answerTimestamps[idx] || 0;
                      const currentTimestamp =
                        answerTimestamps[q.questionNumber] || finalTime || 0;
                      const timeTaken =
                        idx === 0
                          ? currentTimestamp
                          : currentTimestamp - prevTimestamp;

                      return {
                        question: q.question,
                        correctAnswer: q.correctAnswer,
                        userAnswer: selectedAnswers[q.questionNumber] || null,
                        timeTaken: Math.max(0, timeTaken),
                        difficulty: quizData.difficulty as
                          | "Easy"
                          | "Medium"
                          | "Hard"
                          | undefined,
                      };
                    }),
                    totalTime: finalTime || elapsedTime,
                  };
                  navigate("/metrics", { state: metricsData });
                }}
                className="cursor-pointer sm:ml-4 ml-2 sm:mt-0 mt-4 px-5 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg border border-white/30 transition-colors"
              >
                View Metrics
              </button>
            </div>
          </div>
        )}

        {/* Back Button - Show only if quiz not completed */}
        {!allAnswered && (
          <div className="flex justify-center mt-8">
            <p className="text-white/60 text-sm">
              {answeredQuestions} of {totalQuestions} questions answered
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
