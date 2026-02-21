-- 016_team_member_access.sql
-- Enables team-based access: trigger auto-linking, helper functions, and RLS policies.
--
-- Safe to re-run: DROP POLICY IF EXISTS guards prevent duplicate errors.

-- ==========================================================
-- 0. Drop any previously-applied policies so this is re-runnable
-- ==========================================================
DROP POLICY IF EXISTS "team_select_care_recipients"    ON public.care_recipients;
DROP POLICY IF EXISTS "team_select_appointments"        ON public.appointments;
DROP POLICY IF EXISTS "team_select_caregiver_shifts"    ON public.caregiver_shifts;
DROP POLICY IF EXISTS "team_select_medications"         ON public.medications;
DROP POLICY IF EXISTS "team_select_medication_logs"     ON public.medication_logs;
DROP POLICY IF EXISTS "team_select_medication_refills"  ON public.medication_refills;
DROP POLICY IF EXISTS "team_select_tasks"               ON public.tasks;
DROP POLICY IF EXISTS "team_select_care_tasks"          ON public.care_tasks;
DROP POLICY IF EXISTS "team_select_care_notes"          ON public.care_notes;
DROP POLICY IF EXISTS "team_select_care_plans"          ON public.care_plans;
DROP POLICY IF EXISTS "team_select_documents"           ON public.documents;
DROP POLICY IF EXISTS "team_select_care_plan_details"   ON public.care_plan_details;
DROP POLICY IF EXISTS "team_insert_appointments"        ON public.appointments;
DROP POLICY IF EXISTS "team_update_appointments"        ON public.appointments;
DROP POLICY IF EXISTS "team_insert_medication_logs"     ON public.medication_logs;
DROP POLICY IF EXISTS "team_update_medication_logs"     ON public.medication_logs;
DROP POLICY IF EXISTS "team_insert_tasks"               ON public.tasks;
DROP POLICY IF EXISTS "team_update_tasks"               ON public.tasks;
DROP POLICY IF EXISTS "team_insert_care_tasks"          ON public.care_tasks;
DROP POLICY IF EXISTS "team_update_care_tasks"          ON public.care_tasks;
DROP POLICY IF EXISTS "team_insert_care_notes"          ON public.care_notes;
DROP POLICY IF EXISTS "team_update_care_notes"          ON public.care_notes;
DROP POLICY IF EXISTS "team_insert_caregiver_shifts"    ON public.caregiver_shifts;
DROP POLICY IF EXISTS "team_update_caregiver_shifts"    ON public.caregiver_shifts;
DROP POLICY IF EXISTS "team_insert_documents"           ON public.documents;
DROP POLICY IF EXISTS "team_update_documents"           ON public.documents;

-- ==========================================================
-- 1. Update handle_new_user() to auto-link pending invites
-- ==========================================================
-- When someone signs up with an email that already has a pending team invite,
-- their new account is immediately connected to the invite (status → accepted).
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

    -- Auto-link any pending invite sent to this email address.
    UPDATE public.team_members
    SET
      invited_user_id = NEW.id,
      status = 'accepted',
      accepted_at = now()
    WHERE lower(email) = lower(NEW.email)
      AND status = 'pending'
      AND invited_user_id IS NULL;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================================
-- 2. RLS helper functions
-- ==========================================================
-- Written once here, reused across all table policies below.
-- SECURITY DEFINER lets them read team_members even for restricted users.

-- Returns TRUE if the current user is an accepted team member in owner_id's
-- workspace, and (optionally) is assigned to a specific care recipient.
CREATE OR REPLACE FUNCTION team_has_access(owner_id UUID, cr_id UUID DEFAULT NULL)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.invited_user_id = auth.uid()
      AND tm.status = 'accepted'
      AND tm.user_id = owner_id
      AND (
        cr_id IS NULL
        OR tm.care_recipient_ids IS NULL
        OR cr_id = ANY(tm.care_recipient_ids)
      )
  );
$$;

-- Same as team_has_access but also requires admin or caregiver role.
-- Used to gate INSERT and UPDATE operations.
CREATE OR REPLACE FUNCTION team_can_write(owner_id UUID, cr_id UUID DEFAULT NULL)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.invited_user_id = auth.uid()
      AND tm.status = 'accepted'
      AND tm.user_id = owner_id
      AND tm.role IN ('admin', 'caregiver')
      AND (
        cr_id IS NULL
        OR tm.care_recipient_ids IS NULL
        OR cr_id = ANY(tm.care_recipient_ids)
      )
  );
$$;

-- ==========================================================
-- 3. SELECT policies — all team roles can read care data
-- ==========================================================

-- care_recipients: the row's own id IS the care recipient id
CREATE POLICY "team_select_care_recipients" ON public.care_recipients
  FOR SELECT USING (
    auth.uid() = user_id
    OR team_has_access(user_id, id)
  );

-- appointments
CREATE POLICY "team_select_appointments" ON public.appointments
  FOR SELECT USING (
    auth.uid() = user_id
    OR team_has_access(user_id, care_recipient_id)
  );

-- caregiver_shifts
CREATE POLICY "team_select_caregiver_shifts" ON public.caregiver_shifts
  FOR SELECT USING (
    auth.uid() = user_id
    OR team_has_access(user_id, care_recipient_id)
  );

-- medications
CREATE POLICY "team_select_medications" ON public.medications
  FOR SELECT USING (
    auth.uid() = user_id
    OR team_has_access(user_id, care_recipient_id)
  );

-- medication_logs
CREATE POLICY "team_select_medication_logs" ON public.medication_logs
  FOR SELECT USING (
    auth.uid() = user_id
    OR team_has_access(user_id, care_recipient_id)
  );

-- medication_refills: no care_recipient_id column — look it up through medications
CREATE POLICY "team_select_medication_refills" ON public.medication_refills
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.medications m
      WHERE m.id = medication_id
        AND team_has_access(m.user_id, m.care_recipient_id)
    )
  );

-- tasks
CREATE POLICY "team_select_tasks" ON public.tasks
  FOR SELECT USING (
    auth.uid() = user_id
    OR team_has_access(user_id, care_recipient_id)
  );

-- care_tasks
CREATE POLICY "team_select_care_tasks" ON public.care_tasks
  FOR SELECT USING (
    auth.uid() = user_id
    OR team_has_access(user_id, care_recipient_id)
  );

-- care_notes
CREATE POLICY "team_select_care_notes" ON public.care_notes
  FOR SELECT USING (
    auth.uid() = user_id
    OR team_has_access(user_id, care_recipient_id)
  );

-- care_plans
CREATE POLICY "team_select_care_plans" ON public.care_plans
  FOR SELECT USING (
    auth.uid() = user_id
    OR team_has_access(user_id, care_recipient_id)
  );

-- documents
CREATE POLICY "team_select_documents" ON public.documents
  FOR SELECT USING (
    auth.uid() = user_id
    OR team_has_access(user_id, care_recipient_id)
  );

-- care_plan_details: no user_id column — look it up through care_plans
CREATE POLICY "team_select_care_plan_details" ON public.care_plan_details
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.care_plans cp
      WHERE cp.id = care_plan_id
        AND (
          cp.user_id = auth.uid()
          OR team_has_access(cp.user_id, cp.care_recipient_id)
        )
    )
  );

-- ==========================================================
-- 4. INSERT/UPDATE policies — admin + caregiver can write
-- ==========================================================
-- Owner-only tables (no team write access per spec):
--   care_recipients, medications, team_members, subscriptions, profiles

-- appointments
CREATE POLICY "team_insert_appointments" ON public.appointments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR team_can_write(user_id, care_recipient_id)
  );

CREATE POLICY "team_update_appointments" ON public.appointments
  FOR UPDATE USING (
    auth.uid() = user_id
    OR team_can_write(user_id, care_recipient_id)
  );

-- medication_logs
CREATE POLICY "team_insert_medication_logs" ON public.medication_logs
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR team_can_write(user_id, care_recipient_id)
  );

CREATE POLICY "team_update_medication_logs" ON public.medication_logs
  FOR UPDATE USING (
    auth.uid() = user_id
    OR team_can_write(user_id, care_recipient_id)
  );

-- tasks
CREATE POLICY "team_insert_tasks" ON public.tasks
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR team_can_write(user_id, care_recipient_id)
  );

CREATE POLICY "team_update_tasks" ON public.tasks
  FOR UPDATE USING (
    auth.uid() = user_id
    OR team_can_write(user_id, care_recipient_id)
  );

-- care_tasks
CREATE POLICY "team_insert_care_tasks" ON public.care_tasks
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR team_can_write(user_id, care_recipient_id)
  );

CREATE POLICY "team_update_care_tasks" ON public.care_tasks
  FOR UPDATE USING (
    auth.uid() = user_id
    OR team_can_write(user_id, care_recipient_id)
  );

-- care_notes
CREATE POLICY "team_insert_care_notes" ON public.care_notes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR team_can_write(user_id, care_recipient_id)
  );

CREATE POLICY "team_update_care_notes" ON public.care_notes
  FOR UPDATE USING (
    auth.uid() = user_id
    OR team_can_write(user_id, care_recipient_id)
  );

-- caregiver_shifts
CREATE POLICY "team_insert_caregiver_shifts" ON public.caregiver_shifts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR team_can_write(user_id, care_recipient_id)
  );

CREATE POLICY "team_update_caregiver_shifts" ON public.caregiver_shifts
  FOR UPDATE USING (
    auth.uid() = user_id
    OR team_can_write(user_id, care_recipient_id)
  );

-- documents
CREATE POLICY "team_insert_documents" ON public.documents
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR team_can_write(user_id, care_recipient_id)
  );

CREATE POLICY "team_update_documents" ON public.documents
  FOR UPDATE USING (
    auth.uid() = user_id
    OR team_can_write(user_id, care_recipient_id)
  );
