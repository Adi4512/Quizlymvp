import { useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";

const Pricing = () => {
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const plans = [
    {
      name: "BASIC PLAN",
      price: "₹0",
      period: "/month",
      description: "Perfect for getting started",
      features: [
        { text: "5 quizzes per day", included: true },
        { text: "Basic AI question generation", included: true },
        { text: "Standard difficulty levels", included: true },
        { text: "Email support", included: true },
        { text: "Performance analytics", included: false },
        { text: "Priority support", included: false },
      ],
      cta: "SELECT PLAN",
      popular: false,
      headerGradient: "from-purple-500 to-purple-300",
      buttonGradient: "from-purple-500 to-purple-300",
    },
    {
      name: "STANDARD PLAN",
      price: "₹299",
      period: "/month",
      description: "For serious learners",
      features: [
        { text: "Unlimited quizzes", included: true },
        { text: "Advanced AI with explanations", included: true },
        { text: "All difficulty levels", included: true },
        { text: "Performance analytics", included: true },
        { text: "Priority support", included: true },
        { text: "Custom topics", included: true },
      ],
      cta: "SELECT PLAN",
      popular: true,
      headerGradient: "from-pink-500 to-pink-300",
      buttonGradient: "from-pink-500 to-pink-300",
    },
    {
      name: "PREMIUM PLAN",
      price: "₹999",
      period: "/month",
      description: "For coaching centers & schools",
      features: [
        { text: "Everything in Standard", included: true },
        { text: "Up to 50 users", included: true },
        { text: "Admin dashboard", included: true },
        { text: "Bulk quiz creation", included: true },
        { text: "Custom branding", included: true },
        { text: "API access", included: true },
        { text: "Dedicated support", included: true },
      ],
      cta: "SELECT PLAN",
      popular: false,
      headerGradient: "from-blue-500 to-blue-300",
      buttonGradient: "from-blue-500 to-blue-300",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gray-100 relative overflow-hidden">
      {/* Desktop Header */}
      <header className="hidden md:flex items-center px-8 lg:px-16 pt-6 pb-4 relative z-10">
        {/* Left: Logo */}
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
            <span className="font-bold text-lg text-gray-800">
              Quizethic AI
            </span>
          </button>
        </div>

        {/* Center: Navigation */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-1 rounded-full px-3 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-md">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `cursor-pointer px-5 py-2 text-sm font-semibold transition-all duration-200 relative ${
                  isActive
                    ? "text-purple-600 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-0.5 after:bg-purple-600 after:rounded-full"
                    : "text-gray-700 hover:text-purple-600 hover:scale-105"
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/pricing"
              className={({ isActive }) =>
                `cursor-pointer px-5 py-2 text-sm font-semibold transition-all duration-200 relative ${
                  isActive
                    ? "text-purple-600 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-0.5 after:bg-purple-600 after:rounded-full"
                    : "text-gray-700 hover:text-purple-600 hover:scale-105"
                }`
              }
            >
              Pricing
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `cursor-pointer px-5 py-2 text-sm font-semibold transition-all duration-200 relative ${
                  isActive
                    ? "text-purple-600 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-0.5 after:bg-purple-600 after:rounded-full"
                    : "text-gray-700 hover:text-purple-600 hover:scale-105"
                }`
              }
            >
              About
            </NavLink>
          </div>
        </div>

        {/* Right: Empty space for balance */}
        <div className="flex-1"></div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-5 pt-6 pb-4 relative z-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <img
            src="/static/quizethic-favicon.svg"
            alt="Quizethic AI Logo"
            className="w-8 h-8 rounded-xl"
          />
          <span className="font-bold text-base text-gray-800">
            Quizethic AI
          </span>
        </button>
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-4 sm:px-6 lg:px-8 pb-12 pt-8 sm:pt-12 md:pt-16">
        {/* Hero Section */}
        <section className="text-center mb-12 max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold text-gray-800 mb-4 leading-tight">
            Choose a plan that fits your preparation{" "}
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto mb-4 rounded-full"></div>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed font-medium">
            Transparent pricing designed for students preparing seriously — no
            hidden limits, no surprises.
          </p>
        </section>

        {/* Pricing Cards */}
        <section className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  plan.popular ? "scale-105 md:scale-110 z-20" : "z-10"
                }`}
              >
                {/* Gradient Header */}
                <div
                  className={`bg-gradient-to-r ${plan.headerGradient} py-6 px-6`}
                >
                  <h3 className="text-white font-bold text-lg uppercase tracking-wide text-center">
                    {plan.name}
                  </h3>
                </div>

                {/* Price Section */}
                <div className="px-6 py-6 text-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl sm:text-5xl font-bold text-gray-800">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 text-lg">{plan.period}</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="px-6 pb-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className={`flex items-center gap-3 ${
                          feature.included
                            ? "text-gray-800"
                            : "text-gray-400 line-through"
                        }`}
                      >
                        {feature.included ? (
                          <svg
                            className="w-5 h-5 text-green-500 flex-shrink-0"
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
                    onClick={() => navigate("/dashboard")}
                    className={`w-full py-3 rounded-xl font-semibold text-white text-sm sm:text-base transition-all duration-300 hover:opacity-90 active:scale-[0.98] bg-gradient-to-r ${plan.buttonGradient} shadow-md hover:shadow-lg`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto mt-16 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <h3 className="text-gray-800 font-semibold text-base mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Yes! You can cancel your subscription at any time. No questions
                asked.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <h3 className="text-gray-800 font-semibold text-base mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Standard plan comes with a 7-day free trial. No credit card
                required.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <h3 className="text-gray-800 font-semibold text-base mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We accept all major credit cards, UPI, and net banking for
                Indian users.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <h3 className="text-gray-800 font-semibold text-base mb-2">
                Can I upgrade or downgrade?
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Yes, you can change your plan at any time. Changes take effect
                immediately.
              </p>
            </div>
          </div>
        </section>

        {/* Back to Home */}
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="w-full bg-white text-gray-800 font-semibold py-4 rounded-2xl border-2 border-gray-300 hover:border-gray-400 active:scale-[0.98] transition-all shadow-md hover:shadow-lg"
          >
            Back to Home
          </button>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
