# Quiz MVP Technical Documentation

## 🎯 Project Overview
**Quizethic AI** - An AI-powered quiz generation platform where users can create custom MCQs on any topic with difficulty distribution and PDF export capabilities.

## 🏗️ Technical Architecture

### Frontend Stack
- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** for styling
- **React Router DOM** for navigation
- **Glassmorphic UI** design with backdrop blur effects

### Backend & Database
- **Supabase** for authentication and database
- **PostgreSQL** (managed by Supabase)
- **Real-time subscriptions** for live updates

### AI Integration
- **OpenRouter API** for model access
- **Mistral-7B** for free/plus tiers (cost-effective)
- **Claude-3.5-Sonnet** for pro tier (premium quality)

### Deployment
- **Vercel** for frontend hosting
- **Supabase** for backend services
- **Free tier limits** apply until scale requires upgrades

## 🗄️ Database Schema

### Core Tables
```sql
-- User authentication (handled by Supabase Auth)
users (id, email, username, created_at, tier)

-- Quiz management
quizzes (
  id, 
  user_id, 
  topic, 
  difficulty, 
  question, 
  options[], 
  correct_answer, 
  explanation, 
  created_at
)

-- User progress tracking
user_progress (
  id, 
  user_id, 
  quiz_id, 
  score, 
  completed_at, 
  tier_used
)

-- Subscription management
subscriptions (
  id, 
  user_id, 
  tier, 
  status, 
  current_period_start, 
  current_period_end
)
```

## 💰 Pricing Strategy

### Three-Tier Model
| Tier | Price | Features | AI Model | Question Limit |
|------|-------|----------|----------|----------------|
| **Free** | $0 | 2 sets × 10 questions | Mistral-7B | 20 questions/month |
| **Plus** | $6/month | 10 sets × 20 questions + PDF | Mistral-7B | 200 questions/month |
| **Pro** | $12-15/month | Unlimited sets × 20 questions + PDF + Premium | Claude-3.5 | Unlimited |

## 📊 Cost Analysis

### AI Costs (OpenRouter)
- **Mistral-7B**: $0.14/1M tokens (free/plus tiers)
- **Claude-3.5**: $3/1M tokens (pro tier)
- **OpenRouter Subscription**: $10/month

### Infrastructure Costs
- **Vercel**: Free tier (100GB bandwidth)
- **Supabase**: Free tier (500MB database)
- **Stripe**: 2.9% + $0.30 per transaction

### Profitability by Scale

#### 100 Users Daily
```
Revenue: $255/month
Costs: $104.54/month
Profit: $150.46/month (59% margin)
```

#### 5000 Users Daily
```
Revenue: $12,750/month
Costs: $652.56/month
Profit: $12,097.44/month (95% margin)
```

## 🚀 MVP Features

### Core Functionality
- ✅ **Custom topic input** (user-defined topics)
- ✅ **AI quiz generation** with difficulty distribution
- ✅ **MCQ format**: 30% hard, 50% medium, 20% easy
- ✅ **Answer validation** with explanations
- ✅ **PDF export** (paid tiers)
- ✅ **User authentication** (signup/signin)

### Future Enhancements
- 🔄 **Progress tracking** and analytics
- 🔄 **Quiz sharing** and collaboration
- 🔄 **Advanced difficulty algorithms**
- 🔄 **Multi-language support**
- 🔄 **Mobile app** (React Native)

## 🛠️ Implementation Timeline

### Phase 1: Core MVP (2-3 weeks)
- [ ] Custom topic input component
- [ ] AI integration with OpenRouter
- [ ] Quiz generation and display
- [ ] Basic user tier system
- [ ] Answer validation

### Phase 2: Monetization (1-2 weeks)
- [ ] Stripe payment integration
- [ ] Subscription management
- [ ] Tier-based access control
- [ ] PDF export functionality

### Phase 3: Scale & Polish (1-2 weeks)
- [ ] Performance optimization
- [ ] Error handling
- [ ] Analytics dashboard
- [ ] User feedback system

## 🔧 Technical Requirements

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENROUTER_API_KEY=your_openrouter_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

### Dependencies to Add
```json
{
  "openrouter": "^1.0.0",
  "stripe": "^14.0.0",
  "jspdf": "^2.5.1",
  "@types/jspdf": "^2.0.0"
}
```

## 📈 Growth Strategy

### User Acquisition
- **Free tier** as lead magnet
- **Student communities** (Reddit, Discord, universities)
- **Social media** content marketing
- **SEO optimization** for quiz topics

### Conversion Optimization
- **Feature limitations** in free tier
- **Quality difference** between tiers
- **Social proof** and testimonials
- **Referral programs**

### Scaling Considerations
- **CDN implementation** for high traffic
- **Database optimization** for large datasets
- **Caching strategies** for AI responses
- **Load balancing** for peak usage

## 🎯 Success Metrics

### Key Performance Indicators
- **Daily Active Users** (DAU)
- **Conversion Rate** (free → paid)
- **Monthly Recurring Revenue** (MRR)
- **Customer Acquisition Cost** (CAC)
- **Lifetime Value** (LTV)

### Target Benchmarks
- **Month 1**: 100 users, 5% conversion
- **Month 3**: 500 users, 8% conversion
- **Month 6**: 2000 users, 10% conversion
- **Month 12**: 10000 users, 12% conversion

## 🚨 Risk Mitigation

### Technical Risks
- **AI API rate limits** → Implement queuing system
- **Database performance** → Regular optimization
- **Security vulnerabilities** → Regular audits

### Business Risks
- **Low conversion rates** → A/B testing pricing
- **High churn** → Customer success programs
- **Competition** → Unique feature differentiation

---

*This document serves as the technical foundation for the Quizethic AI MVP development and scaling strategy.*
