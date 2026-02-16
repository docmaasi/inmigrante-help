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
    if (!med.refill_date || !med.is_active) return false;
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
    urgent: 'bg-red-50/80 border-l-red-500 border-red-100',
    warning: 'bg-amber-50/80 border-l-amber-500 border-amber-100',
    info: 'bg-slate-50/80 border-l-teal-500 border-slate-100'
  };

  const iconStyles = {
    urgent: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-teal-500'
  };

  const badgeStyles = {
    urgent: 'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    info: 'bg-teal-100 text-teal-700 border-teal-200'
  };

  return (
    <div className="space-y-3">
      {sortedAlerts.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <Info className="w-7 h-7 text-emerald-400" />
          </div>
          <p className="text-slate-600 text-sm font-medium">No urgent alerts</p>
          <p className="text-slate-400 text-xs mt-1">Everything is on track!</p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {sortedAlerts.map(alert => {
            const Icon = alert.icon;
            return (
              <div
                key={alert.id}
                className={`p-3.5 rounded-lg border border-l-4 ${typeStyles[alert.type]} transition-all duration-150 hover:shadow-sm`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Icon className={`w-4 h-4 ${iconStyles[alert.type]} flex-shrink-0`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-slate-800">{alert.title}</div>
                    <div className="text-sm text-slate-600 mt-0.5">{alert.description}</div>
                    {alert.details && (
                      <div className="text-xs mt-1.5 text-slate-500">{alert.details}</div>
                    )}
                  </div>
                  <Badge variant="outline" className={`text-xs capitalize font-medium ${badgeStyles[alert.type]}`}>
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