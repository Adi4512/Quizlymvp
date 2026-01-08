-- ═══════════════════════════════════════════════════════════════════════════
-- QUIZETHIC AI - Database Schema
-- ═══════════════════════════════════════════════════════════════════════════
-- Run this in Supabase SQL Editor to create the required tables
-- Dashboard → SQL Editor → New Query → Paste & Run
--
-- REQUIRED .env variables for backend:
--   SUPABASE_URL=https://your-project.supabase.co
--   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
--   (Get these from Supabase Dashboard → Settings → API)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. USER SUBSCRIPTIONS TABLE
-- Tracks user tier and subscription status
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- NULL for free tier, set for pro
    razorpay_payment_id TEXT,
    razorpay_order_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Each user has one subscription record
    UNIQUE(user_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier ON user_subscriptions(tier);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. DAILY USAGE TABLE
-- Tracks quiz usage per user per day for rate limiting
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    quiz_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One record per user per day
    UNIQUE(user_id, usage_date)
);

-- Index for fast lookups by user and date
CREATE INDEX IF NOT EXISTS idx_daily_usage_user_date ON daily_usage(user_id, usage_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. PAYMENT HISTORY TABLE
-- Records all payment transactions
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    razorpay_order_id TEXT NOT NULL,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    amount INTEGER NOT NULL, -- Amount in paise
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'captured', 'failed', 'refunded')),
    plan_id TEXT NOT NULL DEFAULT 'pro',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order ON payments(razorpay_order_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- Users can only access their own data
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Subscriptions: Users can read their own, service role can do everything
CREATE POLICY "Users can view own subscription" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to subscriptions" ON user_subscriptions
    FOR ALL USING (auth.role() = 'service_role');

-- Daily Usage: Users can read their own
CREATE POLICY "Users can view own usage" ON daily_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to usage" ON daily_usage
    FOR ALL USING (auth.role() = 'service_role');

-- Payments: Users can read their own payment history
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to payments" ON payments
    FOR ALL USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. HELPER FUNCTIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Function to get or create subscription for a user
CREATE OR REPLACE FUNCTION get_or_create_subscription(p_user_id UUID)
RETURNS user_subscriptions AS $$
DECLARE
    sub user_subscriptions;
BEGIN
    -- Try to get existing subscription
    SELECT * INTO sub FROM user_subscriptions WHERE user_id = p_user_id;
    
    -- If not found, create a free subscription
    IF NOT FOUND THEN
        INSERT INTO user_subscriptions (user_id, tier, status)
        VALUES (p_user_id, 'free', 'active')
        RETURNING * INTO sub;
    END IF;
    
    RETURN sub;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get today's usage for a user
CREATE OR REPLACE FUNCTION get_daily_usage(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    count INTEGER;
BEGIN
    SELECT quiz_count INTO count 
    FROM daily_usage 
    WHERE user_id = p_user_id AND usage_date = CURRENT_DATE;
    
    RETURN COALESCE(count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage (called after quiz generation)
CREATE OR REPLACE FUNCTION increment_usage(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    INSERT INTO daily_usage (user_id, usage_date, quiz_count)
    VALUES (p_user_id, CURRENT_DATE, 1)
    ON CONFLICT (user_id, usage_date)
    DO UPDATE SET 
        quiz_count = daily_usage.quiz_count + 1,
        updated_at = NOW()
    RETURNING quiz_count INTO new_count;
    
    RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to upgrade user to Pro
CREATE OR REPLACE FUNCTION upgrade_to_pro(
    p_user_id UUID,
    p_razorpay_payment_id TEXT,
    p_razorpay_order_id TEXT,
    p_duration_days INTEGER DEFAULT 30
)
RETURNS user_subscriptions AS $$
DECLARE
    sub user_subscriptions;
BEGIN
    INSERT INTO user_subscriptions (user_id, tier, status, expires_at, razorpay_payment_id, razorpay_order_id)
    VALUES (
        p_user_id, 
        'pro', 
        'active', 
        NOW() + (p_duration_days || ' days')::INTERVAL,
        p_razorpay_payment_id,
        p_razorpay_order_id
    )
    ON CONFLICT (user_id)
    DO UPDATE SET 
        tier = 'pro',
        status = 'active',
        expires_at = NOW() + (p_duration_days || ' days')::INTERVAL,
        razorpay_payment_id = p_razorpay_payment_id,
        razorpay_order_id = p_razorpay_order_id,
        updated_at = NOW()
    RETURNING * INTO sub;
    
    RETURN sub;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. AUTOMATIC SUBSCRIPTION CHECK (Optional cron job)
-- Run daily to expire subscriptions
-- ─────────────────────────────────────────────────────────────────────────────

-- This can be run via Supabase Edge Functions or a cron job
-- UPDATE user_subscriptions 
-- SET tier = 'free', status = 'expired' 
-- WHERE tier = 'pro' AND expires_at < NOW() AND status = 'active';

-- ═══════════════════════════════════════════════════════════════════════════
-- TIER LIMITS REFERENCE
-- ═══════════════════════════════════════════════════════════════════════════
-- FREE:       5 quizzes per day
-- PRO:        Unlimited quizzes
-- ENTERPRISE: Unlimited quizzes + team features
-- ═══════════════════════════════════════════════════════════════════════════

