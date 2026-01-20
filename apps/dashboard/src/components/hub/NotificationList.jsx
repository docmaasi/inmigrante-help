import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckSquare, Pill, AlertCircle, Bell, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function NotificationList({ notifications }) {
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const dismissMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('Notification dismissed');
    }
  });

  const getIcon = (type) => {
    switch(type) {
      case 'appointment': return Calendar;
      case 'task': return CheckSquare;
      case 'medication_refill': return Pill;
      default: return Bell;
    }
  };

  const getColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'bg-red-50 border-red-200';
      case 'high': return 'bg-orange-50 border-orange-200';
      case 'medium': return 'bg-blue-50 border-blue-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      urgent: 'bg-red-600',
      high: 'bg-orange-600',
      medium: 'bg-blue-600',
      low: 'bg-slate-600'
    };
    return colors[priority] || colors.low;
  };

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No notifications</h3>
          <p className="text-slate-500">You're all caught up!</p>
        </CardContent>
      </Card>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <div className="space-y-6">
      {/* Unread Section */}
      {unreadNotifications.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Unread ({unreadNotifications.length})
          </h3>
          <div className="space-y-3">
            {unreadNotifications.map(notification => {
              const Icon = getIcon(notification.type);
              return (
                <Card key={notification.id} className={`${getColor(notification.priority)} border-2`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getPriorityBadge(notification.priority)} text-white`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-slate-800">{notification.title}</h4>
                          <Badge className={`${getPriorityBadge(notification.priority)} text-white shrink-0`}>
                            {notification.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                        className="flex-1"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Mark as read
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => dismissMutation.mutate(notification.id)}
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Dismiss
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Read Section */}
      {readNotifications.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Earlier ({readNotifications.length})
          </h3>
          <div className="space-y-3">
            {readNotifications.map(notification => {
              const Icon = getIcon(notification.type);
              return (
                <Card key={notification.id} className="opacity-60">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-slate-200 text-slate-600">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-700">{notification.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dismissMutation.mutate(notification.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}