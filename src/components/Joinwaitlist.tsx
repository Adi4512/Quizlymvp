import { useState } from "react";

export default function Waitlist() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 🔗 Call Supabase insert function here
    console.log("Waitlist email submitted:", email);
    setEmail("");
  };

  return (
    <div className="w-full flex justify-center mt-0">
      <div className="bg-gradient-to-r from-purple-500/50 to-pink-500/50 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl px-6 py-3 w-full max-w-md">
        <h2 className="text-base font-semibold text-white text-center mb-1">
          Join the Waitlist 🚀
        </h2>
        
                 <p className="text-sm text-purple-100 text-center mb-3">
                 Your shortcut to smarter prep starts here — join before launch
         </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-4 py-3 rounded-lg bg-white/20 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <button
            type="submit"
            className="px-4 cursor-pointer bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg font-medium text-white shadow-md hover:opacity-90 transition hover:scale-105"
          >
            Join
          </button>
        </form>
      </div>
    </div>
  );
}
