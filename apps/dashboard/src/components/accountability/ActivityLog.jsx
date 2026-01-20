import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { User, Calendar, Pill, CheckSquare, FileText, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export default function ActivityLog({ recipientId = null, limit = 20 }) {
  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list('-created_date', limit)
  });

  const { data: medications = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: () => base44.entities.Medication.list('-created_date', limit)
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-created_date', limit)
  });

  const { data: medicationLogs = [] } = useQuery({
    queryKey: ['medicationLogs'],
    queryFn: () => base44.entities.MedicationLog.list('-created_date', limit)
  });

  const { data: careNotes = [] } = useQuery({
    queryKey: ['careNotes'],
    queryFn: () => base44.entities.CareNote.list('-created_date', limit)
  });

  const { data: recipients = [] } = useQuery({
    queryKey: ['careRecipients'],
    queryFn: () => base44.entities.CareRecipient.list()
  });

  // Combine all activities
  const activities = [
    ...appointments.map(a => ({
      type: 'appointment',
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      title: `Scheduled appointment: ${a.title}`,
      user: a.created_by,
      timestamp: a.created_date,
      recipientId: a.care_recipient_id
    })),
    ...medications.map(m => ({
      type: 'medication',
      icon: Pill,
      color: 'text-green-600',
      bg: 'bg-green-100',
      title: `Added medication: ${m.medication_name}`,
      user: m.created_by,
      timestamp: m.created_date,
      recipientId: m.care_recipient_id
    })),
    ...tasks.map(t => ({
      type: 'task',
      icon: CheckSquare,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      title: `Created task: ${t.title}`,
      user: t.created_by,
      timestamp: t.created_date,
      recipientId: t.care_recipient_id
    })),
    ...medicationLogs.map(l => ({
      type: 'medication_log',
      icon: Pill,
      color: l.status === 'taken' ? 'text-green-600' : 'text-yellow-600',
      bg: l.status === 'taken' ? 'bg-green-100' : 'bg-yellow-100',
      title: `Logged medication: ${l.medication_name} (${l.status})`,
      user: l.created_by,
      timestamp: l.created_date,
      recipientId: l.care_recipient_id
    })),
    ...careNotes.map(n => ({
      type: 'note',
      icon: FileText,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      title: `Added care note: ${n.title || n.note_type}`,
      user: n.created_by,
      timestamp: n.created_date,
      recipientId: n.care_recipient_id
    }))
  ];

  // Filter by recipient if specified
  const filteredActivities = recipientId 
    ? activities.filter(a => a.recipientId === recipientId)
    : activities;

  // Sort by timestamp descending
  const sortedActivities = filteredActivities.sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  ).slice(0, limit);

  const getRecipientName = (id) => {
    return recipients.find(r => r.id === id)?.full_name || 'Unknown';
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
                        <span>•</span>
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