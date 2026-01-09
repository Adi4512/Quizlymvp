/**
 * AppLayout Component
 * ===================
 * Shared layout for authenticated pages with consistent sidebar navigation
 * on both desktop and mobile.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { SideNavbar } from "./SideNavbar";
import {
  IconHome,
  IconDashboard,
  IconUserBolt,
  IconSettings,
  IconArrowLeft,
  IconMenu2,
  IconX,
  IconCreditCard,
  IconInfoCircle,
  IconMail,
} from "@tabler/icons-react";

interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    display_name?: string;
    username?: string;
    avatar_url?: string;
    picture?: string;
    name?: string;
  };
}

interface AppLayoutProps {
  children: React.ReactNode;
  user?: User | null;
}

export const AppLayout = ({ children, user }: AppLayoutProps) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mobile menu links - same as SideNavbar
  const mobileMenuLinks = [
    { label: "Home", icon: IconHome, path: "/" },
    { label: "Dashboard", icon: IconDashboard, path: "/dashboard" },
    { label: "Profile", icon: IconUserBolt, path: "/profile" },
    { label: "Settings", icon: IconSettings, path: "/settings" },
    { label: "Pricing", icon: IconCreditCard, path: "/pricing" },
    { label: "About Us", icon: IconInfoCircle, path: "/about" },
    { label: "Contact Us", icon: IconMail, path: "/contactus" },
  ];

  const handleMobileLogout = async () => {
    try {
      await supabase.auth.signOut();
      setMobileMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block relative shrink-0" style={{ zIndex: 10 }}>
        <SideNavbar />
      </div>

      {/* Mobile Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[60] px-4 py-3 bg-blur backdrop-blur-2xl">
        <button
          className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition-colors"
          onClick={() => setMobileMenuOpen(true)}
        >
          <IconMenu2 className="text-white h-5 w-5" />
        </button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 bg-black/70 z-[70]"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="md:hidden fixed left-0 top-0 h-full w-[280px] bg-[#0f0f1a] z-[80] flex flex-col border-r border-white/10 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <img
                    src="/static/quizethic-favicon.svg"
                    className="h-6 w-6"
                    alt="Logo"
                  />
                  <span className="text-white font-semibold">Quizethic AI</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <IconX className="text-white h-5 w-5" />
                </button>
              </div>

              {/* Menu Links */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {mobileMenuLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => {
                      navigate(link.path);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <link.icon className="h-5 w-5" />
                    <span>{link.label}</span>
                  </button>
                ))}
                <button
                  onClick={handleMobileLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <IconArrowLeft className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </nav>

              {/* User Info */}
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  {user?.user_metadata?.avatar_url ||
                  user?.user_metadata?.picture ? (
                    <img
                      src={
                        user?.user_metadata?.avatar_url ||
                        user?.user_metadata?.picture
                      }
                      className="h-10 w-10 rounded-full border-2 border-white/20"
                      alt="Avatar"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center border-2 border-white/20">
                      <span className="text-white font-semibold">
                        {user?.user_metadata?.full_name?.charAt(0) ||
                          user?.user_metadata?.display_name?.charAt(0) ||
                          user?.user_metadata?.username?.charAt(0) ||
                          user?.email?.charAt(0).toUpperCase() ||
                          "U"}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {user?.user_metadata?.full_name ||
                        user?.user_metadata?.display_name ||
                        user?.user_metadata?.username ||
                        user?.user_metadata?.name ||
                        "User"}
                    </p>
                    <p className="text-white/60 text-sm truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden pt-16 md:pt-0">
        {children}
      </div>
    </div>
  );
};

export default AppLayout;
