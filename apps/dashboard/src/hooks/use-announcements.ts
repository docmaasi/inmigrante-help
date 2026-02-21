import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { useWorkspace } from './use-workspace';
import type { InsertTables } from '@/types/database';

export function useTeamAnnouncements() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['team-announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_announcements')
        .select('*, profiles:user_id(full_name)')
        .or(`expires_at.is.null,expires_at.gte.${new Date().toISOString()}`)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { workspaceOwnerUserId } = useWorkspace();

  return useMutation({
    mutationFn: async (data: Omit<InsertTables<'team_announcements'>, 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: result, error } = await (supabase.from('team_announcements') as any)
        .insert({ ...data, user_id: workspaceOwnerUserId })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-announcements'] });
    },
  });
}
