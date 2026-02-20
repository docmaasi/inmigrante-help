import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { usePermissions } from '@/hooks/use-permissions';
import { useAuth } from '@/lib/auth-context';
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
  careTeamMembers: number;
}

const INITIAL_STATS: StatsData = {
  totalUsers: 0,
  activeSubscriptions: 0,
  careRecipients: 0,
  tasksToday: 0,
  careTeamMembers: 0,
};

function getTodayRange(): { todayISO: string; tomorrowISO: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return {
    todayISO: today.toISOString(),
    tomorrowISO: new Date(today.getTime() + 86400000).toISOString(),
  };
}

function buildCards(stats: StatsData, isSuperAdmin: boolean): StatCard[] {
  const shared: StatCard[] = [
    {
      title: 'Care Recipients', value: stats.careRecipients, icon: Heart,
      description: 'People receiving care',
      color: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-200',
    },
    {
      title: 'Tasks Today', value: stats.tasksToday, icon: CheckSquare,
      description: 'Scheduled for today',
      color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200',
    },
  ];

  if (isSuperAdmin) {
    return [
      {
        title: 'Total Users', value: stats.totalUsers, icon: Users,
        description: 'Registered accounts',
        color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200',
      },
      {
        title: 'Active Subscriptions', value: stats.activeSubscriptions, icon: CreditCard,
        description: 'Paying customers',
        color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200',
      },
      ...shared,
    ];
  }

  return [
    {
      title: 'Care Team', value: stats.careTeamMembers, icon: Users,
      description: 'Family & care team members',
      color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200',
    },
    ...shared,
  ];
}

function AdminStatsCards(): JSX.Element {
  const { isSuperAdmin } = usePermissions();
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsData>(INITIAL_STATS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait until user is available before fetching
    if (!user?.id) return;
    fetchStats();
  }, [isSuperAdmin, user?.id]);

  async function fetchStats(): Promise<void> {
    setIsLoading(true);
    const { todayISO, tomorrowISO } = getTodayRange();

    try {
      const recipientsQ = supabase
        .from('care_recipients')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);
      const tasksQ = supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .gte('due_date', todayISO)
        .lt('due_date', tomorrowISO);

      if (isSuperAdmin) {
        const [usersR, subsR, recipR, tasksR] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
          recipientsQ, tasksQ,
        ]);

        setStats({
          ...INITIAL_STATS,
          totalUsers: usersR.count ?? 0,
          activeSubscriptions: subsR.count ?? 0,
          careRecipients: recipR.count ?? 0,
          tasksToday: tasksR.count ?? 0,
        });
      } else {
        const [teamR, recipR, tasksR] = await Promise.all([
          supabase.from('team_members').select('id', { count: 'exact', head: true }).eq('invited_by', user?.id),
          recipientsQ, tasksQ,
        ]);

        setStats({
          ...INITIAL_STATS,
          careTeamMembers: teamR.count ?? 0,
          careRecipients: recipR.count ?? 0,
          tasksToday: tasksR.count ?? 0,
        });
      }
    } catch (err) {
      // Silently handle errors — just show 0 values
      console.error('Stats fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const statCards = buildCards(stats, isSuperAdmin);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${isSuperAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className={`border ${card.borderColor} ${card.bgColor} shadow-sm`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${card.color}`}>{card.title}</p>
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400 mt-2" />
                  ) : (
                    <p className={`text-3xl font-bold ${card.color}`}>{card.value.toLocaleString()}</p>
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
