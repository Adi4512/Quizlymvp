/**
 * Centralized Pricing Configuration
 * ================================
 * B2B-first SaaS pricing with 3 tiers:
 * - Free: Trial & lead funnel (no payment)
 * - Pro: Self-serve paid plan (Payment method being upgraded)
 * - Enterprise: Contact sales (no payment, manual onboarding)
 * 
 * NOTE: Razorpay has been commented out. New payment method to be implemented.
 */

// User tier values - used for database/auth metadata
export type UserTier = "free" | "pro" | "enterprise";

// Plan identifiers for internal use
export type PlanId = "free" | "pro" | "enterprise";

// Pricing configuration - adjust PRO_PRICE_INR as needed (₹199-₹399 range)
export const PRICING_CONFIG = {
  PRO_PRICE_INR: 299, // Configurable: change to adjust Pro price
  CURRENCY: "INR",
  SALES_EMAIL: "quizethicai@protonmail.com", // Enterprise contact
} as const;

// Feature definitions for each tier
export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PricingPlan {
  id: PlanId;
  name: string;
  price: number; // 0 for free, actual price for pro, -1 for enterprise (contact us)
  priceDisplay: string; // "Free", "₹299", "Custom"
  priceInPaise: number; // For Razorpay (smallest currency unit)
  currency: string;
  description: string;
  features: PlanFeature[];
  cta: string;
  ctaAction: "start_free" | "checkout" | "contact_sales";
  isPopular: boolean;
  // UI styling
  headerGradient: string;
  buttonGradient: string;
}

/**
 * PLAN DEFINITIONS
 * ================
 * Free: No payment, limited features
 * Pro: Single paid plan, full features
 * Enterprise: Contact sales, custom features
 */
export const PLANS: Record<PlanId, PricingPlan> = {
  free: {
    id: "free",
    name: "FREE",
    price: 0,
    priceDisplay: "Free",
    priceInPaise: 0,
    currency: PRICING_CONFIG.CURRENCY,
    description: "Perfect for getting started",
    features: [
      { text: "5 quizzes per day", included: true },
      { text: "Basic AI question generation", included: true },
      { text: "Standard difficulty levels", included: true },
      { text: "Community support", included: true },
      { text: "Performance analytics", included: false },
      { text: "Priority support", included: false },
      { text: "Custom topics", included: false },
    ],
    cta: "Start Free",
    ctaAction: "start_free",
    isPopular: false,
    headerGradient: "from-slate-500 to-slate-400",
    buttonGradient: "from-slate-600 to-slate-500",
  },

  pro: {
    id: "pro",
    name: "PRO",
    price: PRICING_CONFIG.PRO_PRICE_INR,
    priceDisplay: `₹${PRICING_CONFIG.PRO_PRICE_INR}`,
    priceInPaise: PRICING_CONFIG.PRO_PRICE_INR * 100, // Convert to paise
    currency: PRICING_CONFIG.CURRENCY,
    description: "For serious learners & educators",
    features: [
      { text: "Unlimited quizzes", included: true },
      { text: "Advanced AI with explanations", included: true },
      { text: "All difficulty levels", included: true },
      { text: "Performance analytics", included: true },
      { text: "Priority support", included: true },
      { text: "Custom topics", included: true },
      { text: "Export & share quizzes", included: true },
    ],
    cta: "Upgrade to Pro",
    ctaAction: "checkout",
    isPopular: true, // Highlight as recommended
    headerGradient: "from-pink-500 to-pink-400",
    buttonGradient: "from-pink-500 to-pink-400",
  },

  enterprise: {
    id: "enterprise",
    name: "ENTERPRISE",
    price: -1, // Signals "contact us" pricing
    priceDisplay: "Custom",
    priceInPaise: 0, // No direct payment
    currency: PRICING_CONFIG.CURRENCY,
    description: "For coaching centers & institutions",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Unlimited team members", included: true },
      { text: "Admin dashboard", included: true },
      { text: "Bulk quiz creation", included: true },
      { text: "Custom branding", included: true },
      { text: "API access", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "SLA & priority support", included: true },
    ],
    cta: "Contact Us",
    ctaAction: "contact_sales",
    isPopular: false,
    headerGradient: "from-blue-500 to-blue-400",
    buttonGradient: "from-blue-500 to-blue-400",
  },
} as const;

// Helper: Get plans as array (for UI iteration)
export const getPlansArray = (): PricingPlan[] => [
  PLANS.free,
  PLANS.pro,
  PLANS.enterprise,
];

// Helper: Check if a plan requires payment
export const requiresPayment = (planId: PlanId): boolean => {
  return planId === "pro";
};

// Helper: Get sales contact mailto link
export const getSalesContactLink = (): string => {
  const subject = encodeURIComponent("Enterprise Plan Inquiry - Quizethic AI");
  const body = encodeURIComponent(
    "Hi,\n\nI'm interested in the Enterprise plan for my organization.\n\nPlease share more details about:\n- Pricing\n- Team size options\n- Implementation timeline\n\nThank you!"
  );
  return `mailto:${PRICING_CONFIG.SALES_EMAIL}?subject=${subject}&body=${body}`;
};

// Type guard for valid plan IDs
export const isValidPlanId = (id: string): id is PlanId => {
  return id === "free" || id === "pro" || id === "enterprise";
};

// Type guard for valid user tiers
export const isValidUserTier = (tier: string): tier is UserTier => {
  return tier === "free" || tier === "pro" || tier === "enterprise";
};
