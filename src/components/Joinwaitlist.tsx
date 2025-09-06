import { useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { gsap } from "gsap";

interface WaitlistProps {
  onSuccess?: () => void;
}

export default function Waitlist({ onSuccess }: WaitlistProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

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
      
      // Animate fade out after successful submission
      setTimeout(() => {
        if (containerRef.current) {
          gsap.to(containerRef.current, {
            opacity: 0,
            y: -20,
            scale: 0.95,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => {
              setIsVisible(false);
              if (onSuccess) {
                onSuccess();
              }
            }
          });
        } else {
          // Fallback if ref is not available
          setIsVisible(false);
          if (onSuccess) {
            onSuccess();
          }
        }
      }, 2000); // Show success message for 2 seconds before animating out
    } catch (error: any) {
      console.error('Error adding to waitlist:', error);
      
      // Check for duplicate email error
      if (error?.code === '23505' || error?.message?.includes('duplicate') || error?.message?.includes('already exists')) {
        setMessage("Seems like you're too excited but you're already on our waitlist! 😉");
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div className="w-full flex justify-center mt-0">
      <div 
        ref={containerRef}
        className=" bg-gradient-to-r from-purple-500/50 to-pink-500/50 backdrop-blur-xl border border-white/30 rounded-xl sm:rounded-2xl shadow-2xl px-4 sm:px-6 py-3 w-full max-w-sm sm:max-w-md"
      >
        <h2 className="text-sm sm:text-base font-semibold text-white text-center mb-1">
          Join the Waitlist 🚀
        </h2>
        
        <p className="text-xs sm:text-sm text-purple-100 text-center mb-3 leading-relaxed">
          Your shortcut to smarter prep starts here — join before launch
        </p>
        {message && (
          <div className={`text-center mb-3 text-xs sm:text-sm ${
            message.includes("Thanks") ? "text-green-300" : "text-red-300"
          }`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-white/20 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:opacity-50 text-sm sm:text-base"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 sm:py-3 cursor-pointer bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg font-medium text-white shadow-md hover:opacity-90 transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isLoading ? "Joining..." : "Join"}
          </button>
        </form>
      </div>
    </div>
  );
}
