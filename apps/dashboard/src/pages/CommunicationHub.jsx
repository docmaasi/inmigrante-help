import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Calendar, Bell, Users, Plus, Megaphone, X, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  useConversations,
  useMessages,
  useSendMessage,
  useCareRecipients,
  useNotifications,
  useTeamAnnouncements,
} from '@/hooks';
import { supabase } from '@/lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
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

  const queryClient = useQueryClient();
  const { data: conversations = [] } = useConversations();
  const { data: messages = [] } = useMessages(selectedConversationId);
  const { data: recipients = [] } = useCareRecipients();
  const { data: notifications = [] } = useNotifications();
  const { data: announcements = [] } = useTeamAnnouncements();

  const sendMessageMutation = useSendMessage();

  const updateAnnouncementMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase
        .from('team_announcements')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-announcements'] });
    }
  });

  const handleMarkAsRead = async (announcement) => {
    const readBy = announcement.read_by || [];
    if (!readBy.includes(user?.id)) {
      try {
        await updateAnnouncementMutation.mutateAsync({
          id: announcement.id,
          data: { read_by: [...readBy, user.id] }
        });
      } catch (error) {
        toast.error('Failed to mark as read');
      }
    }
  };

  const unreadAnnouncements = announcements.filter(a => {
    const readBy = a.read_by || [];
    return !readBy.includes(user?.id);
  });

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
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-white border border-slate-200 p-1">
            <TabsTrigger value="messages" className="flex items-center gap-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex items-center gap-2 relative data-[state=active]:bg-teal-600 data-[state=active]:text-white">
              <Megaphone className="w-4 h-4" />
              <span className="hidden sm:inline">Announcements</span>
              {unreadAnnouncements.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadAnnouncements.length}
                </span>
              )}
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
                      <CardTitle className="text-lg font-semibold text-slate-800">{selectedConversation?.title}</CardTitle>
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

          {/* Announcements Tab */}
          <TabsContent value="announcements">
            <Card className="bg-white shadow-sm border border-slate-200">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-teal-600" />
                    Team Announcements
                  </CardTitle>
                  {unreadAnnouncements.length > 0 && (
                    <Badge className="bg-red-100 text-red-800">
                      {unreadAnnouncements.length} unread
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  Important updates from your care team. Create announcements from the Collaboration page.
                </p>
              </CardHeader>
              <CardContent className="p-4">
                {announcements.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 mx-auto mb-3 bg-slate-100 rounded-full flex items-center justify-center">
                      <Megaphone className="w-7 h-7 text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-sm">No announcements yet</p>
                    <p className="text-slate-400 text-xs mt-1">Announcements created on the Collaboration page will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {announcements.map(announcement => {
                      const readBy = announcement.read_by || [];
                      const isUnread = !readBy.includes(user?.id);
                      const authorName = announcement.profiles?.full_name || 'Unknown';
                      const priorityColors = {
                        normal: 'bg-blue-50 text-blue-800 border-blue-200',
                        important: 'bg-orange-50 text-orange-800 border-orange-200',
                        urgent: 'bg-red-50 text-red-800 border-red-200'
                      };
                      const priorityBadgeColors = {
                        normal: 'bg-blue-100 text-blue-800',
                        important: 'bg-orange-100 text-orange-800',
                        urgent: 'bg-red-100 text-red-800'
                      };

                      return (
                        <div
                          key={announcement.id}
                          className={`p-4 rounded-lg border-l-4 ${priorityColors[announcement.priority]} ${
                            isUnread ? 'shadow-md ring-1 ring-slate-200' : 'opacity-75'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {announcement.priority === 'urgent' && (
                                  <AlertCircle className="w-4 h-4 text-red-600 animate-pulse" />
                                )}
                                {announcement.priority === 'important' && (
                                  <AlertCircle className="w-4 h-4 text-orange-600" />
                                )}
                                <h4 className="font-semibold text-sm">{announcement.title}</h4>
                                <Badge className={priorityBadgeColors[announcement.priority] + ' text-xs'}>
                                  {announcement.priority}
                                </Badge>
                                {isUnread && (
                                  <Badge className="bg-teal-100 text-teal-800 text-xs">New</Badge>
                                )}
                              </div>
                              <p className="text-sm mt-1">{announcement.content}</p>
                              <div className="flex items-center gap-3 text-xs text-slate-600 mt-2">
                                <span className="font-medium">{authorName}</span>
                                <span>&bull;</span>
                                <span>{formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}</span>
                              </div>
                            </div>
                            {isUnread && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkAsRead(announcement)}
                                className="shrink-0"
                              >
                                Mark Read
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
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
