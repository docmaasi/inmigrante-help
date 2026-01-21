import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import type { InsertTables, UpdateTables } from '@/types/database';

const QUERY_KEY = 'documents';

interface DocumentFilters {
  careRecipientId?: string;
  category?: string;
}

export function useDocuments(filters?: DocumentFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from('documents')
        .select('*, care_recipients(first_name, last_name)')
        .order('created_at', { ascending: false });

      if (filters?.careRecipientId) {
        query = query.eq('care_recipient_id', filters.careRecipientId);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useDocument(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('documents')
        .select('*, care_recipients(first_name, last_name)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<InsertTables<'documents'>, 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data: result, error } = await supabase
        .from('documents')
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

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: UpdateTables<'documents'> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('documents')
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

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUploadDocument() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      file,
      careRecipientId,
    }: {
      file: File;
      careRecipientId?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('documents').getPublicUrl(fileName);

      return {
        filePath: fileName,
        fileUrl: publicUrl,
        fileType: file.type,
        fileSize: file.size,
      };
    },
  });
}
