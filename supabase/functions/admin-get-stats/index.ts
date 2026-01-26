import { createClient } from 'jsr:@supabase/supabase-js@2';
import { requireAdmin, createErrorResponse } from '../_shared/admin-middleware.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalCareRecipients: number;
  tasksToday: number;
  recentSignups: number;
  revenueThisMonth: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return createErrorResponse('Method not allowed', 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    await requireAdmin(req, supabase);

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const sevenDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const [
      usersResult,
      subscriptionsResult,
      careRecipientsResult,
      tasksTodayResult,
      recentSignupsResult,
      revenueResult,
    ] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('care_recipients').select('id', { count: 'exact', head: true }),
      supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .gte('due_date', startOfToday.toISOString())
        .lt('due_date', endOfToday.toISOString()),
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString()),
      supabase
        .from('receipts')
        .select('amount')
        .gte('created_at', startOfMonth.toISOString())
        .lt('created_at', endOfMonth.toISOString())
        .eq('status', 'succeeded'),
    ]);

    const totalRevenue = revenueResult.data?.reduce((sum, receipt) => sum + (receipt.amount || 0), 0) ?? 0;

    const stats: AdminStats = {
      totalUsers: usersResult.count ?? 0,
      activeSubscriptions: subscriptionsResult.count ?? 0,
      totalCareRecipients: careRecipientsResult.count ?? 0,
      tasksToday: tasksTodayResult.count ?? 0,
      recentSignups: recentSignupsResult.count ?? 0,
      revenueThisMonth: totalRevenue,
    };

    return new Response(JSON.stringify({ data: stats }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Unauthorized')
      ? 401
      : message.includes('Forbidden')
        ? 403
        : 500;

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
