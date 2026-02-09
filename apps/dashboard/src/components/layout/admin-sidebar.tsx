import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Settings,
  Activity,
  CreditCard,
  ChevronLeft,
  Shield,
  Stethoscope,
  HardDriveDownload,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { RoleBadge, type UserRole, isSuperAdminRole } from '@/components/ui/role-badge';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  superAdminOnly?: boolean;
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    name: 'Dashboard',
    path: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Users',
    path: '/admin/users',
    icon: Users,
    superAdminOnly: true,
  },
  {
    name: 'Settings',
    path: '/admin/settings',
    icon: Settings,
    superAdminOnly: true,
  },
  {
    name: 'Activity',
    path: '/admin/activity',
    icon: Activity,
  },
  {
    name: 'Subscriptions',
    path: '/admin/subscriptions',
    icon: CreditCard,
  },
  {
    name: 'Diagnostics',
    path: '/admin/diagnostics',
    icon: Stethoscope,
  },
  {
    name: 'Data Export',
    path: '/admin/export',
    icon: HardDriveDownload,
  },
];

interface AdminSidebarProps {
  userRole: UserRole;
}

export function AdminSidebar({ userRole }: AdminSidebarProps) {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const isSuperAdmin = isSuperAdminRole(userRole);

  const isActive = (path: string): boolean => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const visibleNavItems = ADMIN_NAV_ITEMS.filter(
    (item) => !item.superAdminOnly || isSuperAdmin
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-purple-200 bg-slate-900">
      <SidebarHeader className="border-b border-purple-800/50 p-4 bg-slate-900">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 flex-shrink-0">
            <Shield className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-white truncate">
                Admin Panel
              </h1>
              <p className="text-xs text-purple-300 truncate">
                System Management
              </p>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2 bg-slate-900">
        <SidebarGroup className="py-1">
          <SidebarGroupLabel className="px-2 text-[11px] font-medium text-purple-300 uppercase tracking-wider">
            Administration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.name}
                    >
                      <Link
                        to={item.path}
                        className={cn(
                          active
                            ? 'bg-purple-700/50 text-white font-medium'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        )}
                      >
                        <Icon
                          className={cn(
                            'w-5 h-5',
                            active ? 'text-purple-300' : 'text-slate-400'
                          )}
                        />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator className="bg-slate-700" />

      <SidebarFooter className="border-t border-slate-700 p-2 bg-slate-900">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Back to Dashboard">
              <Link
                to="/"
                className="text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <ChevronLeft className="w-5 h-5 text-slate-400" />
                <span>Back to Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {!isCollapsed && (
          <div className="mt-2 px-2">
            <RoleBadge role={userRole} size="sm" />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
