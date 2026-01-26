import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Calendar, Bell, Users, Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  useConversations,
  useMessages,
  useSendMessage,
  useCareRecipients,
  useNotifications,
} from '@/hooks';
import ConversationList from '../components/messaging/ConversationList';
import MessageThread from '../components/messaging/MessageThread';
import MessageInput from '../components/messaging/MessageInput';
import CalendarView from '../components/calendar/CalendarView';
import NotificationList from '../components/hub/NotificationList';
import NewConversationDialog from '../components/hub/NewConversationDialog';

export default function CommunicationHub() {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [showNewConvDialog, setShowNewConvDialog] = useState(false);

  const { data: conversations = [] } = useConversations();
  const { data: messages = [] } = useMessages(selectedConversationId);
  const { data: recipients = [] } = useCareRecipients();
  const { data: notifications = [] } = useNotifications();

  const sendMessageMutation = useSendMessage();

  const handleSendMessage = (content) => {
    if (!user || !selectedConversationId) return;

    sendMessageMutation.mutate({
      conversationId: selectedConversationId,
      content,
      messageType: 'text',
    });
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const unreadNotifications = notifications.filter(n => !n.is_read).length;

  // Transform recipients to match expected format
  const formattedRecipients = recipients.map(r => ({
    ...r,
    full_name: `${r.first_name || ''} ${r.last_name || ''}`.trim(),
  }));

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Communication Hub
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">
            Secure messaging, shared calendar, and notifications in one place
          </p>
        </div>

        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-white border border-slate-200 p-1">
            <TabsTrigger value="messages" className="flex items-center gap-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 relative data-[state=active]:bg-teal-600 data-[state=active]:text-white">
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
              <Card className="lg:col-span-1 bg-white shadow-sm border border-slate-200">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-800">Conversations</CardTitle>
                    <Button
                      size="sm"
                      onClick={() => setShowNewConvDialog(true)}
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {conversations.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-14 h-14 mx-auto mb-3 bg-slate-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-7 h-7 text-slate-400" />
                      </div>
                      <p className="text-slate-500 text-sm mb-4">No conversations yet</p>
                      <Button onClick={() => setShowNewConvDialog(true)} size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
                        Start Conversation
                      </Button>
                    </div>
                  ) : (
                    <ConversationList
                      conversations={conversations}
                      selectedId={selectedConversationId}
                      onSelect={setSelectedConversationId}
                      recipients={formattedRecipients}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Message Thread */}
              <Card className="lg:col-span-2 flex flex-col h-[600px] bg-white shadow-sm border border-slate-200">
                {selectedConversationId ? (
                  <>
                    <CardHeader className="border-b border-slate-100 pb-4">
                      <CardTitle className="text-lg font-semibold text-slate-800">{selectedConversation?.name}</CardTitle>
                      <p className="text-sm text-slate-500">
                        {formattedRecipients.find(r => r.id === selectedConversation?.care_recipient_id)?.full_name}
                      </p>
                    </CardHeader>
                    <MessageThread messages={messages} currentUserEmail={user?.email} />
                    <MessageInput onSend={handleSendMessage} disabled={!user} />
                  </>
                ) : (
                  <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center text-slate-500">
                      <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-8 h-8 text-slate-400" />
                      </div>
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
          recipients={formattedRecipients}
        />
      </div>
    </div>
  );
}
