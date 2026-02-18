import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ClientPortalNav } from '../components/client/ClientPortalNav';
import { ClientMessageThread } from '../components/client/ClientMessageThread';
import { ClientMessageInput } from '../components/client/ClientMessageInput';
import {
  useClientConversation,
  useClientMessages,
  useSendClientMessage,
} from '../hooks/use-client-messages';

function useClientAccess() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['clientAccess', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const { data, error } = await supabase
        .from('client_access')
        .select('*')
        .eq('client_email', user.email)
        .eq('approved', true)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.email,
  });
}

function useRecipient(recipientId) {
  return useQuery({
    queryKey: ['recipient', recipientId],
    queryFn: async () => {
      if (!recipientId) return null;
      const { data, error } = await supabase
        .from('care_recipients')
        .select('*')
        .eq('id', recipientId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!recipientId,
  });
}

export function ClientMessages() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { data: access, isLoading: accessLoading } = useClientAccess();

  const recipientId = access?.care_recipient_id;
  const { data: recipient } = useRecipient(recipientId);

  const { data: conversation } = useClientConversation(recipientId);
  const conversationId = conversation?.id;

  const { data: messages = [], isLoading: msgsLoading } =
    useClientMessages(conversationId);

  const sendMessage = useSendClientMessage();

  React.useEffect(() => {
    if (!authLoading && !user) navigate('/');
  }, [authLoading, user, navigate]);

  React.useEffect(() => {
    if (!accessLoading && user && !access) navigate('/');
  }, [accessLoading, user, access, navigate]);

  const handleSend = (content) => {
    if (!conversationId) return;
    sendMessage.mutate(
      { conversationId, content },
      { onError: () => toast.error('Failed to send message') }
    );
  };

  if (authLoading || accessLoading || !recipient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <ClientPortalNav
        careRecipientName={recipient.full_name}
        currentPageName="ClientMessages"
      />

      <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto">
        <div className="px-4 md:px-8 pt-6 pb-2">
          <h1 className="text-2xl font-bold text-slate-800">Messages</h1>
          <p className="text-sm text-slate-500">
            Chat with your care team
          </p>
        </div>

        <div className="flex-1 flex flex-col bg-slate-100 rounded-t-lg mx-4 md:mx-8 mb-0 min-h-[400px]">
          <ClientMessageThread
            messages={messages}
            isLoading={msgsLoading}
          />
          <ClientMessageInput
            onSend={handleSend}
            isSending={sendMessage.isPending}
          />
        </div>
      </div>
    </div>
  );
}

export default ClientMessages;
