import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { format } from 'date-fns';
import {
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  User,
  CreditCard,
  Settings,
  Users,
  Heart,
  Flag,
} from 'lucide-react';
import type { Json } from '@/types/database';

interface ActivityLogEntry {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: Json;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  } | null;
}

interface ActivityTableProps {
  data: ActivityLogEntry[];
  isLoading: boolean;
  sortDirection: 'asc' | 'desc';
  onSortChange: (direction: 'asc' | 'desc') => void;
}

const ACTION_LABELS: Record<string, string> = {
  user_role_changed: 'Role Changed',
  user_disabled: 'User Disabled',
  user_enabled: 'User Enabled',
  user_deleted: 'User Deleted',
  user_impersonated: 'User Impersonated',
  subscription_modified: 'Subscription Modified',
  subscription_canceled: 'Subscription Canceled',
  setting_updated: 'Setting Updated',
  feature_flag_toggled: 'Feature Flag Toggled',
  data_exported: 'Data Exported',
  team_member_added: 'Team Member Added',
  team_member_removed: 'Team Member Removed',
  care_recipient_created: 'Care Recipient Created',
  care_recipient_updated: 'Care Recipient Updated',
  care_recipient_deleted: 'Care Recipient Deleted',
};

const ACTION_COLORS: Record<string, { bg: string; text: string }> = {
  user_role_changed: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  user_disabled: { bg: 'bg-red-100', text: 'text-red-700' },
  user_enabled: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  user_deleted: { bg: 'bg-red-100', text: 'text-red-700' },
  user_impersonated: { bg: 'bg-purple-100', text: 'text-purple-700' },
  subscription_modified: { bg: 'bg-amber-100', text: 'text-amber-700' },
  subscription_canceled: { bg: 'bg-red-100', text: 'text-red-700' },
  setting_updated: { bg: 'bg-blue-100', text: 'text-blue-700' },
  feature_flag_toggled: { bg: 'bg-purple-100', text: 'text-purple-700' },
  data_exported: { bg: 'bg-slate-100', text: 'text-slate-700' },
  team_member_added: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  team_member_removed: { bg: 'bg-red-100', text: 'text-red-700' },
  care_recipient_created: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  care_recipient_updated: { bg: 'bg-blue-100', text: 'text-blue-700' },
  care_recipient_deleted: { bg: 'bg-red-100', text: 'text-red-700' },
};

const TARGET_ICONS: Record<string, React.ElementType> = {
  user: User,
  subscription: CreditCard,
  setting: Settings,
  team: Users,
  care_recipient: Heart,
  feature_flag: Flag,
};

function getActionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function getActionColors(action: string): { bg: string; text: string } {
  return ACTION_COLORS[action] ?? { bg: 'bg-slate-100', text: 'text-slate-700' };
}

function getTargetIcon(targetType: string): React.ElementType {
  return TARGET_ICONS[targetType] ?? Settings;
}

function formatDetails(details: Json): string {
  if (details === null || details === undefined) {
    return 'No additional details';
  }
  return JSON.stringify(details, null, 2);
}

function ActivityTable({
  data,
  isLoading,
  sortDirection,
  onSortChange,
}: ActivityTableProps): JSX.Element {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  function toggleRow(id: string): void {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleSortClick(): void {
    onSortChange(sortDirection === 'asc' ? 'desc' : 'asc');
  }

  function getSortIcon(): JSX.Element {
    if (sortDirection === 'asc') {
      return <ArrowUp className="w-4 h-4" />;
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="w-4 h-4" />;
    }
    return <ArrowUpDown className="w-4 h-4" />;
  }

  function getAdminName(entry: ActivityLogEntry): string {
    if (entry.profiles?.full_name) {
      return entry.profiles.full_name;
    }
    if (entry.profiles?.email) {
      return entry.profiles.email;
    }
    return 'Unknown Admin';
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="p-8 flex items-center justify-center">
          <div className="animate-pulse text-slate-500">Loading activity logs...</div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="p-8 text-center">
          <p className="text-slate-500">No activity logs found matching your filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="w-10" />
            <TableHead className="w-48">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSortClick}
                className="flex items-center gap-1 -ml-3 font-medium text-slate-700"
              >
                Timestamp
                {getSortIcon()}
              </Button>
            </TableHead>
            <TableHead className="w-40">Admin</TableHead>
            <TableHead className="w-40">Action</TableHead>
            <TableHead className="w-32">Target</TableHead>
            <TableHead>Details Preview</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((entry) => {
            const isExpanded = expandedRows.has(entry.id);
            const colors = getActionColors(entry.action);
            const TargetIcon = getTargetIcon(entry.target_type);

            return (
              <Collapsible
                key={entry.id}
                open={isExpanded}
                onOpenChange={() => toggleRow(entry.id)}
                asChild
              >
                <>
                  <TableRow className="hover:bg-slate-50">
                    <TableCell>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-slate-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-slate-500" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-slate-600">
                      {format(new Date(entry.created_at), 'MMM d, yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 truncate max-w-[120px]">
                          {getAdminName(entry)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${colors.bg} ${colors.text} border-0`}>
                        {getActionLabel(entry.action)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TargetIcon className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-600 capitalize">
                          {entry.target_type.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500 truncate max-w-[200px]">
                      {entry.target_id && (
                        <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                          ID: {entry.target_id.slice(0, 8)}...
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                  <CollapsibleContent asChild>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableCell colSpan={6} className="p-0">
                        <div className="px-6 py-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Full Details
                              </h4>
                              <pre className="bg-white rounded-lg border border-slate-200 p-4 text-xs text-slate-700 overflow-x-auto max-h-48">
                                {formatDetails(entry.details)}
                              </pre>
                            </div>
                            <div className="space-y-3">
                              {entry.target_id && (
                                <div>
                                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                    Target ID
                                  </h4>
                                  <p className="font-mono text-xs bg-white rounded border border-slate-200 px-3 py-2 break-all">
                                    {entry.target_id}
                                  </p>
                                </div>
                              )}
                              {entry.ip_address && (
                                <div>
                                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                    IP Address
                                  </h4>
                                  <p className="font-mono text-xs bg-white rounded border border-slate-200 px-3 py-2">
                                    {entry.ip_address}
                                  </p>
                                </div>
                              )}
                              {entry.user_agent && (
                                <div>
                                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                    User Agent
                                  </h4>
                                  <p className="text-xs bg-white rounded border border-slate-200 px-3 py-2 truncate">
                                    {entry.user_agent}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  </CollapsibleContent>
                </>
              </Collapsible>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export { ActivityTable };
export type { ActivityTableProps, ActivityLogEntry };
