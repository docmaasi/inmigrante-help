import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import {
  UserPlus,
  Settings,
  CreditCard,
  Shield,
  FileEdit,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface ActivityLog {
  id: string;
  action: string;
  actor_id: string | null;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  actorName?: string;
}

interface ActionConfig {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  label: string;
}

const ACTION_CONFIG: Record<string, ActionConfig> = {
  user_created: {
    icon: UserPlus,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
    label: 'User Created',
  },
  user_updated: {
    icon: FileEdit,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    label: 'User Updated',
  },
  user_deleted: {
    icon: Trash2,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    label: 'User Deleted',
  },
  settings_changed: {
    icon: Settings,
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    label: 'Settings Changed',
  },
  subscription_created: {
    icon: CreditCard,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
    label: 'Subscription Created',
  },
  subscription_updated: {
    icon: CreditCard,
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    label: 'Subscription Updated',
  },
  subscription_canceled: {
    icon: CreditCard,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    label: 'Subscription Canceled',
  },
  role_changed: {
    icon: Shield,
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100',
    label: 'Role Changed',
  },
  login: {
    icon: Eye,
    color: 'text-slate-700',
    bgColor: 'bg-slate-100',
    label: 'User Login',
  },
  default: {
    icon: Clock,
    color: 'text-slate-700',
    bgColor: 'bg-slate-100',
    label: 'Activity',
  },
};

function getActionConfig(action: string): ActionConfig {
  return ACTION_CONFIG[action] ?? ACTION_CONFIG.default;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

function AdminActivityFeed(): JSX.Element {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  async function fetchActivityLogs(): Promise<void> {
    setIsLoading(true);
    setError(null);

    try {
      // Try to fetch from action_logs table (existing in database)
      const { data, error: fetchError } = await supabase
        .from('action_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (fetchError) throw fetchError;

      // Map data to include actor names if available
      const activitiesWithNames = await Promise.all(
        (data ?? []).map(async (activity) => {
          let actorName = 'System';
          if (activity.actor_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', activity.actor_id)
              .single();

            if (profile) {
              actorName = profile.full_name ?? profile.email ?? 'Unknown User';
            }
          }
          return { ...activity, actorName };
        })
      );

      setActivities(activitiesWithNames);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch activity logs';
      setError(errorMessage);
      // Set placeholder data if the table doesn't exist yet
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-800 text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
            <span className="ml-2 text-slate-600">Loading activity...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-800 text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-amber-600 py-4">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">
              Activity logging is not yet configured. This feature will be
              available once the admin_activity_logs table is created.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-800 text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-slate-400" />
            <p className="text-sm">No recent activity to display.</p>
            <p className="text-xs text-slate-400 mt-1">
              Activity will appear here as users interact with the system.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-800 text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const config = getActionConfig(activity.action);
            const Icon = config.icon;

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
              >
                <div
                  className={`p-2 rounded-full ${config.bgColor} flex-shrink-0`}
                >
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="secondary"
                      className={`${config.bgColor} ${config.color} text-xs`}
                    >
                      {config.label}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {formatTimeAgo(activity.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mt-1">
                    <span className="font-medium">{activity.actorName}</span>
                    {activity.entity_type && (
                      <span className="text-slate-500">
                        {' '}
                        on {activity.entity_type}
                      </span>
                    )}
                  </p>
                  {activity.details && Object.keys(activity.details).length > 0 && (
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      {JSON.stringify(activity.details).slice(0, 100)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export { AdminActivityFeed };
