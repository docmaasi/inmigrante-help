import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import type { InsertTables, UpdateTables } from '@/types/database';

const QUERY_KEY = 'team-members';

export function useTeamMembers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('full_name');

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useTeamMember(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });
}

type InviteInput = Omit<InsertTables<'team_members'>, 'user_id' | 'status' | 'invited_at'> & {
  careRecipientNames?: string[];
};

export function useInviteTeamMember() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ careRecipientNames: _names, ...data }: InviteInput) => {
      if (!user) throw new Error('Not authenticated');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: result, error } = await (supabase.from('team_members') as any)
        .insert({
          ...data,
          user_id: user.id,
          status: 'pending',
          invited_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });

      // Fire-and-forget: send invite email (and auto-link if account already exists).
      supabase.functions
        .invoke('send-team-invite', {
          body: {
            teamMemberEmail: variables.email,
            teamMemberName: variables.full_name,
            caregiverName:
              user?.user_metadata?.full_name || user?.email || 'Your care team',
            careRecipientNames: variables.careRecipientNames ?? [],
          },
        })
        .catch(console.warn);
    },
  });
}

export function useUpdateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: UpdateTables<'team_members'> & { id: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: result, error } = await (supabase.from('team_members') as any)
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

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Re-export shift and announcement hooks for backward compatibility.
// The implementations have moved to their own files to keep file sizes under 200 lines.
export { useCaregiverShifts, useCreateShift, useUpdateShift } from './use-shifts';
export { useTeamAnnouncements, useCreateAnnouncement } from './use-announcements';
