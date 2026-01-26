-- Admin System Migration: Role Enum Type
-- Creates the user_role enum for role-based access control

-- ============================================
-- USER ROLE ENUM
-- ============================================

-- Create enum type for user roles
-- super_admin: Platform owner with system-wide access
-- admin: Full access within their care circle
-- caregiver: Can create/edit care records
-- viewer: Read-only access
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'caregiver', 'viewer');

-- ============================================
-- UPDATE PROFILES TABLE
-- ============================================

-- Convert existing role column from TEXT to user_role enum
-- Map existing 'user' role to 'viewer' as default

-- First drop the existing default (can't cast TEXT default to enum)
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;

-- Convert column type with explicit casting
ALTER TABLE public.profiles
    ALTER COLUMN role TYPE user_role
    USING (
        CASE
            WHEN role = 'admin' THEN 'admin'::user_role
            WHEN role = 'caregiver' THEN 'caregiver'::user_role
            WHEN role = 'super_admin' THEN 'super_admin'::user_role
            ELSE 'viewer'::user_role
        END
    );

-- Set the new default
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'viewer'::user_role;

-- Add is_super_admin flag for platform owner identification
-- Separate from role to allow explicit super admin designation
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Index for quick admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_super_admin ON public.profiles(is_super_admin) WHERE is_super_admin = TRUE;
