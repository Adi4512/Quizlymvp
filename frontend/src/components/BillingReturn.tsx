/**
 * Billing Return Page
 * ===================
 * Handles the return from Dodo Payments after checkout.
 * Shows success/failure dialog and redirects to dashboard.
 */

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../lib/api";
import { supabase, updateUserTier } from "../lib/supabase";
import { Modal, useModal } from "./ui/modal";

const BillingReturn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const { modalProps, showSuccess, showError } = useModal();

  useEffect(() => {
    const handlePaymentReturn = async () => {
      try {
        // Get the current user
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          showError("Authentication Error", "Please sign in to continue.", {
            primaryAction: {
              label: "Sign In",
              onClick: () => navigate("/"),
            },
          });
          setIsProcessing(false);
          return;
        }

        const userId = session.user.id;

        // Check subscription status from backend
        const response = await axios.get(
          `${API_URL}/api/user/subscription/${userId}`
        );

        const subscription = response.data?.subscription;

        if (subscription?.tier === "pro" && subscription?.status === "active") {
          // Payment successful! Update user metadata
          await updateUserTier("pro");

          // Refresh the session to get updated metadata
          await supabase.auth.refreshSession();

          setIsProcessing(false);

          // Show success dialog
          showSuccess(
            "🎉 Welcome to Pro!",
            "You're now a Pro member with unlimited quizzes. Enjoy all the premium features!",
            {
              primaryAction: {
                label: "Go to Dashboard",
                onClick: () => navigate("/dashboard"),
              },
            }
          );
        } else {
          // Payment might still be processing or failed
          // Check query params for status hints
          const status = searchParams.get("status");
          const paymentStatus = searchParams.get("payment_status");

          if (status === "cancelled" || paymentStatus === "cancelled") {
            setIsProcessing(false);
            showError("Payment Cancelled", "Your payment was cancelled.", {
              primaryAction: {
                label: "Try Again",
                onClick: () => navigate("/pricing"),
              },
              secondaryAction: {
                label: "Go to Dashboard",
                onClick: () => navigate("/dashboard"),
              },
            });
          } else {
            // Payment might be processing - wait a moment and check again
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Check again
            const retryResponse = await axios.get(
              `${API_URL}/api/user/subscription/${userId}`
            );
            const retrySubscription = retryResponse.data?.subscription;

            if (
              retrySubscription?.tier === "pro" &&
              retrySubscription?.status === "active"
            ) {
              await updateUserTier("pro");
              await supabase.auth.refreshSession();

              setIsProcessing(false);
              showSuccess(
                "🎉 Welcome to Pro!",
                "You're now a Pro member with unlimited quizzes. Enjoy all the premium features!",
                {
                  primaryAction: {
                    label: "Go to Dashboard",
                    onClick: () => navigate("/dashboard"),
                  },
                }
              );
            } else {
              setIsProcessing(false);
              showError(
                "Payment Processing",
                "Your payment is being processed. Please check your dashboard in a few moments.",
                {
                  primaryAction: {
                    label: "Go to Dashboard",
                    onClick: () => navigate("/dashboard"),
                  },
                }
              );
            }
          }
        }
      } catch (error) {
        console.error("Error processing payment return:", error);
        setIsProcessing(false);
        showError(
          "Something went wrong",
          "We couldn't verify your payment. Please check your dashboard or contact support.",
          {
            primaryAction: {
              label: "Go to Dashboard",
              onClick: () => navigate("/dashboard"),
            },
          }
        );
      }
    };

    handlePaymentReturn();
  }, [navigate, searchParams, showSuccess, showError]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#C084FC] via-[#A855F7] to-[#7E22CE] flex items-center justify-center">
      {isProcessing ? (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Processing your payment...
          </h2>
          <p className="text-white/70">
            Please wait while we confirm your subscription.
          </p>
        </div>
      ) : null}

      {/* Modal for success/error messages */}
      <Modal {...modalProps} />
    </div>
  );
};

export default BillingReturn;
