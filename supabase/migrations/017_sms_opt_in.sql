-- Add SMS opt-in column to profiles.
-- Required for TCPA legal compliance — users must explicitly consent
-- before receiving any SMS messages. Defaults to false (opt-out by default).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS sms_reminders_enabled BOOLEAN NOT NULL DEFAULT FALSE;
