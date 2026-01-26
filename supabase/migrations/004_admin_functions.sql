-- Admin System Migration: Helper Functions
-- Creates utility functions for role-based access control

-- ============================================
-- IS_ADMIN FUNCTION
-- ============================================

-- Checks if the current authenticated user is an admin or super_admin
-- Returns TRUE if user has admin-level access
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
        AND (
            role IN ('admin'::user_role, 'super_admin'::user_role)
            OR is_super_admin = TRUE
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- IS_SUPER_ADMIN FUNCTION
-- ============================================

-- Checks if the current authenticated user is a super_admin
-- Returns TRUE only for platform-level administrators
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
        AND is_super_admin = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- GET_USER_ROLE FUNCTION
-- ============================================

-- Returns the role of the current authenticated user
-- Useful for conditional logic in RLS policies
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
DECLARE
    user_role_value user_role;
BEGIN
    SELECT role INTO user_role_value
    FROM public.profiles
    WHERE id = auth.uid();

    RETURN COALESCE(user_role_value, 'viewer'::user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- HAS_ROLE FUNCTION
-- ============================================

-- Checks if the current user has one of the specified roles
-- Accepts an array of roles to check against
CREATE OR REPLACE FUNCTION public.has_role(allowed_roles user_role[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
        AND (
            role = ANY(allowed_roles)
            OR (is_super_admin = TRUE AND 'super_admin'::user_role = ANY(allowed_roles))
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- CAN_EDIT_RECORDS FUNCTION
-- ============================================

-- Checks if user can create/edit care records
-- Caregivers, admins, and super_admins can edit
CREATE OR REPLACE FUNCTION public.can_edit_records()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.has_role(ARRAY['caregiver', 'admin', 'super_admin']::user_role[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- LOG_ADMIN_ACTION FUNCTION
-- ============================================

-- Logs an admin action for audit purposes
-- Called by triggers or application code
CREATE OR REPLACE FUNCTION public.log_admin_action(
    p_action TEXT,
    p_target_type TEXT,
    p_target_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.admin_activity_logs (
        admin_id,
        action,
        target_type,
        target_id,
        details
    ) VALUES (
        auth.uid(),
        p_action,
        p_target_type,
        p_target_id,
        p_details
    )
    RETURNING id INTO log_id;

    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- IS_FEATURE_ENABLED FUNCTION
-- ============================================

-- Checks if a feature flag is enabled for the current user
-- Takes into account both the enabled status and allowed roles
CREATE OR REPLACE FUNCTION public.is_feature_enabled(feature_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    feature_record RECORD;
    current_role user_role;
BEGIN
    -- Get the feature flag
    SELECT enabled, allowed_roles
    INTO feature_record
    FROM public.feature_flags
    WHERE name = feature_name;

    -- Feature doesn't exist
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Feature is disabled
    IF NOT feature_record.enabled THEN
        RETURN FALSE;
    END IF;

    -- Get current user's role
    SELECT role INTO current_role
    FROM public.profiles
    WHERE id = auth.uid();

    -- Check if user's role is allowed
    RETURN current_role = ANY(feature_record.allowed_roles)
        OR public.is_super_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
