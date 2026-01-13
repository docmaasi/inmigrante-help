import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Calendar, Bell, Users, Plus } from 'lucide-react';
import ConversationList from '../components/messaging/ConversationList';
import MessageThread from '../components/messaging/MessageThread';
import MessageInput from '../components/messaging/MessageInput';
import CalendarView from '../components/calendar/CalendarView';
import NotificationList from '../components/hub/NotificationList';
import NewConversationDialog from '../components/hub/NewConversationDialog';
import { toast } from 'sonner';

export default function CommunicationHub() {
  const [user, setUser] = useState(null);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [showNewConvDialog, setShowNewConvDialog] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => base44.entities.Conversation.list('-last_message_at')
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedConversationId],
    queryFn: () => base44.entities.Message.filter({ conversation_id: selectedConversationId }, 'created_date'),
    enabled: !!selectedConversationId
  });

  const { data: recipients = [] } = useQuery({
    queryKey: ['careRecipients'],
    queryFn: () => base44.entities.CareRecipient.list()
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user.email }, '-created_date', 50),
    enabled: !!user?.email
  });

  // Real-time message subscription
  useEffect(() => {
    if (!selectedConversationId) return;

    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.data.conversation_id === selectedConversationId) {
        queryClient.invalidateQueries(['messages', selectedConversationId]);
        queryClient.invalidateQueries(['conversations']);
      }
    });

    return unsubscribe;
  }, [selectedConversationId, queryClient]);

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['messages', selectedConversationId]);
      base44.entities.Conversation.update(selectedConversationId, {
        last_message_at: new Date().toISOString()
      });
    }
  });

  const handleSendMessage = (content) => {
    if (!user || !selectedConversationId) return;
    
    sendMessageMutation.mutate({
      conversation_id: selectedConversationId,
      sender_email: user.email,
      sender_name: user.full_name,
      content,
      message_type: 'text'
    });
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
            Communication Hub
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">
            Secure messaging, shared calendar, and notifications in one place
          </p>
        </div>

        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 relative">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Conversations List */}
              <Card className="lg:col-span-1 shadow-sm border-slate-200/60">
                <CardHeader className="border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Conversations</CardTitle>
                    <Button
                      size="sm"
                      onClick={() => setShowNewConvDialog(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {conversations.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm mb-4">No conversations yet</p>
                      <Button onClick={() => setShowNewConvDialog(true)} size="sm">
                        Start Conversation
                      </Button>
                    </div>
                  ) : (
                    <ConversationList
                      conversations={conversations}
                      selectedId={selectedConversationId}
                      onSelect={setSelectedConversationId}
                      recipients={recipients}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Message Thread */}
              <Card className="lg:col-span-2 flex flex-col h-[600px] shadow-sm border-slate-200/60">
                {selectedConversationId ? (
                  <>
                    <CardHeader className="border-b border-slate-100">
                      <CardTitle className="text-lg">{selectedConversation?.name}</CardTitle>
                      <p className="text-sm text-slate-500">
                        {recipients.find(r => r.id === selectedConversation?.care_recipient_id)?.full_name}
                      </p>
                    </CardHeader>
                    <MessageThread messages={messages} currentUserEmail={user?.email} />
                    <MessageInput onSend={handleSendMessage} disabled={!user} />
                  </>
                ) : (
                  <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center text-slate-500">
                      <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p>Select a conversation to start messaging</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <CalendarView />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <NotificationList notifications={notifications} />
          </TabsContent>
        </Tabs>

        <NewConversationDialog
          open={showNewConvDialog}
          onClose={() => setShowNewConvDialog(false)}
          recipients={recipients}
        />
      </div>
    </div>
  );
}