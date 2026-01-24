import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { usePermissions } from '@/hooks/use-permissions';
import { logAdminAction } from '@/services/admin-activity-logger';
import type { UserRole } from '@/types/permissions';

const QUERY_KEY = 'admin-users';

export interface AdminUserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: string;
  subscription_status: string;
  stripe_customer_id: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
  subscriptions?: {
    id: string;
    status: string;
    plan_name: string | null;
    current_period_end: string | null;
  }[];
}

export interface AdminUserFilters {
  search?: string;
  role?: UserRole | 'all';
  subscriptionStatus?: string | 'all';
  sortBy?: 'created_at' | 'full_name' | 'email' | 'role';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

interface AdminUsersResult {
  users: AdminUserProfile[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function useAdminUsers(filters: AdminUserFilters = {}) {
  const { user } = useAuth();
  const { isSuperAdmin } = usePermissions();

  const {
    search = '',
    role = 'all',
    subscriptionStatus = 'all',
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    pageSize = 10,
  } = filters;

  return useQuery({
    queryKey: [QUERY_KEY, { search, role, subscriptionStatus, sortBy, sortOrder, page, pageSize }],
    queryFn: async (): Promise<AdminUsersResult> => {
      let query = supabase
        .from('profiles')
        .select('*, subscriptions(id, status, plan_name, current_period_end)', { count: 'exact' });

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      if (role !== 'all') {
        query = query.eq('role', role);
      }

      if (subscriptionStatus !== 'all') {
        query = query.eq('subscription_status', subscriptionStatus);
      }

      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(error.message);
      }

      const totalCount = count ?? 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        users: data as AdminUserProfile[],
        totalCount,
        page,
        pageSize,
        totalPages,
      };
    },
    enabled: !!user && isSuperAdmin,
  });
}

export function useAdminUserById(userId: string | undefined) {
  const { user } = useAuth();
  const { isSuperAdmin } = usePermissions();

  return useQuery({
    queryKey: [QUERY_KEY, userId],
    queryFn: async (): Promise<AdminUserProfile | null> => {
      if (!userId) {
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*, subscriptions(id, status, plan_name, current_period_end)')
        .eq('id', userId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as AdminUserProfile;
    },
    enabled: !!user && !!userId && isSuperAdmin,
  });
}

interface UpdateUserRoleParams {
  userId: string;
  newRole: UserRole;
  previousRole: string;
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ userId, newRole, previousRole }: UpdateUserRoleParams) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const logResult = await logAdminAction({
        action: 'user_role_changed',
        targetType: 'user',
        targetId: userId,
        details: {
          previousRole,
          newRole,
        },
      });

      if (!logResult.ok) {
        console.error('Failed to log admin action:', logResult.error);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

interface DisableUserParams {
  userId: string;
  reason?: string;
}

export function useDisableUser() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ userId, reason }: DisableUserParams) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'disabled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const logResult = await logAdminAction({
        action: 'user_disabled',
        targetType: 'user',
        targetId: userId,
        details: { reason: reason ?? 'No reason provided' },
      });

      if (!logResult.ok) {
        console.error('Failed to log admin action:', logResult.error);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

interface EnableUserParams {
  userId: string;
}

export function useEnableUser() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ userId }: EnableUserParams) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const logResult = await logAdminAction({
        action: 'user_enabled',
        targetType: 'user',
        targetId: userId,
        details: {},
      });

      if (!logResult.ok) {
        console.error('Failed to log admin action:', logResult.error);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useAdminUserStats() {
  const { user } = useAuth();
  const { isSuperAdmin } = usePermissions();

  return useQuery({
    queryKey: [QUERY_KEY, 'stats'],
    queryFn: async () => {
      const [
        totalResult,
        adminResult,
        caregiverResult,
        viewerResult,
        activeSubResult,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'admin'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'caregiver'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'viewer'),
        supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      ]);

      return {
        total: totalResult.count ?? 0,
        admins: adminResult.count ?? 0,
        caregivers: caregiverResult.count ?? 0,
        viewers: viewerResult.count ?? 0,
        activeSubscriptions: activeSubResult.count ?? 0,
      };
    },
    enabled: !!user && isSuperAdmin,
  });
}
