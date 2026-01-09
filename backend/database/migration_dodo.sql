-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION: Razorpay to Dodo Payments
-- ═══════════════════════════════════════════════════════════════════════════
-- Run this in Supabase SQL Editor to add Dodo payment columns
-- Dashboard → SQL Editor → New Query → Paste & Run
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. ADD DODO COLUMNS TO USER_SUBSCRIPTIONS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS dodo_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS dodo_customer_id TEXT,
ADD COLUMN IF NOT EXISTS dodo_payment_id TEXT;

-- Create indexes for Dodo fields
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_dodo_sub ON user_subscriptions(dodo_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_dodo_customer ON user_subscriptions(dodo_customer_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. ADD DODO COLUMNS TO PAYMENTS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS dodo_payment_id TEXT,
ADD COLUMN IF NOT EXISTS dodo_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS dodo_customer_id TEXT;

-- Make razorpay columns optional (they may contain NULL for Dodo payments)
-- Note: These columns already allow NULL, just adding for clarity

-- Create indexes for Dodo payment fields
CREATE INDEX IF NOT EXISTS idx_payments_dodo_payment ON payments(dodo_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_dodo_subscription ON payments(dodo_subscription_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. UPDATE PAYMENT STATUS CHECK CONSTRAINT
-- ─────────────────────────────────────────────────────────────────────────────
-- Dodo uses 'succeeded' instead of 'captured', so update the constraint
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE payments ADD CONSTRAINT payments_status_check 
  CHECK (status IN ('pending', 'captured', 'succeeded', 'failed', 'refunded'));

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. UPDATE UPGRADE_TO_PRO FUNCTION FOR DODO
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION upgrade_to_pro_dodo(
    p_user_id UUID,
    p_dodo_subscription_id TEXT,
    p_dodo_customer_id TEXT DEFAULT NULL,
    p_dodo_payment_id TEXT DEFAULT NULL,
    p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS user_subscriptions AS $$
DECLARE
    sub user_subscriptions;
BEGIN
    INSERT INTO user_subscriptions (
        user_id, 
        tier, 
        status, 
        expires_at, 
        dodo_subscription_id,
        dodo_customer_id,
        dodo_payment_id
    )
    VALUES (
        p_user_id, 
        'pro', 
        'active', 
        p_expires_at,
        p_dodo_subscription_id,
        p_dodo_customer_id,
        p_dodo_payment_id
    )
    ON CONFLICT (user_id)
    DO UPDATE SET 
        tier = 'pro',
        status = 'active',
        expires_at = p_expires_at,
        dodo_subscription_id = p_dodo_subscription_id,
        dodo_customer_id = COALESCE(p_dodo_customer_id, user_subscriptions.dodo_customer_id),
        dodo_payment_id = COALESCE(p_dodo_payment_id, user_subscriptions.dodo_payment_id),
        updated_at = NOW()
    RETURNING * INTO sub;
    
    RETURN sub;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════
-- DONE! Your database is now ready for Dodo Payments.
-- The old Razorpay columns are preserved for historical data.
-- ═══════════════════════════════════════════════════════════════════════════
