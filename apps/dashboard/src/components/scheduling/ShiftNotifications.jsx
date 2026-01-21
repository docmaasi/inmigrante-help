import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { differenceInMinutes } from 'date-fns';

export default function ShiftNotifications() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: upcomingShifts = [] } = useQuery({
    queryKey: ['upcoming-shifts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('caregiver_shifts')
        .select('*, team_members(user_id, full_name)')
        .eq('team_members.user_id', user.id)
        .eq('status', 'scheduled')
        .eq('notification_sent', false)
        .gte('start_time', new Date().toISOString());

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    refetchInterval: 60000
  });

  const createNotificationMutation = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('notifications')
        .insert(data);
      if (error) throw error;
    }
  });

  const updateShiftMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase
        .from('caregiver_shifts')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcoming-shifts'] });
    }
  });

  useEffect(() => {
    if (upcomingShifts.length === 0 || !user?.id) return;

    const now = new Date();

    upcomingShifts.forEach(async (shift) => {
      const shiftDateTime = new Date(shift.start_time);
      const minutesUntilShift = differenceInMinutes(shiftDateTime, now);

      if (minutesUntilShift <= 60 && minutesUntilShift > 0) {
        try {
          await createNotificationMutation.mutateAsync({
            user_id: user.id,
            type: 'shift_reminder',
            title: 'Upcoming Shift',
            message: `Your shift starts at ${new Date(shift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. ${shift.notes ? `Notes: ${shift.notes}` : ''}`,
            priority: minutesUntilShift <= 15 ? 'urgent' : 'high',
            is_read: false,
            related_entity_type: 'caregiver_shift',
            related_entity_id: shift.id
          });

          await updateShiftMutation.mutateAsync({
            id: shift.id,
            data: { notification_sent: true }
          });
        } catch (error) {
          console.error('Failed to send shift notification:', error);
        }
      }
    });
  }, [upcomingShifts, user?.id]);

  return null;
}
