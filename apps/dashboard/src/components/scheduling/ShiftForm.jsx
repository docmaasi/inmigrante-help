import React, { useState } from 'react';
import { useCreateShift, useUpdateShift } from '@/hooks';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import RecipientCheckboxList from './RecipientCheckboxList';
import ShiftTimeFields from './ShiftTimeFields';

const SELF_VALUE = '__self__';

export default function ShiftForm({ shift, careRecipients, teamMembers, onClose }) {
  const { profile } = useAuth();
  const adminName = profile?.full_name || 'Me';

  const [formData, setFormData] = useState(shift || {
    team_member_id: '',
    care_recipient_id: '',
    shift_type: 'full_day',
    start_time: new Date().toISOString().split('T')[0] + 'T09:00',
    end_time: new Date().toISOString().split('T')[0] + 'T17:00',
    notes: '',
  });

  const [selectedRecipientIds, setSelectedRecipientIds] = useState(() => {
    if (shift?.care_recipient_id) return [shift.care_recipient_id];
    return [];
  });

  const createShiftMutation = useCreateShift();
  const updateShiftMutation = useUpdateShift();

  const isEditing = !!shift?.id;
  const isPending = createShiftMutation.isPending || updateShiftMutation.isPending;

  const buildPayload = (recipientId) => {
    const caregiverId = formData.team_member_id;
    return {
      team_member_id: caregiverId === SELF_VALUE ? null : caregiverId,
      care_recipient_id: recipientId,
      start_time: formData.start_time
        ? (formData.start_time.length <= 16 ? formData.start_time + ':00' : formData.start_time)
        : null,
      end_time: formData.end_time
        ? (formData.end_time.length <= 16 ? formData.end_time + ':00' : formData.end_time)
        : null,
      notes: formData.notes || null,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.team_member_id) {
      toast.error('Please select a caregiver');
      return;
    }

    if (isEditing) {
      const recipientId = selectedRecipientIds[0] || formData.care_recipient_id;
      if (!recipientId) {
        toast.error('Please select a care recipient');
        return;
      }
      try {
        await updateShiftMutation.mutateAsync({ id: shift.id, ...buildPayload(recipientId) });
        toast.success('Shift updated');
        onClose();
      } catch {
        toast.error('Failed to update shift');
      }
      return;
    }

    if (selectedRecipientIds.length === 0) {
      toast.error('Please select at least one care recipient');
      return;
    }

    try {
      for (const recipientId of selectedRecipientIds) {
        await createShiftMutation.mutateAsync(buildPayload(recipientId));
      }
      const count = selectedRecipientIds.length;
      toast.success(count === 1 ? 'Shift created' : `${count} shifts created`);
      onClose();
    } catch {
      toast.error('Failed to create shift');
    }
  };

  return (
    <Card className="shadow-lg border-slate-200/60">
      <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
        <CardTitle>{isEditing ? 'Edit Shift' : 'Create Shift'}</CardTitle>
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
                value={formData.team_member_id}
                onValueChange={(value) => setFormData({ ...formData, team_member_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select caregiver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SELF_VALUE}>{adminName} (Me)</SelectItem>
                  {teamMembers.map((tm) => (
                    <SelectItem key={tm.id} value={tm.id}>{tm.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <Label>Care Recipient *</Label>
                <Select
                  value={selectedRecipientIds[0] || formData.care_recipient_id}
                  onValueChange={(value) => setSelectedRecipientIds([value])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {careRecipients.map((cr) => (
                      <SelectItem key={cr.id} value={cr.id}>
                        {cr.first_name} {cr.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <RecipientCheckboxList
                careRecipients={careRecipients}
                selectedIds={selectedRecipientIds}
                onChange={setSelectedRecipientIds}
              />
            )}
          </div>

          <ShiftTimeFields formData={formData} onChange={setFormData} />

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
              ) : isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
