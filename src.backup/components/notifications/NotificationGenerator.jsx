import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isAfter, isBefore, addDays, parseISO, startOfToday } from 'date-fns';

export default function NotificationGenerator() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list('-date'),
    enabled: !!user
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-due_date'),
    enabled: !!user
  });

  const { data: refills = [] } = useQuery({
    queryKey: ['refills'],
    queryFn: () => base44.entities.MedicationRefill.list('-refill_date'),
    enabled: !!user
  });

  const { data: existingNotifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => user ? base44.entities.Notification.filter({ user_email: user.email }) : [],
    enabled: !!user
  });

  useEffect(() => {
    if (!user) return;

    const generateNotifications = async () => {
      const today = startOfToday();
      const threeDaysFromNow = addDays(today, 3);
      const notificationsToCreate = [];

      // Check for upcoming appointments (next 3 days)
      appointments.forEach(apt => {
        if (apt.completed) return;
        
        const aptDate = parseISO(apt.date);
        if (isAfter(aptDate, today) && isBefore(aptDate, threeDaysFromNow)) {
          const exists = existingNotifications.some(
            n => n.type === 'appointment' && n.related_entity_id === apt.id && !n.read
          );
          if (!exists) {
            notificationsToCreate.push({
              user_email: user.email,
              type: 'appointment',
              title: 'Upcoming Appointment',
              message: `${apt.title} is scheduled in the next 3 days`,
              related_entity_id: apt.id,
              priority: 'medium'
            });
          }
        }
      });

      // Check for urgent tasks
      tasks.forEach(task => {
        if (task.status === 'completed') return;
        if (task.priority !== 'high' && task.priority !== 'urgent') return;

        const dueDate = parseISO(task.due_date);
        if (isBefore(dueDate, addDays(today, 1))) {
          const exists = existingNotifications.some(
            n => n.type === 'task' && n.related_entity_id === task.id && !n.read
          );
          if (!exists) {
            notificationsToCreate.push({
              user_email: user.email,
              type: 'task',
              title: 'Urgent Task',
              message: `${task.title} is due soon`,
              related_entity_id: task.id,
              priority: task.priority === 'urgent' ? 'urgent' : 'high'
            });
          }
        }
      });

      // Check for medication refills (next 7 days)
      refills.forEach(refill => {
        if (refill.status !== 'pending') return;

        const refillDate = parseISO(refill.refill_date);
        if (isBefore(refillDate, addDays(today, 7)) && isAfter(refillDate, today)) {
          const exists = existingNotifications.some(
            n => n.type === 'medication_refill' && n.related_entity_id === refill.id && !n.read
          );
          if (!exists) {
            notificationsToCreate.push({
              user_email: user.email,
              type: 'medication_refill',
              title: 'Medication Refill Needed',
              message: `${refill.medication_name} refill is needed soon`,
              related_entity_id: refill.id,
              priority: 'high'
            });
          }
        }
      });

      // Create notifications
      if (notificationsToCreate.length > 0) {
        await base44.entities.Notification.bulkCreate(notificationsToCreate);
        queryClient.invalidateQueries(['notifications']);
      }
    };

    generateNotifications().catch(err => console.log('Notification generation skipped'));
  }, [appointments, tasks, refills, user, existingNotifications, queryClient]);

  return null; // This component doesn't render anything
}