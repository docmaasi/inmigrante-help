import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import RecipientCheckboxList from '../shared/RecipientCheckboxList';

const SELF_VALUE = '__self__';

export default function ShiftForm({ shift, careRecipients, teamMembers, onClose }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const adminName = user?.full_name || 'Me';

  const [formData, setFormData] = useState(shift || {
    caregiver_email: '',
    care_recipient_id: '',
    shift_type: 'full_day',
    start_time: '09:00',
    end_time: '17:00',
    start_date: new Date().toISOString().split('T')[0],
    recurring: 'none',
    notes: '',
  });

  const [selectedRecipientIds, setSelectedRecipientIds] = useState(() => {
    if (shift?.care_recipient_id) return [shift.care_recipient_id];
    return [];
  });

  const isEditing = !!shift?.id;

  const saveMutation = useMutation({
    mutationFn: async ({ recipientId }) => {
      const caregiverId = formData.caregiver_email;
      const payload = {
        ...formData,
        care_recipient_id: recipientId,
        caregiver_email: caregiverId === SELF_VALUE ? user?.email : caregiverId,
        team_member_id: caregiverId === SELF_VALUE ? null : undefined,
      };

      if (isEditing) {
        return base44.entities.CaregiverShift.update(shift.id, payload);
      }

      const caregiver = caregiverId === SELF_VALUE
        ? { full_name: adminName }
        : teamMembers.find((t) => t.user_email === caregiverId);

      return base44.entities.CaregiverShift.create({
        ...payload,
        caregiver_name: caregiver?.full_name || caregiverId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['shifts']);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.caregiver_email) {
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
        await saveMutation.mutateAsync({ recipientId });
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
        await saveMutation.mutateAsync({ recipientId });
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
                value={formData.caregiver_email}
                onValueChange={(value) => setFormData({ ...formData, caregiver_email: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select caregiver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SELF_VALUE}>
                    {adminName} (Me)
                  </SelectItem>
                  {teamMembers.map((tm) => (
                    <SelectItem key={tm.id} value={tm.user_email}>
                      {tm.full_name}
                    </SelectItem>
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
                        {cr.full_name}
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
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
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
              ) : isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
