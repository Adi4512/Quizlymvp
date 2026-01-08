import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ═══════════════════════════════════════════════════════════════════════════
// USER TIER TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type UserTier = "free" | "pro" | "enterprise";

// ═══════════════════════════════════════════════════════════════════════════
// AUTH HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const auth = {
  signUp: async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          display_name: username,
          full_name: username,
          tier: "free" as UserTier, // Default tier for new users
        },
      },
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// TIER MANAGEMENT HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get the current user's tier from metadata
 * Returns "free" if no tier is set (default for all users)
 */
export const getUserTier = async (): Promise<UserTier> => {
  const user = await auth.getCurrentUser();
  if (!user) return "free";

  const tier = user.user_metadata?.tier;
  if (tier === "pro" || tier === "enterprise") {
    return tier;
  }
  return "free"; // Default
};

/**
 * Update user tier in metadata
 * Called after successful Pro payment or manual Enterprise assignment
 */
export const updateUserTier = async (
  tier: UserTier
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      data: { tier },
    });

    if (error) {
      console.error("Failed to update user tier:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
};

/**
 * Check if user has Pro tier or higher
 */
export const isProUser = async (): Promise<boolean> => {
  const tier = await getUserTier();
  return tier === "pro" || tier === "enterprise";
};

/**
 * Check if user has Enterprise tier
 */
export const isEnterpriseUser = async (): Promise<boolean> => {
  const tier = await getUserTier();
  return tier === "enterprise";
};

/**
 * Get tier from user object (sync version for when user is already loaded)
 */
export const getTierFromUser = (
  user: { user_metadata?: { tier?: string } } | null
): UserTier => {
  if (!user) return "free";
  const tier = user.user_metadata?.tier;
  if (tier === "pro" || tier === "enterprise") {
    return tier;
  }
  return "free";
};
