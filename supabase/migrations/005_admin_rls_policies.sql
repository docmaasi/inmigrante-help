-- Admin System Migration: RLS Policies
-- Creates Row Level Security policies for admin tables

-- ============================================
-- SYSTEM SETTINGS RLS POLICIES
-- ============================================

-- Anyone authenticated can read system settings
CREATE POLICY "Authenticated users can view system settings"
    ON public.system_settings
    FOR SELECT
    TO authenticated
    USING (TRUE);

-- Only super admins can insert system settings
CREATE POLICY "Super admins can insert system settings"
    ON public.system_settings
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_super_admin());

-- Only super admins can update system settings
CREATE POLICY "Super admins can update system settings"
    ON public.system_settings
    FOR UPDATE
    TO authenticated
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- Only super admins can delete system settings
CREATE POLICY "Super admins can delete system settings"
    ON public.system_settings
    FOR DELETE
    TO authenticated
    USING (public.is_super_admin());

-- ============================================
-- ADMIN ACTIVITY LOGS RLS POLICIES
-- ============================================

-- Admins can view their own activity logs
-- Super admins can view all activity logs
CREATE POLICY "Admins can view activity logs"
    ON public.admin_activity_logs
    FOR SELECT
    TO authenticated
    USING (
        admin_id = auth.uid()
        OR public.is_super_admin()
    );

-- Any authenticated admin can insert activity logs
-- The function itself validates admin status
CREATE POLICY "Admins can insert activity logs"
    ON public.admin_activity_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (
        admin_id = auth.uid()
        AND public.is_admin()
    );

-- Activity logs are immutable - no updates allowed
-- (No UPDATE policy created intentionally)

-- Activity logs are immutable - no deletes allowed
-- (No DELETE policy created intentionally)

-- ============================================
-- FEATURE FLAGS RLS POLICIES
-- ============================================

-- Anyone authenticated can read feature flags
-- Application code uses this to check feature availability
CREATE POLICY "Authenticated users can view feature flags"
    ON public.feature_flags
    FOR SELECT
    TO authenticated
    USING (TRUE);

-- Only super admins can create feature flags
CREATE POLICY "Super admins can insert feature flags"
    ON public.feature_flags
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_super_admin());

-- Only super admins can update feature flags
CREATE POLICY "Super admins can update feature flags"
    ON public.feature_flags
    FOR UPDATE
    TO authenticated
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- Only super admins can delete feature flags
CREATE POLICY "Super admins can delete feature flags"
    ON public.feature_flags
    FOR DELETE
    TO authenticated
    USING (public.is_super_admin());

-- ============================================
-- ENHANCED PROFILES RLS POLICIES
-- ============================================

-- Super admins can view all profiles
-- Note: This extends the existing "Users can view own profile" policy
CREATE POLICY "Super admins can view all profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (public.is_super_admin());

-- Super admins can update any profile
CREATE POLICY "Super admins can update all profiles"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- ============================================
-- ENHANCED TEAM MEMBERS RLS POLICIES
-- ============================================

-- Admins can update team member roles within their circle
CREATE POLICY "Admins can update team member roles"
    ON public.team_members
    FOR UPDATE
    TO authenticated
    USING (
        public.is_admin()
        AND user_id = auth.uid()
    )
    WITH CHECK (
        public.is_admin()
        AND user_id = auth.uid()
    );

-- ============================================
-- SERVICE ROLE BYPASS POLICIES
-- ============================================

-- Allow service role to bypass RLS for admin operations
-- These are used by Edge Functions with service role key

-- Service role can manage all admin activity logs
CREATE POLICY "Service role can manage admin activity logs"
    ON public.admin_activity_logs
    FOR ALL
    TO service_role
    USING (TRUE)
    WITH CHECK (TRUE);

-- Service role can manage all system settings
CREATE POLICY "Service role can manage system settings"
    ON public.system_settings
    FOR ALL
    TO service_role
    USING (TRUE)
    WITH CHECK (TRUE);

-- Service role can manage all feature flags
CREATE POLICY "Service role can manage feature flags"
    ON public.feature_flags
    FOR ALL
    TO service_role
    USING (TRUE)
    WITH CHECK (TRUE);
