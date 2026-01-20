import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Megaphone, Plus, X, AlertCircle, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function TeamAnnouncementBanner({ careRecipientId }) {
  const [showDialog, setShowDialog] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'normal'
  });
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements', careRecipientId],
    queryFn: () => base44.entities.TeamAnnouncement.filter(
      { care_recipient_id: careRecipientId },
      '-created_date',
      5
    ),
    enabled: !!careRecipientId
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: (data) => base44.entities.TeamAnnouncement.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['announcements']);
      setShowDialog(false);
      setFormData({ title: '', message: '', priority: 'normal' });
      toast.success('Announcement posted');
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TeamAnnouncement.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['announcements']);
    }
  });

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    createAnnouncementMutation.mutate({
      care_recipient_id: careRecipientId,
      author_email: user?.email,
      author_name: user?.full_name,
      ...formData,
      read_by: JSON.stringify([user?.email])
    });
  };

  const handleMarkAsRead = (announcement) => {
    const readBy = JSON.parse(announcement.read_by || '[]');
    if (!readBy.includes(user?.email)) {
      readBy.push(user?.email);
      markAsReadMutation.mutate({
        id: announcement.id,
        data: { read_by: JSON.stringify(readBy) }
      });
    }
  };

  const unreadAnnouncements = announcements.filter(a => {
    const readBy = JSON.parse(a.read_by || '[]');
    return !readBy.includes(user?.email);
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
              const readBy = JSON.parse(announcement.read_by || '[]');
              const isUnread = !readBy.includes(user?.email);
              
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
                      <p className="text-xs mb-2">{announcement.message}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-600">
                        <span className="font-medium">{announcement.author_name}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(announcement.created_date), { addSuffix: true })}</span>
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

      {/* Create Dialog */}
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
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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