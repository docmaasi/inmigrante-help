import React from 'react';
import { useAppointments } from '@/hooks/use-appointments';
import { useMedications, useMedicationLogs } from '@/hooks/use-medications';
import { useTasks } from '@/hooks/use-tasks';
import { useCareNotes } from '@/hooks/use-care-plans';
import { useCareRecipients } from '@/hooks/use-care-recipients';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { User, Calendar, Pill, CheckSquare, FileText, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function ActivityLog({ recipientId = null, limit = 20 }) {
  const { data: appointments = [] } = useAppointments();
  const { data: medications = [] } = useMedications();
  const { data: tasks = [] } = useTasks();
  const { data: medicationLogs = [] } = useMedicationLogs();
  const { data: careNotes = [] } = useCareNotes();
  const { data: recipients = [] } = useCareRecipients();

  const activities = [
    ...appointments.map(a => ({
      type: 'appointment',
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      title: `Scheduled appointment: ${a.title}`,
      user: a.profiles?.full_name || 'Unknown',
      timestamp: a.created_at,
      recipientId: a.care_recipient_id
    })),
    ...medications.map(m => ({
      type: 'medication',
      icon: Pill,
      color: 'text-green-600',
      bg: 'bg-green-100',
      title: `Added medication: ${m.name}`,
      user: m.profiles?.full_name || 'Unknown',
      timestamp: m.created_at,
      recipientId: m.care_recipient_id
    })),
    ...tasks.map(t => ({
      type: 'task',
      icon: CheckSquare,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      title: `Created task: ${t.title}`,
      user: t.profiles?.full_name || 'Unknown',
      timestamp: t.created_at,
      recipientId: t.care_recipient_id
    })),
    ...medicationLogs.map(l => ({
      type: 'medication_log',
      icon: Pill,
      color: l.status === 'taken' ? 'text-green-600' : 'text-yellow-600',
      bg: l.status === 'taken' ? 'bg-green-100' : 'bg-yellow-100',
      title: `Logged medication: ${l.medications?.name || 'Unknown'} (${l.status})`,
      user: l.profiles?.full_name || 'Unknown',
      timestamp: l.created_at,
      recipientId: l.care_recipient_id
    })),
    ...careNotes.map(n => ({
      type: 'note',
      icon: FileText,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      title: `Added care note: ${n.title || n.note_type || 'Note'}`,
      user: n.profiles?.full_name || 'Unknown',
      timestamp: n.created_at,
      recipientId: n.care_recipient_id
    }))
  ];

  const filteredActivities = recipientId
    ? activities.filter(a => a.recipientId === recipientId)
    : activities;

  const sortedActivities = filteredActivities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);

  const getRecipientName = (id) => {
    const recipient = recipients.find(r => r.id === id);
    return recipient ? `${recipient.first_name} ${recipient.last_name}` : 'Unknown';
  };

  return (
    <Card className="shadow-sm border-slate-200/60">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {sortedActivities.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No recent activity
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedActivities.map((activity, idx) => {
              const Icon = activity.icon;
              return (
                <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${activity.bg} flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{activity.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <User className="w-3 h-3" />
                        <span>{activity.user}</span>
                        <span>-</span>
                        <Clock className="w-3 h-3" />
                        <span>{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</span>
                      </div>
                      {activity.recipientId && (
                        <p className="text-xs text-slate-500 mt-1">
                          For: {getRecipientName(activity.recipientId)}
                        </p>
                      )}
                    </div>
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

export default ActivityLog;
