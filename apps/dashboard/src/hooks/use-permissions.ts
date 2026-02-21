import { useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import type { Permissions, UserRole, PermissionKey } from '@/types/permissions';
import { hasMinimumRole, isRoleAllowed } from '@/types/permissions';

/**
 * Default role when profile is unavailable.
 */
const DEFAULT_ROLE: UserRole = 'viewer';

/**
 * Computes permissions for a given role.
 * Follows the permission matrix from the admin implementation plan.
 */
function computePermissions(role: UserRole): Permissions {
  return {
    // Super admin only
    canManageUsers: role === 'super_admin',
    canViewAllData: role === 'super_admin',
    canEditSettings: role === 'super_admin',

    // Admin and above
    canManageTeam: isRoleAllowed(role, ['admin', 'super_admin']),
    canManageSubscriptions: isRoleAllowed(role, ['admin', 'super_admin']),
    canViewAuditLogs: isRoleAllowed(role, ['admin', 'super_admin']),
    canManageCarePlans: isRoleAllowed(role, ['admin', 'super_admin']),

    // Caregiver and above
    canEditRecords: isRoleAllowed(role, ['caregiver', 'admin', 'super_admin']),
    canViewExpenses: isRoleAllowed(role, ['caregiver', 'admin', 'super_admin']),

    // All authenticated users
    canViewRecords: true,
  };
}

/**
 * Return type for the usePermissions hook.
 */
export interface UsePermissionsReturn {
  /** Current user role */
  role: UserRole;
  /** Whether the user is an admin (admin or super_admin) */
  isAdmin: boolean;
  /** Whether the user is a super admin */
  isSuperAdmin: boolean;
  /** Computed permissions object */
  permissions: Permissions;
  /** Check if user has a specific permission */
  hasPermission: (permission: PermissionKey) => boolean;
  /** Check if user has at least the specified role level */
  hasRole: (minimumRole: UserRole) => boolean;
  /** Check if user's role is one of the specified roles */
  isRole: (allowedRoles: UserRole[]) => boolean;
}

/**
 * Hook that provides role-based permissions for the current user.
 * Computes permissions based on the user's profile role.
 *
 * @example
 * ```tsx
 * function AdminPanel() {
 *   const { permissions, isAdmin } = usePermissions();
 *
 *   if (!isAdmin) {
 *     return <AccessDenied />;
 *   }
 *
 *   return (
 *     <div>
 *       {permissions.canManageUsers && <UserManagement />}
 *       {permissions.canViewAuditLogs && <AuditLogs />}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePermissions(): UsePermissionsReturn {
  const { profile } = useAuth();

  const role = useMemo<UserRole>(() => {
    const profileRole = profile?.role;
    if (
      profileRole === 'super_admin' ||
      profileRole === 'admin' ||
      profileRole === 'caregiver' ||
      profileRole === 'viewer'
    ) {
      return profileRole;
    }
    return DEFAULT_ROLE;
  }, [profile?.role]);

  const permissions = useMemo<Permissions>(() => computePermissions(role), [role]);

  const isAdmin = useMemo<boolean>(
    () => isRoleAllowed(role, ['admin', 'super_admin']),
    [role]
  );

  const isSuperAdmin = useMemo<boolean>(() => role === 'super_admin', [role]);

  const hasPermission = useMemo(
    () => (permission: PermissionKey): boolean => permissions[permission],
    [permissions]
  );

  const hasRole = useMemo(
    () => (minimumRole: UserRole): boolean => hasMinimumRole(role, minimumRole),
    [role]
  );

  const isRole = useMemo(
    () => (allowedRoles: UserRole[]): boolean => isRoleAllowed(role, allowedRoles),
    [role]
  );

  return {
    role,
    isAdmin,
    isSuperAdmin,
    permissions,
    hasPermission,
    hasRole,
    isRole,
  };
}
