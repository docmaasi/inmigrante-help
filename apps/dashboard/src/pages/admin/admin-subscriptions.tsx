import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CreditCard,
  RefreshCw,
  Search,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface Subscription {
  id: string;
  user_id: string;
  status: string;
  plan_id: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  max_care_recipients: number;
  created_at: string;
  profiles?: {
    email: string;
    full_name: string | null;
  };
}

interface SubscriptionStats {
  total: number;
  active: number;
  canceled: number;
  trialing: number;
}

function useSubscriptions(searchTerm: string) {
  return useQuery({
    queryKey: ['admin', 'subscriptions', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('subscriptions')
        .select(`
          *,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`stripe_customer_id.ilike.%${searchTerm}%,stripe_subscription_id.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Subscription[];
    },
  });
}

function useSubscriptionStats() {
  return useQuery({
    queryKey: ['admin', 'subscription-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('status');

      if (error) throw error;

      const stats: SubscriptionStats = {
        total: data?.length ?? 0,
        active: data?.filter((s) => s.status === 'active').length ?? 0,
        canceled: data?.filter((s) => s.status === 'canceled').length ?? 0,
        trialing: data?.filter((s) => s.status === 'trialing').length ?? 0,
      };

      return stats;
    },
  });
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  canceled: 'bg-red-100 text-red-800',
  trialing: 'bg-blue-100 text-blue-800',
  past_due: 'bg-amber-100 text-amber-800',
  incomplete: 'bg-slate-100 text-slate-800',
};

export function AdminSubscriptions() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: subscriptions, isLoading, refetch } = useSubscriptions(searchTerm);
  const { data: stats } = useSubscriptionStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Subscription Management</h1>
                <p className="text-indigo-100 text-sm font-normal">
                  Monitor and manage user subscriptions
                </p>
              </div>
            </div>
            <Button
              onClick={() => refetch()}
              variant="secondary"
              className="bg-white text-indigo-700 hover:bg-indigo-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Subscriptions</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.total ?? 0}</p>
              </div>
              <Users className="w-10 h-10 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-green-200 bg-green-50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Active</p>
                <p className="text-3xl font-bold text-green-900">{stats?.active ?? 0}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-blue-200 bg-blue-50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Trialing</p>
                <p className="text-3xl font-bold text-blue-900">{stats?.trialing ?? 0}</p>
              </div>
              <DollarSign className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-red-200 bg-red-50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Canceled</p>
                <p className="text-3xl font-bold text-red-900">{stats?.canceled ?? 0}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by Stripe customer or subscription ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-800">All Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : !subscriptions?.length ? (
            <div className="text-center py-12 text-slate-500">
              <CreditCard className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p>No subscriptions found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Care Recipients</TableHead>
                  <TableHead>Period End</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">
                          {sub.profiles?.full_name || 'Unknown'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {sub.profiles?.email || sub.user_id}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[sub.status] || 'bg-slate-100 text-slate-800'}>
                        {sub.status}
                      </Badge>
                      {sub.cancel_at_period_end && (
                        <Badge variant="outline" className="ml-2 text-amber-600 border-amber-300">
                          Canceling
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-700">{sub.plan_id || 'Default'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-700">{sub.max_care_recipients}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-600">
                        {sub.current_period_end
                          ? format(parseISO(sub.current_period_end), 'MMM d, yyyy')
                          : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-600">
                        {format(parseISO(sub.created_at), 'MMM d, yyyy')}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
