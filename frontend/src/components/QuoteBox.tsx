import { useState, useEffect } from "react";

const quotes = [
  {
    content: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    content:
      "Education is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela",
  },
  {
    content: "The mind is not a vessel to be filled, but a fire to be kindled.",
    author: "Plutarch",
  },
  {
    content:
      "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    author: "Mahatma Gandhi",
  },
  {
    content:
      "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King",
  },
  {
    content:
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
  },
  {
    content:
      "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
    author: "Dr. Seuss",
  },
  {
    content: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
  },
  {
    content: "The expert in anything was once a beginner.",
    author: "Helen Hayes",
  },
  {
    content: "Your limitation—it's only your imagination.",
    author: "steve jobs",
  },
  {
    content: "Push yourself, because no one else is going to do it for you.",
    author: "steve jobs",
  },
  {
    content: "Great things never come from comfort zones.",
    author: "steve jobs",
  },
  { content: "Dream it. Wish it. Do it.", author: "steve jobs" },
  {
    content: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    content: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
  },
  {
    content: "Knowledge is power. Information is liberating.",
    author: "Kofi Annan",
  },
  {
    content: "The roots of education are bitter, but the fruit is sweet.",
    author: "Aristotle",
  },
  { content: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
  {
    content:
      "Study hard what interests you the most in the most undisciplined, irreverent and original manner possible.",
    author: "Richard Feynman",
  },
  {
    content: "An investment in knowledge pays the best interest.",
    author: "Benjamin Franklin",
  },
];

const getRandomQuote = () => quotes[Math.floor(Math.random() * quotes.length)];

const QuoteBox = () => {
  const [currentQuote, setCurrentQuote] = useState(getRandomQuote);

  useEffect(() => {
    // Change quote every hour
    const interval = setInterval(() => {
      setCurrentQuote(getRandomQuote());
    }, 3600000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/30 shadow-xl relative overflow-hidden">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-pink-500/10 pointer-events-none"></div>

        {/* Content */}
        <div className="relative z-10">
          <blockquote className="text-white/95 text-base sm:text-lg font-light leading-relaxed mb-5 sm:mb-6 italic">
            <span className="text-3xl sm:text-4xl text-white/40 font-serif leading-none mr-2">
              "
            </span>
            {currentQuote.content}
            <span className="text-3xl sm:text-4xl text-white/40 font-serif leading-none ml-1">
              "
            </span>
          </blockquote>
          <div className="flex items-center justify-end mt-4">
            <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-white/30 flex-1 mr-3 max-w-[100px]"></div>
            <cite className="text-white/70 text-xs sm:text-sm font-normal not-italic tracking-wide">
              {currentQuote.author}
            </cite>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteBox;
