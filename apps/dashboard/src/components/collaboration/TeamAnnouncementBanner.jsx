import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTeamAnnouncements, useCreateAnnouncement, useTeamMembers } from '@/hooks';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Megaphone, Plus, X, AlertCircle, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function TeamAnnouncementBanner({ careRecipientId, careRecipientIds }) {
  const [showDialog, setShowDialog] = useState(false);
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal'
  });
  const queryClient = useQueryClient();

  const { data: announcements = [] } = useTeamAnnouncements();
  const { data: teamMembers = [] } = useTeamMembers();

  const createAnnouncementMutation = useCreateAnnouncement();

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

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const announcement = await createAnnouncementMutation.mutateAsync({
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        care_recipient_id: careRecipientIds?.[0] || careRecipientId || null,
        read_by: [user?.id]
      });

      // Create in-app notifications for all active team members with accounts
      const activeMembers = teamMembers.filter(m =>
        m.status !== 'removed' && m.invited_user_id && m.invited_user_id !== user?.id
      );

      if (activeMembers.length > 0) {
        const notifications = activeMembers.map(member => ({
          user_id: member.invited_user_id,
          title: `Team Announcement: ${formData.title}`,
          message: formData.content,
          type: 'announcement',
          reference_type: 'team_announcements',
          reference_id: announcement?.id || null,
        }));

        await supabase.from('notifications').insert(notifications);
      }

      // Send email notifications to all team members via edge function
      const allMemberEmails = teamMembers
        .filter(m => m.status !== 'removed' && m.email)
        .map(m => ({ email: m.email, name: m.full_name, phone: m.phone }));

      if (allMemberEmails.length > 0) {
        supabase.functions.invoke('notify-team-announcement', {
          body: {
            announcement_title: formData.title,
            announcement_content: formData.content,
            announcement_priority: formData.priority,
            author_name: profile?.full_name || user?.email,
            team_members: allMemberEmails,
          }
        }).catch(() => {
          // Email notification is best-effort, don't block the UI
        });
      }

      setShowDialog(false);
      setFormData({ title: '', content: '', priority: 'normal' });
      toast.success('Announcement posted and team notified');
    } catch (error) {
      toast.error('Failed to post announcement');
    }
  };

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

  const priorityColors = {
    normal: 'bg-blue-100 text-blue-800 border-blue-200',
    important: 'bg-orange-100 text-orange-800 border-orange-200',
    urgent: 'bg-red-100 text-red-800 border-red-200'
  };

  const priorityIcons = {
    normal: <Bell className="w-4 h-4" />,
    important: <AlertCircle className="w-4 h-4" />,
    urgent: <AlertCircle className="w-4 h-4 animate-pulse" />
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Megaphone className="w-4 h-4" />
            Team Announcements
            {unreadAnnouncements.length > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {unreadAnnouncements.length}
              </span>
            )}
          </h3>
          <Button size="sm" onClick={() => setShowDialog(true)}>
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>

        {announcements.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No announcements yet</p>
        ) : (
          <div className="space-y-2">
            {announcements.map(announcement => {
              const readBy = announcement.read_by || [];
              const isUnread = !readBy.includes(user?.id);
              const authorName = announcement.profiles?.full_name || 'Unknown';

              return (
                <Card
                  key={announcement.id}
                  className={`p-3 border-l-4 ${priorityColors[announcement.priority]} ${
                    isUnread ? 'shadow-md' : 'opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {priorityIcons[announcement.priority]}
                        <h4 className="font-semibold text-sm">{announcement.title}</h4>
                      </div>
                      <p className="text-xs mb-2">{announcement.content}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-600">
                        <span className="font-medium">{authorName}</span>
                        <span>&bull;</span>
                        <span>{formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                    {isUnread && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMarkAsRead(announcement)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Team Announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Title</label>
              <Input
                placeholder="Announcement title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Message</label>
              <Textarea
                placeholder="Your announcement message"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Priority</label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button
                onClick={handleSubmit}
                disabled={createAnnouncementMutation.isPending}
              >
                {createAnnouncementMutation.isPending ? 'Posting...' : 'Post Announcement'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
