import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AvailabilityManager({
  caregiverName,
  teamMemberId,
  isSelf = false,
}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const queryKey = ['caregiver-availability', isSelf ? 'self' : teamMemberId];

  const { data: availability = [] } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase.from('caregiver_availability').select('*');

      if (isSelf) {
        query = query
          .eq('user_id', user.id)
          .is('team_member_id', null);
      } else if (teamMemberId) {
        query = query.eq('team_member_id', teamMemberId);
      } else {
        return [];
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user && (isSelf || !!teamMemberId),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const insertData = {
        ...data,
        user_id: user.id,
        team_member_id: isSelf ? null : teamMemberId,
      };
      const { data: result, error } = await supabase
        .from('caregiver_availability')
        .insert(insertData)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caregiver-availability'] });
      toast.success('Availability saved');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase
        .from('caregiver_availability')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caregiver-availability'] });
      toast.success('Availability updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('caregiver_availability')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caregiver-availability'] });
      toast.success('Availability removed');
    },
  });

  const handleToggleDay = async (dayIndex, existingSlot) => {
    if (existingSlot) {
      await updateMutation.mutateAsync({
        id: existingSlot.id,
        data: { is_available: !existingSlot.is_available },
      });
    } else {
      await createMutation.mutateAsync({
        day_of_week: dayIndex,
        start_time: '09:00',
        end_time: '17:00',
        is_available: true,
      });
    }
  };

  const handleUpdateTime = async (dayIndex, field, value) => {
    const existingSlot = availability.find((a) => a.day_of_week === dayIndex);
    if (existingSlot) {
      await updateMutation.mutateAsync({
        id: existingSlot.id,
        data: { [field]: value },
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{caregiverName}&apos;s Availability</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1.5">
          {SHORT_DAYS.map((day, index) => {
            const slot = availability.find((a) => a.day_of_week === index);

            return (
              <div
                key={index}
                className="flex flex-wrap items-center gap-2 p-2 border border-slate-200 rounded-lg"
              >
                <span className="w-10 font-medium text-xs text-slate-800">
                  {day}
                </span>

                <Switch
                  checked={slot?.is_available ?? false}
                  onCheckedChange={() => handleToggleDay(index, slot)}
                />

                {slot?.is_available && (
                  <div className="flex items-center gap-1">
                    <Input
                      type="time"
                      value={slot.start_time || ''}
                      onChange={(e) =>
                        handleUpdateTime(index, 'start_time', e.target.value)
                      }
                      className="w-20 text-xs font-medium h-7 px-1"
                    />
                    <span className="text-xs text-slate-500">to</span>
                    <Input
                      type="time"
                      value={slot.end_time || ''}
                      onChange={(e) =>
                        handleUpdateTime(index, 'end_time', e.target.value)
                      }
                      className="w-20 text-xs font-medium h-7 px-1"
                    />
                  </div>
                )}

                {slot?.is_available && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(slot.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto h-7 px-2 text-xs"
                  >
                    Remove
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
