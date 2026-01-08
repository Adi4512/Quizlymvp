-- ═══════════════════════════════════════════════════════════════════════════
-- QUIZETHIC AI - User Stats & Quiz Results Schema
-- ═══════════════════════════════════════════════════════════════════════════
-- Run this in Supabase SQL Editor after running schema.sql
-- Dashboard → SQL Editor → New Query → Paste & Run
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. QUIZ RESULTS TABLE
-- Stores each completed quiz with score details
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'Mix')),
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    score_percentage DECIMAL(5,2) NOT NULL, -- e.g., 85.50
    time_taken_seconds INTEGER, -- Optional: how long the quiz took
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure correct_answers doesn't exceed total
    CONSTRAINT valid_score CHECK (correct_answers <= total_questions AND correct_answers >= 0)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_completed_at ON quiz_results(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_date ON quiz_results(user_id, completed_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. USER STATS TABLE
-- Aggregated statistics for quick profile display
-- Updated via trigger when quiz_results changes
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_stats (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_quizzes INTEGER NOT NULL DEFAULT 0,
    total_questions_answered INTEGER NOT NULL DEFAULT 0,
    total_correct_answers INTEGER NOT NULL DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0, -- Percentage
    best_score DECIMAL(5,2) DEFAULT 0, -- Highest quiz score
    worst_score DECIMAL(5,2) DEFAULT 100, -- Lowest quiz score (for improvement tracking)
    current_streak INTEGER NOT NULL DEFAULT 0, -- Consecutive days
    longest_streak INTEGER NOT NULL DEFAULT 0, -- All-time best streak
    last_quiz_date DATE, -- For streak calculation
    favorite_topic TEXT, -- Most frequently quizzed topic
    favorite_difficulty TEXT, -- Most used difficulty
    total_time_spent_seconds INTEGER DEFAULT 0, -- Total time in quizzes
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Quiz Results: Users can read/insert their own
CREATE POLICY "Users can view own quiz results" ON quiz_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz results" ON quiz_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access to quiz_results" ON quiz_results
    FOR ALL USING (auth.role() = 'service_role');

-- User Stats: Users can read their own
CREATE POLICY "Users can view own stats" ON user_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to user_stats" ON user_stats
    FOR ALL USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. FUNCTION: Update user stats after quiz completion
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_user_stats_on_quiz()
RETURNS TRIGGER AS $$
DECLARE
    v_last_date DATE;
    v_today DATE := CURRENT_DATE;
    v_new_streak INTEGER;
    v_longest_streak INTEGER;
    v_favorite_topic TEXT;
    v_favorite_difficulty TEXT;
BEGIN
    -- Get current stats
    SELECT last_quiz_date, current_streak, longest_streak
    INTO v_last_date, v_new_streak, v_longest_streak
    FROM user_stats
    WHERE user_id = NEW.user_id;

    -- If no stats exist yet, initialize
    IF NOT FOUND THEN
        v_new_streak := 1;
        v_longest_streak := 1;
    ELSE
        -- Calculate streak
        IF v_last_date IS NULL THEN
            v_new_streak := 1;
        ELSIF v_last_date = v_today THEN
            -- Same day, no streak change
            NULL;
        ELSIF v_last_date = v_today - 1 THEN
            -- Consecutive day, increment streak
            v_new_streak := v_new_streak + 1;
        ELSE
            -- Streak broken, reset to 1
            v_new_streak := 1;
        END IF;
        
        -- Update longest streak if current is higher
        IF v_new_streak > v_longest_streak THEN
            v_longest_streak := v_new_streak;
        END IF;
    END IF;

    -- Get favorite topic (most frequent)
    SELECT topic INTO v_favorite_topic
    FROM quiz_results
    WHERE user_id = NEW.user_id
    GROUP BY topic
    ORDER BY COUNT(*) DESC
    LIMIT 1;

    -- Get favorite difficulty
    SELECT difficulty INTO v_favorite_difficulty
    FROM quiz_results
    WHERE user_id = NEW.user_id
    GROUP BY difficulty
    ORDER BY COUNT(*) DESC
    LIMIT 1;

    -- Upsert user stats
    INSERT INTO user_stats (
        user_id,
        total_quizzes,
        total_questions_answered,
        total_correct_answers,
        average_score,
        best_score,
        worst_score,
        current_streak,
        longest_streak,
        last_quiz_date,
        favorite_topic,
        favorite_difficulty,
        total_time_spent_seconds,
        updated_at
    )
    SELECT
        NEW.user_id,
        COUNT(*),
        SUM(total_questions),
        SUM(correct_answers),
        ROUND(AVG(score_percentage)::numeric, 2),
        MAX(score_percentage),
        MIN(score_percentage),
        v_new_streak,
        v_longest_streak,
        v_today,
        v_favorite_topic,
        v_favorite_difficulty,
        COALESCE(SUM(time_taken_seconds), 0),
        NOW()
    FROM quiz_results
    WHERE user_id = NEW.user_id
    ON CONFLICT (user_id) DO UPDATE SET
        total_quizzes = EXCLUDED.total_quizzes,
        total_questions_answered = EXCLUDED.total_questions_answered,
        total_correct_answers = EXCLUDED.total_correct_answers,
        average_score = EXCLUDED.average_score,
        best_score = EXCLUDED.best_score,
        worst_score = EXCLUDED.worst_score,
        current_streak = EXCLUDED.current_streak,
        longest_streak = EXCLUDED.longest_streak,
        last_quiz_date = EXCLUDED.last_quiz_date,
        favorite_topic = EXCLUDED.favorite_topic,
        favorite_difficulty = EXCLUDED.favorite_difficulty,
        total_time_spent_seconds = EXCLUDED.total_time_spent_seconds,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. TRIGGER: Auto-update stats when quiz result is inserted
-- ─────────────────────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS trigger_update_user_stats ON quiz_results;

CREATE TRIGGER trigger_update_user_stats
    AFTER INSERT ON quiz_results
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats_on_quiz();

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. FUNCTION: Get user stats (creates if not exists)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS user_stats AS $$
DECLARE
    stats user_stats;
BEGIN
    SELECT * INTO stats FROM user_stats WHERE user_id = p_user_id;
    
    -- If no stats exist, return defaults
    IF NOT FOUND THEN
        stats.user_id := p_user_id;
        stats.total_quizzes := 0;
        stats.total_questions_answered := 0;
        stats.total_correct_answers := 0;
        stats.average_score := 0;
        stats.best_score := 0;
        stats.worst_score := 0;
        stats.current_streak := 0;
        stats.longest_streak := 0;
        stats.last_quiz_date := NULL;
        stats.favorite_topic := NULL;
        stats.favorite_difficulty := NULL;
        stats.total_time_spent_seconds := 0;
    END IF;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. FUNCTION: Check and decay streak (run daily via cron)
-- If user didn't take quiz yesterday, reset streak
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION decay_inactive_streaks()
RETURNS void AS $$
BEGIN
    UPDATE user_stats
    SET 
        current_streak = 0,
        updated_at = NOW()
    WHERE 
        last_quiz_date < CURRENT_DATE - 1
        AND current_streak > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════
-- STATS REFERENCE
-- ═══════════════════════════════════════════════════════════════════════════
-- After quiz completion, frontend should POST to save the result:
-- {
--   "user_id": "uuid",
--   "topic": "Physics",
--   "difficulty": "Medium",
--   "total_questions": 10,
--   "correct_answers": 8,
--   "score_percentage": 80.00,
--   "time_taken_seconds": 300
-- }
--
-- The trigger will automatically update user_stats!
-- ═══════════════════════════════════════════════════════════════════════════

