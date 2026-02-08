import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import type { InsertTables, UpdateTables } from '@/types/database';

const QUERY_KEY = 'appointments';

interface AppointmentFilters {
  careRecipientId?: string;
  careRecipientIds?: string[];
  startDate?: string;
  endDate?: string;
  status?: string;
}

export function useAppointments(filters?: AppointmentFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from('appointments')
        .select('*, care_recipients(first_name, last_name)')
        .order('start_time', { ascending: true });

      if (filters?.careRecipientIds && filters.careRecipientIds.length > 0) {
        query = query.in('care_recipient_id', filters.careRecipientIds);
      } else if (filters?.careRecipientId) {
        query = query.eq('care_recipient_id', filters.careRecipientId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.startDate) {
        query = query.gte('start_time', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('start_time', filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useUpcomingAppointments(limit = 5) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY, 'upcoming', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, care_recipients(first_name, last_name)')
        .gte('start_time', new Date().toISOString())
        .eq('status', 'scheduled')
        .order('start_time', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAppointment(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('appointments')
        .select('*, care_recipients(first_name, last_name)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<InsertTables<'appointments'>, 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: result, error } = await (supabase
        .from('appointments') as any)
        .insert({ ...data, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: UpdateTables<'appointments'> & { id: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: result, error } = await (supabase
        .from('appointments') as any)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
