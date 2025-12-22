import { useState, useEffect } from "react";

const QuoteBox = () => {
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");

  const fetchQuote = async () => {
    try {
      // Using quotable.io API which supports CORS
      const response = await fetch("https://api.quotable.io/random");
      const data = await response.json();
      console.log("Quote data:", data);

      if (data && data.content) {
        setQuote(data.content); // Quote text
        setAuthor(data.author); // Author
      } else {
        console.error("Unexpected API response structure:", data);
        // Fallback quote
        setQuote("The only way to do great work is to love what you do.");
        setAuthor("Steve Jobs");
      }
    } catch (error) {
      console.error("Error fetching quote:", error);
      // Fallback quote
      setQuote("The only way to do great work is to love what you do.");
      setAuthor("Steve Jobs");
    }
  };

  useEffect(() => {
    // Fetch quote immediately
    fetchQuote();

    // Set up interval to fetch new quote every hour (3600000 ms)
    const interval = setInterval(() => {
      fetchQuote();
    }, 3600000); // 1 hour = 3600000 milliseconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/30 shadow-xl relative overflow-hidden">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-pink-500/10 pointer-events-none"></div>

        {/* Content */}
        <div className="relative z-10">
          {quote && (
            <blockquote className="text-white/95 text-base sm:text-lg font-light leading-relaxed mb-5 sm:mb-6 italic">
              <span className="text-3xl sm:text-4xl text-white/40 font-serif leading-none mr-2">
                "
              </span>
              {quote}
              <span className="text-3xl sm:text-4xl text-white/40 font-serif leading-none ml-1">
                "
              </span>
            </blockquote>
          )}
          {author && (
            <div className="flex items-center justify-end mt-4">
              <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-white/30 flex-1 mr-3 max-w-[100px]"></div>
              <cite className="text-white/70 text-xs sm:text-sm font-normal not-italic tracking-wide">
                {author}
              </cite>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteBox;
