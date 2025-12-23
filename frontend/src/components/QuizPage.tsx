import { useLocation } from "react-router-dom";

const QuizPage = () => {
  const location = useLocation();
  const response = location.state?.response || "No response received";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 sm:p-8 max-w-4xl w-full border border-white/30 shadow-lg">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          Response
        </h2>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-white/20">
          <p className="text-white text-sm sm:text-base whitespace-pre-wrap">
            {response}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
