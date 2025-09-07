import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AuthModal from './AuthModal';
import LottieLoader from './LottieLoader';
import { gsap } from 'gsap';
import { SideNavbar } from './SideNavbar';


interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    picture?: string;
    name?: string;
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  
  // Refs for GSAP animations
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<SVGPathElement>(null);
  const line2Ref = useRef<SVGPathElement>(null);
  const line3Ref = useRef<SVGPathElement>(null);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
      
        setUser(session.user as User);
      }
      setShowPopup(true);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        if (session?.user) {
        
          setUser(session.user as User);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // GSAP Animation functions
  const animateMenuOpen = () => {
    if (!menuRef.current || !line1Ref.current || !line2Ref.current || !line3Ref.current) return;
    
    setIsMenuOpen(true);
    
    // Animate hamburger lines to X
    gsap.to(line1Ref.current, { rotation: 45, y: 6, duration: 0.3, ease: "power2.out" });
    gsap.to(line2Ref.current, { opacity: 0, duration: 0.2, ease: "power2.out" });
    gsap.to(line3Ref.current, { rotation: -45, y: -6, duration: 0.3, ease: "power2.out" });
    
    // Animate menu dropdown
    gsap.fromTo(menuRef.current, 
      { 
        opacity: 0, 
        y: -10, 
        scale: 0.95,
        transformOrigin: "top right"
      },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        duration: 0.3, 
        ease: "back.out(1.7)" 
      }
    );
  };

  const animateMenuClose = () => {
    if (!menuRef.current || !line1Ref.current || !line2Ref.current || !line3Ref.current) return;
    
    setIsMenuOpen(false);
    
    // Animate hamburger lines back to normal
    gsap.to(line1Ref.current, { rotation: 0, y: 0, duration: 0.3, ease: "power2.out" });
    gsap.to(line2Ref.current, { opacity: 1, duration: 0.2, ease: "power2.out" });
    gsap.to(line3Ref.current, { rotation: 0, y: 0, duration: 0.3, ease: "power2.out" });
    
    // Animate menu dropdown out
    gsap.to(menuRef.current, { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      duration: 0.2, 
      ease: "power2.in" 
    });
  };

  const handleMenuToggle = () => {
    if (isMenuOpen) {
      animateMenuClose();
    } else {
      animateMenuOpen();
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <LottieLoader size="xlarge" />
      </div>
    );
  }

  if (!user) {
    return <AuthModal />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Video failed to load:', e);
          }}
          onLoadStart={() => {
            console.log('Video loading started');
          }}
          onCanPlay={() => {
            console.log('Video can play');
          }}
        >
          <source src="/static/dashboardvid.webm" type="video/webm" />
          <source src="/static/dashboardvid.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" style={{ zIndex: 0 }}></div>

      {/* Sidebar */}
      <div className="relative" style={{ zIndex: 1 }}>
        <SideNavbar />
      </div>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8" style={{ zIndex: 1 }}>
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
            Welcome back, {user.user_metadata?.full_name?.split(' ')[0] || 'Quiz Master'}!  
          </h1>
          <p className="text-white/80 text-sm sm:text-base lg:text-lg leading-relaxed">
            Ready to test your knowledge? Choose a topic and start your quiz journey.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-black/40 backdrop-blur-lg rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/30 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs sm:text-sm font-medium">Quizzes Completed</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">0</p>
              </div>
              <div className="text-2xl sm:text-3xl">📊</div>
            </div>
          </div>
          
          <div className="bg-black/40 backdrop-blur-lg rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/30 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs sm:text-sm font-medium">Average Score</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">-</p>
              </div>
              <div className="text-2xl sm:text-3xl">🎯</div>
            </div>
          </div>
          
          <div className="bg-black/40 backdrop-blur-lg rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/30 shadow-xl sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs sm:text-sm font-medium">Streak</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">0</p>
              </div>
              <div className="text-2xl sm:text-3xl">🔥</div>
            </div>
          </div>
        </div>

        {/* Quiz Topics */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Choose Your Quiz Topic</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              { emoji: '🎨', name: 'Art', color: 'from-pink-500 to-rose-500' },
              { emoji: '🔬', name: 'Science', color: 'from-blue-500 to-cyan-500' },
              { emoji: '⛅', name: 'Weather', color: 'from-sky-500 to-blue-500' },
              { emoji: '⚛️', name: 'Physics', color: 'from-purple-500 to-indigo-500' },
              { emoji: '🌍', name: 'Geography', color: 'from-green-500 to-emerald-500' },
              { emoji: '➗', name: 'Math', color: 'from-orange-500 to-red-500' },
              { emoji: '🗣️', name: 'Language', color: 'from-yellow-500 to-orange-500' },
              { emoji: '🔭', name: 'Astronomy', color: 'from-indigo-500 to-purple-500' },
              { emoji: '❤️', name: 'Health', color: 'from-red-500 to-pink-500' },
              { emoji: '🏛️', name: 'History', color: 'from-amber-500 to-yellow-500' },
              { emoji: '🎵', name: 'Music', color: 'from-violet-500 to-purple-500' },
              { emoji: '⚽', name: 'Sports', color: 'from-lime-500 to-green-500' }
            ].map((topic) => (
              <button
                key={topic.name}
                className={`bg-gradient-to-br ${topic.color} hover:scale-105 transform transition-all duration-200 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 text-white shadow-lg`}
              >
                <div className="text-xl sm:text-2xl lg:text-3xl mb-1 sm:mb-2">{topic.emoji}</div>
                <div className="font-semibold text-xs sm:text-sm lg:text-base">{topic.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-black/40 backdrop-blur-lg rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/30 shadow-xl">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Recent Activity</h3>
          <div className="text-center py-6 sm:py-8">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📝</div>
            <p className="text-white/80 text-sm sm:text-base">No recent activity yet. Start your first quiz!</p>
          </div>
        </div>
      </main>
      
      {showPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPopup(false)}
          />
          
          {/* Popup */}
          <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-300 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-lg mx-2 sm:mx-4">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl mb-3 sm:mb-4">🚧</div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 leading-tight">Dashboard Under Development</h3>
              <div className="space-y-2 sm:space-y-3 text-gray-700">
                <p className="text-xs sm:text-sm leading-relaxed">
                  The current dashboard is not a replica of the original design. We are actively working on the backend infrastructure.
                </p>
                <div className="bg-blue-100 rounded-lg p-2 sm:p-3 border border-blue-200">
                  <p className="text-xs text-blue-800 font-medium">
                    <span className="font-bold">Current Status:</span> Backend Development in Progress
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    UI: Testing Interface | Backend: Core Development | Features: Coming Soon
                  </p>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed">
                  This UI is just for testing purposes. Thank you for your patience as we build something amazing!
                </p>
                <div className="bg-green-100 rounded-lg p-2 sm:p-3 border border-green-200">
                  <p className="text-xs sm:text-sm text-green-800 font-medium">
                    🚀 <span className="font-bold">Join the Waitlist!</span>
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Get early access and exclusive updates before we launch
                  </p>
                </div>
              </div>
            </div>
            
            {/* Close button */}
            <button
              onClick={() => setShowPopup(false)}
              className="cursor-pointer absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-500 hover:text-gray-700 transition-colors text-lg sm:text-xl font-bold bg-white/80 hover:bg-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
      )}




    </div>
  );
};

export default Dashboard;
