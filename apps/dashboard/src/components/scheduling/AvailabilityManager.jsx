import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function AvailabilityManager({ caregiverEmail, caregiverName, teamMemberId }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const { data: availability = [] } = useQuery({
    queryKey: ['caregiver-availability', teamMemberId || caregiverEmail],
    queryFn: async () => {
      let query = supabase
        .from('caregiver_availability')
        .select('*');

      if (teamMemberId) {
        query = query.eq('team_member_id', teamMemberId);
      } else if (caregiverEmail) {
        query = query.eq('caregiver_email', caregiverEmail);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user && (!!teamMemberId || !!caregiverEmail)
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { data: result, error } = await supabase
        .from('caregiver_availability')
        .insert({
          ...data,
          user_id: user.id,
          team_member_id: teamMemberId,
          caregiver_email: caregiverEmail
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caregiver-availability'] });
      toast.success('Availability saved');
    }
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
    }
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
    }
  });

  const handleToggleDay = async (dayIndex, existingSlot) => {
    if (existingSlot) {
      await updateMutation.mutateAsync({
        id: existingSlot.id,
        data: { is_available: !existingSlot.is_available }
      });
    } else {
      await createMutation.mutateAsync({
        day_of_week: dayIndex,
        available_from: '09:00',
        available_until: '17:00',
        is_available: true
      });
    }
  };

  const handleUpdateTime = async (dayIndex, field, value) => {
    const existingSlot = availability.find(a => a.day_of_week === dayIndex);
    if (existingSlot) {
      await updateMutation.mutateAsync({
        id: existingSlot.id,
        data: { [field]: value }
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{caregiverName}'s Availability</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {daysOfWeek.map((day, index) => {
            const slot = availability.find(a => a.day_of_week === index);

            return (
              <div key={index} className="flex flex-wrap items-center gap-3 p-3 border border-slate-200 rounded-lg">
                <div className="w-20">
                  <span className="font-medium text-sm text-slate-800">{day}</span>
                </div>

                <Switch
                  checked={slot?.is_available ?? false}
                  onCheckedChange={() => handleToggleDay(index, slot)}
                />

                {slot?.is_available && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={slot.available_from}
                      onChange={(e) => handleUpdateTime(index, 'available_from', e.target.value)}
                      className="w-24 text-sm font-medium"
                    />
                    <span className="text-sm text-slate-600 font-medium">to</span>
                    <Input
                      type="time"
                      value={slot.available_until}
                      onChange={(e) => handleUpdateTime(index, 'available_until', e.target.value)}
                      className="w-24 text-sm font-medium"
                    />
                  </div>
                )}

                {slot && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(slot.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
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
