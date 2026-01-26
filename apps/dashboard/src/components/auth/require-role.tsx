import type { ReactNode } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import type { UserRole } from '@/types/permissions';

interface RequireRoleProps {
  allowedRoles: UserRole[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function RequireRole({
  allowedRoles,
  fallback = null,
  children,
}: RequireRoleProps): ReactNode {
  const { isRole } = usePermissions();

  if (!isRole(allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
