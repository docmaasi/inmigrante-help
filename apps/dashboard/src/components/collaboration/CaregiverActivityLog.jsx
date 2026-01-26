import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Calendar, Pill, MessageSquare, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ACTION_ICONS = {
  task_completed: <CheckCircle2 className="w-4 h-4 text-green-600" />,
  appointment_created: <Calendar className="w-4 h-4 text-blue-600" />,
  medication_logged: <Pill className="w-4 h-4 text-purple-600" />,
  message_sent: <MessageSquare className="w-4 h-4 text-slate-600" />,
  note_added: <FileText className="w-4 h-4 text-orange-600" />,
};

const ACTION_COLORS = {
  task_created: 'bg-blue-100 text-blue-800',
  task_assigned: 'bg-purple-100 text-purple-800',
  task_completed: 'bg-green-100 text-green-800',
  task_updated: 'bg-yellow-100 text-yellow-800',
  appointment_created: 'bg-blue-100 text-blue-800',
  appointment_updated: 'bg-yellow-100 text-yellow-800',
  appointment_completed: 'bg-green-100 text-green-800',
  medication_logged: 'bg-purple-100 text-purple-800',
  note_added: 'bg-orange-100 text-orange-800',
  message_sent: 'bg-slate-100 text-slate-800'
};

export default function CaregiverActivityLog({ careRecipientId, limit = 20 }) {
  const { user } = useAuth();

  const { data: activities = [] } = useQuery({
    queryKey: ['action-log', careRecipientId, limit],
    queryFn: async () => {
      if (!careRecipientId) return [];

      const { data, error } = await supabase
        .from('action_logs')
        .select('*, profiles:actor_id(full_name)')
        .eq('care_recipient_id', careRecipientId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data.map(item => ({
        ...item,
        actor_name: item.profiles?.full_name || 'Unknown',
        created_date: item.created_at
      }));
    },
    enabled: !!user && !!careRecipientId
  });

  const groupedByDate = activities.reduce((groups, activity) => {
    const date = new Date(activity.created_date).toLocaleDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(activity);
    return groups;
  }, {});

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-slate-800 mb-4">Team Activity</h3>
      <div className="space-y-6">
        {Object.entries(groupedByDate).map(([date, dayActivities]) => (
          <div key={date}>
            <div className="text-xs font-semibold text-slate-500 uppercase mb-3">{date}</div>
            <div className="space-y-3">
              {dayActivities.map((activity) => (
                <div key={activity.id} className="flex gap-3 pb-3 border-b border-slate-200 last:border-0">
                  <div className="mt-0.5">
                    {ACTION_ICONS[activity.action_type] || <FileText className="w-4 h-4 text-slate-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm text-slate-800">
                          <span className="font-medium">{activity.actor_name}</span>
                          {' '}{activity.description}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatDistanceToNow(new Date(activity.created_date), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge className={ACTION_COLORS[activity.action_type]}>
                        {activity.action_type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4">No activity yet</p>
        )}
      </div>
    </Card>
  );
}
