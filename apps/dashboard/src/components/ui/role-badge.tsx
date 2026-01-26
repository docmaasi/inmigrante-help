import { Crown, Shield, UserCheck, Eye, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type UserRole = 'super_admin' | 'admin' | 'caregiver' | 'viewer';

interface RoleConfig {
  label: string;
  className: string;
  Icon: LucideIcon;
}

const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  super_admin: {
    label: 'Super Admin',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
    Icon: Crown,
  },
  admin: {
    label: 'Admin',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
    Icon: Shield,
  },
  caregiver: {
    label: 'Caregiver',
    className: 'bg-teal-100 text-teal-800 border-teal-200',
    Icon: UserCheck,
  },
  viewer: {
    label: 'Viewer',
    className: 'bg-slate-100 text-slate-800 border-slate-200',
    Icon: Eye,
  },
};

interface RoleBadgeProps {
  role: UserRole;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function RoleBadge({
  role,
  showIcon = true,
  size = 'md',
  className,
}: RoleBadgeProps) {
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.viewer;
  const { label, className: roleClassName, Icon } = config;

  return (
    <Badge
      variant="outline"
      className={cn(
        roleClassName,
        size === 'sm' && 'text-[10px] px-1.5 py-0',
        size === 'md' && 'text-xs px-2 py-0.5',
        className
      )}
    >
      {showIcon && (
        <Icon
          className={cn(
            'mr-1',
            size === 'sm' && 'h-3 w-3',
            size === 'md' && 'h-3.5 w-3.5'
          )}
        />
      )}
      {label}
    </Badge>
  );
}

export function getRoleLabel(role: UserRole): string {
  return ROLE_CONFIG[role]?.label ?? 'Unknown';
}

export function isAdminRole(role: UserRole): boolean {
  return role === 'super_admin' || role === 'admin';
}

export function isSuperAdminRole(role: UserRole): boolean {
  return role === 'super_admin';
}
