import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import {
  logAdminAction,
  type AdminActionType,
  type AdminActionTargetType,
} from '@/services/admin-activity-logger';
import type { Json } from '@/types/database';

const QUERY_KEY = 'admin-activity-logs';

interface AdminActivityLog {
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

interface AdminActivityFilters {
  adminId?: string;
  action?: AdminActionType;
  targetType?: AdminActionTargetType;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export function useAdminActivity(filters?: AdminActivityFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: async (): Promise<AdminActivityLog[]> => {
      let query = supabase
        .from('admin_activity_logs')
        .select('*, profiles:admin_id(full_name, email)')
        .order('created_at', { ascending: false });

      if (filters?.adminId) {
        query = query.eq('admin_id', filters.adminId);
      }

      if (filters?.action) {
        query = query.eq('action', filters.action);
      }

      if (filters?.targetType) {
        query = query.eq('target_type', filters.targetType);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data as AdminActivityLog[];
    },
    enabled: !!user,
  });
}

export function useAdminActivityById(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async (): Promise<AdminActivityLog | null> => {
      if (!id) {
        return null;
      }

      const { data, error } = await supabase
        .from('admin_activity_logs')
        .select('*, profiles:admin_id(full_name, email)')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as AdminActivityLog;
    },
    enabled: !!user && !!id,
  });
}

interface LogAdminActionMutationParams {
  action: AdminActionType;
  targetType: AdminActionTargetType;
  targetId?: string;
  details?: Record<string, unknown>;
}

export function useLogAdminAction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: LogAdminActionMutationParams) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const result = await logAdminAction(params);

      if (!result.ok) {
        throw result.error;
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useAdminActivityStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY, 'stats'],
    queryFn: async () => {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [last24Hours, last7Days] = await Promise.all([
        supabase
          .from('admin_activity_logs')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', twentyFourHoursAgo.toISOString()),
        supabase
          .from('admin_activity_logs')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', sevenDaysAgo.toISOString()),
      ]);

      return {
        last24Hours: last24Hours.count ?? 0,
        last7Days: last7Days.count ?? 0,
      };
    },
    enabled: !!user,
  });
}
