# 🧠 Quizethic AI

> **An AI-powered quiz generation platform where users can create custom MCQs on any topic with difficulty distribution and PDF export capabilities.**

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green.svg)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black.svg)](https://vercel.com/)

## ✨ Features

### 🎯 **Core Functionality**
- **🤖 AI-Powered Quiz Generation** - Create custom MCQs on any topic using advanced AI models
- **📊 Smart Difficulty Distribution** - 30% hard, 50% medium, 20% easy questions
- **📝 Multiple Choice Questions** - Professional MCQ format with detailed explanations
- **📄 PDF Export** - Download quizzes as beautifully formatted PDFs (paid tiers)
- **🔐 User Authentication** - Secure signup/signin with Google OAuth and email/password
- **💾 Progress Tracking** - Save and track your quiz performance over time

### 🎨 **User Experience**
- **🌐 Glassmorphic Design** - Modern, beautiful UI with backdrop blur effects
- **📱 Responsive Layout** - Works perfectly on desktop, tablet, and mobile
- **⚡ Real-time Updates** - Instant feedback and live progress tracking
- **🎭 Smooth Animations** - GSAP-powered animations for premium feel
- **🌙 Dark Theme** - Easy on the eyes with beautiful gradient backgrounds

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenRouter API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/quizethic-ai.git
   cd quizethic-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Tech Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **GSAP** - Professional animations

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Robust relational database
- **Real-time subscriptions** - Live data updates
- **Row Level Security** - Secure data access

### AI Integration
- **OpenRouter API** - Access to multiple AI models
- **Mistral-7B** - Cost-effective for free/plus tiers
- **Claude-3.5-Sonnet** - Premium quality for pro tier

### Deployment
- **Vercel** - Frontend hosting with edge functions
- **Supabase** - Managed backend services

## 📖 How to Use

### 1. **Sign Up / Sign In**
   - Create an account with email/password or Google OAuth
   - Access your personalized dashboard

### 2. **Create a Quiz**
   - Enter any topic you want to learn about
   - AI generates 10 MCQs with optimal difficulty distribution
   - Questions include detailed explanations

### 3. **Take the Quiz**
   - Answer questions at your own pace
   - Get instant feedback on each answer
   - View detailed explanations for learning

### 4. **Track Progress**
   - Monitor your performance over time
   - Access quiz history and statistics
   - Export results as PDF (premium feature)

## 🎯 Pricing Tiers

| Feature | Free | Plus ($9.99/month) | Pro ($19.99/month) |
|---------|------|-------------------|-------------------|
| Quizzes per month | 5 | 50 | Unlimited |
| AI Model | Mistral-7B | Mistral-7B | Claude-3.5-Sonnet |
| PDF Export | ❌ | ✅ | ✅ |
| Progress Tracking | Basic | Advanced | Premium |
| Priority Support | ❌ | ✅ | ✅ |

## 🔧 Development

### Project Structure
```
src/
├── components/          # React components
│   ├── AuthModal.tsx   # Authentication modal
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Hero.tsx        # Landing page
│   └── ...
├── lib/                # Utilities and configurations
│   └── supabase.ts     # Supabase client
├── App.tsx             # Main app component
└── main.tsx            # App entry point
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🛠️ Configuration

### Supabase Setup
1. Create a new Supabase project
2. Enable authentication providers (Google, Email)
3. Set up Row Level Security policies
4. Configure real-time subscriptions

### OpenRouter Setup
1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Get your API key
3. Configure model access and rate limits

## 📊 Performance

- **⚡ Fast Loading** - Optimized bundle with code splitting
- **🎯 SEO Ready** - Meta tags and structured data
- **📱 Mobile First** - Responsive design for all devices
- **🔒 Secure** - HTTPS, secure authentication, data encryption

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

### Manual Deployment
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🤝 Support

- **📧 Email**: support@quizethic.ai
- **💬 Discord**: [Join our community](https://discord.gg/quizethic)
- **📖 Documentation**: [docs.quizethic.ai](https://docs.quizethic.ai)
- **🐛 Issues**: [GitHub Issues](https://github.com/yourusername/quizethic-ai/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenRouter** for AI model access
- **Supabase** for backend infrastructure
- **Vercel** for hosting and deployment
- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS

---

<div align="center">

**Made with ❤️ by the Quizethic AI Team**

[🌐 Website](https://quizethic.ai) • [📱 Twitter](https://twitter.com/quizethic) • [💼 LinkedIn](https://linkedin.com/company/quizethic)

</div>
