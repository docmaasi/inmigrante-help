import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { parseISO, format } from 'date-fns';
import ReportExporter from './ReportExporter';
import { Activity, CheckCircle, AlertCircle, FileText, Pill } from 'lucide-react';

export default function ActivityLogReport({ recipientId, recipientName, dateRange }) {
  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', recipientId],
    queryFn: () => base44.entities.Appointment.filter({ care_recipient_id: recipientId })
  });

  const { data: medicationLogs = [] } = useQuery({
    queryKey: ['medicationLogs', recipientId],
    queryFn: () => base44.entities.MedicationLog.filter({ care_recipient_id: recipientId })
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', recipientId],
    queryFn: () => base44.entities.Task.filter({ care_recipient_id: recipientId })
  });

  const { data: careNotes = [] } = useQuery({
    queryKey: ['careNotes', recipientId],
    queryFn: () => base44.entities.CareNote.filter({ care_recipient_id: recipientId })
  });

  // Combine and filter activities by date range
  const activities = [];

  appointments.forEach(apt => {
    activities.push({
      type: 'appointment',
      date: apt.date,
      title: apt.title,
      status: apt.status,
      details: apt.provider_name ? `with ${apt.provider_name}` : apt.location
    });
  });

  medicationLogs.forEach(log => {
    activities.push({
      type: 'medication',
      date: log.date_taken,
      title: log.medication_name,
      status: log.status,
      details: `${log.dosage} at ${log.time_taken || 'unknown time'}`
    });
  });

  tasks.forEach(task => {
    activities.push({
      type: 'task',
      date: task.due_date,
      title: task.title,
      status: task.status,
      details: task.description || task.task_type
    });
  });

  careNotes.forEach(note => {
    activities.push({
      type: 'note',
      date: note.date,
      title: note.title,
      status: note.mood,
      details: note.content
    });
  });

  const filteredActivities = activities
    .filter(act => {
      const actDate = parseISO(act.date);
      const startDate = parseISO(dateRange.startDate);
      const endDate = parseISO(dateRange.endDate);
      return actDate >= startDate && actDate <= endDate;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const activityCounts = {
    appointment: filteredActivities.filter(a => a.type === 'appointment').length,
    medication: filteredActivities.filter(a => a.type === 'medication').length,
    task: filteredActivities.filter(a => a.type === 'task').length,
    note: filteredActivities.filter(a => a.type === 'note').length
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'appointment':
        return AlertCircle;
      case 'medication':
        return Pill;
      case 'task':
        return CheckCircle;
      case 'note':
        return FileText;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'appointment':
        return 'bg-blue-100 text-blue-800';
      case 'medication':
        return 'bg-green-100 text-green-800';
      case 'task':
        return 'bg-purple-100 text-purple-800';
      case 'note':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const reportContent = (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{activityCounts.appointment}</p>
            <p className="text-sm text-slate-600">Appointments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{activityCounts.medication}</p>
            <p className="text-sm text-slate-600">Med Doses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">{activityCounts.task}</p>
            <p className="text-sm text-slate-600">Tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-orange-600">{activityCounts.note}</p>
            <p className="text-sm text-slate-600">Care Notes</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      {filteredActivities.length > 0 && (
        <Card>
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activity Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {filteredActivities.map((act, idx) => {
                const Icon = getActivityIcon(act.type);
                return (
                  <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${getActivityColor(act.type)}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800 capitalize">{act.title}</h4>
                          <p className="text-sm text-slate-600">{format(parseISO(act.date), 'MMMM d, yyyy')}</p>
                          {act.details && (
                            <p className="text-sm text-slate-700 mt-1">{act.details}</p>
                          )}
                        </div>
                      </div>
                      <Badge className={getActivityColor(act.type)} variant="outline">
                        {act.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredActivities.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-500">No activities found in this date range</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <ReportExporter
        title={`Activity Log Report - ${recipientName}`}
        dateRange={dateRange}
        content={reportContent}
      />
      {reportContent}
    </div>
  );
}