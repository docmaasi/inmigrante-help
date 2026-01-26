import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useMarkNotificationRead } from '@/hooks';

export default function NotificationsWidget({ notifications }) {
  const markReadMutation = useMarkNotificationRead();

  const typeIcons = {
    appointment: Calendar,
    task: CheckCircle2,
    medication_refill: AlertTriangle,
    general: Info
  };

  const priorityStyles = {
    urgent: 'border-l-red-500',
    high: 'border-l-amber-500',
    medium: 'border-l-teal-500',
    low: 'border-l-slate-300'
  };

  const iconColors = {
    urgent: 'text-red-500',
    high: 'text-amber-500',
    medium: 'text-teal-500',
    low: 'text-slate-400'
  };

  const sortedNotifications = [...notifications]
    .sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 6);

  return (
    <div className="space-y-3">
      {sortedNotifications.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <Bell className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-slate-600 text-sm font-medium">No new notifications</p>
          <p className="text-slate-400 text-xs mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
          {sortedNotifications.map(notification => {
            const Icon = typeIcons[notification.type] || Info;
            const isUnread = !notification.read;
            return (
              <div
                key={notification.id}
                className={`p-3.5 rounded-lg border border-l-4 ${priorityStyles[notification.priority]} ${isUnread ? 'bg-teal-50/30 border-slate-200' : 'bg-white border-slate-100'} hover:bg-slate-50 transition-colors duration-150 cursor-pointer`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 relative">
                    <Icon className={`w-4 h-4 ${iconColors[notification.priority]} flex-shrink-0`} />
                    {isUnread && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-teal-500 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm ${isUnread ? 'font-semibold text-slate-800' : 'font-medium text-slate-700'}`}>
                      {notification.title}
                    </div>
                    <div className="text-sm text-slate-600 mt-0.5 line-clamp-2">{notification.message}</div>
                    <div className="text-xs mt-2 text-slate-400">
                      {format(parseISO(notification.created_at), 'MMM d, h:mm a')}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markReadMutation.mutate(notification.id)}
                    className="text-xs h-7 px-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
