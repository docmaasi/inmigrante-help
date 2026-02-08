import { useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { usePermissions } from '@/hooks/use-permissions';
import type { UserRole, PermissionKey } from '@/types/permissions';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
  requiredPermission?: PermissionKey;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  redirectTo = '/',
}: ProtectedRouteProps): ReactNode {
  const { isAuthenticated, isLoading } = useAuth();
  const { role, hasPermission, isRole } = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    if (requiredRole) {
      const allowedRoles = Array.isArray(requiredRole)
        ? requiredRole
        : [requiredRole];

      if (!isRole(allowedRoles)) {
        navigate(redirectTo, { replace: true });
        return;
      }
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
      navigate(redirectTo, { replace: true });
    }
  }, [
    isAuthenticated,
    isLoading,
    role,
    requiredRole,
    requiredPermission,
    redirectTo,
    navigate,
    hasPermission,
    isRole,
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];

    if (!isRole(allowedRoles)) {
      return null;
    }
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return null;
  }

  return <>{children}</>;
}
