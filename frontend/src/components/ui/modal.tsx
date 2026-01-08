/**
 * Modal Component
 * ================
 * Reusable modal for alerts, confirmations, and notifications.
 * Replaces browser alerts with a polished UI.
 */

import { useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ModalVariant = "success" | "error" | "warning" | "info";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: ModalVariant;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  autoClose?: number; // Auto close after X milliseconds
}

const variantStyles: Record<
  ModalVariant,
  { icon: ReactNode; gradient: string; iconBg: string }
> = {
  success: {
    icon: (
      <svg
        className="w-8 h-8 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
    gradient: "from-green-500 to-emerald-600",
    iconBg: "bg-gradient-to-br from-green-400 to-emerald-500",
  },
  error: {
    icon: (
      <svg
        className="w-8 h-8 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
    gradient: "from-red-500 to-rose-600",
    iconBg: "bg-gradient-to-br from-red-400 to-rose-500",
  },
  warning: {
    icon: (
      <svg
        className="w-8 h-8 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    gradient: "from-yellow-500 to-orange-500",
    iconBg: "bg-gradient-to-br from-yellow-400 to-orange-500",
  },
  info: {
    icon: (
      <svg
        className="w-8 h-8 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    gradient: "from-blue-500 to-indigo-600",
    iconBg: "bg-gradient-to-br from-blue-400 to-indigo-500",
  },
};

export function Modal({
  isOpen,
  onClose,
  title,
  message,
  variant = "info",
  primaryAction,
  secondaryAction,
  autoClose,
}: ModalProps) {
  const styles = variantStyles[variant];

  // Auto close timer
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, onClose]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-[101] p-4"
          >
            <div className="bg-[#1a1a2e] rounded-2xl shadow-2xl border border-white/10 max-w-md w-full overflow-hidden">
              {/* Header with gradient */}
              <div
                className={`bg-gradient-to-r ${styles.gradient} p-6 text-center`}
              >
                <div
                  className={`${styles.iconBg} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}
                >
                  {styles.icon}
                </div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
              </div>

              {/* Body */}
              <div className="p-6">
                <p className="text-white/80 text-center leading-relaxed whitespace-pre-line">
                  {message}
                </p>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
                {secondaryAction && (
                  <button
                    onClick={secondaryAction.onClick}
                    className="flex-1 px-4 py-3 rounded-xl font-semibold text-white/70 bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
                  >
                    {secondaryAction.label}
                  </button>
                )}
                <button
                  onClick={primaryAction?.onClick || onClose}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${styles.gradient} hover:opacity-90 transition-opacity shadow-lg`}
                >
                  {primaryAction?.label || "OK"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook for easier modal state management
import { useState, useCallback } from "react";

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  variant: ModalVariant;
  primaryAction?: ModalProps["primaryAction"];
  secondaryAction?: ModalProps["secondaryAction"];
  autoClose?: number;
}

export function useModal() {
  const [state, setState] = useState<ModalState>({
    isOpen: false,
    title: "",
    message: "",
    variant: "info",
  });

  const showModal = useCallback((options: Omit<ModalState, "isOpen">) => {
    setState({ ...options, isOpen: true });
  }, []);

  const hideModal = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const showSuccess = useCallback(
    (title: string, message: string, options?: Partial<ModalState>) => {
      showModal({ title, message, variant: "success", ...options });
    },
    [showModal]
  );

  const showError = useCallback(
    (title: string, message: string, options?: Partial<ModalState>) => {
      showModal({ title, message, variant: "error", ...options });
    },
    [showModal]
  );

  const showWarning = useCallback(
    (title: string, message: string, options?: Partial<ModalState>) => {
      showModal({ title, message, variant: "warning", ...options });
    },
    [showModal]
  );

  const showInfo = useCallback(
    (title: string, message: string, options?: Partial<ModalState>) => {
      showModal({ title, message, variant: "info", ...options });
    },
    [showModal]
  );

  return {
    modalProps: { ...state, onClose: hideModal },
    showModal,
    hideModal,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}

export default Modal;
