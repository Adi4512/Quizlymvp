/**
 * Settings Component
 * ==================
 * Subscription management, account settings, and billing history.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { motion } from "framer-motion";
import axios from "axios";
import {
  supabase,
  getTierFromUser,
  UserTier,
  updateUserTier,
} from "../lib/supabase";
import { API_URL } from "../lib/api";
import { Modal, useModal } from "./ui/modal";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface Subscription {
  tier: UserTier;
  status: "active" | "expired" | "cancelled";
  started_at?: string;
  expires_at?: string | null;
  dodo_subscription_id?: string;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  dodo_payment_id?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const Settings = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [currentTier, setCurrentTier] = useState<UserTier>("free");
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { modalProps, showSuccess, showError, showWarning, hideModal } =
    useModal();

  // ─────────────────────────────────────────────────────────────────────────
  // LOAD USER DATA
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          navigate("/");
          return;
        }

        const user = session.user;
        setUserId(user.id);
        setUserEmail(user.email || "");
        setUserName(
          user.user_metadata?.full_name ||
            user.user_metadata?.display_name ||
            user.email ||
            "User"
        );
        setCurrentTier(getTierFromUser(user));

        // Fetch subscription details
        const response = await axios.get(
          `${API_URL}/api/billing/subscription/${user.id}`
        );

        if (response.data?.subscription) {
          setSubscription(response.data.subscription);
          setCurrentTier(response.data.subscription.tier || "free");
        }

        if (response.data?.payments) {
          setPayments(response.data.payments);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  // ─────────────────────────────────────────────────────────────────────────
  // CANCEL SUBSCRIPTION
  // ─────────────────────────────────────────────────────────────────────────

  const handleCancelSubscription = () => {
    showWarning(
      "Cancel Subscription?",
      "Are you sure you want to cancel your Pro subscription? You'll lose access to unlimited quizzes and premium features at the end of your billing period.",
      {
        primaryAction: {
          label: "Yes, Cancel",
          onClick: confirmCancelSubscription,
        },
        secondaryAction: {
          label: "Keep Subscription",
          onClick: hideModal,
        },
      }
    );
  };

  const confirmCancelSubscription = async () => {
    if (!userId) return;

    setIsCancelling(true);
    try {
      const response = await axios.post(`${API_URL}/api/billing/cancel`, {
        userId,
      });

      if (response.data?.success) {
        // Update local state
        setCurrentTier("free");
        setSubscription((prev) =>
          prev ? { ...prev, tier: "free", status: "cancelled" } : null
        );

        // Update user metadata
        await updateUserTier("free");
        await supabase.auth.refreshSession();

        showSuccess(
          "Subscription Cancelled",
          "Your subscription has been cancelled. You can continue using Pro features until the end of your billing period.",
          {
            primaryAction: {
              label: "OK",
              onClick: hideModal,
            },
          }
        );
      }
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      showError(
        "Cancellation Failed",
        error?.response?.data?.error ||
          "Failed to cancel subscription. Please try again.",
        {
          primaryAction: {
            label: "OK",
            onClick: hideModal,
          },
        }
      );
    } finally {
      setIsCancelling(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE ACCOUNT
  // ─────────────────────────────────────────────────────────────────────────

  const handleDeleteAccount = () => {
    showWarning(
      "⚠️ Delete Account?",
      "This action is PERMANENT and cannot be undone. All your data including:\n\n• Quiz history\n• Statistics & progress\n• Subscription & payments\n• Account information\n\nWill be permanently deleted.",
      {
        primaryAction: {
          label: "Yes, Delete Everything",
          onClick: confirmDeleteAccount,
        },
        secondaryAction: {
          label: "Cancel",
          onClick: hideModal,
        },
      }
    );
  };

  const confirmDeleteAccount = async () => {
    if (!userId) return;

    setIsDeleting(true);
    hideModal();

    try {
      const response = await axios.delete(`${API_URL}/api/user/delete`, {
        data: { userId },
      });

      if (response.data?.success) {
        // Sign out the user
        await supabase.auth.signOut();

        showSuccess(
          "Account Deleted",
          "Your account and all associated data have been permanently deleted.",
          {
            primaryAction: {
              label: "OK",
              onClick: () => navigate("/"),
            },
          }
        );
      }
    } catch (error: any) {
      console.error("Error deleting account:", error);
      showError(
        "Deletion Failed",
        error?.response?.data?.error ||
          "Failed to delete account. Please try again or contact support.",
        {
          primaryAction: {
            label: "OK",
            onClick: hideModal,
          },
        }
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    if (currency === "INR") {
      return `₹${(amount / 100).toFixed(2)}`;
    }
    return `$${(amount / 100).toFixed(2)}`;
  };

  const getTierBadgeColor = (tier: UserTier) => {
    switch (tier) {
      case "pro":
        return "from-pink-500 to-rose-500";
      case "enterprise":
        return "from-blue-500 to-indigo-500";
      default:
        return "from-slate-500 to-slate-400";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "cancelled":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "expired":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  // Create user object for AppLayout
  const userForLayout = userId
    ? {
        id: userId,
        email: userEmail,
        user_metadata: { full_name: userName },
      }
    : null;

  return (
    <AppLayout user={userForLayout}>
      {/* Video Background - Fixed to cover entire viewport */}
      <div className="fixed inset-0 w-full h-full" style={{ zIndex: -1 }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/static/dashboardvid.webm" type="video/webm" />
          <source src="/static/dashboardvid.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Overlay - Fixed to cover entire viewport */}
      <div className="fixed inset-0 bg-black/50" style={{ zIndex: 0 }}></div>

      {/* Main Content */}
      <main
        className="relative h-full overflow-y-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8"
        style={{ zIndex: 1 }}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-white/60">
              Manage your subscription and account settings
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin h-10 w-10 border-4 border-white border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              {/* Subscription Card */}
              <motion.div
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    Subscription
                  </h2>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${getTierBadgeColor(
                        currentTier
                      )} text-white`}
                    >
                      {currentTier.toUpperCase()}
                    </span>
                    {subscription?.status && (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                          subscription.status
                        )}`}
                      >
                        {subscription.status.charAt(0).toUpperCase() +
                          subscription.status.slice(1)}
                      </span>
                    )}
                  </div>
                </div>

                {currentTier === "free" ? (
                  /* Free Tier View */
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Free Plan
                    </h3>
                    <p className="text-white/60 mb-6 max-w-md mx-auto">
                      You're on the free plan with 5 quizzes per day. Upgrade to
                      Pro for unlimited quizzes and premium features.
                    </p>
                    <button
                      onClick={() => navigate("/pricing")}
                      className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      Upgrade to Pro
                    </button>
                  </div>
                ) : (
                  /* Pro/Enterprise View */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-white/60 text-sm mb-1">Plan</p>
                        <p className="text-white font-semibold">
                          {currentTier === "pro" ? "Pro Monthly" : "Enterprise"}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-white/60 text-sm mb-1">Status</p>
                        <p className="text-white font-semibold capitalize">
                          {subscription?.status || "Active"}
                        </p>
                      </div>
                      {subscription?.started_at && (
                        <div className="bg-white/5 rounded-lg p-4">
                          <p className="text-white/60 text-sm mb-1">
                            Member Since
                          </p>
                          <p className="text-white font-semibold">
                            {formatDate(subscription.started_at)}
                          </p>
                        </div>
                      )}
                      {subscription?.expires_at && (
                        <div className="bg-white/5 rounded-lg p-4">
                          <p className="text-white/60 text-sm mb-1">
                            Next Billing
                          </p>
                          <p className="text-white font-semibold">
                            {formatDate(subscription.expires_at)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Pro Benefits */}
                    <div className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-lg p-4 border border-pink-500/20">
                      <p className="text-pink-300 font-semibold mb-2">
                        Your Pro Benefits
                      </p>
                      <ul className="text-white/80 text-sm space-y-1">
                        <li className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-green-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Unlimited quizzes
                        </li>
                        <li className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-green-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Advanced AI explanations
                        </li>
                        <li className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-green-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Performance analytics
                        </li>
                        <li className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-green-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Priority support
                        </li>
                      </ul>
                    </div>

                    {/* Cancel Subscription Button - Always show for Pro/Enterprise users */}
                    <div className="pt-6 mt-4 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">
                            Cancel Subscription
                          </p>
                          <p className="text-white/50 text-sm">
                            You'll lose access to Pro features
                          </p>
                        </div>
                        <button
                          onClick={handleCancelSubscription}
                          disabled={
                            isCancelling || subscription?.status === "cancelled"
                          }
                          className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors cursor-pointer text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isCancelling
                            ? "Cancelling..."
                            : subscription?.status === "cancelled"
                            ? "Already Cancelled"
                            : "Cancel Subscription"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Payment History */}
              {payments.length > 0 && (
                <motion.div
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h2 className="text-xl font-semibold text-white mb-4">
                    Payment History
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-white/60 text-sm border-b border-white/10">
                          <th className="pb-3 font-medium">Date</th>
                          <th className="pb-3 font-medium">Amount</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium">Payment ID</th>
                        </tr>
                      </thead>
                      <tbody className="text-white">
                        {payments.map((payment) => (
                          <tr
                            key={payment.id}
                            className="border-b border-white/5"
                          >
                            <td className="py-3">
                              {formatDate(payment.created_at)}
                            </td>
                            <td className="py-3">
                              {formatAmount(payment.amount, payment.currency)}
                            </td>
                            <td className="py-3">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  payment.status === "succeeded" ||
                                  payment.status === "captured"
                                    ? "bg-green-500/20 text-green-400"
                                    : payment.status === "failed"
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-yellow-500/20 text-yellow-400"
                                }`}
                              >
                                {payment.status}
                              </span>
                            </td>
                            <td className="py-3 text-white/60 text-sm font-mono">
                              {payment.dodo_payment_id?.slice(0, 16) || "—"}...
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* Account Info */}
              <motion.div
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h2 className="text-xl font-semibold text-white mb-4">
                  Account Information
                </h2>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-white/60 text-sm mb-1">Email</p>
                    <p className="text-white font-medium">{userEmail}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-white/60 text-sm mb-1">Name</p>
                    <p className="text-white font-medium">{userName}</p>
                  </div>
                </div>
              </motion.div>

              {/* Danger Zone */}
              <motion.div
                className="bg-red-500/30 backdrop-blur-lg rounded-2xl p-6 border border-red-500/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h2 className="text-xl font-semibold text-red-400 mb-4">
                  Danger Zone
                </h2>
                <p className="text-white/60 text-sm mb-4">
                  Once you delete your account, there is no going back. All your
                  quiz history, statistics, and subscription data will be
                  permanently deleted.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors cursor-pointer text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </button>
              </motion.div>
            </>
          )}
        </div>
      </main>

      {/* Modal */}
      <Modal {...modalProps} />
    </AppLayout>
  );
};

export default Settings;
