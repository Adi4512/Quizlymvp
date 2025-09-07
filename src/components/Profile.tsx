import { SideNavbar } from './SideNavbar';
import { motion } from 'framer-motion';

const Profile = () => {
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
        <div className="flex items-center justify-center min-h-full">
          <motion.div 
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-4xl w-full border border-white/20"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: 0.8, 
              ease: "easeOut",
              delay: 0.3
            }}
          >
            <h1 className="text-3xl font-bold text-white mb-6 text-center">Profile & Stats</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Stats */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4">Quiz Statistics</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Total Quizzes Taken:</span>
                    <span className="text-white font-bold">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Average Score:</span>
                    <span className="text-white font-bold">-</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Best Score:</span>
                    <span className="text-white font-bold">-</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Current Streak:</span>
                    <span className="text-white font-bold">0 days</span>
                  </div>
                </div>
              </div>
              
              {/* Profile Information */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
                <p className="text-white/80 leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
              </div>
              
              {/* Recent Activity */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10 md:col-span-2">
                <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
                <p className="text-white/80 leading-relaxed">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
