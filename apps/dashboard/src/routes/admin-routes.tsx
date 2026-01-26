import { lazy, Suspense, type ReactNode } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth';
import { AdminLayout } from '@/components/layout/admin-layout';

const AdminDashboard = lazy(() =>
  import('@/pages/admin/admin-dashboard').then((module) => ({
    default: module.AdminDashboard,
  }))
);

const UserManagement = lazy(() =>
  import('@/pages/admin/user-management').then((module) => ({
    default: module.UserManagement,
  }))
);

const SystemSettings = lazy(() =>
  import('@/pages/admin/system-settings').then((module) => ({
    default: module.SystemSettings,
  }))
);

const AdminActivity = lazy(() =>
  import('@/pages/admin/admin-activity').then((module) => ({
    default: module.AdminActivity,
  }))
);

function LazyLoadFallback(): ReactNode {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );
}

function withSuspense(Component: React.LazyExoticComponent<() => JSX.Element>): ReactNode {
  return (
    <Suspense fallback={<LazyLoadFallback />}>
      <Component />
    </Suspense>
  );
}

export const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole={['admin', 'super_admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: withSuspense(AdminDashboard),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute requiredRole="super_admin">
            {withSuspense(UserManagement)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute requiredRole="super_admin">
            {withSuspense(SystemSettings)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'activity',
        element: withSuspense(AdminActivity),
      },
    ],
  },
];
