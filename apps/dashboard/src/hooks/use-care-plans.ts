import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import type { InsertTables, UpdateTables } from '@/types/database';

const QUERY_KEY = 'care-plans';

export function useCarePlans(careRecipientId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY, { careRecipientId }],
    queryFn: async () => {
      let query = supabase
        .from('care_plans')
        .select('*, care_recipients(first_name, last_name)')
        .order('created_at', { ascending: false });

      if (careRecipientId) query = query.eq('care_recipient_id', careRecipientId);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCarePlan(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('care_plans')
        .select('*, care_recipients(first_name, last_name), care_plan_details(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateCarePlan() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<InsertTables<'care_plans'>, 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: result, error } = await (supabase.from('care_plans') as any)
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

export function useUpdateCarePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: UpdateTables<'care_plans'> & { id: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: result, error } = await (supabase.from('care_plans') as any)
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

export function useDeleteCarePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('care_plans').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpdateCarePlanDetails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      carePlanId,
      details,
    }: {
      carePlanId: string;
      details: InsertTables<'care_plan_details'>[];
    }) => {
      await supabase
        .from('care_plan_details')
        .delete()
        .eq('care_plan_id', carePlanId);

      if (details.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('care_plan_details') as any).insert(
          details.map((d, i) => ({
            ...d,
            care_plan_id: carePlanId,
            order_index: i,
          }))
        );
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Care notes have moved to their own file to keep this file under 200 lines.
// Re-exported here for backward compatibility with any existing imports.
export {
  useCareNotes,
  useCreateCareNote,
  useUpdateCareNote,
  useDeleteCareNote,
} from './use-care-notes';
