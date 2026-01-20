import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function AvailabilityManager({ caregiverEmail, caregiverName }) {
  const queryClient = useQueryClient();
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const { data: availability = [] } = useQuery({
    queryKey: ['availability', caregiverEmail],
    queryFn: () => caregiverEmail
      ? base44.entities.CaregiverAvailability.filter({ caregiver_email: caregiverEmail })
      : []
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CaregiverAvailability.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['availability']);
      toast.success('Availability saved');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CaregiverAvailability.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['availability']);
      toast.success('Availability updated');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CaregiverAvailability.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['availability']);
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
        caregiver_email: caregiverEmail,
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
              <div key={index} className="flex items-center gap-4 p-3 border border-slate-200 rounded-lg">
                <div className="w-20">
                  <span className="font-medium text-sm text-slate-800">{day}</span>
                </div>

                <Switch
                  checked={slot?.is_available ?? false}
                  onCheckedChange={() => handleToggleDay(index, slot)}
                  className="ml-auto"
                />

                {slot?.is_available && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={slot.available_from}
                      onChange={(e) => handleUpdateTime(index, 'available_from', e.target.value)}
                      className="w-28 text-sm font-medium"
                    />
                    <span className="text-sm text-slate-600 font-medium">to</span>
                    <Input
                      type="time"
                      value={slot.available_until}
                      onChange={(e) => handleUpdateTime(index, 'available_until', e.target.value)}
                      className="w-28 text-sm font-medium"
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