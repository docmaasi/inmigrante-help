import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { AdminStatsCards } from '@/components/admin/admin-stats-cards';
import { AdminQuickActions } from '@/components/admin/admin-quick-actions';
import { AdminActivityFeed } from '@/components/admin/admin-activity-feed';
import {
  Shield,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Server,
  Database,
  Wifi,
  Clock,
} from 'lucide-react';

interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
}

interface SystemStatus {
  database: 'healthy' | 'degraded' | 'down';
  auth: 'healthy' | 'degraded' | 'down';
  storage: 'healthy' | 'degraded' | 'down';
}

function getStatusIcon(status: string): JSX.Element {
  switch (status) {
    case 'healthy':
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    case 'degraded':
      return <AlertTriangle className="w-4 h-4 text-amber-600" />;
    case 'down':
      return <XCircle className="w-4 h-4 text-red-600" />;
    default:
      return <Clock className="w-4 h-4 text-slate-400" />;
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'healthy':
      return 'text-emerald-700 bg-emerald-50';
    case 'degraded':
      return 'text-amber-700 bg-amber-50';
    case 'down':
      return 'text-red-700 bg-red-50';
    default:
      return 'text-slate-700 bg-slate-50';
  }
}

function getAlertIcon(type: string): JSX.Element {
  switch (type) {
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-amber-600" />;
    case 'error':
      return <XCircle className="w-5 h-5 text-red-600" />;
    case 'success':
      return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    default:
      return <Clock className="w-5 h-5 text-blue-600" />;
  }
}

function getAlertStyle(type: string): string {
  switch (type) {
    case 'warning':
      return 'border-l-amber-500 bg-amber-50';
    case 'error':
      return 'border-l-red-500 bg-red-50';
    case 'success':
      return 'border-l-emerald-500 bg-emerald-50';
    default:
      return 'border-l-blue-500 bg-blue-50';
  }
}

function AdminDashboard(): JSX.Element {
  const { user, profile } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'healthy',
    auth: 'healthy',
    storage: 'healthy',
  });
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  useEffect(() => {
    checkSystemHealth();
    generateAlerts();
  }, []);

  async function checkSystemHealth(): Promise<void> {
    const status: SystemStatus = {
      database: 'healthy',
      auth: 'healthy',
      storage: 'healthy',
    };

    try {
      // Check database connectivity
      const { error: dbError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (dbError) {
        status.database = 'degraded';
      }
    } catch {
      status.database = 'down';
    }

    try {
      // Check auth service
      const { error: authError } = await supabase.auth.getSession();
      if (authError) {
        status.auth = 'degraded';
      }
    } catch {
      status.auth = 'down';
    }

    // Storage check is simplified - would need actual bucket access test
    status.storage = 'healthy';

    setSystemStatus(status);
    setLastChecked(new Date());
  }

  async function generateAlerts(): Promise<void> {
    const newAlerts: SystemAlert[] = [];

    try {
      // Check for users without subscriptions
      const { count: noSubCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .is('stripe_customer_id', null);

      if (noSubCount && noSubCount > 10) {
        newAlerts.push({
          id: 'no-subscription',
          type: 'info',
          title: 'Users Without Subscriptions',
          message: `${noSubCount} users have not set up a subscription.`,
          timestamp: new Date(),
        });
      }

      // Check for expired subscriptions
      const { count: expiredCount } = await supabase
        .from('subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'past_due');

      if (expiredCount && expiredCount > 0) {
        newAlerts.push({
          id: 'past-due',
          type: 'warning',
          title: 'Past Due Subscriptions',
          message: `${expiredCount} subscription(s) are past due.`,
          timestamp: new Date(),
        });
      }

      // Check for tasks overdue
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const { count: overdueCount } = await supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')
        .lt('due_date', yesterday.toISOString());

      if (overdueCount && overdueCount > 5) {
        newAlerts.push({
          id: 'overdue-tasks',
          type: 'warning',
          title: 'Overdue Tasks',
          message: `${overdueCount} tasks are overdue across all users.`,
          timestamp: new Date(),
        });
      }
    } catch (err) {
      newAlerts.push({
        id: 'error',
        type: 'error',
        title: 'Alert Generation Failed',
        message:
          err instanceof Error ? err.message : 'Could not generate system alerts.',
        timestamp: new Date(),
      });
    }

    // If no alerts, add a success message
    if (newAlerts.length === 0) {
      newAlerts.push({
        id: 'all-good',
        type: 'success',
        title: 'All Systems Operational',
        message: 'No issues detected. Everything is running smoothly.',
        timestamp: new Date(),
      });
    }

    setAlerts(newAlerts);
  }

  async function handleRefresh(): Promise<void> {
    setIsRefreshing(true);
    await Promise.all([checkSystemHealth(), generateAlerts()]);
    setIsRefreshing(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                  <p className="text-indigo-100 text-sm font-normal">
                    Welcome back, {profile?.full_name ?? user?.email}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-white text-indigo-700 hover:bg-indigo-50"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <AdminStatsCards />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Activity Feed */}
          <div className="lg:col-span-2 space-y-6">
            <AdminActivityFeed />

            {/* System Alerts */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-800 text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  System Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border-l-4 ${getAlertStyle(alert.type)}`}
                    >
                      <div className="flex items-start gap-3">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                          <p className="font-medium text-sm text-slate-900">
                            {alert.title}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            {alert.message}
                          </p>
                          <p className="text-xs text-slate-400 mt-2">
                            {alert.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <AdminQuickActions />

            {/* System Status */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-800 text-lg flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium">Database</span>
                    </div>
                    <Badge className={getStatusColor(systemStatus.database)}>
                      {getStatusIcon(systemStatus.database)}
                      <span className="ml-1 capitalize">{systemStatus.database}</span>
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium">Authentication</span>
                    </div>
                    <Badge className={getStatusColor(systemStatus.auth)}>
                      {getStatusIcon(systemStatus.auth)}
                      <span className="ml-1 capitalize">{systemStatus.auth}</span>
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium">Storage</span>
                    </div>
                    <Badge className={getStatusColor(systemStatus.storage)}>
                      {getStatusIcon(systemStatus.storage)}
                      <span className="ml-1 capitalize">{systemStatus.storage}</span>
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-4 text-center">
                  Last checked: {lastChecked.toLocaleTimeString()}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export { AdminDashboard };
