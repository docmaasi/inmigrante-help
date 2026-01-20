import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Bell, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format, formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: notifications = [], refetch } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => user ? base44.entities.Notification.filter({ user_email: user.email }, '-created_date', 20) : [],
    enabled: !!user,
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (notificationId) => {
    await base44.entities.Notification.update(notificationId, { read: true });
    refetch();
  };

  const handleDismiss = async (notificationId) => {
    await base44.entities.Notification.delete(notificationId);
    refetch();
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'border-l-4 border-l-red-500 bg-red-50';
      case 'high': return 'border-l-4 border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-4 border-l-blue-500 bg-blue-50';
      default: return 'border-l-4 border-l-slate-500 bg-slate-50';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'appointment': return '📅';
      case 'task': return '✓';
      case 'medication_refill': return '💊';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-800 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800">Notifications</h3>
            <p className="text-xs text-slate-500">{unreadCount} unread</p>
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-4 ${getPriorityColor(notif.priority)} hover:bg-opacity-75 transition-colors`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getTypeIcon(notif.type)}</span>
                        <h4 className="font-medium text-slate-800 text-sm">{notif.title}</h4>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{notif.message}</p>
                      <p className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(notif.created_date), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDismiss(notif.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        title="Dismiss"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}