import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { useWorkspace } from './use-workspace';
import type { InsertTables, UpdateTables } from '@/types/database';

const QUERY_KEY = 'medications';

export function useMedications(careRecipientId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY, { careRecipientId }],
    queryFn: async () => {
      let query = supabase
        .from('medications')
        .select('*, care_recipients(first_name, last_name)')
        .order('name');

      if (careRecipientId) {
        query = query.eq('care_recipient_id', careRecipientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useMedication(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('medications')
        .select('*, care_recipients(first_name, last_name)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateMedication() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<InsertTables<'medications'>, 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: result, error } = await (supabase
        .from('medications') as any)
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

export function useUpdateMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: UpdateTables<'medications'> & { id: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: result, error } = await (supabase
        .from('medications') as any)
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

export function useDeleteMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('medications').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Medication Logs
export function useMedicationLogs(medicationId?: string, careRecipientId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['medication-logs', { medicationId, careRecipientId }],
    queryFn: async () => {
      let query = supabase
        .from('medication_logs')
        .select('*, medications(name, dosage), profiles(full_name)')
        .order('scheduled_time', { ascending: false });

      if (medicationId) {
        query = query.eq('medication_id', medicationId);
      }
      if (careRecipientId) {
        query = query.eq('care_recipient_id', careRecipientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useLogMedication() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { workspaceOwnerUserId } = useWorkspace();

  return useMutation({
    mutationFn: async (data: Omit<InsertTables<'medication_logs'>, 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: result, error } = await (supabase
        .from('medication_logs') as any)
        .insert({ ...data, user_id: workspaceOwnerUserId })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medication-logs'] });
    },
  });
}
