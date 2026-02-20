import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Calendar, Bell, Megaphone } from 'lucide-react';
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
import { toast } from 'sonner';
import CalendarView from '../components/calendar/CalendarView';
import NotificationList from '../components/hub/NotificationList';
import NewConversationDialog from '../components/hub/NewConversationDialog';
import { MessagesTab } from '../components/hub/MessagesTab';
import { AnnouncementsTab } from '../components/hub/AnnouncementsTab';

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
      const { error } = await supabase.from('team_announcements').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team-announcements'] }),
  });

  const handleMarkAsRead = async (announcement) => {
    const readBy = announcement.read_by || [];
    if (!readBy.includes(user?.id)) {
      try {
        await updateAnnouncementMutation.mutateAsync({ id: announcement.id, data: { read_by: [...readBy, user.id] } });
      } catch { toast.error('Failed to mark as read'); }
    }
  };

  const unreadAnnouncements = announcements.filter(a => !(a.read_by || []).includes(user?.id));
  const unreadNotifications = notifications.filter(n => !n.is_read).length;

  const handleSendMessage = (content) => {
    if (!user || !selectedConversationId) return;
    sendMessageMutation.mutate({ conversationId: selectedConversationId, content, messageType: 'text' });
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const formattedRecipients = recipients.map(r => ({
    ...r, full_name: `${r.first_name || ''} ${r.last_name || ''}`.trim(),
  }));

  const tabStyle = "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4F46E5] data-[state=active]:to-[#8B7EC8] data-[state=active]:text-white";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3FF] via-[#EEF2FF] to-[#4F46E5]/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#4F46E5] to-[#8B7EC8] bg-clip-text text-transparent">
            Communication Hub
          </h1>
          <p className="text-sm md:text-base text-[#8B7EC8] mt-1">
            Secure messaging, shared calendar, and notifications in one place
          </p>
        </div>

        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-white/80 backdrop-blur-sm border border-[#4F46E5]/10 p-1">
            <TabsTrigger value="messages" className={`flex items-center gap-2 ${tabStyle}`}>
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="announcements" className={`flex items-center gap-2 relative ${tabStyle}`}>
              <Megaphone className="w-4 h-4" />
              <span className="hidden sm:inline">Announcements</span>
              {unreadAnnouncements.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E07A5F] text-white text-xs rounded-full flex items-center justify-center">
                  {unreadAnnouncements.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="calendar" className={`flex items-center gap-2 ${tabStyle}`}>
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className={`flex items-center gap-2 relative ${tabStyle}`}>
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E07A5F] text-white text-xs rounded-full flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages">
            <MessagesTab
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              selectedConversation={selectedConversation}
              messages={messages}
              recipients={formattedRecipients}
              user={user}
              onSelectConversation={setSelectedConversationId}
              onNewConversation={() => setShowNewConvDialog(true)}
              onSendMessage={handleSendMessage}
            />
          </TabsContent>

          <TabsContent value="announcements">
            <AnnouncementsTab
              announcements={announcements}
              unreadAnnouncements={unreadAnnouncements}
              userId={user?.id}
              onMarkAsRead={handleMarkAsRead}
            />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView />
          </TabsContent>

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
