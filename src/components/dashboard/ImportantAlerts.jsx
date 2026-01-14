import React from 'react';
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, Info, Calendar, Pill } from 'lucide-react';
import { format, parseISO, isPast, differenceInDays } from 'date-fns';

export default function ImportantAlerts({ tasks, appointments, medications, recipients }) {
  const alerts = [];

  // Overdue tasks
  const overdueTasks = tasks.filter(t => 
    t.due_date && isPast(parseISO(t.due_date)) && t.status !== 'completed'
  );
  
  overdueTasks.forEach(task => {
    const recipient = recipients.find(r => r.id === task.care_recipient_id);
    alerts.push({
      id: `task-${task.id}`,
      type: 'urgent',
      icon: AlertCircle,
      title: 'Overdue Task',
      description: `${task.title} for ${recipient?.full_name}`,
      details: `Due: ${format(parseISO(task.due_date), 'MMM d, yyyy')}`
    });
  });

  // Upcoming appointments (within 3 days)
  const upcomingAppointments = appointments.filter(apt => {
    if (!apt.date || apt.status === 'completed') return false;
    const days = differenceInDays(parseISO(apt.date), new Date());
    return days >= 0 && days <= 3;
  });

  upcomingAppointments.forEach(apt => {
    const recipient = recipients.find(r => r.id === apt.care_recipient_id);
    const days = differenceInDays(parseISO(apt.date), new Date());
    alerts.push({
      id: `apt-${apt.id}`,
      type: days === 0 ? 'warning' : 'info',
      icon: Calendar,
      title: days === 0 ? 'Appointment Today' : `Appointment in ${days} day${days !== 1 ? 's' : ''}`,
      description: `${apt.title} - ${recipient?.full_name}`,
      details: apt.time || format(parseISO(apt.date), 'MMM d')
    });
  });

  // Medication refills needed (within 7 days)
  const needsRefill = medications.filter(med => {
    if (!med.refill_date || !med.active) return false;
    const days = differenceInDays(parseISO(med.refill_date), new Date());
    return days >= 0 && days <= 7;
  });

  needsRefill.forEach(med => {
    const recipient = recipients.find(r => r.id === med.care_recipient_id);
    const days = differenceInDays(parseISO(med.refill_date), new Date());
    alerts.push({
      id: `med-${med.id}`,
      type: days <= 2 ? 'warning' : 'info',
      icon: Pill,
      title: days === 0 ? 'Refill Needed Today' : `Refill needed in ${days} day${days !== 1 ? 's' : ''}`,
      description: `${med.medication_name} - ${recipient?.full_name}`,
      details: med.pharmacy || 'No pharmacy specified'
    });
  });

  // Sort by urgency
  const sortedAlerts = alerts.sort((a, b) => {
    const order = { urgent: 0, warning: 1, info: 2 };
    return order[a.type] - order[b.type];
  }).slice(0, 8);

  const typeStyles = {
    urgent: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-orange-50 border-orange-200 text-orange-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700'
  };

  const iconStyles = {
    urgent: 'text-red-600',
    warning: 'text-orange-600',
    info: 'text-blue-600'
  };

  return (
    <div className="space-y-3">
      {sortedAlerts.length === 0 ? (
        <div className="text-center py-8">
          <Info className="w-12 h-12 text-green-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No urgent alerts</p>
          <p className="text-slate-400 text-xs">Everything is on track!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {sortedAlerts.map(alert => {
            const Icon = alert.icon;
            return (
              <div 
                key={alert.id} 
                className={`p-3 rounded-lg border ${typeStyles[alert.type]}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-0.5 ${iconStyles[alert.type]} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{alert.title}</div>
                    <div className="text-sm">{alert.description}</div>
                    {alert.details && (
                      <div className="text-xs mt-1 opacity-75">{alert.details}</div>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {alert.type}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}