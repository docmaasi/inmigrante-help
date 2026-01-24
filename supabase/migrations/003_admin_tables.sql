-- Admin System Migration: Admin Tables
-- Creates system_settings, admin_activity_logs, and feature_flags tables

-- ============================================
-- SYSTEM SETTINGS TABLE
-- ============================================

-- Stores global application configuration
CREATE TABLE public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for system_settings
CREATE INDEX idx_system_settings_key ON public.system_settings(key);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Apply updated_at trigger
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ADMIN ACTIVITY LOGS TABLE
-- ============================================

-- Tracks all admin actions for audit purposes
CREATE TABLE public.admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_admin_activity_admin_id ON public.admin_activity_logs(admin_id);
CREATE INDEX idx_admin_activity_created_at ON public.admin_activity_logs(created_at DESC);
CREATE INDEX idx_admin_activity_target ON public.admin_activity_logs(target_type, target_id);
CREATE INDEX idx_admin_activity_action ON public.admin_activity_logs(action);

-- Enable RLS
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FEATURE FLAGS TABLE
-- ============================================

-- Controls feature availability by role
CREATE TABLE public.feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    allowed_roles user_role[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for feature_flags
CREATE INDEX idx_feature_flags_name ON public.feature_flags(name);
CREATE INDEX idx_feature_flags_enabled ON public.feature_flags(enabled) WHERE enabled = TRUE;

-- Enable RLS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Apply updated_at trigger
CREATE TRIGGER update_feature_flags_updated_at
    BEFORE UPDATE ON public.feature_flags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INSERT DEFAULT SYSTEM SETTINGS
-- ============================================

INSERT INTO public.system_settings (key, value, description) VALUES
    ('app_name', '"FamilyCare.help"', 'Application display name'),
    ('default_timezone', '"America/New_York"', 'Default timezone for new users'),
    ('session_timeout_minutes', '60', 'Session timeout in minutes'),
    ('max_team_members', '10', 'Maximum team members per care circle'),
    ('max_care_recipients', '5', 'Maximum care recipients per account'),
    ('maintenance_mode', 'false', 'Enable maintenance mode'),
    ('registration_enabled', 'true', 'Allow new user registration')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- INSERT DEFAULT FEATURE FLAGS
-- ============================================

INSERT INTO public.feature_flags (name, enabled, description, allowed_roles) VALUES
    ('dark_mode', TRUE, 'Enable dark mode theme', ARRAY['super_admin', 'admin', 'caregiver', 'viewer']::user_role[]),
    ('ai_assistant', FALSE, 'AI-powered care assistant', ARRAY['super_admin', 'admin']::user_role[]),
    ('export_data', TRUE, 'Export care data to CSV/PDF', ARRAY['super_admin', 'admin', 'caregiver']::user_role[]),
    ('beta_features', FALSE, 'Access to beta features', ARRAY['super_admin']::user_role[])
ON CONFLICT (name) DO NOTHING;
