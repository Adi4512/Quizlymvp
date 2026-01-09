/**
 * User Profile Service
 * ====================
 * Handles user profile CRUD operations.
 * Works with the user_profiles table in Supabase.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type UserRole = "user" | "admin" | "moderator" | "enterprise_admin";
export type SubscriptionTier = "free" | "pro" | "enterprise";
export type SubscriptionStatus = "active" | "expired" | "cancelled";

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_email_verified: boolean;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus | null;
  country: string | null;
  country_code: string | null;
  timezone: string | null;
  language: string;
  phone: string | null;
  phone_verified: boolean;
  signup_source: string | null;
  referral_code: string | null;
  referred_by: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  last_sign_in_at: string | null;
  last_active_at: string | null;
  total_sign_ins: number;
  onboarding_completed: boolean;
  email_notifications: boolean;
  marketing_emails: boolean;
  product_updates: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  full_name?: string;
  avatar_url?: string;
  country?: string;
  country_code?: string;
  timezone?: string;
  language?: string;
  phone?: string;
  email_notifications?: boolean;
  marketing_emails?: boolean;
  product_updates?: boolean;
  onboarding_completed?: boolean;
  metadata?: Record<string, any>;
}

export interface ProfileWithStats extends UserProfile {
  total_quizzes?: number;
  average_score?: number;
  current_streak?: number;
  longest_streak?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// SUPABASE CLIENT
// ═══════════════════════════════════════════════════════════════════════════

let supabaseAdmin: SupabaseClient | null = null;

const getSupabaseAdmin = (): SupabaseClient => {
  if (!supabaseAdmin) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        "Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env"
      );
    }

    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdmin;
};

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get user profile by user ID
 * Creates a profile if one doesn't exist (for backward compatibility)
 */
export const getUserProfile = async (
  userId: string
): Promise<UserProfile | null> => {
  const supabase = getSupabaseAdmin();

  // Try to get existing profile
  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (profile && !error) {
    return profile as UserProfile;
  }

  // Profile not found - try to create from auth.users
  if (error?.code === "PGRST116") {
    return await createProfileFromAuth(userId);
  }

  console.error("Error fetching user profile:", error);
  return null;
};

/**
 * Create profile from auth.users data
 * Used for existing users who don't have a profile yet
 */
export const createProfileFromAuth = async (
  userId: string
): Promise<UserProfile | null> => {
  const supabase = getSupabaseAdmin();

  // Get user from auth.users
  const { data: authUser, error: authError } =
    await supabase.auth.admin.getUserById(userId);

  if (authError || !authUser?.user) {
    console.error("Error fetching auth user:", authError);
    return null;
  }

  const user = authUser.user;
  const metadata = user.user_metadata || {};

  // Determine signup source
  const provider = user.app_metadata?.provider || "email";
  const signupSource =
    provider === "email" ? "email" : (provider as string).toLowerCase();

  // Create profile
  const { data: profile, error: insertError } = await supabase
    .from("user_profiles")
    .insert({
      user_id: userId,
      email: user.email!,
      full_name:
        metadata.full_name || metadata.name || user.email?.split("@")[0],
      avatar_url: metadata.avatar_url || metadata.picture || null,
      is_email_verified: !!user.email_confirmed_at,
      signup_source: signupSource,
      last_sign_in_at: user.last_sign_in_at,
      total_sign_ins: 1,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Error creating user profile:", insertError);
    return null;
  }

  return profile as UserProfile;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: UpdateProfileData
): Promise<UserProfile | null> => {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("user_profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating user profile:", error);
    return null;
  }

  return data as UserProfile;
};

/**
 * Get profile with stats (extended view)
 */
export const getProfileWithStats = async (
  userId: string
): Promise<ProfileWithStats | null> => {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("user_profiles_extended")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile with stats:", error);
    // Fallback to regular profile
    return (await getUserProfile(userId)) as ProfileWithStats;
  }

  return data as ProfileWithStats;
};

/**
 * Update last active timestamp
 */
export const updateLastActive = async (userId: string): Promise<void> => {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("user_profiles")
    .update({
      last_active_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    console.error("Error updating last active:", error);
  }
};

/**
 * Mark onboarding as completed
 */
export const completeOnboarding = async (
  userId: string
): Promise<UserProfile | null> => {
  return updateUserProfile(userId, { onboarding_completed: true });
};

/**
 * Set user role (admin only)
 */
export const setUserRole = async (
  userId: string,
  role: UserRole
): Promise<UserProfile | null> => {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("user_profiles")
    .update({
      role,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error setting user role:", error);
    return null;
  }

  return data as UserProfile;
};

/**
 * Search profiles (admin only)
 */
export const searchProfiles = async (
  query: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ profiles: UserProfile[]; total: number }> => {
  const supabase = getSupabaseAdmin();

  // Search by email or name
  const { data, error, count } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact" })
    .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error searching profiles:", error);
    return { profiles: [], total: 0 };
  }

  return {
    profiles: (data || []) as UserProfile[],
    total: count || 0,
  };
};

/**
 * Get user count by tier (admin analytics)
 */
export const getUserCountByTier = async (): Promise<Record<string, number>> => {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.rpc("get_user_count_by_tier");

  if (error) {
    // Fallback to manual count if RPC doesn't exist
    console.error("Error getting user count by tier:", error);

    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("subscription_tier");

    const counts: Record<string, number> = { free: 0, pro: 0, enterprise: 0 };
    profiles?.forEach((p) => {
      counts[p.subscription_tier] = (counts[p.subscription_tier] || 0) + 1;
    });
    return counts;
  }

  return data as Record<string, number>;
};

/**
 * Get user count by signup source (marketing analytics)
 */
export const getUserCountBySignupSource = async (): Promise<
  Record<string, number>
> => {
  const supabase = getSupabaseAdmin();

  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("signup_source");

  const counts: Record<string, number> = {};
  profiles?.forEach((p) => {
    const source = p.signup_source || "unknown";
    counts[source] = (counts[source] || 0) + 1;
  });

  return counts;
};

/**
 * Add UTM tracking data to profile
 */
export const addUtmTracking = async (
  userId: string,
  utm: { source?: string; medium?: string; campaign?: string }
): Promise<void> => {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("user_profiles")
    .update({
      utm_source: utm.source || null,
      utm_medium: utm.medium || null,
      utm_campaign: utm.campaign || null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    console.error("Error adding UTM tracking:", error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  getUserProfile,
  createProfileFromAuth,
  updateUserProfile,
  getProfileWithStats,
  updateLastActive,
  completeOnboarding,
  setUserRole,
  searchProfiles,
  getUserCountByTier,
  getUserCountBySignupSource,
  addUtmTracking,
};
