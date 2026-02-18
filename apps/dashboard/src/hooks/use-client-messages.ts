import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

/**
 * Finds or creates a "Client Portal" conversation for a care recipient,
 * then provides messages + send functionality with real-time updates.
 */
export function useClientConversation(careRecipientId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['clientConversation', careRecipientId],
    queryFn: async () => {
      if (!careRecipientId || !user) return null;

      // Look for an existing client-portal conversation
      const { data: existing, error: findErr } = await supabase
        .from('conversations')
        .select('*')
        .eq('care_recipient_id', careRecipientId)
        .eq('type', 'client_portal')
        .maybeSingle();

      if (findErr) throw findErr;
      if (existing) return existing;

      // None found — create one
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: created, error: createErr } = await (supabase
        .from('conversations') as any)
        .insert({
          care_recipient_id: careRecipientId,
          user_id: user.id,
          title: 'Client Portal Messages',
          type: 'client_portal',
        })
        .select()
        .single();

      if (createErr) throw createErr;
      return created;
    },
    enabled: !!careRecipientId && !!user,
  });
}

export function useClientMessages(conversationId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['clientMessages', conversationId],
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

  // Real-time subscription for new messages
  useEffect(() => {
    if (!conversationId || !user) return;

    const channel = supabase
      .channel(`client-messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ['clientMessages', conversationId],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user, queryClient]);

  return query;
}

export function useSendClientMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
    }: {
      conversationId: string;
      content: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase
        .from('messages') as any)
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: 'text',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['clientMessages', variables.conversationId],
      });
    },
  });
}
