import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Users, CreditCard, Heart, CheckSquare, Loader2 } from 'lucide-react';

interface StatCard {
  title: string;
  value: number;
  icon: React.ElementType;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface StatsData {
  totalUsers: number;
  activeSubscriptions: number;
  careRecipients: number;
  tasksToday: number;
}

function AdminStatsCards(): JSX.Element {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    activeSubscriptions: 0,
    careRecipients: 0,
    tasksToday: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats(): Promise<void> {
    setIsLoading(true);
    setError(null);

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const [
        usersResult,
        subscriptionsResult,
        recipientsResult,
        tasksResult,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase
          .from('subscriptions')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active'),
        supabase
          .from('care_recipients')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true),
        supabase
          .from('tasks')
          .select('id', { count: 'exact', head: true })
          .gte('due_date', todayISO)
          .lt('due_date', new Date(today.getTime() + 86400000).toISOString()),
      ]);

      if (usersResult.error) throw usersResult.error;
      if (subscriptionsResult.error) throw subscriptionsResult.error;
      if (recipientsResult.error) throw recipientsResult.error;
      if (tasksResult.error) throw tasksResult.error;

      setStats({
        totalUsers: usersResult.count ?? 0,
        activeSubscriptions: subscriptionsResult.count ?? 0,
        careRecipients: recipientsResult.count ?? 0,
        tasksToday: tasksResult.count ?? 0,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const statCards: StatCard[] = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      description: 'Registered accounts',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Active Subscriptions',
      value: stats.activeSubscriptions,
      icon: CreditCard,
      description: 'Paying customers',
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
    {
      title: 'Care Recipients',
      value: stats.careRecipients,
      icon: Heart,
      description: 'People receiving care',
      color: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
    },
    {
      title: 'Tasks Today',
      value: stats.tasksToday,
      icon: CheckSquare,
      description: 'Scheduled for today',
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
  ];

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="col-span-full border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700 text-sm">Failed to load statistics: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className={`border ${card.borderColor} ${card.bgColor} shadow-sm`}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${card.color}`}>
                    {card.title}
                  </p>
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400 mt-2" />
                  ) : (
                    <p className={`text-3xl font-bold ${card.color}`}>
                      {card.value.toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">{card.description}</p>
                </div>
                <Icon className={`w-10 h-10 ${card.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export { AdminStatsCards };
