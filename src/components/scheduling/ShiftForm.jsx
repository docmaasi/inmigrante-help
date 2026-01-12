import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ShiftForm({ shift, careRecipients, teamMembers, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(shift || {
    caregiver_email: '',
    care_recipient_id: '',
    shift_type: 'full_day',
    start_time: '09:00',
    end_time: '17:00',
    start_date: new Date().toISOString().split('T')[0],
    recurring: 'none',
    recurring_days: '[]',
    notes: ''
  });

  const [selectedDays, setSelectedDays] = useState(() => {
    try {
      return shift ? JSON.parse(shift.recurring_days || '[]') : [];
    } catch {
      return [];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        ...data,
        recurring_days: JSON.stringify(selectedDays)
      };

      if (shift?.id) {
        return base44.entities.CaregiverShift.update(shift.id, payload);
      }
      
      const caregiver = teamMembers.find(t => t.user_email === data.caregiver_email);
      return base44.entities.CaregiverShift.create({
        ...payload,
        caregiver_name: caregiver?.full_name || data.caregiver_email
      });
    },
    onSuccess: async (result) => {
      queryClient.invalidateQueries(['shifts']);
      
      if (!shift?.id) {
        await base44.entities.ActionLog.create({
          care_recipient_id: formData.care_recipient_id,
          actor_email: (await base44.auth.me()).email,
          actor_name: (await base44.auth.me()).full_name,
          action_type: 'task_created',
          entity_type: 'task',
          entity_id: result.id,
          description: `Created shift for ${result.caregiver_name} on ${result.start_date}`
        }).catch(() => {});
      }

      toast.success(shift ? 'Shift updated' : 'Shift created');
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.caregiver_email || !formData.care_recipient_id || !formData.start_date) {
      toast.error('Please fill in required fields');
      return;
    }
    saveMutation.mutate(formData);
  };

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  return (
    <Card className="shadow-lg border-slate-200/60">
      <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
        <CardTitle>{shift ? 'Edit Shift' : 'Create Shift'}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Caregiver *</Label>
              <Select
                value={formData.caregiver_email}
                onValueChange={(value) => setFormData({ ...formData, caregiver_email: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select caregiver" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map(tm => (
                    <SelectItem key={tm.id} value={tm.user_email}>
                      {tm.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Care Recipient *</Label>
              <Select
                value={formData.care_recipient_id}
                onValueChange={(value) => setFormData({ ...formData, care_recipient_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {careRecipients.map(cr => (
                    <SelectItem key={cr.id} value={cr.id}>
                      {cr.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Shift Type</Label>
              <Select
                value={formData.shift_type}
                onValueChange={(value) => setFormData({ ...formData, shift_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (6am-2pm)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (2pm-10pm)</SelectItem>
                  <SelectItem value="evening">Evening (4pm-midnight)</SelectItem>
                  <SelectItem value="night">Night (10pm-6am)</SelectItem>
                  <SelectItem value="full_day">Full Day</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time *</Label>
              <Input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>End Time *</Label>
              <Input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Recurrence</Label>
            <Select
              value={formData.recurring}
              onValueChange={(value) => setFormData({ ...formData, recurring: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">One-time</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.recurring === 'weekly' && (
            <div className="space-y-2">
              <Label>Repeat On</Label>
              <div className="grid grid-cols-4 gap-2">
                {daysOfWeek.map((day, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleDay(idx)}
                    className={`p-2 rounded text-xs font-medium transition-colors ${
                      selectedDays.includes(idx)
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(formData.recurring !== 'none') && (
            <div className="space-y-2">
              <Label>End Date (leave empty for ongoing)</Label>
              <Input
                type="date"
                value={formData.end_date || ''}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Notes</Label>
            <Input
              placeholder="Any special instructions..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : shift ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}