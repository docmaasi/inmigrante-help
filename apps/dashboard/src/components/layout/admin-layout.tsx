import { Outlet, useLocation, Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight, Home } from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { RoleBadge, type UserRole } from '@/components/ui/role-badge';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

const ROUTE_LABELS: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/users': 'User Management',
  '/admin/settings': 'System Settings',
  '/admin/activity': 'Activity Log',
  '/admin/subscriptions': 'Subscription Management',
  '/admin/diagnostics': 'System Diagnostics',
};

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [{ label: 'Admin', path: '/admin' }];

  if (pathname !== '/admin') {
    const label = ROUTE_LABELS[pathname] ?? pathname.split('/').pop() ?? '';
    crumbs.push({ label });
  }

  return crumbs;
}

interface AdminBreadcrumbsProps {
  items: BreadcrumbItem[];
}

function AdminBreadcrumbs({ items }: AdminBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      <Link
        to="/"
        className="flex items-center text-slate-500 hover:text-slate-700 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4 text-slate-400" />
          {item.path ? (
            <Link
              to={item.path}
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

function AdminWarningBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
      <div className="flex items-center gap-2 text-amber-800">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <p className="text-sm font-medium">
          Admin Mode: Changes made here affect all users. Proceed with caution.
        </p>
      </div>
    </div>
  );
}

interface AdminHeaderProps {
  userRole: UserRole;
  breadcrumbs: BreadcrumbItem[];
}

function AdminHeader({ userRole, breadcrumbs }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-slate-600 hover:text-slate-900 hover:bg-slate-100" />
          <div className="h-6 w-px bg-slate-200" />
          <AdminBreadcrumbs items={breadcrumbs} />
        </div>
        <div className="flex items-center gap-3">
          <RoleBadge role={userRole} />
        </div>
      </div>
    </header>
  );
}

export function AdminLayout() {
  const location = useLocation();
  const { profile } = useAuth();
  const userRole = (profile?.role as UserRole) ?? 'viewer';
  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <SidebarProvider defaultOpen>
      <AdminSidebar userRole={userRole} />
      <SidebarInset className="bg-slate-50">
        <AdminWarningBanner />
        <AdminHeader userRole={userRole} breadcrumbs={breadcrumbs} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
