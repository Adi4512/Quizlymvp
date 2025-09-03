import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AuthModal from './AuthModal';
import { gsap } from 'gsap';

interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthModal />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img 
                src="/static/quizethic-favicon.svg" 
                alt="Quizethic AI Logo" 
                className="w-8 h-8 rounded-full"
              />
              <span className="font-bold text-xl text-white cursor-pointer" onClick={() => navigate('/')}>Quizethic AI</span>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {/* User Info */}
              <div className="flex items-center gap-3">
                {user.user_metadata?.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="User Avatar" 
                    className="w-9 h-9 rounded-full border-2 border-white/20"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center border-2 border-white/20">
                    <span className="text-white font-semibold text-sm">
                      {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="text-white">
                  <p className="font-semibold text-sm">
                    {user.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-white/70">{user.email}</p>
                </div>
              </div>

              {/* Hamburger Menu */}
              <div className="relative">
                <button 
                  ref={hamburgerRef}
                  onClick={handleMenuToggle}
                  className="cursor-pointer p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path 
                      ref={line1Ref}
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 6h16" 
                    />
                    <path 
                      ref={line2Ref}
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 12h16" 
                    />
                    <path 
                      ref={line3Ref}
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 18h16" 
                    />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                <div 
                  ref={menuRef}
                  className={`absolute right-0 top-full mt-6 w-48 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 z-50 ${
                    isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                  }`}
                >
                  <div className="py-2">
                    <button
                      onClick={() => {
                        navigate('/');
                        animateMenuClose();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Home
                    </button>
                    <div className="border-t border-white/20 my-1"></div>
                    <button
                      onClick={() => {
                        handleSignOut();
                        animateMenuClose();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-500/20 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>



      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user.user_metadata?.full_name?.split(' ')[0] || 'Quiz Master'}!  
          </h1>
          <p className="text-white/80 text-lg">
            Ready to test your knowledge? Choose a topic and start your quiz journey.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Quizzes Completed</p>
                <p className="text-3xl font-bold text-white">0</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Average Score</p>
                <p className="text-3xl font-bold text-white">-</p>
              </div>
              <div className="text-3xl">🎯</div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Streak</p>
                <p className="text-3xl font-bold text-white">0</p>
              </div>
              <div className="text-3xl">🔥</div>
            </div>
          </div>
        </div>

        {/* Quiz Topics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Choose Your Quiz Topic</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
                className={`bg-gradient-to-br ${topic.color} hover:scale-105 transform transition-all duration-200 rounded-xl p-6 text-white shadow-lg`}
              >
                <div className="text-3xl mb-2">{topic.emoji}</div>
                <div className="font-semibold">{topic.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-white/70">No recent activity yet. Start your first quiz!</p>
          </div>
        </div>
      </main>
      
      {showPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPopup(false)}
          />
          
          {/* Popup */}
          <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-300 rounded-2xl shadow-2xl p-8 w-full max-w-lg mx-4">
            <div className="text-center">
              <div className="text-5xl mb-4">🚧</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Dashboard Under Development</h3>
              <div className="space-y-3 text-gray-700">
                <p className="text-sm">
                  The current dashboard is not a replica of the original design. We are actively working on the backend infrastructure.
                </p>
                <div className="bg-blue-100 rounded-lg p-3 border border-blue-200">
                  <p className="text-xs text-blue-800 font-medium">
                    <span className="font-bold">Current Status:</span> Backend Development in Progress
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    UI: Testing Interface | Backend: Core Development | Features: Coming Soon
                  </p>
                </div>
                <p className="text-sm">
                  This UI is just for testing purposes. Thank you for your patience as we build something amazing!
                </p>
                <div className="bg-green-100 rounded-lg p-3 border border-green-200">
                  <p className="text-sm text-green-800 font-medium">
                    🎉 <span className="font-bold">Waitlist Feature Coming Soon!</span>
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Be the first to know when we launch the full platform
                  </p>
                </div>
              </div>
            </div>
            
            {/* Close button */}
            <button
              onClick={() => setShowPopup(false)}
              className="cursor-pointer absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors text-xl font-bold bg-white/80 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center"
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
