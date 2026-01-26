import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  AdminActionType,
  AdminActionTargetType,
} from '@/services/admin-activity-logger';

interface AdminProfile {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface ActivityFiltersProps {
  filters: {
    adminId?: string;
    action?: AdminActionType;
    targetType?: AdminActionTargetType;
    startDate?: string;
    endDate?: string;
  };
  onFiltersChange: (filters: ActivityFiltersProps['filters']) => void;
}

const ACTION_OPTIONS: { value: AdminActionType; label: string }[] = [
  { value: 'user_role_changed', label: 'Role Changed' },
  { value: 'user_disabled', label: 'User Disabled' },
  { value: 'user_enabled', label: 'User Enabled' },
  { value: 'user_deleted', label: 'User Deleted' },
  { value: 'user_impersonated', label: 'User Impersonated' },
  { value: 'subscription_modified', label: 'Subscription Modified' },
  { value: 'subscription_canceled', label: 'Subscription Canceled' },
  { value: 'setting_updated', label: 'Setting Updated' },
  { value: 'feature_flag_toggled', label: 'Feature Flag Toggled' },
  { value: 'data_exported', label: 'Data Exported' },
  { value: 'team_member_added', label: 'Team Member Added' },
  { value: 'team_member_removed', label: 'Team Member Removed' },
  { value: 'care_recipient_created', label: 'Care Recipient Created' },
  { value: 'care_recipient_updated', label: 'Care Recipient Updated' },
  { value: 'care_recipient_deleted', label: 'Care Recipient Deleted' },
];

const TARGET_TYPE_OPTIONS: { value: AdminActionTargetType; label: string }[] = [
  { value: 'user', label: 'User' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'setting', label: 'Setting' },
  { value: 'team', label: 'Team' },
  { value: 'care_recipient', label: 'Care Recipient' },
  { value: 'feature_flag', label: 'Feature Flag' },
];

function ActivityFilters({
  filters,
  onFiltersChange,
}: ActivityFiltersProps): JSX.Element {
  const [adminUsers, setAdminUsers] = useState<AdminProfile[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  async function fetchAdminUsers(): Promise<void> {
    setIsLoadingAdmins(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('role', ['admin', 'super_admin'])
        .order('full_name', { ascending: true });

      if (error) throw error;
      setAdminUsers(data ?? []);
    } catch {
      setAdminUsers([]);
    } finally {
      setIsLoadingAdmins(false);
    }
  }

  function handleAdminChange(value: string): void {
    onFiltersChange({
      ...filters,
      adminId: value === 'all' ? undefined : value,
    });
  }

  function handleActionChange(value: string): void {
    onFiltersChange({
      ...filters,
      action: value === 'all' ? undefined : (value as AdminActionType),
    });
  }

  function handleTargetTypeChange(value: string): void {
    onFiltersChange({
      ...filters,
      targetType: value === 'all' ? undefined : (value as AdminActionTargetType),
    });
  }

  function handleStartDateChange(date: Date | undefined): void {
    onFiltersChange({
      ...filters,
      startDate: date ? date.toISOString() : undefined,
    });
    setStartDateOpen(false);
  }

  function handleEndDateChange(date: Date | undefined): void {
    onFiltersChange({
      ...filters,
      endDate: date ? date.toISOString() : undefined,
    });
    setEndDateOpen(false);
  }

  function handleClearFilters(): void {
    onFiltersChange({});
  }

  const hasActiveFilters =
    filters.adminId !== undefined ||
    filters.action !== undefined ||
    filters.targetType !== undefined ||
    filters.startDate !== undefined ||
    filters.endDate !== undefined;

  function getAdminDisplayName(admin: AdminProfile): string {
    return admin.full_name ?? admin.email ?? 'Unknown Admin';
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-700">Filters</span>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="ml-auto text-slate-500 hover:text-slate-700"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Date Range - Start */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600">Start Date</label>
          <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !filters.startDate && 'text-slate-400'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.startDate
                  ? format(new Date(filters.startDate), 'MMM d, yyyy')
                  : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.startDate ? new Date(filters.startDate) : undefined}
                onSelect={handleStartDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Date Range - End */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600">End Date</label>
          <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !filters.endDate && 'text-slate-400'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.endDate
                  ? format(new Date(filters.endDate), 'MMM d, yyyy')
                  : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.endDate ? new Date(filters.endDate) : undefined}
                onSelect={handleEndDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Admin User Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600">Admin User</label>
          <Select
            value={filters.adminId ?? 'all'}
            onValueChange={handleAdminChange}
            disabled={isLoadingAdmins}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All admins" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All admins</SelectItem>
              {adminUsers.map((admin) => (
                <SelectItem key={admin.id} value={admin.id}>
                  {getAdminDisplayName(admin)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Type Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600">Action Type</label>
          <Select
            value={filters.action ?? 'all'}
            onValueChange={handleActionChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              {ACTION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Target Type Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600">Target Type</label>
          <Select
            value={filters.targetType ?? 'all'}
            onValueChange={handleTargetTypeChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All targets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All targets</SelectItem>
              {TARGET_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export { ActivityFilters };
export type { ActivityFiltersProps };
