import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import type { InsertTables, UpdateTables } from '@/types/database';

const QUERY_KEY = 'tasks';

interface TaskFilters {
  careRecipientId?: string;
  careRecipientIds?: string[];
  status?: string;
  assignedTo?: string;
  priority?: string;
}

export function useTasks(filters?: TaskFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select(
          '*, care_recipients(first_name, last_name), team_members(full_name)'
        )
        .order('due_date', { ascending: true, nullsFirst: false });

      if (filters?.careRecipientIds && filters.careRecipientIds.length > 0) {
        query = query.in('care_recipient_id', filters.careRecipientIds);
      } else if (filters?.careRecipientId) {
        query = query.eq('care_recipient_id', filters.careRecipientId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useTask(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('tasks')
        .select(
          '*, care_recipients(first_name, last_name), team_members(full_name)'
        )
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<InsertTables<'tasks'>, 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: result, error } = await (supabase
        .from('tasks') as any)
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

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: UpdateTables<'tasks'> & { id: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: result, error } = await (supabase
        .from('tasks') as any)
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

export function useCompleteTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: result, error } = await (supabase
        .from('tasks') as any)
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: user.id,
        })
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

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Task Comments
export function useTaskComments(taskId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['task-comments', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_comments')
        .select('*, profiles(full_name, avatar_url)')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!taskId,
  });
}

export function useAddTaskComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ taskId, content }: { taskId: string; content: string }) => {
      if (!user) throw new Error('Not authenticated');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: result, error } = await (supabase
        .from('task_comments') as any)
        .insert({ task_id: taskId, user_id: user.id, content })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', variables.taskId] });
    },
  });
}
