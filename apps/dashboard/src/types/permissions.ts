/**
 * User role types for the RBAC system.
 * Roles are hierarchical: super_admin > admin > caregiver > viewer
 */
export type UserRole = 'super_admin' | 'admin' | 'caregiver' | 'viewer';

/**
 * All available roles as a readonly array for iteration and validation.
 */
export const USER_ROLES: readonly UserRole[] = [
  'super_admin',
  'admin',
  'caregiver',
  'viewer',
] as const;

/**
 * Role hierarchy levels for permission comparisons.
 * Higher number = more privileges.
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 4,
  admin: 3,
  caregiver: 2,
  viewer: 1,
} as const;

/**
 * Permission flags that control access to various features.
 * Each permission maps to specific functionality in the application.
 */
export interface Permissions {
  /** Super admin only: manage all platform users */
  canManageUsers: boolean;
  /** Super admin only: view all data across the platform */
  canViewAllData: boolean;
  /** Super admin only: modify system-wide settings */
  canEditSettings: boolean;
  /** Admin+: manage team members within their care circle */
  canManageTeam: boolean;
  /** Admin+: manage subscription and billing */
  canManageSubscriptions: boolean;
  /** Admin+: view admin activity logs */
  canViewAuditLogs: boolean;
  /** Admin+: create and modify care plans */
  canManageCarePlans: boolean;
  /** Caregiver+: create and edit records (medications, notes, etc.) */
  canEditRecords: boolean;
  /** Caregiver+: view receipts and expenses */
  canViewExpenses: boolean;
  /** All authenticated users: view records */
  canViewRecords: boolean;
}

/**
 * Type for permission keys, useful for dynamic permission checks.
 */
export type PermissionKey = keyof Permissions;

/**
 * Role display configuration for UI components.
 */
export interface RoleDisplayConfig {
  label: string;
  description: string;
  color: string;
}

/**
 * Display configuration for each role.
 */
export const ROLE_DISPLAY_CONFIG: Record<UserRole, RoleDisplayConfig> = {
  super_admin: {
    label: 'Super Admin',
    description: 'Full platform access and system management',
    color: 'bg-purple-100 text-purple-800',
  },
  admin: {
    label: 'Admin',
    description: 'Full access within their care circle',
    color: 'bg-amber-100 text-amber-800',
  },
  caregiver: {
    label: 'Caregiver',
    description: 'Can create and edit care records',
    color: 'bg-teal-100 text-teal-800',
  },
  viewer: {
    label: 'Viewer',
    description: 'Read-only access to care records',
    color: 'bg-slate-100 text-slate-800',
  },
} as const;

/**
 * Checks if a role has at least the specified minimum role level.
 */
export function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
}

/**
 * Checks if the user role is one of the allowed roles.
 */
export function isRoleAllowed(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}
