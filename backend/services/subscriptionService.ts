/**
 * Subscription Service
 * ====================
 * Handles tier checking, usage tracking, and subscription management.
 * Connects to Supabase for database operations.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type UserTier = "free" | "pro" | "enterprise";
export type SubscriptionStatus = "active" | "expired" | "cancelled";

export interface UserSubscription {
  id: string;
  user_id: string;
  tier: UserTier;
  status: SubscriptionStatus;
  started_at: string;
  expires_at: string | null;
  // Dodo Payments fields
  dodo_subscription_id: string | null;
  dodo_customer_id: string | null;
  dodo_payment_id: string | null;
  // Legacy Razorpay fields (for historical data)
  razorpay_payment_id?: string | null;
  razorpay_order_id?: string | null;
}

export interface DailyUsage {
  user_id: string;
  usage_date: string;
  quiz_count: number;
}

export interface UsageStatus {
  tier: UserTier;
  quizzesToday: number;
  dailyLimit: number;
  remaining: number;
  canGenerate: boolean;
  isUnlimited: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// TIER LIMITS CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const TIER_LIMITS = {
  free: {
    dailyQuizzes: 5,
    isUnlimited: false,
  },
  pro: {
    dailyQuizzes: Infinity,
    isUnlimited: true,
  },
  enterprise: {
    dailyQuizzes: Infinity,
    isUnlimited: true,
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SUPABASE CLIENT (Service Role for backend operations)
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
// SUBSCRIPTION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get or create subscription for a user
 * New users automatically get a "free" tier
 */
export const getSubscription = async (
  userId: string
): Promise<UserSubscription> => {
  const supabase = getSupabaseAdmin();

  // Try to get existing subscription
  const { data: existing, error: fetchError } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (existing && !fetchError) {
    // Check if Pro subscription has expired
    if (existing.tier === "pro" && existing.expires_at) {
      const expiresAt = new Date(existing.expires_at);
      if (expiresAt < new Date()) {
        // Subscription expired - downgrade to free
        const { data: updated } = await supabase
          .from("user_subscriptions")
          .update({ tier: "free", status: "expired" })
          .eq("user_id", userId)
          .select()
          .single();
        return updated as UserSubscription;
      }
    }
    return existing as UserSubscription;
  }

  // Create new free subscription
  const { data: newSub, error: createError } = await supabase
    .from("user_subscriptions")
    .insert({
      user_id: userId,
      tier: "free",
      status: "active",
    })
    .select()
    .single();

  if (createError) {
    console.error("Error creating subscription:", createError);
    // Return default free subscription if insert fails (might be race condition)
    return {
      id: "",
      user_id: userId,
      tier: "free",
      status: "active",
      started_at: new Date().toISOString(),
      expires_at: null,
      dodo_subscription_id: null,
      dodo_customer_id: null,
      dodo_payment_id: null,
    };
  }

  return newSub as UserSubscription;
};

/**
 * Get user's current tier
 */
export const getUserTier = async (userId: string): Promise<UserTier> => {
  const subscription = await getSubscription(userId);
  return subscription.tier;
};

/**
 * Upgrade user to Pro tier via Dodo Payments
 */
export const upgradeToPro = async (
  userId: string,
  dodoSubscriptionId: string,
  dodoCustomerId?: string,
  dodoPaymentId?: string,
  expiresAt?: string | null
): Promise<UserSubscription> => {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("user_subscriptions")
    .upsert(
      {
        user_id: userId,
        tier: "pro",
        status: "active",
        expires_at: expiresAt || null,
        dodo_subscription_id: dodoSubscriptionId,
        dodo_customer_id: dodoCustomerId || null,
        dodo_payment_id: dodoPaymentId || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("Error upgrading to Pro:", error);
    throw new Error("Failed to upgrade subscription");
  }

  return data as UserSubscription;
};

// ═══════════════════════════════════════════════════════════════════════════
// USAGE TRACKING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get today's quiz count for a user
 */
export const getTodayUsage = async (userId: string): Promise<number> => {
  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const { data, error } = await supabase
    .from("daily_usage")
    .select("quiz_count")
    .eq("user_id", userId)
    .eq("usage_date", today)
    .single();

  if (error || !data) {
    return 0; // No usage today
  }

  return data.quiz_count;
};

/**
 * Increment quiz usage for today
 * Returns the new count
 */
export const incrementUsage = async (userId: string): Promise<number> => {
  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().split("T")[0];

  // Upsert: insert or update
  const { data: existing } = await supabase
    .from("daily_usage")
    .select("quiz_count")
    .eq("user_id", userId)
    .eq("usage_date", today)
    .single();

  const newCount = (existing?.quiz_count || 0) + 1;

  const { error } = await supabase.from("daily_usage").upsert(
    {
      user_id: userId,
      usage_date: today,
      quiz_count: newCount,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,usage_date" }
  );

  if (error) {
    console.error("Error incrementing usage:", error);
  }

  return newCount;
};

/**
 * Get full usage status for a user
 * Includes tier, limits, and remaining quota
 */
export const getUsageStatus = async (userId: string): Promise<UsageStatus> => {
  const [subscription, todayUsage] = await Promise.all([
    getSubscription(userId),
    getTodayUsage(userId),
  ]);

  const tier = subscription.tier;
  const limits = TIER_LIMITS[tier];
  const dailyLimit = limits.dailyQuizzes;
  const isUnlimited = limits.isUnlimited;
  const remaining = isUnlimited
    ? Infinity
    : Math.max(0, dailyLimit - todayUsage);
  const canGenerate = isUnlimited || remaining > 0;

  return {
    tier,
    quizzesToday: todayUsage,
    dailyLimit: isUnlimited ? -1 : dailyLimit, // -1 indicates unlimited
    remaining: isUnlimited ? -1 : remaining,
    canGenerate,
    isUnlimited,
  };
};

/**
 * Check if user can generate a quiz
 * Returns { allowed: boolean, reason?: string }
 */
export const canGenerateQuiz = async (
  userId: string
): Promise<{ allowed: boolean; reason?: string; status: UsageStatus }> => {
  const status = await getUsageStatus(userId);

  if (status.canGenerate) {
    return { allowed: true, status };
  }

  return {
    allowed: false,
    reason: `Daily limit reached (${status.dailyLimit} quizzes). Upgrade to Pro for unlimited access.`,
    status,
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// PAYMENT RECORDING - Dodo Payments
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Record a Dodo payment in the payments table
 */
export const recordPayment = async (
  userId: string,
  dodoPaymentId: string,
  dodoSubscriptionId: string,
  amount: number,
  currency: string = "INR",
  status: "pending" | "succeeded" | "failed" | "refunded" = "succeeded"
): Promise<void> => {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from("payments").insert({
    user_id: userId,
    dodo_payment_id: dodoPaymentId,
    dodo_subscription_id: dodoSubscriptionId,
    amount,
    currency,
    status,
    plan_id: "pro",
  });

  if (error) {
    console.error("Error recording payment:", error);
    // Don't throw - payment recording failure shouldn't block the user
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  getSubscription,
  getUserTier,
  upgradeToPro,
  getTodayUsage,
  incrementUsage,
  getUsageStatus,
  canGenerateQuiz,
  recordPayment,
  TIER_LIMITS,
};
