import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import type { InsertTables, UpdateTables } from '@/types/database';

// Conversations
export function useConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*, care_recipients(first_name, last_name)')
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useConversation(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conversations', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('conversations')
        .select('*, care_recipients(first_name, last_name)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<InsertTables<'conversations'>, 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data: result, error } = await supabase
        .from('conversations')
        .insert({ ...data, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

// Messages with real-time
export function useMessages(conversationId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from('messages')
        .select('*, profiles:sender_id(full_name, avatar_url)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!conversationId,
  });

  // Real-time subscription
  useEffect(() => {
    if (!conversationId || !user) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user, queryClient]);

  return query;
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
      messageType = 'text',
      attachments,
    }: {
      conversationId: string;
      content: string;
      messageType?: string;
      attachments?: unknown;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data: result, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: messageType,
          attachments: attachments as never,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useMarkMessagesRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user) throw new Error('Not authenticated');

      // Get unread messages
      const { data: messages, error: fetchError } = await supabase
        .from('messages')
        .select('id, read_by')
        .eq('conversation_id', conversationId)
        .not('read_by', 'cs', `{${user.id}}`);

      if (fetchError) throw fetchError;
      if (!messages?.length) return;

      // Update each message to add user to read_by
      const updates = messages.map((msg) => ({
        id: msg.id,
        read_by: [...(msg.read_by || []), user.id],
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('messages')
          .update({ read_by: update.read_by })
          .eq('id', update.id);
        if (error) throw error;
      }
    },
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
  });
}
