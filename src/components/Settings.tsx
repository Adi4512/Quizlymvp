
import { SideNavbar } from './SideNavbar';
import { motion } from 'framer-motion';

const Settings = () => {
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
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full border border-white/20"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: 0.8, 
              ease: "easeOut",
              delay: 0.3
            }}
          >
            <h1 className="text-3xl font-bold text-white mb-6 text-center">Settings</h1>
            
            <div className="space-y-6">
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4">Account Settings</h2>
                <p className="text-white/80 leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4">Privacy Settings</h2>
                <p className="text-white/80 leading-relaxed">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4">Notification Settings</h2>
                <p className="text-white/80 leading-relaxed">
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
