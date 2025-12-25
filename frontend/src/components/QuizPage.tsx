import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
        <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 sm:p-6 mb-6 border border-white/30 shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {quizData.topic.toUpperCase()} Quiz
          </h1>
          <p className="text-white/80 text-sm sm:text-base">
            Difficulty: {quizData.difficulty} | Total Questions:{" "}
            {quizData.totalQuestions}
          </p>
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
                    className={`p-4 rounded-lg border-2 ${
                      key === question.correctAnswer
                        ? "bg-green-500/20 border-green-400 text-white"
                        : "bg-white/10 border-white/20 text-white"
                    }`}
                  >
                    <span className="font-semibold mr-3">{key}.</span>
                    {value}
                  </div>
                ))}
              </div>

              {/* Explanation */}
              {question.explanation && (
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

        {/* Back Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg border border-white/30 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
