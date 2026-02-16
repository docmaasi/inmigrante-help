-- 011_security_fixes.sql
-- Fixes critical security and data integrity issues found during audit
-- Safe, additive changes only — no data loss, no breaking changes

-- ==============================================
-- 1. Add missing columns to profiles table
--    Edge functions (cancel-subscription, cleanup-expired-trials,
--    stripe-webhook) reference these columns but they were never created.
--    Without them, those functions silently fail.
-- ==============================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deletion_status TEXT,
  ADD COLUMN IF NOT EXISTS deletion_scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deletion_reason TEXT,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT;

-- Index for cleanup queries that filter by deletion status
CREATE INDEX IF NOT EXISTS idx_profiles_deletion_status
  ON public.profiles (deletion_status)
  WHERE deletion_status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
  ON public.profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- ==============================================
-- 2. Fix blocked_trial_emails RLS policy (CRITICAL)
--    Old policy: USING (true) — any user can read ALL blocked emails
--    New policy: users can only check if THEIR OWN email is blocked
-- ==============================================
DROP POLICY IF EXISTS "Users can check own email block status"
  ON public.blocked_trial_emails;

CREATE POLICY "Users can check own email block status"
  ON public.blocked_trial_emails
  FOR SELECT
  TO authenticated
  USING (
    email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- ==============================================
-- 3. Fix documents storage bucket (CRITICAL)
--    Old policy: public read access — anyone with a URL can see
--    medical records, insurance cards, etc.
--    New policy: only authenticated users can read their own docs
-- ==============================================
DROP POLICY IF EXISTS "Public read access for documents"
  ON storage.objects;

CREATE POLICY "Authenticated users can read own documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Make the bucket private (no unauthenticated URL access)
UPDATE storage.buckets
  SET public = false
  WHERE id = 'documents';

-- ==============================================
-- 4. Add unique constraint on subscriptions.stripe_subscription_id
--    The Stripe webhook uses upsert with onConflict: 'stripe_subscription_id'
--    Without this constraint, upserts fail and create duplicate records.
-- ==============================================
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_stripe_subscription_id_unique
  UNIQUE (stripe_subscription_id);

-- ==============================================
-- 5. Fix action_logs RLS policy
--    Old policy: users see logs where they are user_id OR actor_id
--    Problem: if user A acts on user B's data, user B can see user A's
--    actions — potential privacy leak across care teams.
--    New policy: users only see logs where they are the actor.
-- ==============================================
DROP POLICY IF EXISTS "Users can view own action logs"
  ON public.action_logs;

CREATE POLICY "Users can view own action logs"
  ON public.action_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = actor_id);

-- ==============================================
-- 6. Add missing indexes for performance
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_team_members_invited_user_id
  ON public.team_members (invited_user_id)
  WHERE invited_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_participant_ids
  ON public.conversations USING GIN (participant_ids);

CREATE INDEX IF NOT EXISTS idx_documents_shared_with
  ON public.documents USING GIN (shared_with);
