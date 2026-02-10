-- 009_trial_system.sql
-- Adds trial tracking, email blocking, and message status

-- ==============================================
-- 1. Add trial columns to profiles
-- ==============================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS data_deletion_scheduled_at TIMESTAMPTZ;

-- ==============================================
-- 2. Create blocked_trial_emails table
-- ==============================================
CREATE TABLE IF NOT EXISTS blocked_trial_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  blocked_at TIMESTAMPTZ DEFAULT now(),
  reason TEXT DEFAULT 'trial_expired_no_subscription',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE blocked_trial_emails ENABLE ROW LEVEL SECURITY;

-- Only service role can manage blocked emails (no user access)
CREATE POLICY "Service role manages blocked emails"
  ON blocked_trial_emails
  FOR ALL
  USING (auth.role() = 'service_role');

-- Allow authenticated users to check if their email is blocked
CREATE POLICY "Users can check own email block status"
  ON blocked_trial_emails
  FOR SELECT
  USING (true);

-- Index for fast email lookups
CREATE INDEX IF NOT EXISTS idx_blocked_trial_emails_email
  ON blocked_trial_emails (email);

-- ==============================================
-- 3. Add status column to messages table
-- ==============================================
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent';

-- ==============================================
-- 4. Backfill existing profiles with trial dates
-- ==============================================
UPDATE profiles
SET
  trial_started_at = created_at,
  trial_ends_at = created_at + INTERVAL '10 days'
WHERE trial_started_at IS NULL;

-- ==============================================
-- 5. Auto-update updated_at on blocked_trial_emails
-- ==============================================
CREATE TRIGGER set_blocked_trial_emails_updated_at
  BEFORE UPDATE ON blocked_trial_emails
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- 6. Update handle_new_user() to set trial dates
-- ==============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
      id, email, full_name,
      trial_started_at, trial_ends_at, data_deletion_scheduled_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        now(),
        now() + INTERVAL '10 days',
        now() + INTERVAL '20 days'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
