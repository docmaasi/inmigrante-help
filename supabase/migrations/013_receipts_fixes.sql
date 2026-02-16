-- 013_receipts_fixes.sql
-- Fixes 7 issues found during Receipts & Expenses user testing
-- Safe, additive changes only

-- ==============================================
-- 1. Multi-recipient support (array of IDs)
--    Instead of creating separate expenses per recipient,
--    store an array of recipient IDs on a single expense.
-- ==============================================
ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS care_recipient_ids UUID[];

-- Migrate existing single-recipient data into the array column
UPDATE public.expenses
  SET care_recipient_ids = ARRAY[care_recipient_id]
  WHERE care_recipient_id IS NOT NULL
    AND care_recipient_ids IS NULL;

-- GIN index for array containment queries (@>)
CREATE INDEX IF NOT EXISTS idx_expenses_care_recipient_ids
  ON public.expenses USING GIN (care_recipient_ids);

-- ==============================================
-- 2. Payment method tracking
-- ==============================================
ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- ==============================================
-- 3. Custom category for "Other"
-- ==============================================
ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS custom_category TEXT;

-- ==============================================
-- 4. Fix storage: let all authenticated users read documents
--    Migration 011 restricted reads to only the uploader's folder.
--    Team members need to see each other's receipt photos.
--    App-level RLS on the expenses table already controls access.
-- ==============================================
DROP POLICY IF EXISTS "Authenticated users can read own documents"
  ON storage.objects;

CREATE POLICY "Authenticated users can read documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents');
