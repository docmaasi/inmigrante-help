import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const PRIORITY_COLORS = {
  normal: 'bg-[#4F46E5]/5 text-[#4F46E5] border-[#4F46E5]/20',
  important: 'bg-[#F4A261]/10 text-[#E07A5F] border-[#F4A261]/30',
  urgent: 'bg-red-50 text-red-800 border-red-200',
};

const PRIORITY_BADGE_COLORS = {
  normal: 'bg-[#4F46E5]/10 text-[#4F46E5]',
  important: 'bg-[#F4A261]/15 text-[#E07A5F]',
  urgent: 'bg-red-100 text-red-800',
};

export function AnnouncementsTab({ announcements, unreadAnnouncements, userId, onMarkAsRead }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-sm border border-[#E07A5F]/15">
      <CardHeader className="border-b border-[#E07A5F]/10 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-[#4F46E5] flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#E07A5F]" />
            Team Announcements
          </CardTitle>
          {unreadAnnouncements.length > 0 && (
            <Badge className="bg-[#E07A5F]/15 text-[#E07A5F]">
              {unreadAnnouncements.length} unread
            </Badge>
          )}
        </div>
        <p className="text-sm text-[#8B7EC8] mt-1">
          Important updates from your care team. Create announcements from the Collaboration page.
        </p>
      </CardHeader>
      <CardContent className="p-4">
        {announcements.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-[#E07A5F]/10 to-[#F4A261]/15 rounded-full flex items-center justify-center">
              <Megaphone className="w-7 h-7 text-[#E07A5F]" />
            </div>
            <p className="text-[#8B7EC8] text-sm">No announcements yet</p>
            <p className="text-[#8B7EC8]/60 text-xs mt-1">Announcements created on the Collaboration page will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map(announcement => {
              const readBy = announcement.read_by || [];
              const isUnread = !readBy.includes(userId);
              const authorName = announcement.profiles?.full_name || 'Unknown';

              return (
                <div
                  key={announcement.id}
                  className={`p-4 rounded-lg border-l-4 ${PRIORITY_COLORS[announcement.priority]} ${
                    isUnread ? 'shadow-md ring-1 ring-[#4F46E5]/10' : 'opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {announcement.priority === 'urgent' && <AlertCircle className="w-4 h-4 text-red-600 animate-pulse" />}
                        {announcement.priority === 'important' && <AlertCircle className="w-4 h-4 text-[#E07A5F]" />}
                        <h4 className="font-semibold text-sm">{announcement.title}</h4>
                        <Badge className={PRIORITY_BADGE_COLORS[announcement.priority] + ' text-xs'}>
                          {announcement.priority}
                        </Badge>
                        {isUnread && <Badge className="bg-[#4F46E5]/10 text-[#4F46E5] text-xs">New</Badge>}
                      </div>
                      <p className="text-sm mt-1">{announcement.content}</p>
                      <div className="flex items-center gap-3 text-xs text-[#8B7EC8] mt-2">
                        <span className="font-medium">{authorName}</span>
                        <span>&bull;</span>
                        <span>{formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                    {isUnread && (
                      <Button size="sm" variant="outline" onClick={() => onMarkAsRead(announcement)} className="shrink-0 border-[#4F46E5]/20 text-[#4F46E5]">
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
  );
}
