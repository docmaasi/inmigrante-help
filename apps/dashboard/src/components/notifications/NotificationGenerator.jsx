import { useEffect, useRef } from 'react';
import { isAfter, isBefore, addDays, parseISO, startOfToday } from 'date-fns';
import { useAuth } from '@/lib/auth-context';
import {
  useAppointments,
  useTasks,
  useMedications,
  useNotifications,
  useCreateNotifications
} from '@/hooks';

export default function NotificationGenerator() {
  const { user } = useAuth();
  const hasGenerated = useRef(false);

  const { data: appointments = [] } = useAppointments();
  const { data: tasks = [] } = useTasks();
  const { data: medications = [] } = useMedications();
  const { data: existingNotifications = [] } = useNotifications();
  const createNotificationsMutation = useCreateNotifications();

  useEffect(() => {
    if (!user || hasGenerated.current) return;

    const generateNotifications = async () => {
      const today = startOfToday();
      const threeDaysFromNow = addDays(today, 3);
      const notificationsToCreate = [];

      // Check for upcoming appointments (next 3 days)
      appointments.forEach((apt) => {
        if (apt.status === 'completed' || apt.status === 'cancelled') return;

        const aptDate = parseISO(apt.start_time);
        if (isAfter(aptDate, today) && isBefore(aptDate, threeDaysFromNow)) {
          const exists = existingNotifications.some(
            (n) =>
              n.type === 'appointment' &&
              n.related_entity_id === apt.id &&
              !n.is_read
          );
          if (!exists) {
            notificationsToCreate.push({
              type: 'appointment',
              title: 'Upcoming Appointment',
              message: `${apt.title} is scheduled in the next 3 days`,
              related_entity_id: apt.id,
              related_entity_type: 'appointment',
              priority: 'medium',
            });
          }
        }
      });

      // Check for urgent tasks
      tasks.forEach((task) => {
        if (task.status === 'completed') return;
        if (task.priority !== 'high' && task.priority !== 'urgent') return;

        if (task.due_date) {
          const dueDate = parseISO(task.due_date);
          if (isBefore(dueDate, addDays(today, 1))) {
            const exists = existingNotifications.some(
              (n) =>
                n.type === 'task' &&
                n.related_entity_id === task.id &&
                !n.is_read
            );
            if (!exists) {
              notificationsToCreate.push({
                type: 'task',
                title: 'Urgent Task',
                message: `${task.title} is due soon`,
                related_entity_id: task.id,
                related_entity_type: 'task',
                priority: task.priority === 'urgent' ? 'urgent' : 'high',
              });
            }
          }
        }
      });

      // Check for medication refills (next 7 days)
      medications.forEach((med) => {
        if (!med.refill_date || med.is_discontinued) return;

        const refillDate = parseISO(med.refill_date);
        if (isBefore(refillDate, addDays(today, 7)) && isAfter(refillDate, today)) {
          const exists = existingNotifications.some(
            (n) =>
              n.type === 'medication_refill' &&
              n.related_entity_id === med.id &&
              !n.is_read
          );
          if (!exists) {
            notificationsToCreate.push({
              type: 'medication_refill',
              title: 'Medication Refill Needed',
              message: `${med.name} refill is needed soon`,
              related_entity_id: med.id,
              related_entity_type: 'medication',
              priority: 'high',
            });
          }
        }
      });

      // Create notifications
      if (notificationsToCreate.length > 0) {
        hasGenerated.current = true;
        createNotificationsMutation.mutate(notificationsToCreate);
      }
    };

    generateNotifications();
  }, [
    appointments,
    tasks,
    medications,
    user,
    existingNotifications,
    createNotificationsMutation,
  ]);

  return null;
}
