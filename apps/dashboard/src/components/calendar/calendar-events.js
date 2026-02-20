import { format } from 'date-fns';

export const RECIPIENT_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500',
  'bg-cyan-500', 'bg-teal-500', 'bg-emerald-500', 'bg-lime-500',
  'bg-amber-500', 'bg-orange-500', 'bg-rose-500', 'bg-fuchsia-500',
];

export function getRecipientColorByIndex(recipients, recipientId) {
  const index = recipients.findIndex((r) => r.id === recipientId);
  return index !== -1 ? RECIPIENT_COLORS[index % RECIPIENT_COLORS.length] : 'bg-slate-500';
}

export function getRecipientNameById(recipients, id) {
  const recipient = recipients.find((r) => r.id === id);
  return recipient ? `${recipient.first_name} ${recipient.last_name}` : 'Unknown';
}

export function collectEventsForDate(date, { appointments, tasks, medicationLogs, filterRecipient, filterType, getRecipientColor }) {
  const dateStr = format(date, 'yyyy-MM-dd');
  const events = [];
  collectAppointments(events, dateStr, appointments, filterRecipient, filterType, getRecipientColor);
  collectTasks(events, dateStr, tasks, filterRecipient, filterType);
  collectMedications(events, dateStr, medicationLogs, filterRecipient, filterType);
  return events;
}

function collectAppointments(events, dateStr, appointments, filterRecipient, filterType, getRecipientColor) {
  appointments.forEach((apt) => {
    const aptDate = apt.start_time ? format(new Date(apt.start_time), 'yyyy-MM-dd') : apt.date;
    if (aptDate !== dateStr) return;
    if (filterRecipient !== 'all' && apt.care_recipient_id !== filterRecipient) return;
    if (filterType !== 'all' && filterType !== 'appointment') return;
    events.push({
      type: 'appointment',
      title: apt.title,
      time: apt.start_time ? format(new Date(apt.start_time), 'HH:mm') : apt.time,
      color: getRecipientColor(apt.care_recipient_id),
      data: apt,
      draggable: true,
    });
  });
}

function collectTasks(events, dateStr, tasks, filterRecipient, filterType) {
  if (filterType !== 'all' && filterType !== 'task') return;
  tasks.forEach((task) => {
    if (task.due_date !== dateStr || task.status === 'completed') return;
    if (filterRecipient !== 'all' && task.care_recipient_id !== filterRecipient) return;
    const color = task.priority === 'urgent' ? 'bg-red-500' : task.priority === 'high' ? 'bg-orange-500' : 'bg-purple-500';
    events.push({ type: 'task', title: task.title, color, data: task, draggable: false });
  });
}

function collectMedications(events, dateStr, medicationLogs, filterRecipient, filterType) {
  if (filterType !== 'all' && filterType !== 'medication') return;
  medicationLogs.forEach((log) => {
    const logDate = log.scheduled_time ? format(new Date(log.scheduled_time), 'yyyy-MM-dd') : log.date_taken;
    if (logDate !== dateStr) return;
    if (filterRecipient !== 'all' && log.care_recipient_id !== filterRecipient) return;
    const color = log.status === 'taken' ? 'bg-green-500' : log.status === 'skipped' ? 'bg-yellow-500' : 'bg-slate-400';
    events.push({
      type: 'medication',
      title: log.medications?.name || 'Medication',
      time: log.scheduled_time ? format(new Date(log.scheduled_time), 'HH:mm') : log.time_taken,
      color,
      data: log,
      draggable: false,
    });
  });
}
