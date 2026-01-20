import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { differenceInMinutes, addHours, parseISO } from 'date-fns';

export default function ShiftNotifications() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: upcomingShifts = [] } = useQuery({
    queryKey: ['upcomingShifts', user?.email],
    queryFn: () => user?.email
      ? base44.entities.CaregiverShift.filter({
          caregiver_email: user.email,
          status: 'scheduled',
          notification_sent: false
        })
      : [],
    enabled: !!user?.email,
    refetchInterval: 60000 // Check every minute
  });

  useEffect(() => {
    if (upcomingShifts.length === 0) return;

    const now = new Date();
    
    upcomingShifts.forEach(async (shift) => {
      const shiftDateTime = new Date(`${shift.start_date}T${shift.start_time}`);
      const minutesUntilShift = differenceInMinutes(shiftDateTime, now);

      // Send notification 1 hour before shift
      if (minutesUntilShift <= 60 && minutesUntilShift > 0) {
        try {
          await base44.entities.Notification.create({
            user_email: shift.caregiver_email,
            type: 'general',
            title: 'Upcoming Shift',
            message: `Your shift with ${shift.care_recipient_id} starts at ${shift.start_time}. ${shift.notes ? `Notes: ${shift.notes}` : ''}`,
            priority: minutesUntilShift <= 15 ? 'urgent' : 'high',
            read: false
          });

          // Mark as notified
          await base44.entities.CaregiverShift.update(shift.id, {
            notification_sent: true
          });
        } catch (error) {
          console.error('Failed to send shift notification:', error);
        }
      }
    });
  }, [upcomingShifts]);

  return null;
}