import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "5 quizzes per day",
        "Basic AI question generation",
        "Standard difficulty levels",
        "Email support",
      ],
      cta: "Get Started",
      popular: false,
      gradient: "from-gray-400/30 to-gray-500/30",
    },
    {
      name: "Pro",
      price: "₹299",
      period: "/month",
      description: "For serious learners",
      features: [
        "Unlimited quizzes",
        "Advanced AI with explanations",
        "All difficulty levels",
        "Performance analytics",
        "Priority support",
        "Custom topics",
      ],
      cta: "Start Free Trial",
      popular: true,
      gradient: "from-pink-500/40 to-purple-500/40",
    },
    {
      name: "Team",
      price: "₹999",
      period: "/month",
      description: "For coaching centers & schools",
      features: [
        "Everything in Pro",
        "Up to 50 users",
        "Admin dashboard",
        "Bulk quiz creation",
        "Custom branding",
        "API access",
        "Dedicated support",
      ],
      cta: "Contact Sales",
      popular: false,
      gradient: "from-cyan-400/30 to-blue-500/30",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#C084FC] via-[#A855F7] to-[#7E22CE] font-['Outfit',sans-serif]">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-6 pb-4">
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
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-white/80 hover:text-white transition-colors"
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
      <main className="px-5 pb-8">
        {/* Hero Section */}
        <section className="mt-6 mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-3">
            Simple, Transparent Pricing
          </h1>
          <p className="text-white/80 text-base leading-relaxed">
            Choose the plan that fits your learning journey
          </p>
        </section>

        {/* Pricing Cards */}
        <section className="space-y-4 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-gradient-to-br ${plan.gradient} backdrop-blur-md rounded-2xl p-5 border ${
                plan.popular ? "border-pink-400/50" : "border-white/20"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {plan.name}
                  </h3>
                  <p className="text-white/70 text-xs">{plan.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-white font-bold text-2xl">
                    {plan.price}
                  </span>
                  <span className="text-white/70 text-sm">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-2 mb-5">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-green-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-white/90 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate("/dashboard")}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] ${
                  plan.popular
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-purple-500/30"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </section>

        {/* FAQ Section */}
        <section className="mb-8">
          <h2 className="text-white font-semibold text-lg mb-4 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <h3 className="text-white font-medium text-sm mb-1">
                Can I cancel anytime?
              </h3>
              <p className="text-white/70 text-xs leading-relaxed">
                Yes! You can cancel your subscription at any time. No questions
                asked.
              </p>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <h3 className="text-white font-medium text-sm mb-1">
                Is there a free trial?
              </h3>
              <p className="text-white/70 text-xs leading-relaxed">
                Pro plan comes with a 7-day free trial. No credit card required.
              </p>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <h3 className="text-white font-medium text-sm mb-1">
                What payment methods do you accept?
              </h3>
              <p className="text-white/70 text-xs leading-relaxed">
                We accept all major credit cards, UPI, and net banking for
                Indian users.
              </p>
            </div>
          </div>
        </section>

        {/* Money Back Guarantee */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-green-500/30 to-emerald-500/30 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center">
            <span className="text-3xl mb-2 block">🛡️</span>
            <h3 className="text-white font-semibold text-base mb-1">
              30-Day Money Back Guarantee
            </h3>
            <p className="text-white/80 text-sm">
              Not satisfied? Get a full refund within 30 days. No questions
              asked.
            </p>
          </div>
        </section>

        {/* Back to Home */}
        <button
          onClick={() => navigate("/")}
          className="w-full bg-white/20 backdrop-blur-md text-white font-semibold py-4 rounded-2xl border border-white/30 active:scale-[0.98] transition-transform"
        >
          Back to Home
        </button>
      </main>
    </div>
  );
};

export default Pricing;

