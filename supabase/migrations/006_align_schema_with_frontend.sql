-- Migration 006: Align database schema with frontend code
-- The frontend code references columns that don't exist in the initial schema.
-- This migration adds the missing columns and restructures widget_preferences
-- to match what the application actually uses.

-- ============================================
-- PROFILES: Add max_care_recipients
-- ============================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS max_care_recipients INTEGER NOT NULL DEFAULT 5;

-- ============================================
-- CARE RECIPIENTS: Add medical & contact fields
-- ============================================

ALTER TABLE public.care_recipients
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_email TEXT,
  ADD COLUMN IF NOT EXISTS secondary_emergency_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS secondary_emergency_contact_relationship TEXT,
  ADD COLUMN IF NOT EXISTS secondary_emergency_contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS secondary_emergency_contact_email TEXT,
  ADD COLUMN IF NOT EXISTS primary_condition TEXT,
  ADD COLUMN IF NOT EXISTS conditions_diagnoses TEXT,
  ADD COLUMN IF NOT EXISTS medical_history TEXT,
  ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT,
  ADD COLUMN IF NOT EXISTS physician_phone TEXT;

-- ============================================
-- MEDICATIONS: Add photo_url
-- ============================================

ALTER TABLE public.medications
  ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- ============================================
-- NOTIFICATIONS: Add priority and rename
-- reference columns to match frontend
-- ============================================

-- Add the columns the frontend expects
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS priority TEXT,
  ADD COLUMN IF NOT EXISTS related_entity_type TEXT,
  ADD COLUMN IF NOT EXISTS related_entity_id TEXT;

-- Copy existing data from old columns to new columns
UPDATE public.notifications
  SET related_entity_type = reference_type,
      related_entity_id = reference_id::TEXT
  WHERE reference_type IS NOT NULL OR reference_id IS NOT NULL;

-- Drop old columns
ALTER TABLE public.notifications
  DROP COLUMN IF EXISTS reference_type,
  DROP COLUMN IF EXISTS reference_id;

-- ============================================
-- TEAM ANNOUNCEMENTS: Add read_by tracking
-- ============================================

ALTER TABLE public.team_announcements
  ADD COLUMN IF NOT EXISTS read_by UUID[] DEFAULT '{}';

-- ============================================
-- WIDGET PREFERENCES: Restructure to match
-- frontend (widget_config instead of per-widget rows)
-- ============================================

-- Drop the old unique constraint and columns
ALTER TABLE public.widget_preferences
  DROP CONSTRAINT IF EXISTS widget_preferences_user_id_widget_id_key;

ALTER TABLE public.widget_preferences
  DROP COLUMN IF EXISTS widget_id,
  DROP COLUMN IF EXISTS is_visible,
  DROP COLUMN IF EXISTS position,
  DROP COLUMN IF EXISTS settings;

-- Add the column the frontend expects
ALTER TABLE public.widget_preferences
  ADD COLUMN IF NOT EXISTS widget_config TEXT;

-- Add a unique constraint on user_id so each user has one row
ALTER TABLE public.widget_preferences
  ADD CONSTRAINT widget_preferences_user_id_unique UNIQUE (user_id);
