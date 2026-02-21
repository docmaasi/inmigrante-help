import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { useWorkspace } from './use-workspace';
import type { InsertTables, UpdateTables } from '@/types/database';

export function useCareNotes(careRecipientId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['care-notes', { careRecipientId }],
    queryFn: async () => {
      let query = supabase
        .from('care_notes')
        .select('*, care_recipients(first_name, last_name), profiles:author_id(full_name)')
        .order('created_at', { ascending: false });

      if (careRecipientId) query = query.eq('care_recipient_id', careRecipientId);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateCareNote() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { workspaceOwnerUserId } = useWorkspace();

  return useMutation({
    mutationFn: async (data: Omit<InsertTables<'care_notes'>, 'user_id' | 'author_id'>) => {
      if (!user) throw new Error('Not authenticated');

      // user_id: workspace owner (for RLS — whose account is this filed under?)
      // author_id: actual logged-in user (for display — who wrote this note?)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: result, error } = await (supabase.from('care_notes') as any)
        .insert({ ...data, user_id: workspaceOwnerUserId, author_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['care-notes'] });
    },
  });
}

export function useUpdateCareNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: UpdateTables<'care_notes'> & { id: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: result, error } = await (supabase.from('care_notes') as any)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['care-notes'] });
    },
  });
}

export function useDeleteCareNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('care_notes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['care-notes'] });
    },
  });
}
