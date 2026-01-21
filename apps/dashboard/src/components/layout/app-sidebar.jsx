import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
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
  BarChart3
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
      { name: 'Home', icon: Home, path: 'Today' },
      { name: 'Diagnostics', icon: Activity, path: 'Diagnostics' }
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
  { name: 'Settings', icon: Settings, path: 'Settings' },
  { name: 'Subscribe', icon: CreditCard, path: 'Checkout', special: true }
];

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const isActive = (path) => {
    const currentPath = location.pathname.toLowerCase();
    const targetPath = createPageUrl(path).toLowerCase();
    return currentPath === targetPath || currentPath === `/${path.toLowerCase()}`;
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

      <SidebarContent className="px-2 py-2">
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
                              to={createPageUrl(item.path)}
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
                  <Link to={createPageUrl(item.path)}>
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
