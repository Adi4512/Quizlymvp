import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OpenRouter } from "@openrouter/sdk";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { inferSyllabus } from "./services/syllabusInference.js";
import { generateQuiz } from "./services/quizGenerator.js";
// COMMENTED OUT: Razorpay imports - implementing different payment method
// import {
//   createProOrder,
//   verifyPayment,
//   fetchPayment,
//   getRazorpayKeyId,
//   PRO_PLAN,
// } from "./services/razorpayService.js";
import { PRO_PLAN } from "./services/razorpayService.js"; // Keep PRO_PLAN for reference
import {
  getUsageStatus,
  canGenerateQuiz,
  incrementUsage,
  // COMMENTED OUT: Razorpay-related imports - implementing different payment method
  // upgradeToPro,
  // recordPayment,
  getSubscription,
  TIER_LIMITS,
} from "./services/subscriptionService.js";
import {
  saveQuizResult,
  getUserStats,
  getRecentQuizzes,
  getProfileData,
  calculateScorePercentage,
} from "./services/statsService.js";

// Dodo Payments + Webhook + Supabase (for subscription updates)
import { dodo } from "./services/dodoClient.js";
import { Webhook } from "standardwebhooks";
import { createClient as createSbClient } from "@supabase/supabase-js";
// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from backend directory
dotenv.config({ path: join(__dirname, ".env") });

const app = express();
// Use raw body for Dodo webhook verification BEFORE JSON parser
app.use("/api/billing/webhook", express.raw({ type: "application/json" }));
const PORT: number = parseInt(process.env.PORT || "3000", 10);

// Middleware
app.use(cors());
app.use((req, res, next) => {
  // Avoid JSON parsing for webhook route to preserve raw body for signature verification
  if (req.originalUrl === "/api/billing/webhook") return next();
  return express.json()(req, res, next);
}); // Initialize OpenRouter SDK
const OPENROUTER_API_KEY: string | undefined = process.env.OPEN_ROUTER_API_KEY;
const openRouter = new OpenRouter({
  apiKey: OPENROUTER_API_KEY || "",
});

// Types for request body
interface GenerateQuizRequest {
  prompt: string; // Topic name (any topic in the world)
  difficulty: "Easy" | "Medium" | "Hard" | "Mix";
  numberOfQuestions?: number | string;
  userId?: string; // Required for tier checking
}

// Output validation - rejects exam metadata questions
function containsForbiddenContent(text: string): boolean {
  const forbiddenPatterns = [
    /what does \w+ stand for/i,
    /what is the full form/i,
    /where is \w+ located/i,
    /what is the age limit/i,
    /what is the eligibility/i,
    /when is \w+ exam conducted/i,
    /when is \w+ exam held/i,
    /exam date/i,
    /conducted by/i,
    /training academy/i,
    /training center/i,
    /admission process/i,
    /application process/i,
    /exam pattern/i,
    /marking scheme/i,
    /cut-off/i,
    /cutoff/i,
    /motto of/i,
    /motto is/i,
  ];

  return forbiddenPatterns.some((pattern) => pattern.test(text));
}

// Validate generated quiz
function validateQuiz(quiz: any): boolean {
  if (!quiz || !quiz.questions || !Array.isArray(quiz.questions)) {
    return false;
  }

  // Check each question for forbidden content
  for (const question of quiz.questions) {
    if (question.question && containsForbiddenContent(question.question)) {
      return false;
    }
  }

  return true;
}

// Simple test route
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Quizethic AI Backend API is running!" });
});

// ═══════════════════════════════════════════════════════════════════════════
// USER STATUS & QUOTA ROUTES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get user's subscription status and remaining quota
 * Frontend should call this to display limits and check before generating
 */
app.get("/api/user/status/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const status = await getUsageStatus(userId);

    res.json({
      success: true,
      ...status,
      limits: TIER_LIMITS[status.tier],
    });
  } catch (error) {
    console.error("Error fetching user status:", error);
    res.status(500).json({
      error: "Failed to fetch user status",
      // Return safe defaults
      tier: "free",
      quizzesToday: 0,
      dailyLimit: 5,
      remaining: 5,
      canGenerate: true,
      isUnlimited: false,
    });
  }
});

/**
 * Get subscription details for a user
 */
app.get(
  "/api/user/subscription/:userId",
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const subscription = await getSubscription(userId);

      res.json({
        success: true,
        subscription,
      });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ error: "Failed to fetch subscription" });
    }
  }
);

// ═══════════════════════════════════════════════════════════════════════════
// QUIZ GENERATION ROUTE (with tier enforcement)
// ═══════════════════════════════════════════════════════════════════════════

app.post(
  "/api/generate",
  async (req: Request<{}, {}, GenerateQuizRequest>, res: Response) => {
    try {
      const { prompt, difficulty, numberOfQuestions, userId } = req.body;

      if (!prompt || !difficulty) {
        return res
          .status(400)
          .json({ error: "Prompt and difficulty are required" });
      }

      // ────────────────────────────────────────────────────────────────
      // TIER CHECK: Verify user can generate a quiz
      // ────────────────────────────────────────────────────────────────
      if (userId) {
        const { allowed, reason, status } = await canGenerateQuiz(userId);

        if (!allowed) {
          console.log(`🚫 User ${userId} blocked: ${reason}`);
          return res.status(403).json({
            error: "Daily limit reached",
            message: reason,
            status, // Include usage status for frontend
            upgradeRequired: true,
          });
        }

        console.log(
          `✅ User ${userId} authorized (${status.tier}, ${
            status.quizzesToday
          }/${status.isUnlimited ? "∞" : status.dailyLimit} today)`
        );
      }

      // Validate numberOfQuestions
      const numQuestions = numberOfQuestions
        ? parseInt(String(numberOfQuestions), 10)
        : 10; // Default to 10 if not provided

      if (isNaN(numQuestions) || numQuestions < 1 || numQuestions > 20) {
        return res.status(400).json({
          error: "numberOfQuestions must be a number between 1 and 20",
        });
      }

      if (!OPENROUTER_API_KEY) {
        console.error(
          "❌ OPEN_ROUTER_API_KEY not found in environment variables"
        );
        return res.status(500).json({
          error: "OpenRouter API key is not configured",
        });
      }

      // ────────────────────────────────────────────────────────────────
      // PHASE 1: SYLLABUS INFERENCE
      // ────────────────────────────────────────────────────────────────
      console.log(`🔍 Phase 1: Inferring syllabus for "${prompt}"...`);

      let syllabus;
      try {
        syllabus = await inferSyllabus(prompt, openRouter);
        console.log(`✅ Syllabus inferred:`, {
          identifiedAs: syllabus.identifiedAs,
          subjectsCount: syllabus.subjects.length,
          subjects: syllabus.subjects,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error(`❌ Syllabus inference failed:`, errorMessage);
        return res.status(400).json({
          error: "Failed to infer syllabus for this topic",
          message: errorMessage,
        });
      }

      // ────────────────────────────────────────────────────────────────
      // PHASE 2: QUIZ GENERATION (with validation and retry)
      // ────────────────────────────────────────────────────────────────
      console.log(
        `📝 Phase 2: Generating ${numQuestions} questions at ${difficulty} difficulty...`
      );

      let quiz;
      let attempts = 0;
      const maxAttempts = 2; // Regenerate once if invalid

      while (attempts < maxAttempts) {
        attempts++;

        try {
          quiz = await generateQuiz(
            {
              topic: prompt,
              difficulty,
              numberOfQuestions: numQuestions,
              subjects: syllabus.subjects,
              identifiedAs: syllabus.identifiedAs,
            },
            openRouter
          );

          // Validate quiz
          if (validateQuiz(quiz)) {
            console.log(`✅ Valid quiz generated on attempt ${attempts}`);
            break;
          } else {
            console.log(
              `⚠️ Invalid quiz detected on attempt ${attempts}, regenerating...`
            );
            if (attempts >= maxAttempts) {
              console.error(
                `❌ Failed to generate valid quiz after ${maxAttempts} attempts`
              );
              return res.status(500).json({
                error: "Failed to generate valid questions",
                message:
                  "Generated questions contained forbidden content. Please try again.",
              });
            }
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.error(`❌ Quiz generation failed:`, errorMessage);

          if (attempts >= maxAttempts) {
            return res.status(500).json({
              error: "Failed to generate quiz",
              message: errorMessage,
            });
          }
        }
      }

      // ────────────────────────────────────────────────────────────────
      // INCREMENT USAGE (only after successful generation)
      // ────────────────────────────────────────────────────────────────
      let newUsageCount = 0;
      if (userId) {
        newUsageCount = await incrementUsage(userId);
        console.log(
          `📊 Usage incremented for ${userId}: ${newUsageCount} quizzes today`
        );
      }

      // Convert quiz to JSON string for frontend compatibility
      const responseContent = JSON.stringify(quiz, null, 2);

      // Get updated status to return to frontend
      const updatedStatus = userId ? await getUsageStatus(userId) : null;

      // Return the validated quiz
      res.json({
        success: true,
        response: responseContent,
        usage: updatedStatus, // Include updated usage for frontend
      });
    } catch (error) {
      console.error("Error calling OpenRouter API:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        error: "Internal server error",
        message: errorMessage,
      });
    }
  }
);

// ═══════════════════════════════════════════════════════════════════════════
// USER STATS & PROFILE ROUTES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Save quiz result after user completes a quiz
 */
interface SaveQuizResultRequest {
  userId: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Mix";
  totalQuestions: number;
  correctAnswers: number;
  timeTakenSeconds?: number;
}

app.post(
  "/api/quiz/result",
  async (req: Request<{}, {}, SaveQuizResultRequest>, res: Response) => {
    try {
      const {
        userId,
        topic,
        difficulty,
        totalQuestions,
        correctAnswers,
        timeTakenSeconds,
      } = req.body;

      if (
        !userId ||
        !topic ||
        !difficulty ||
        totalQuestions === undefined ||
        correctAnswers === undefined
      ) {
        return res.status(400).json({
          error:
            "Missing required fields: userId, topic, difficulty, totalQuestions, correctAnswers",
        });
      }

      const scorePercentage = calculateScorePercentage(
        correctAnswers,
        totalQuestions
      );

      console.log(
        `📊 Saving quiz result for ${userId}: ${correctAnswers}/${totalQuestions} (${scorePercentage}%)`
      );

      const result = await saveQuizResult({
        user_id: userId,
        topic,
        difficulty,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        score_percentage: scorePercentage,
        time_taken_seconds: timeTakenSeconds,
      });

      // Get updated stats to return
      const stats = await getUserStats(userId);

      res.json({
        success: true,
        result,
        stats, // Updated stats after this quiz
      });
    } catch (error) {
      console.error("Error saving quiz result:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        error: "Failed to save quiz result",
        message: errorMessage,
      });
    }
  }
);

/**
 * Get user stats
 */
app.get("/api/user/stats/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const stats = await getUserStats(userId);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
});

/**
 * Get user profile data (stats + recent quizzes)
 */
app.get("/api/user/profile/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const profileData = await getProfileData(userId);

    res.json({
      success: true,
      ...profileData,
    });
  } catch (error) {
    console.error("Error fetching profile data:", error);
    res.status(500).json({ error: "Failed to fetch profile data" });
  }
});

/**
 * Get recent quizzes for a user
 */
app.get(
  "/api/user/recent-quizzes/:userId",
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 5;

      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const recentQuizzes = await getRecentQuizzes(userId, limit);

      res.json({
        success: true,
        recentQuizzes,
      });
    } catch (error) {
      console.error("Error fetching recent quizzes:", error);
      res.status(500).json({ error: "Failed to fetch recent quizzes" });
    }
  }
);

// ═══════════════════════════════════════════════════════════════════════════
// RAZORPAY PAYMENT ROUTES (Pro tier only)
// ═══════════════════════════════════════════════════════════════════════════
//
// COMMENTED OUT: Implementing different payment method
//
// Payment flow:
// - Free tier: No payment required, handled client-side
// - Pro tier: Uses these routes for Razorpay checkout
// - Enterprise tier: No payment, "Contact Us" handled client-side
//

// COMMENTED OUT: Get Razorpay key ID (safe to expose to frontend)
app.get("/api/payment/key", (_req: Request, res: Response) => {
  // Return error while payment system is being upgraded
  return res.status(503).json({
    error: "Payment system is being upgraded",
    message: "Please check back soon!",
  });
});

// Get Pro plan details (the only paid plan) - Keep this for pricing display
app.get("/api/payment/pro-plan", (_req: Request, res: Response) => {
  res.json({ plan: PRO_PLAN });
});

// COMMENTED OUT: Create order for Pro subscription
interface CreateProOrderRequest {
  userId: string;
  userEmail: string;
  userName?: string;
}

app.post(
  "/api/payment/create-order",
  async (req: Request<{}, {}, CreateProOrderRequest>, res: Response) => {
    // Return error while payment system is being upgraded
    return res.status(503).json({
      error: "Payment system is being upgraded",
      message: "Please check back soon!",
    });

    // COMMENTED OUT: Razorpay order creation
    // try {
    //   const { userId, userEmail, userName } = req.body;

    //   if (!userId || !userEmail) {
    //     return res.status(400).json({
    //       error: "userId and userEmail are required",
    //     });
    //   }

    //   console.log(`💳 Creating Pro order for user: ${userEmail}`);

    //   const order = await createProOrder({
    //     userId,
    //     userEmail,
    //     userName,
    //   });

    //   console.log(`✅ Order created: ${order.id}`);

    //   res.json({
    //     success: true,
    //     order: {
    //       id: order.id,
    //       amount: order.amount,
    //       currency: order.currency,
    //       receipt: order.receipt,
    //     },
    //     plan: PRO_PLAN,
    //     targetTier: "pro", // User will be upgraded to this tier on success
    //   });
    // } catch (error) {
    //   console.error("Error creating order:", error);
    //   const errorMessage =
    //     error instanceof Error ? error.message : "Unknown error";
    //   res.status(500).json({
    //     error: "Failed to create order",
    //     message: errorMessage,
    //   });
    // }
  }
);

// COMMENTED OUT: Verify payment and upgrade user to Pro
interface VerifyProPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  userId: string;
}

app.post(
  "/api/payment/verify",
  async (req: Request<{}, {}, VerifyProPaymentRequest>, res: Response) => {
    // Return error while payment system is being upgraded
    return res.status(503).json({
      error: "Payment system is being upgraded",
      message: "Please check back soon!",
    });

    // COMMENTED OUT: Razorpay payment verification
    // try {
    //   const {
    //     razorpay_order_id,
    //     razorpay_payment_id,
    //     razorpay_signature,
    //     userId,
    //   } = req.body;

    //   if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    //     return res.status(400).json({
    //       error: "Missing payment verification details",
    //     });
    //   }

    //   if (!userId) {
    //     return res.status(400).json({
    //       error: "userId is required",
    //     });
    //   }

    //   console.log(`🔐 Verifying Pro payment: ${razorpay_payment_id}`);

    //   // Verify signature
    //   const isValid = verifyPayment({
    //     razorpay_order_id,
    //     razorpay_payment_id,
    //     razorpay_signature,
    //   });

    //   if (!isValid) {
    //     console.error(
    //       `❌ Invalid payment signature for: ${razorpay_payment_id}`
    //     );
    //     return res.status(400).json({
    //       error: "Payment verification failed",
    //       message: "Invalid signature",
    //     });
    //   }

    //   // Fetch payment details to confirm capture
    //   const payment = await fetchPayment(razorpay_payment_id);

    //   if (payment.status !== "captured") {
    //     console.error(`❌ Payment not captured: ${payment.status}`);
    //     return res.status(400).json({
    //       error: "Payment not captured",
    //       message: `Payment status: ${payment.status}`,
    //     });
    //   }

    //   console.log(`✅ Pro payment verified: ${razorpay_payment_id}`);

    //   // ────────────────────────────────────────────────────────────────
    //   // RECORD PAYMENT & UPGRADE SUBSCRIPTION
    //   // ────────────────────────────────────────────────────────────────
    //   try {
    //     // Record payment in database
    //     await recordPayment(
    //       userId,
    //       razorpay_order_id,
    //       razorpay_payment_id,
    //       razorpay_signature,
    //       payment.amount as number,
    //       "captured"
    //     );
    //     console.log(`📝 Payment recorded for user: ${userId}`);

    //     // Upgrade user to Pro (30 days)
    //     const subscription = await upgradeToPro(
    //       userId,
    //       razorpay_payment_id,
    //       razorpay_order_id,
    //       30 // 30 days subscription
    //     );
    //     console.log(
    //       `🎉 User ${userId} upgraded to Pro until ${subscription.expires_at}`
    //     );
    //   } catch (dbError) {
    //     // Log but don't fail - payment was successful
    //     console.error(
    //       "⚠️ Database update error (payment still valid):",

    //       dbError
    //     );
    //   }

    //   res.json({
    //     success: true,
    //     message: "Payment verified - upgraded to Pro!",
    //     payment: {
    //       id: payment.id,
    //       amount: payment.amount,
    //       currency: payment.currency,
    //       status: payment.status,
    //       method: payment.method,
    //     },
    //     tier: "pro", // New user tier
    //     userId,
    //   });
    // } catch (error) {
    //   console.error("Error verifying payment:", error);
    //   const errorMessage =
    //     error instanceof Error ? error.message : "Unknown error";
    //   res.status(500).json({
    //     error: "Payment verification failed",
    //     message: errorMessage,
    //   });
    // }
  }
);

/**
 * Create Dodo subscription and return hosted checkout link
 * Body: { userId: string, email: string, name: string, country?: string }
 */
interface SubscribeRequest {
  userId: string;
  email: string;
  name: string;
  country?: string;
}

app.post(
  "/api/billing/subscribe",
  async (req: Request<{}, {}, SubscribeRequest>, res: Response) => {
    try {
      const { userId, email, name, country } = req.body || {};
      if (!userId || !email || !name) {
        return res
          .status(400)
          .json({ error: "userId, email, and name are required" });
      }

      const returnUrl = `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/billing/return`;

      // Create subscription with hosted checkout link
      const sub = await dodo.subscriptions.create({
        billing: { country: (country || "IN") as any },
        customer: { email, name },
        product_id: "pdt_0NVu3Ox3QqNhrllVCU4vN",
        quantity: 1,
        allowed_payment_method_types: [
          "credit",
          "debit",
          "upi_collect",
          "upi_intent",
        ],
        payment_link: true,
        return_url: returnUrl,
        show_saved_payment_methods: true,
        metadata: { user_id: userId },
      } as any);

      const paymentLink =
        (sub as any)?.payment_link ||
        (sub as any)?.payment?.payment_link ||
        (sub as any)?.link;

      if (!paymentLink) {
        return res
          .status(502)
          .json({ error: "Failed to obtain payment link from Dodo" });
      }

      return res.json({ success: true, paymentLink });
    } catch (err: any) {
      console.error(
        "Dodo subscription creation error:",
        err?.response?.data || err
      );
      return res.status(500).json({
        error: "Failed to create subscription",
        details: err?.response?.data || err?.message || "unknown",
      });
    }
  }
);

/**
 * Helper: Update user subscription tier in Supabase with Dodo payment details
 */
interface DodoPaymentDetails {
  subscriptionId?: string;
  customerId?: string;
  paymentId?: string;
}

async function setUserTier(
  userId: string | undefined,
  tier: "free" | "pro" | "enterprise",
  status: "active" | "expired" | "cancelled",
  expiresAt: string | null,
  dodoDetails?: DodoPaymentDetails
): Promise<void> {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase admin credentials missing");
      return;
    }
    if (!userId) {
      console.warn("setUserTier called without userId; skipping update.");
      return;
    }

    const supabase = createSbClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const updateData: Record<string, any> = {
      user_id: userId,
      tier,
      status,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    };

    // Add Dodo payment details if provided
    if (dodoDetails?.subscriptionId) {
      updateData.dodo_subscription_id = dodoDetails.subscriptionId;
    }
    if (dodoDetails?.customerId) {
      updateData.dodo_customer_id = dodoDetails.customerId;
    }
    if (dodoDetails?.paymentId) {
      updateData.dodo_payment_id = dodoDetails.paymentId;
    }

    const { error } = await supabase
      .from("user_subscriptions")
      .upsert(updateData, { onConflict: "user_id" });

    if (error) {
      console.error("Supabase upsert subscription failed:", error);
    } else {
      console.log(
        `Subscription updated for user ${userId}: ${tier}/${status}`,
        dodoDetails || ""
      );
    }
  } catch (e) {
    console.error("setUserTier error:", e);
  }
}

/**
 * Dodo Webhook
 * Uses raw body for signature verification. Raw parser is mounted earlier via:
 * app.use("/api/billing/webhook", express.raw({ type: "application/json" }));
 */
app.post("/api/billing/webhook", async (req: Request, res: Response) => {
  try {
    const secret = process.env.DODO_WEBHOOK_SECRET || "";
    if (!secret) {
      console.error("DODO_WEBHOOK_SECRET not set");
      return res.status(500).json({ error: "Webhook secret not configured" });
    }

    const webhook = new Webhook(secret);
    const headers = {
      "webhook-id": req.headers["webhook-id"] as string,
      "webhook-signature": req.headers["webhook-signature"] as string,
      "webhook-timestamp": req.headers["webhook-timestamp"] as string,
    };

    const payload =
      req.body instanceof Buffer
        ? req.body.toString("utf8")
        : typeof req.body === "string"
        ? req.body
        : JSON.stringify(req.body || {});

    // Verify signature
    await webhook.verify(payload, headers);

    // Acknowledge quickly to avoid retries
    res.status(200).json({ received: true });

    // Process asynchronously
    process.nextTick(async () => {
      try {
        const event = JSON.parse(payload);
        console.log(`📨 Dodo webhook received: ${event?.type}`);
        console.log(`📦 Full webhook payload:`, JSON.stringify(event, null, 2));

        // Extract common Dodo data - try multiple paths
        const data = event?.data || {};
        const subscription = data?.subscription || data;

        // Try multiple paths to find metadata with user_id
        const metadata =
          data?.metadata ||
          subscription?.metadata ||
          data?.customer?.metadata ||
          {};

        // Try multiple paths to find userId
        const userId =
          metadata?.user_id ||
          data?.metadata?.user_id ||
          subscription?.metadata?.user_id ||
          data?.customer?.metadata?.user_id;

        console.log(`👤 Extracted userId: ${userId}`);

        // Helper to get Supabase client for payments recording
        const getSupabase = () => {
          const supabaseUrl = process.env.SUPABASE_URL;
          const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          if (!supabaseUrl || !supabaseServiceKey) return null;
          return createSbClient(supabaseUrl, supabaseServiceKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          });
        };

        switch (event?.type) {
          case "subscription.active":
          case "subscription.renewed": {
            const dodoDetails: DodoPaymentDetails = {
              subscriptionId:
                data?.subscription_id ||
                subscription?.subscription_id ||
                subscription?.id ||
                data?.id,
              customerId:
                data?.customer?.customer_id ||
                subscription?.customer?.customer_id ||
                data?.customer_id,
              paymentId: data?.payment_id,
            };

            console.log(`✅ Activating Pro for user ${userId}`, dodoDetails);

            if (userId) {
              await setUserTier(userId, "pro", "active", null, dodoDetails);
            } else {
              console.error("❌ No userId found in webhook metadata!");
            }
            break;
          }
          case "subscription.cancelled":
          case "subscription.expired": {
            const dodoDetails: DodoPaymentDetails = {
              subscriptionId:
                data?.subscription_id ||
                subscription?.subscription_id ||
                subscription?.id,
            };

            console.log(`❌ Cancelling Pro for user ${userId}`);
            if (userId) {
              await setUserTier(userId, "free", "cancelled", null, dodoDetails);
            }
            break;
          }
          case "payment.succeeded": {
            console.log(`💰 Payment succeeded for user ${userId}:`, {
              paymentId: data?.payment_id,
              amount: data?.total_amount || data?.amount,
              currency: data?.currency,
            });

            // Record payment in payments table
            if (userId) {
              const supabase = getSupabase();
              if (supabase) {
                const { error } = await supabase.from("payments").insert({
                  user_id: userId,
                  dodo_payment_id: data?.payment_id,
                  dodo_subscription_id:
                    data?.subscription_id || subscription?.subscription_id,
                  dodo_customer_id: data?.customer?.customer_id,
                  amount: data?.total_amount || data?.amount || 0,
                  currency: data?.currency || "INR",
                  status: "succeeded",
                  plan_id: "pro",
                });
                if (error) {
                  console.error("Failed to record payment:", error);
                } else {
                  console.log("✅ Payment recorded in database");
                }
              }
            }
            break;
          }
          case "payment.failed": {
            console.log(`⚠️ Payment failed for user ${userId}:`, {
              paymentId: data?.payment_id,
              reason: data?.failure_reason || data?.error_message,
            });
            break;
          }
          default:
            console.log(`ℹ️ Unhandled webhook event: ${event?.type}`);
            break;
        }
      } catch (e) {
        console.error("Webhook handler error:", e);
      }
    });
  } catch (e) {
    console.error("Webhook verification failed:", e);
    return res.status(400).json({ error: "Invalid signature" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Quiz endpoint: POST http://localhost:${PORT}/api/generate`);
  console.log(
    `👤 Status endpoint: GET http://localhost:${PORT}/api/user/status/:userId`
  );
  // COMMENTED OUT: Payment endpoint disabled while implementing new payment method
  // console.log(
  //   `💳 Payment endpoint: POST http://localhost:${PORT}/api/payment/create-order`
  // );
});
