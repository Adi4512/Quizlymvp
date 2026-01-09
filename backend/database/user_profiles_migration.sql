-- ═══════════════════════════════════════════════════════════════════════════
-- QUIZETHIC AI - User Profiles Migration
-- ═══════════════════════════════════════════════════════════════════════════
-- Creates a user_profiles table to store user data in one place.
-- Also copies existing user data from auth.users table.
--
-- Run this in Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → Paste & Run
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. CREATE USER_PROFILES TABLE
-- Central table for all user data (marketing, analytics, app features)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
    -- Primary identifiers
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic user info
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    
    -- Account & role management
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator', 'enterprise_admin')),
    is_email_verified BOOLEAN DEFAULT FALSE,
    
    -- Subscription (denormalized from user_subscriptions for quick access)
    subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'expired', 'cancelled', NULL)),
    
    -- Geographic & demographic data (useful for marketing)
    country TEXT,
    country_code TEXT, -- ISO 3166-1 alpha-2 (e.g., 'IN', 'US', 'GB')
    timezone TEXT,
    language TEXT DEFAULT 'en',
    
    -- Contact info (optional)
    phone TEXT,
    phone_verified BOOLEAN DEFAULT FALSE,
    
    -- Source tracking (marketing attribution)
    signup_source TEXT, -- e.g., 'google', 'facebook', 'organic', 'referral', 'waitlist'
    referral_code TEXT,
    referred_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    
    -- Engagement tracking
    last_sign_in_at TIMESTAMPTZ,
    last_active_at TIMESTAMPTZ,
    total_sign_ins INTEGER DEFAULT 0,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT TRUE,
    product_updates BOOLEAN DEFAULT TRUE,
    
    -- Flexible metadata (for any additional data)
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Each user has one profile
    UNIQUE(user_id),
    UNIQUE(email)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. CREATE INDEXES FOR FAST QUERIES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_tier ON user_profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_user_profiles_country_code ON user_profiles(country_code);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_signup_source ON user_profiles(signup_source);
CREATE INDEX IF NOT EXISTS idx_user_profiles_referral_code ON user_profiles(referral_code);

-- Full-text search on name for admin lookup
CREATE INDEX IF NOT EXISTS idx_user_profiles_full_name_search ON user_profiles USING GIN (to_tsvector('english', COALESCE(full_name, '')));

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. ENABLE ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Service role has full access (for backend operations)
CREATE POLICY "Service role full access to user_profiles" ON user_profiles
    FOR ALL USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. FUNCTION: Create profile for new user
-- Called automatically when a new user signs up via Supabase Auth
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_full_name TEXT;
    v_avatar_url TEXT;
    v_signup_source TEXT;
BEGIN
    -- Extract name from metadata or raw_user_meta_data
    v_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'display_name',
        SPLIT_PART(NEW.email, '@', 1)
    );
    
    -- Extract avatar URL from metadata (for social logins)
    v_avatar_url := COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture',
        NEW.raw_user_meta_data->>'photo_url'
    );
    
    -- Determine signup source from provider
    v_signup_source := CASE 
        WHEN NEW.raw_app_meta_data->>'provider' = 'google' THEN 'google'
        WHEN NEW.raw_app_meta_data->>'provider' = 'email' THEN 'email'
        ELSE 'email'
    END;

    -- Insert into user_profiles
    INSERT INTO public.user_profiles (
        user_id,
        email,
        full_name,
        avatar_url,
        is_email_verified,
        signup_source,
        last_sign_in_at,
        total_sign_ins,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        v_full_name,
        v_avatar_url,
        COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE),
        v_signup_source,
        NEW.last_sign_in_at,
        1,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        is_email_verified = EXCLUDED.is_email_verified,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. TRIGGER: Auto-create profile on new user signup
-- ─────────────────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. FUNCTION: Update last_sign_in on user login
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_user_sign_in()
RETURNS TRIGGER AS $$
BEGIN
    -- Update sign-in tracking
    UPDATE public.user_profiles
    SET 
        last_sign_in_at = NEW.last_sign_in_at,
        total_sign_ins = total_sign_ins + 1,
        is_email_verified = COALESCE(NEW.email_confirmed_at IS NOT NULL, is_email_verified),
        updated_at = NOW()
    WHERE user_id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on user updates (sign-ins update last_sign_in_at)
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE OF last_sign_in_at ON auth.users
    FOR EACH ROW 
    WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
    EXECUTE FUNCTION public.handle_user_sign_in();

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. FUNCTION: Sync subscription tier from user_subscriptions
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION sync_profile_subscription()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_profiles
    SET 
        subscription_tier = NEW.tier,
        subscription_status = NEW.status,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync subscription changes
DROP TRIGGER IF EXISTS on_subscription_change ON user_subscriptions;

CREATE TRIGGER on_subscription_change
    AFTER INSERT OR UPDATE ON user_subscriptions
    FOR EACH ROW 
    EXECUTE FUNCTION sync_profile_subscription();

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. HELPER FUNCTION: Get or create user profile
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_or_create_user_profile(p_user_id UUID)
RETURNS user_profiles AS $$
DECLARE
    profile user_profiles;
    auth_user auth.users;
BEGIN
    -- Try to get existing profile
    SELECT * INTO profile FROM user_profiles WHERE user_id = p_user_id;
    
    IF FOUND THEN
        RETURN profile;
    END IF;
    
    -- Get user from auth.users
    SELECT * INTO auth_user FROM auth.users WHERE id = p_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found in auth.users';
    END IF;
    
    -- Create profile
    INSERT INTO user_profiles (
        user_id,
        email,
        full_name,
        is_email_verified,
        signup_source,
        last_sign_in_at,
        created_at
    )
    VALUES (
        auth_user.id,
        auth_user.email,
        COALESCE(
            auth_user.raw_user_meta_data->>'full_name',
            auth_user.raw_user_meta_data->>'name',
            SPLIT_PART(auth_user.email, '@', 1)
        ),
        auth_user.email_confirmed_at IS NOT NULL,
        COALESCE(auth_user.raw_app_meta_data->>'provider', 'email'),
        auth_user.last_sign_in_at,
        auth_user.created_at
    )
    RETURNING * INTO profile;
    
    RETURN profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. POPULATE USER_PROFILES FROM EXISTING AUTH.USERS DATA
-- This copies all existing users from auth.users to user_profiles
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO user_profiles (
    user_id,
    email,
    full_name,
    avatar_url,
    is_email_verified,
    signup_source,
    last_sign_in_at,
    total_sign_ins,
    created_at,
    updated_at
)
SELECT 
    u.id,
    u.email,
    COALESCE(
        u.raw_user_meta_data->>'full_name',
        u.raw_user_meta_data->>'name',
        u.raw_user_meta_data->>'display_name',
        SPLIT_PART(u.email, '@', 1)
    ) AS full_name,
    COALESCE(
        u.raw_user_meta_data->>'avatar_url',
        u.raw_user_meta_data->>'picture',
        u.raw_user_meta_data->>'photo_url'
    ) AS avatar_url,
    u.email_confirmed_at IS NOT NULL AS is_email_verified,
    CASE 
        WHEN u.raw_app_meta_data->>'provider' = 'google' THEN 'google'
        WHEN u.raw_app_meta_data->>'provider' = 'github' THEN 'github'
        WHEN u.raw_app_meta_data->>'provider' = 'facebook' THEN 'facebook'
        WHEN u.raw_app_meta_data->>'provider' = 'twitter' THEN 'twitter'
        ELSE 'email'
    END AS signup_source,
    u.last_sign_in_at,
    1 AS total_sign_ins,
    u.created_at,
    NOW() AS updated_at
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_profiles p WHERE p.user_id = u.id
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. SYNC SUBSCRIPTION DATA TO USER_PROFILES
-- Copy existing subscription tiers to user_profiles
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE user_profiles p
SET 
    subscription_tier = s.tier,
    subscription_status = s.status,
    updated_at = NOW()
FROM user_subscriptions s
WHERE p.user_id = s.user_id;

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. HELPER FUNCTION: Update user profile
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_user_profile(
    p_user_id UUID,
    p_full_name TEXT DEFAULT NULL,
    p_avatar_url TEXT DEFAULT NULL,
    p_country TEXT DEFAULT NULL,
    p_country_code TEXT DEFAULT NULL,
    p_timezone TEXT DEFAULT NULL,
    p_language TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_email_notifications BOOLEAN DEFAULT NULL,
    p_marketing_emails BOOLEAN DEFAULT NULL,
    p_product_updates BOOLEAN DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS user_profiles AS $$
DECLARE
    profile user_profiles;
BEGIN
    UPDATE user_profiles
    SET
        full_name = COALESCE(p_full_name, full_name),
        avatar_url = COALESCE(p_avatar_url, avatar_url),
        country = COALESCE(p_country, country),
        country_code = COALESCE(p_country_code, country_code),
        timezone = COALESCE(p_timezone, timezone),
        language = COALESCE(p_language, language),
        phone = COALESCE(p_phone, phone),
        email_notifications = COALESCE(p_email_notifications, email_notifications),
        marketing_emails = COALESCE(p_marketing_emails, marketing_emails),
        product_updates = COALESCE(p_product_updates, product_updates),
        metadata = COALESCE(p_metadata, metadata),
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING * INTO profile;
    
    RETURN profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. VIEW: User profiles with subscription info (admin view)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW user_profiles_extended AS
SELECT 
    p.*,
    s.started_at AS subscription_started_at,
    s.expires_at AS subscription_expires_at,
    s.dodo_subscription_id,
    s.dodo_customer_id,
    st.total_quizzes,
    st.average_score,
    st.current_streak,
    st.longest_streak
FROM user_profiles p
LEFT JOIN user_subscriptions s ON p.user_id = s.user_id
LEFT JOIN user_stats st ON p.user_id = st.user_id;

-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION COMPLETE!
-- ═══════════════════════════════════════════════════════════════════════════
-- 
-- User Profiles Table Features:
-- ✓ Basic info (email, name, avatar)
-- ✓ Role management (user, admin, moderator, enterprise_admin)
-- ✓ Subscription tier (synced from user_subscriptions)
-- ✓ Geographic data (country, timezone, language)
-- ✓ Marketing attribution (signup source, UTM params, referrals)
-- ✓ Engagement tracking (sign-ins, last active)
-- ✓ Notification preferences
-- ✓ Flexible metadata field for future needs
--
-- Automatic Features:
-- ✓ Auto-creates profile on new user signup
-- ✓ Auto-updates sign-in tracking
-- ✓ Auto-syncs subscription tier changes
-- ✓ RLS policies for user data privacy
--
-- ═══════════════════════════════════════════════════════════════════════════
