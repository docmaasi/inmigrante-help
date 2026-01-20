import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function NotificationsWidget({ notifications }) {
  const queryClient = useQueryClient();

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const typeIcons = {
    appointment: Calendar,
    task: CheckCircle2,
    medication_refill: AlertTriangle,
    general: Info
  };

  const priorityColors = {
    urgent: 'bg-red-50 border-red-200 text-red-700',
    high: 'bg-orange-50 border-orange-200 text-orange-700',
    medium: 'bg-blue-50 border-blue-200 text-blue-700',
    low: 'bg-slate-50 border-slate-200 text-slate-700'
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
        <div className="text-center py-8">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No new notifications</p>
          <p className="text-slate-400 text-xs">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {sortedNotifications.map(notification => {
            const Icon = typeIcons[notification.type] || Info;
            return (
              <div 
                key={notification.id}
                className={`p-3 rounded-lg border ${priorityColors[notification.priority]}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{notification.title}</div>
                    <div className="text-sm mt-1">{notification.message}</div>
                    <div className="text-xs mt-2 opacity-75">
                      {format(parseISO(notification.created_date), 'MMM d, h:mm a')}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markReadMutation.mutate(notification.id)}
                    className="text-xs h-7"
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