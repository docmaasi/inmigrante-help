import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { useWorkspace } from './use-workspace';
import type { InsertTables, UpdateTables } from '@/types/database';

export function useCaregiverShifts(filters?: {
  teamMemberId?: string;
  careRecipientId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['caregiver-shifts', filters],
    queryFn: async () => {
      let query = supabase
        .from('caregiver_shifts')
        .select('*, team_members(full_name), care_recipients(first_name, last_name)')
        .order('start_time', { ascending: true });

      if (filters?.teamMemberId) query = query.eq('team_member_id', filters.teamMemberId);
      if (filters?.careRecipientId) query = query.eq('care_recipient_id', filters.careRecipientId);
      if (filters?.startDate) query = query.gte('start_time', filters.startDate);
      if (filters?.endDate) query = query.lte('end_time', filters.endDate);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateShift() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { workspaceOwnerUserId } = useWorkspace();

  return useMutation({
    mutationFn: async (data: Omit<InsertTables<'caregiver_shifts'>, 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: result, error } = await (supabase.from('caregiver_shifts') as any)
        .insert({ ...data, user_id: workspaceOwnerUserId })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caregiver-shifts'] });
    },
  });
}

export function useUpdateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: UpdateTables<'caregiver_shifts'> & { id: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: result, error } = await (supabase.from('caregiver_shifts') as any)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caregiver-shifts'] });
    },
  });
}
