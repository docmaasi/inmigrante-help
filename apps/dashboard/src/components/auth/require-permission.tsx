import type { ReactNode } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import type { PermissionKey } from '@/types/permissions';

interface RequirePermissionProps {
  permission: PermissionKey;
  fallback?: ReactNode;
  children: ReactNode;
}

export function RequirePermission({
  permission,
  fallback = null,
  children,
}: RequirePermissionProps): ReactNode {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
