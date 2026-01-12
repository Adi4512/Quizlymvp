"use client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/sidebar";
import {
  IconArrowLeft,
  IconDashboard,
  IconHome,
  IconSettings,
  IconUserBolt,
  IconInfoCircle,
  IconMail,
  IconCreditCard,
} from "@tabler/icons-react";
import { motion } from "motion/react";

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

export function SideNavbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user as User);
      }
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        setUser(session.user as User);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const links = [
    {
      label: "Home",
      onClick: () => handleNavigation("/"),
      icon: <IconHome className="h-5 w-5 shrink-0 text-white" />,
    },
    {
      label: "Dashboard",
      onClick: () => handleNavigation("/dashboard"),
      icon: <IconDashboard className="h-5 w-5 shrink-0 text-white" />,
    },
    {
      label: "Profile",
      onClick: () => handleNavigation("/profile"),
      icon: <IconUserBolt className="h-5 w-5 shrink-0 text-white" />,
    },
    {
      label: "Settings",
      onClick: () => handleNavigation("/settings"),
      icon: <IconSettings className="h-5 w-5 shrink-0 text-white" />,
    },
    {
      label: "Pricing",
      onClick: () => handleNavigation("/pricing"),
      icon: <IconCreditCard className="h-5 w-5 shrink-0 text-white" />,
    },
    {
      label: "About Us",
      onClick: () => handleNavigation("/about"),
      icon: <IconInfoCircle className="h-5 w-5 shrink-0 text-white" />,
    },
    {
      label: "Contact Us",
      onClick: () => handleNavigation("/contactus"),
      icon: <IconMail className="h-5 w-5 shrink-0 text-white" />,
    },
    {
      label: "Logout",
      onClick: handleLogout,
      icon: <IconArrowLeft className="h-5 w-5 shrink-0 text-white" />,
    },
  ];
  return (
    <div className="h-screen">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <div
              className="flex items-center gap-3 py-2 cursor-pointer"
              onClick={() => handleNavigation("/profile")}
            >
              {(() => {
                const avatarUrl =
                  user?.user_metadata?.avatar_url ||
                  user?.user_metadata?.picture;
                const fullName =
                  user?.user_metadata?.full_name ||
                  user?.user_metadata?.display_name ||
                  user?.user_metadata?.username ||
                  user?.user_metadata?.name;

                return avatarUrl ? (
                  <img
                    src={avatarUrl}
                    className="h-7 w-7 shrink-0 rounded-full border-2 border-white/20"
                    width={28}
                    height={28}
                    alt="User Avatar"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling?.classList.remove(
                        "hidden"
                      );
                    }}
                  />
                ) : (
                  <div className="h-4 w-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center border-2 border-white/20">
                    <span className="text-white font-semibold text-xs">
                      {fullName?.charAt(0) ||
                        user?.email?.charAt(0).toUpperCase() ||
                        "U"}
                    </span>
                  </div>
                );
              })()}

              <div className="flex flex-col">
                <motion.span
                  animate={{
                    display: open ? "block" : "none",
                    opacity: open ? 1 : 0,
                  }}
                  className="text-white text-sm font-medium whitespace-nowrap"
                >
                  {user?.user_metadata?.full_name ||
                    user?.user_metadata?.display_name ||
                    user?.user_metadata?.username ||
                    user?.user_metadata?.name ||
                    "Quiz-Master"}
                </motion.span>
                <motion.span
                  animate={{
                    display: open ? "block" : "none",
                    opacity: open ? 1 : 0,
                  }}
                  className="text-white/60 text-xs whitespace-nowrap"
                >
                  {user?.email || "user@example.com"}
                </motion.span>
              </div>
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
    </div>
  );
}
export const Logo = () => {
  return (
    <div className="flex items-center gap-2 h-6">
      <img
        src="/static/chatlogoquizethicwithoutbg.webp"
        className="h-8 w-24 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm"
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-white mt-[-5px]"
      >
        Quizethic AI
      </motion.span>
    </div>
  );
};
export const LogoIcon = () => {
  return (
    <div className="h-6 flex items-center">
      <img
        src="/static/chatlogoquizethicwithoutbg.webp"
        className="h-8 w-24 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm"
      />
    </div>
  );
};

// Dummy dashboard component with content
