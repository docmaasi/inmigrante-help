-- Track which trial reminder emails have been sent to each user.
-- Values like '3day', '1day', 'expired' are appended as reminders go out.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS trial_reminders_sent TEXT[] DEFAULT '{}';
