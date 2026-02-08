import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { usePermissions } from '@/hooks/use-permissions';
import {
  Home,
  Users,
  Calendar,
  Pill,
  ListTodo,
  Heart,
  ClipboardCheck,
  AlertCircle,
  UserCheck,
  Sparkles,
  MessageSquare,
  Bell,
  FileText,
  Clock,
  Zap,
  Settings,
  CreditCard,
  ChevronDown,
  LayoutDashboard,
  Activity,
  Receipt,
  FolderOpen,
  RefreshCw,
  Shield,
  Users2,
  CalendarClock,
  BarChart3,
  ShieldCheck,
  History,
  HelpCircle,
  BookOpen
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
  useSidebar
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', icon: Home, path: '/' }
    ]
  },
  {
    label: 'Care Management',
    items: [
      { name: 'Care Recipients', icon: Users, path: 'CareRecipients' },
      { name: 'AI Care Plans', icon: Sparkles, path: 'CarePlans' },
      { name: 'Plan Builder', icon: FileText, path: 'CarePlanBuilder' },
      { name: 'Tasks', icon: ListTodo, path: 'Tasks' },
      { name: 'Calendar', icon: Calendar, path: 'Calendar' },
      { name: 'Appointments', icon: CalendarClock, path: 'Appointments' }
    ]
  },
  {
    label: 'Medications',
    items: [
      { name: 'All Medications', icon: Pill, path: 'Medications' },
      { name: 'Refills', icon: RefreshCw, path: 'Refills' },
      { name: 'Med Log', icon: ClipboardCheck, path: 'MedicationLog' }
    ]
  },
  {
    label: 'Team & Communication',
    items: [
      { name: 'Team/Family', icon: Users2, path: 'Team' },
      { name: 'Comm Hub', icon: MessageSquare, path: 'CommunicationHub' },
      { name: 'Collaboration', icon: UserCheck, path: 'Collaboration' },
      { name: 'Shift Handoff', icon: Clock, path: 'ShiftHandoff' },
      { name: 'Scheduling', icon: CalendarClock, path: 'Scheduling' }
    ]
  },
  {
    label: 'Documents & Records',
    items: [
      { name: 'Documents', icon: FolderOpen, path: 'Documents' },
      { name: 'Receipts', icon: Receipt, path: 'Receipts' },
      { name: 'Reports', icon: BarChart3, path: 'Reports' }
    ]
  },
  {
    label: 'Emergency',
    items: [
      { name: 'Emergency Info', icon: Shield, path: 'EmergencyProfile' }
    ]
  }
];

const BOTTOM_ITEMS = [
  { name: 'Resources', icon: BookOpen, path: 'Resources' },
  { name: 'Help', icon: HelpCircle, path: 'Help' },
  { name: 'Settings', icon: Settings, path: 'Settings' },
  { name: 'Subscribe', icon: CreditCard, path: 'Checkout', special: true }
];

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { isAdmin, isSuperAdmin } = usePermissions();

  const isActive = (path) => {
    const currentPath = location.pathname.toLowerCase();
    // Handle absolute paths (starting with /)
    if (path.startsWith('/')) {
      return currentPath === path.toLowerCase();
    }
    const targetPath = createPageUrl(path).toLowerCase();
    return currentPath === targetPath || currentPath === `/${path.toLowerCase()}`;
  };

  const getNavPath = (path) => {
    // If path starts with /, use it directly
    return path.startsWith('/') ? path : createPageUrl(path);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200">
      <SidebarHeader className="border-b border-slate-100 p-4">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/f2943789d_Screenshot_20260110_164756_ChatGPT.jpg"
            alt="FamilyCare.Help Logo"
            className="w-8 h-8 object-contain flex-shrink-0"
          />
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-slate-800 truncate">
                FamilyCare<span className="text-teal-600">.Help</span>
              </h1>
              <p className="text-xs text-slate-400 truncate">Coordinating care</p>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-2">
        {NAV_GROUPS.map((group) => (
          <Collapsible key={group.label} defaultOpen className="group/collapsible">
            <SidebarGroup className="py-1">
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="cursor-pointer hover:bg-slate-50 rounded-md transition-colors flex items-center justify-between w-full px-2 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  <span>{group.label}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-300 transition-transform group-data-[state=closed]/collapsible:rotate-[-90deg]" />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
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
                              to={getNavPath(item.path)}
                              className={active ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                            >
                              <Icon className={`w-5 h-5 ${active ? 'text-teal-600' : ''}`} />
                              <span>{item.name}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}

        {/* Administration Section - Only visible to admins */}
        {isAdmin && (
          <>
            <SidebarSeparator className="my-2" />
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarGroup className="py-1">
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="cursor-pointer hover:bg-purple-50 rounded-md transition-colors flex items-center justify-between w-full px-2 text-[11px] font-medium text-purple-500 uppercase tracking-wider">
                    <span>Administration</span>
                    <ChevronDown className="w-3.5 h-3.5 text-purple-300 transition-transform group-data-[state=closed]/collapsible:rotate-[-90deg]" />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {/* Admin Dashboard - all admins */}
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname === '/admin'}
                          tooltip="Admin Dashboard"
                        >
                          <Link
                            to="/admin"
                            className={location.pathname === '/admin'
                              ? 'bg-purple-50 text-purple-700 font-medium'
                              : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'}
                          >
                            <ShieldCheck className={`w-5 h-5 ${location.pathname === '/admin' ? 'text-purple-600' : 'text-purple-500'}`} />
                            <span>Admin Dashboard</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      {/* User Management - super_admin only */}
                      {isSuperAdmin && (
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            asChild
                            isActive={location.pathname === '/admin/users'}
                            tooltip="User Management"
                          >
                            <Link
                              to="/admin/users"
                              className={location.pathname === '/admin/users'
                                ? 'bg-amber-50 text-amber-700 font-medium'
                                : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700'}
                            >
                              <Users className={`w-5 h-5 ${location.pathname === '/admin/users' ? 'text-amber-600' : 'text-amber-500'}`} />
                              <span>User Management</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )}

                      {/* System Settings - super_admin only */}
                      {isSuperAdmin && (
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            asChild
                            isActive={location.pathname === '/admin/settings'}
                            tooltip="System Settings"
                          >
                            <Link
                              to="/admin/settings"
                              className={location.pathname === '/admin/settings'
                                ? 'bg-amber-50 text-amber-700 font-medium'
                                : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700'}
                            >
                              <Settings className={`w-5 h-5 ${location.pathname === '/admin/settings' ? 'text-amber-600' : 'text-amber-500'}`} />
                              <span>System Settings</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )}

                      {/* Activity Log - all admins */}
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname === '/admin/activity'}
                          tooltip="Activity Log"
                        >
                          <Link
                            to="/admin/activity"
                            className={location.pathname === '/admin/activity'
                              ? 'bg-purple-50 text-purple-700 font-medium'
                              : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'}
                          >
                            <History className={`w-5 h-5 ${location.pathname === '/admin/activity' ? 'text-purple-600' : 'text-purple-500'}`} />
                            <span>Activity Log</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      {/* Diagnostics - all admins */}
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname === '/admin/diagnostics'}
                          tooltip="Diagnostics"
                        >
                          <Link
                            to="/admin/diagnostics"
                            className={location.pathname === '/admin/diagnostics'
                              ? 'bg-purple-50 text-purple-700 font-medium'
                              : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'}
                          >
                            <Activity className={`w-5 h-5 ${location.pathname === '/admin/diagnostics' ? 'text-purple-600' : 'text-purple-500'}`} />
                            <span>Diagnostics</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-100 p-2">
        <SidebarMenu>
          {BOTTOM_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={item.name}
                  className={item.special ? 'bg-teal-600 text-white hover:bg-teal-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                >
                  <Link to={getNavPath(item.path)}>
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
