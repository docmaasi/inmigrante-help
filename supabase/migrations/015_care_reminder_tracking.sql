-- Track when care reminder emails were sent.
-- Appointment reminders reset automatically when an appointment is rescheduled.
-- Medication refill reminders reset automatically when refills are restocked.

-- ============================================
-- APPOINTMENTS: reminder tracking column
-- ============================================

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;

-- ============================================
-- MEDICATIONS: refill reminder tracking column
-- ============================================

ALTER TABLE public.medications
  ADD COLUMN IF NOT EXISTS refill_reminder_sent_at TIMESTAMPTZ;

-- ============================================
-- TRIGGER: Reset appointment reminder when
-- start_time changes (appointment rescheduled)
-- ============================================

CREATE OR REPLACE FUNCTION reset_appointment_reminder_on_reschedule()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.start_time IS DISTINCT FROM OLD.start_time THEN
    NEW.reminder_sent_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reset_appointment_reminder
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION reset_appointment_reminder_on_reschedule();

-- ============================================
-- TRIGGER: Reset medication refill reminder when
-- refills_remaining increases (new refill received)
-- ============================================

CREATE OR REPLACE FUNCTION reset_refill_reminder_on_restock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.refills_remaining IS NOT NULL
     AND OLD.refills_remaining IS NOT NULL
     AND NEW.refills_remaining > OLD.refills_remaining THEN
    NEW.refill_reminder_sent_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reset_refill_reminder
  BEFORE UPDATE ON public.medications
  FOR EACH ROW EXECUTE FUNCTION reset_refill_reminder_on_restock();

-- ============================================
-- INDEXES for cron query performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_appointments_reminder_cron
  ON public.appointments(start_time, reminder_sent_at)
  WHERE reminder_sent_at IS NULL AND status != 'cancelled';

CREATE INDEX IF NOT EXISTS idx_medications_refill_reminder_cron
  ON public.medications(refills_remaining, refill_reminder_sent_at)
  WHERE refill_reminder_sent_at IS NULL AND is_active = TRUE;
