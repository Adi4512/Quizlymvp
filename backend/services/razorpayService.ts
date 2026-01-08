/**
 * Razorpay Payment Service
 * ========================
 * Handles payment processing for Pro tier ONLY.
 *
 * Payment Flow:
 * - Free tier: No payment required
 * - Pro tier: Razorpay checkout (this service)
 * - Enterprise tier: No payment, contact sales
 */

import Razorpay from "razorpay";
import crypto from "crypto";

// Import shared pricing config
// Note: In a monorepo, you'd use proper path aliases. Here we duplicate the essential config.
// The source of truth is shared/pricing.config.ts

// ═══════════════════════════════════════════════════════════════════════════
// PRICING CONFIGURATION (synced from shared/pricing.config.ts)
// ═══════════════════════════════════════════════════════════════════════════

export type UserTier = "free" | "pro" | "enterprise";

// Pro plan pricing - the ONLY paid plan
export const PRO_PLAN = {
  id: "pro" as const,
  name: "PRO",
  price: 1, // ₹299 - adjust as needed (₹199-₹399 range)
  priceInPaise: 100, // price * 100 for Razorpay
  currency: "INR",
  features: [
    "Unlimited quizzes",
    "Advanced AI with explanations",
    "All difficulty levels",
    "Performance analytics",
    "Priority support",
    "Custom topics",
    "Export & share quizzes",
  ],
};

// Legacy PLANS export for backward compatibility with existing routes
// Only Pro plan triggers payment; others are handled differently
export const PLANS = {
  pro: PRO_PLAN,
} as const;

export type PlanType = keyof typeof PLANS;

// ═══════════════════════════════════════════════════════════════════════════
// RAZORPAY INSTANCE (Lazy initialization)
// ═══════════════════════════════════════════════════════════════════════════

let razorpayInstance: Razorpay | null = null;

const getRazorpayInstance = (): Razorpay => {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error(
        "Razorpay API keys not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env"
      );
    }

    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpayInstance;
};

// ═══════════════════════════════════════════════════════════════════════════
// ORDER CREATION (Pro tier only)
// ═══════════════════════════════════════════════════════════════════════════

interface CreateOrderOptions {
  userId: string;
  userEmail: string;
  userName?: string;
}

interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

/**
 * Create a Razorpay order for Pro subscription
 * This is the ONLY payment flow in the system.
 */
export const createProOrder = async (
  options: CreateOrderOptions
): Promise<RazorpayOrder> => {
  const { userId, userEmail } = options;

  // Receipt max 40 chars - use shortened format
  const shortId = userId.slice(0, 8); // First 8 chars of UUID
  const timestamp = Date.now().toString(36); // Base36 timestamp (shorter)
  const receipt = `pro_${shortId}_${timestamp}`;

  try {
    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create({
      amount: PRO_PLAN.priceInPaise,
      currency: PRO_PLAN.currency,
      receipt: receipt,
      notes: {
        planId: PRO_PLAN.id,
        userId: userId,
        userEmail: userEmail,
        planName: PRO_PLAN.name,
        tier: "pro", // Target tier after successful payment
      },
    });

    return order as RazorpayOrder;
  } catch (error: any) {
    // Log full error for debugging
    console.error("Razorpay order creation error:", error);

    // Razorpay SDK returns error in error.error format
    const errorMessage =
      error?.error?.description ||
      error?.message ||
      JSON.stringify(error) ||
      "Unknown error";
    throw new Error(`Failed to create Razorpay order: ${errorMessage}`);
  }
};

// Legacy function for backward compatibility
export const createOrder = async (
  options: CreateOrderOptions & { planId?: string }
): Promise<RazorpayOrder> => {
  // Ignore planId - we only support Pro tier payment
  return createProOrder(options);
};

// ═══════════════════════════════════════════════════════════════════════════
// PAYMENT VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════

interface VerifyPaymentOptions {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/**
 * Verify Razorpay payment signature
 * Returns true if signature is valid
 */
export const verifyPayment = (options: VerifyPaymentOptions): boolean => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    options;

  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    throw new Error("Razorpay key secret not configured");
  }

  // Create expected signature: HMAC SHA256 of order_id|payment_id
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(body)
    .digest("hex");

  return expectedSignature === razorpay_signature;
};

// ═══════════════════════════════════════════════════════════════════════════
// PAYMENT & ORDER FETCHING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch payment details by payment ID
 */
export const fetchPayment = async (paymentId: string) => {
  try {
    const razorpay = getRazorpayInstance();
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to fetch payment: ${errorMessage}`);
  }
};

/**
 * Fetch order details by order ID
 */
export const fetchOrder = async (orderId: string) => {
  try {
    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.fetch(orderId);
    return order;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to fetch order: ${errorMessage}`);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC KEY (safe to expose to frontend)
// ═══════════════════════════════════════════════════════════════════════════

export const getRazorpayKeyId = (): string => {
  return process.env.RAZORPAY_KEY_ID || "";
};

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default {
  createProOrder,
  createOrder, // Legacy
  verifyPayment,
  fetchPayment,
  fetchOrder,
  getRazorpayKeyId,
  PRO_PLAN,
  PLANS,
};
