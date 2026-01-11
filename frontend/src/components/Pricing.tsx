/**
 * Pricing Page Component
 * ======================
 * B2B-first SaaS pricing with 3 tiers:
 * - Free: "Start Free" → navigates to dashboard
 * - Pro: "Upgrade to Pro" → Razorpay checkout
 * - Enterprise: "Contact Us" → mailto sales
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../lib/api";
import Navbar from "./Navbar";
import { supabase, getTierFromUser, UserTier } from "../lib/supabase";
import { Modal, useModal } from "./ui/modal";
import {
  IconHome,
  IconDashboard,
  IconUserBolt,
  IconSettings,
  IconMenu2,
  IconX,
  IconCreditCard,
  IconInfoCircle,
  IconMail,
} from "@tabler/icons-react";

// ═══════════════════════════════════════════════════════════════════════════
// PRICING CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

// Centralized config - sync with backend/shared config
const PRICING_CONFIG = {
  PRO_PRICE_INR: 3.5, // ₹199-₹399 range
  SALES_EMAIL: "quizethicai@protonmail.com",
};

type PlanId = "free" | "pro" | "enterprise";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: PlanId;
  name: string;
  price: string; // Display price
  priceValue: number; // -1 for enterprise (custom)
  period: string;
  description: string;
  features: PlanFeature[];
  cta: string;
  ctaAction: "start_free" | "checkout" | "contact_sales";
  popular: boolean;
  headerGradient: string;
  buttonGradient: string;
}

// 3-tier plan definitions
const plans: Plan[] = [
  {
    id: "free",
    name: "FREE",
    price: "$0",
    priceValue: 0,
    period: "forever",
    description: "Perfect for getting started",
    features: [
      { text: "5 quizzes per day", included: true },
      { text: "Basic AI question generation", included: true },
      { text: "Standard difficulty levels", included: true },
      { text: "Community support", included: true },
      { text: "Performance analytics", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Start Free",
    ctaAction: "start_free",
    popular: false,
    headerGradient: "from-slate-500 to-slate-400",
    buttonGradient: "from-slate-600 to-slate-500",
  },
  {
    id: "pro",
    name: "PRO",
    price: `$${PRICING_CONFIG.PRO_PRICE_INR}`,
    priceValue: PRICING_CONFIG.PRO_PRICE_INR,
    period: "/month",
    description: "For serious learners & educators",
    features: [
      { text: "Unlimited quizzes", included: true },
      { text: "Advanced AI with explanations", included: true },
      { text: "All difficulty levels", included: true },
      { text: "Performance analytics", included: true },
      { text: "Priority support", included: true },
      { text: "Custom topics", included: true },
    ],
    cta: "Upgrade to Pro",
    ctaAction: "checkout",
    popular: true, // Highlighted as recommended
    headerGradient: "from-pink-500 to-pink-400",
    buttonGradient: "from-pink-500 to-pink-400",
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    price: "Custom",
    priceValue: -1, // Signals "contact us"
    period: "pricing",
    description: "For coaching centers & institutions",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Unlimited team members", included: true },
      { text: "Admin dashboard", included: true },
      { text: "Bulk quiz creation", included: true },
      { text: "Custom branding", included: true },
      { text: "Dedicated account manager", included: true },
    ],
    cta: "Contact Us",
    ctaAction: "contact_sales",
    popular: false,
    headerGradient: "from-blue-500 to-blue-400",
    buttonGradient: "from-blue-500 to-blue-400",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const Pricing = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUserTier, setCurrentUserTier] = useState<UserTier>("free");
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal for notifications
  const { modalProps, showSuccess, showError, showWarning } = useModal();

  // Mobile menu links
  const mobileMenuLinks = [
    { label: "Home", icon: IconHome, path: "/" },
    { label: "Dashboard", icon: IconDashboard, path: "/dashboard" },
    { label: "Profile", icon: IconUserBolt, path: "/profile" },
    { label: "Settings", icon: IconSettings, path: "/settings" },
    { label: "Pricing", icon: IconCreditCard, path: "/pricing" },
    { label: "About Us", icon: IconInfoCircle, path: "/about" },
    { label: "Contact Us", icon: IconMail, path: "/contactus" },
  ];

  // Scroll to top on mount & load user data
  useEffect(() => {
    window.scrollTo(0, 0);

    const loadUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || "");
        setUserName(
          session.user.user_metadata?.full_name || session.user.email || "User"
        );
        setCurrentUserTier(getTierFromUser(session.user));
      }
    };

    loadUser();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // CTA HANDLERS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Handle plan CTA click based on action type
   */
  const handlePlanAction = async (plan: Plan) => {
    switch (plan.ctaAction) {
      case "start_free":
        // Free tier - just navigate to dashboard
        navigate("/dashboard");
        break;

      case "checkout":
        // Pro tier - initiate Razorpay payment
        await handleProCheckout();
        break;

      case "contact_sales":
        // Enterprise - navigate to contact page
        navigate("/contactus");
        break;
    }
  };

  /**
   * COMMENTED OUT: Razorpay - implementing different payment method
   * Handle Pro tier checkout via Razorpay
   * This is the ONLY payment flow in the system
   */
  const handleProCheckout = async () => {
    // Guard: user must be logged in
    if (!userId || !userEmail) {
      showWarning("Sign In Required", "Please sign in to upgrade to Pro.", {
        primaryAction: { label: "Sign In", onClick: () => navigate("/") },
      });
      return;
    }

    // Guard: Already Pro or Enterprise
    if (currentUserTier === "pro" || currentUserTier === "enterprise") {
      showSuccess(
        "Already Subscribed",
        `You're already on the ${currentUserTier.toUpperCase()} plan!`,
        {
          primaryAction: {
            label: "Go to Dashboard",
            onClick: () => navigate("/dashboard"),
          },
        }
      );
      return;
    }

    setIsProcessing(true);

    try {
      const resp = await axios.post(`${API_URL}/api/billing/subscribe`, {
        userId,
        email: userEmail,
        name: userName || "User",
        country: "IN",
      });

      const paymentLink = resp?.data?.paymentLink;
      if (!paymentLink) throw new Error("No paymentLink in response");

      window.location.href = paymentLink;
    } catch (err: any) {
      console.error("Checkout error:", err?.response?.data || err);
      console.log("API_URL", API_URL);
      setIsProcessing(false);
      showError(
        "Checkout Failed",
        "Unable to start checkout. Please try again."
      );
    }
  };

  /**
   * Get button text based on plan and user state
   */
  const getButtonText = (plan: Plan): string => {
    if (isProcessing && plan.id === "pro") {
      return "Processing...";
    }

    // Show "Current Plan" if user is on this tier
    if (plan.id === currentUserTier) {
      return "Current Plan";
    }

    // Pro users see "Current Plan" on Pro, normal CTAs elsewhere
    if (currentUserTier === "pro" && plan.id === "free") {
      return plan.cta; // They can still "Start Free" (downgrade concept)
    }

    // Enterprise users - they have everything
    if (currentUserTier === "enterprise") {
      if (plan.id === "enterprise") return "Current Plan";
      return plan.cta;
    }

    return plan.cta;
  };

  /**
   * Check if button should be disabled
   */
  const isButtonDisabled = (plan: Plan): boolean => {
    if (isProcessing) return true;
    if (plan.id === currentUserTier) return true; // Can't buy current plan
    return false;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/static/pricingbg.webp')" }}
      />
      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-purple-900/20" />

      {/* Desktop Header */}
      <header className="hidden md:flex items-center px-8 lg:px-16 pt-6 pb-4 relative z-10">
        <div className="flex-1">
          <button
            onClick={() => navigate("/")}
            className="cursor-pointer flex items-center gap-2"
          >
            <img
              src="/static/quizethic-favicon.svg"
              alt="Quizethic AI Logo"
              className="w-10 h-10 rounded-xl"
            />
            <span className="font-bold text-lg text-white drop-shadow">
              Quizethic AI
            </span>
          </button>
        </div>
        <div className="flex-1 flex justify-center">
          <Navbar />
        </div>
        <div className="flex-1"></div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-5 pt-6 pb-4 relative z-10">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition-colors"
        >
          <IconMenu2 className="text-white h-5 w-5" />
        </button>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <img
            src="/static/quizethic-favicon.svg"
            alt="Quizethic AI Logo"
            className="w-8 h-8 rounded-xl"
          />
          <span className="font-bold text-base text-white drop-shadow">
            Quizethic AI
          </span>
        </button>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

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
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative z-10 px-4 sm:px-6 lg:px-8 pb-12 pt-8 sm:pt-12 md:pt-16">
        <div className="max-w-7xl mx-auto bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)] p-6 sm:p-8 lg:p-12">
          {/* Hero Section */}
          <section className="text-center mb-12 max-w-3xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold text-white mb-4 leading-tight drop-shadow-lg">
              Simple, transparent pricing
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-300 to-white mx-auto mb-4 rounded-full"></div>
            <p className="text-white/90 text-base sm:text-lg leading-relaxed font-medium">
              Choose the plan that fits your needs. Start free, upgrade anytime.
            </p>
          </section>

          {/* Pricing Cards - 3 Tiers */}
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl border border-white/30 hover:border-white/50 ${
                    plan.popular ? "scale-105 md:scale-110 z-20" : "z-10"
                  }`}
                >
                  {/* Popular badge for Pro */}
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                      RECOMMENDED
                    </div>
                  )}

                  {/* Gradient Header */}
                  <div
                    className={`bg-gradient-to-r ${plan.headerGradient} py-6 px-6`}
                  >
                    <h3 className="text-white font-bold text-lg uppercase tracking-wide text-center drop-shadow">
                      {plan.name}
                    </h3>
                  </div>

                  {/* Price Section */}
                  <div className="px-6 py-6 text-center">
                    {plan.priceValue === -1 ? (
                      // Enterprise: "Custom pricing"
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-3xl sm:text-4xl font-bold text-white">
                          {plan.price}
                        </span>
                        <span className="text-white/70 text-base mt-1">
                          {plan.period}
                        </span>
                      </div>
                    ) : (
                      // Free & Pro: Show price
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl sm:text-5xl font-bold text-white">
                          {plan.price}
                        </span>
                        <span className="text-white/70 text-lg">
                          {plan.period}
                        </span>
                      </div>
                    )}
                    <p className="text-white/80 text-sm mt-2">
                      {plan.description}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="px-6 pb-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className={`flex items-center gap-3 ${
                            feature.included
                              ? "text-white"
                              : "text-white/40 line-through"
                          }`}
                        >
                          {feature.included ? (
                            <svg
                              className="w-5 h-5 text-green-400 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2.5}
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5 text-red-400 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2.5}
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          )}
                          <span className="text-sm sm:text-base">
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <div className="px-6 pb-6">
                    <button
                      onClick={() => handlePlanAction(plan)}
                      disabled={isButtonDisabled(plan)}
                      className={`w-full py-3 rounded-xl font-semibold text-white text-sm sm:text-base transition-all duration-300 hover:opacity-90 active:scale-[0.98] bg-gradient-to-r ${plan.buttonGradient} shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2`}
                    >
                      {isProcessing && plan.id === "pro" ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        getButtonText(plan)
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center drop-shadow-lg">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/15 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/20">
                <h3 className="text-white font-semibold text-base mb-2">
                  Can I try before I upgrade?
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Yes! The Free plan lets you explore core features. Upgrade to
                  Pro when you need more.
                </p>
              </div>
              <div className="bg-white/15 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/20">
                <h3 className="text-white font-semibold text-base mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  We accept all major credit/debit cards, UPI, and net banking.
                  Both national and international payments are accepted.
                  Everything is accepted!
                </p>
              </div>
              <div className="bg-white/15 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/20">
                <h3 className="text-white font-semibold text-base mb-2">
                  What's included in Enterprise?
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Enterprise includes custom pricing, team management, branding,
                  and dedicated support. Contact us for details.
                </p>
              </div>
              <div className="bg-white/15 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/20">
                <h3 className="text-white font-semibold text-base mb-2">
                  Can I cancel anytime?
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Yes! You can cancel your Pro subscription at any time. No
                  questions asked.
                </p>
              </div>
            </div>
          </section>

          {/* Back to Home */}
        </div>
      </main>

      {/* Notification Modal */}
      <Modal {...modalProps} />
    </div>
  );
};

export default Pricing;
