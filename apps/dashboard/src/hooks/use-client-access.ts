import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import type { InsertTables, UpdateTables } from '@/types/database';

const QUERY_KEY = 'client-access';

export function useClientAccess(accessCode?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, accessCode],
    queryFn: async () => {
      if (!accessCode) return null;

      const { data, error } = await supabase
        .from('client_access')
        .select('*, care_recipients(id, first_name, last_name)')
        .eq('access_code', accessCode)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!accessCode,
  });
}

export function useClientAccessByRecipient(careRecipientId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY, 'recipient', careRecipientId],
    queryFn: async () => {
      if (!careRecipientId) return [];

      const { data, error } = await supabase
        .from('client_access')
        .select('*')
        .eq('care_recipient_id', careRecipientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!careRecipientId,
  });
}

export function useValidateClientAccess() {
  return useMutation({
    mutationFn: async (accessCode: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase
        .from('client_access') as any)
        .select('*, care_recipients(id, first_name, last_name)')
        .eq('access_code', accessCode)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Access code not found');

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        throw new Error('Access code has expired');
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase
        .from('client_access') as any)
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('id', data.id);

      return data;
    },
  });
}

export function useCreateClientAccess() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      data: Omit<InsertTables<'client_access'>, 'user_id' | 'access_code'> & {
        access_code?: string;
      }
    ) => {
      if (!user) throw new Error('Not authenticated');

      const accessCode =
        data.access_code || generateAccessCode();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: result, error } = await (supabase
        .from('client_access') as any)
        .insert({
          ...data,
          user_id: user.id,
          access_code: accessCode,
        })
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

export function useUpdateClientAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: UpdateTables<'client_access'> & { id: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: result, error } = await (supabase
        .from('client_access') as any)
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

export function useRevokeClientAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase
        .from('client_access') as any)
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const randomBytes = new Uint8Array(8);
  crypto.getRandomValues(randomBytes);
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(randomBytes[i] % chars.length);
  }
  return code;
}
