import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

type WorkspaceMembership = {
  user_id: string;
  role: string;
  care_recipient_ids: string[] | null;
  profiles: { full_name: string; email: string } | null;
} | null;

/**
 * Detects whether the current user is a team member in someone else's workspace.
 *
 * If they are, `workspaceOwnerUserId` returns the workspace owner's ID so that
 * any data created by this user (appointments, notes, tasks, etc.) is filed
 * under the owner's account rather than the team member's own account.
 *
 * If they're a regular owner, all values fall back to the user's own identity.
 */
export function useWorkspace() {
  const { user } = useAuth();

  const { data: membership } = useQuery({
    queryKey: ['workspace-membership', user?.id],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('team_members')
        .select('user_id, role, care_recipient_ids, profiles!user_id(full_name, email)')
        .eq('invited_user_id', user!.id)
        .eq('status', 'accepted')
        .maybeSingle();
      return (data ?? null) as WorkspaceMembership;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });

  return {
    /** The user ID to use as `user_id` on all data inserts. */
    workspaceOwnerUserId: membership?.user_id ?? user?.id,
    /** TRUE if logged-in user is a team member (not the workspace owner). */
    isTeamMember: !!membership,
    /** Role within the team: owner | admin | caregiver | viewer */
    teamRole: (membership?.role ?? 'owner') as 'owner' | 'admin' | 'caregiver' | 'viewer',
    /** Care recipient IDs this team member is assigned to, or null for all. */
    assignedRecipientIds: membership?.care_recipient_ids ?? null,
    /** Display name of the workspace owner (shown in team member's UI). */
    workspaceOwnerName: membership?.profiles?.full_name ?? null,
  };
}
