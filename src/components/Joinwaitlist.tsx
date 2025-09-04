import { useState } from "react";
import { supabase } from "../lib/supabase";

interface WaitlistProps {
  onSuccess?: () => void;
}

export default function Waitlist({ onSuccess }: WaitlistProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const { error } = await supabase
        .from('WaitList') // Replace 'waitlist' with your actual table name
        .insert([
          { Email: email }
        ]);

      if (error) {
        throw error;
      }

      setMessage("🎉 You're officially on the list! We'll let you know the moment we launch 🚀");
      setEmail("");
      
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 800); 
      }
    } catch (error: any) {
      console.error('Error adding to waitlist:', error);
      
      // Check for duplicate email error
      if (error?.code === '23505' || error?.message?.includes('duplicate') || error?.message?.includes('already exists')) {
        setMessage("This email is already on our waitlist!");
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
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
        {message && (
          <div className={`text-center mb-3 text-sm ${
            message.includes("Thanks") ? "text-green-300" : "text-red-300"
          }`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-lg bg-white/20 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 cursor-pointer bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg font-medium text-white shadow-md hover:opacity-90 transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Joining..." : "Join"}
          </button>
        </form>
      </div>
    </div>
  );
}
