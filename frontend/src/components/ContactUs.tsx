import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";
import Navbar from "./Navbar";
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

// EmailJS Configuration
const EMAILJS_CONFIG = {
  serviceId: "service_r8s4anb",
  templateId: "template_va6nbg9",
  publicKey: "aGBP6BBCCnnqc65vf",
};

// Form field interface
interface ContactFormData {
  name: string;
  email: string;
  businessName: string;
  mobileNumber: string;
  teamSize: string;
  message: string;
}

// Team size options for dropdown
const teamSizeOptions = [
  { value: "", label: "Select team size" },
  { value: "1-10", label: "1-10 members" },
  { value: "11-50", label: "11-50 members" },
  { value: "51-200", label: "51-200 members" },
  { value: "201-500", label: "201-500 members" },
  { value: "500+", label: "500+ members" },
];

const DEFAULT_MESSAGE = `Hi Quizethic Team,

I'm interested in the Enterprise plan for my organization.

We're looking for:
• Custom pricing for our team
• Custom branding options
• Custom requests for our organization

Please reach out to discuss our requirements.

Thank you!`;

const ContactUs = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    businessName: "",
    mobileNumber: "",
    teamSize: "",
    message: DEFAULT_MESSAGE,
  });

  // Modal for notifications
  const { modalProps, showSuccess, showError } = useModal();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Form validation
  const validateForm = (): string | null => {
    if (!formData.name.trim()) return "Please enter your name";
    if (!formData.email.trim()) return "Please enter your email";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Please enter a valid email address";
    }
    if (
      formData.mobileNumber &&
      !/^[+]?[\d\s-]{10,}$/.test(formData.mobileNumber)
    ) {
      return "Please enter a valid mobile number";
    }
    return null;
  };

  // Handle form submission via EmailJS
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      showError("Validation Error", validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      // Send email via EmailJS
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        business_name: formData.businessName || "Not provided",
        mobile_number: formData.mobileNumber || "Not provided",
        team_size: formData.teamSize || "Not specified",
        message: formData.message,
        to_email: "quizethicai@protonmail.com",
      };

      await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams,
        EMAILJS_CONFIG.publicKey
      );

      setIsSubmitting(false);

      // Reset form
      setFormData({
        name: "",
        email: "",
        businessName: "",
        mobileNumber: "",
        teamSize: "",
        message: DEFAULT_MESSAGE,
      });

      showSuccess(
        "Message Sent! 🎉",
        "Thank you for your interest! We've received your inquiry and will get back to you within 24-48 hours.",
        {
          primaryAction: {
            label: "Back to Home",
            onClick: () => navigate("/"),
          },
        }
      );
    } catch (error) {
      console.error("EmailJS error:", error);
      setIsSubmitting(false);
      showError(
        "Failed to Send",
        "We couldn't send your message. Please try again or email us directly at quizethicai@protonmail.com"
      );
    }
  };

  // Input field styling
  const inputClasses =
    "w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/50 transition-all duration-200";

  const labelClasses = "block text-white/90 font-medium mb-2 text-sm";

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden"
      style={{
        backgroundImage: "url('/static/contactbg.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Light overlay for brightness consistency */}
      <div className="absolute inset-0 bg-white/10" />

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
      <main className="relative z-10 px-4 sm:px-6 lg:px-8 pb-12 pt-4 sm:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {/* Glassmorphic Card */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)] p-6 sm:p-8 lg:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 drop-shadow-lg">
                Enterprise Inquiry
              </h1>
              <p className="text-white/80 text-sm sm:text-base">
                Let's discuss custom solutions for your organization
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className={labelClasses}>
                    Full Name <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className={labelClasses}>
                    Work Email <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@company.com"
                    className={inputClasses}
                    required
                  />
                </div>
              </div>

              {/* Business Name & Mobile Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="businessName" className={labelClasses}>
                    Organization Name
                  </label>
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="Acme Inc."
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label htmlFor="mobileNumber" className={labelClasses}>
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    id="mobileNumber"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className={inputClasses}
                  />
                </div>
              </div>

              {/* Team Size */}
              <div>
                <label htmlFor="teamSize" className={labelClasses}>
                  Team Size
                </label>
                <select
                  id="teamSize"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleChange}
                  className={`${inputClasses} cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22rgba(255,255,255,0.7)%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center] bg-[length:1.25rem]`}
                >
                  {teamSizeOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-[#1a1a2e] text-white"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className={labelClasses}>
                  Your Requirements
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={8}
                  className={`${inputClasses} resize-none`}
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl font-semibold text-white text-base bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Send Inquiry
                  </>
                )}
              </motion.button>

              {/* Alternative contact */}
              <p className="text-center text-white/60 text-sm mt-4">
                Or email us directly at{" "}
                <a
                  href="mailto:quizethicai@protonmail.com"
                  className="text-pink-300 hover:text-pink-200 underline transition-colors"
                >
                  quizethicai@protonmail.com
                </a>
              </p>
            </form>
          </div>

          {/* Back link */}
          <div className="text-center mt-6">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-white/70 hover:text-white text-sm font-medium transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </main>

      {/* Notification Modal */}
      <Modal {...modalProps} />
    </div>
  );
};

export default ContactUs;
