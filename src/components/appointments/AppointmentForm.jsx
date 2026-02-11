import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import RecipientCheckboxList from '../shared/RecipientCheckboxList';

export default function AppointmentForm({ appointment, recipients, onClose }) {
  const queryClient = useQueryClient();
  const isEditing = !!appointment?.id;
  const [selectedRecipientIds, setSelectedRecipientIds] = useState(() => {
    if (appointment?.care_recipient_id) return [appointment.care_recipient_id];
    return [];
  });
  const [formData, setFormData] = useState(appointment || {
    care_recipient_id: '',
    title: '',
    appointment_type: 'doctor',
    custom_appointment_type: '',
    date: '',
    time: '',
    location: '',
    provider_name: '',
    notes: '',
    assigned_caregiver: '',
    status: 'scheduled'
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (appointment?.id) {
        return base44.entities.Appointment.update(appointment.id, data);
      }
      return base44.entities.Appointment.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      if (isEditing) {
        toast.success('Appointment updated');
        onClose();
      }
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isEditing) {
      const recipientId = selectedRecipientIds[0] || formData.care_recipient_id;
      if (!recipientId) {
        toast.error('Please select a care recipient');
        return;
      }
      try {
        await saveMutation.mutateAsync({ ...formData, care_recipient_id: recipientId });
      } catch {
        toast.error('Failed to update appointment');
      }
      return;
    }

    if (selectedRecipientIds.length === 0) {
      toast.error('Please select at least one care recipient');
      return;
    }

    try {
      for (const recipientId of selectedRecipientIds) {
        await saveMutation.mutateAsync({ ...formData, care_recipient_id: recipientId });
      }
      const count = selectedRecipientIds.length;
      toast.success(count === 1 ? 'Appointment added' : `${count} appointments added`);
      onClose();
    } catch {
      toast.error('Failed to add appointment');
    }
  };

  return (
    <Card className="shadow-lg border-slate-200/60">
      <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">
          {appointment ? 'Edit Appointment' : 'Add Appointment'}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isEditing ? (
              <div className="space-y-2">
                <Label htmlFor="care_recipient_id">Care Recipient *</Label>
                <Select
                  value={selectedRecipientIds[0] || formData.care_recipient_id}
                  onValueChange={(value) => setSelectedRecipientIds([value])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipients.map(recipient => (
                      <SelectItem key={recipient.id} value={recipient.id}>
                        {recipient.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <RecipientCheckboxList
                careRecipients={recipients}
                selectedIds={selectedRecipientIds}
                onChange={setSelectedRecipientIds}
              />
            )}

            <div className="space-y-2">
              <Label htmlFor="appointment_type">Type *</Label>
              <Select
                value={formData.appointment_type}
                onValueChange={(value) => setFormData({ ...formData, appointment_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctor">Doctor Visit</SelectItem>
                  <SelectItem value="specialist">Specialist</SelectItem>
                  <SelectItem value="therapy">Therapy</SelectItem>
                  <SelectItem value="dentist">Dentist</SelectItem>
                  <SelectItem value="lab_test">Lab Test</SelectItem>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.appointment_type === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="custom_appointment_type">Specify Type *</Label>
              <Input
                id="custom_appointment_type"
                value={formData.custom_appointment_type}
                onChange={(e) => setFormData({ ...formData, custom_appointment_type: e.target.value })}
                placeholder="e.g., Physical Therapy, Vision Test"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Appointment Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Annual checkup, Cardiology follow-up"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., City Medical Center, 123 Main St"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider_name">Doctor/Provider Name</Label>
            <Input
              id="provider_name"
              value={formData.provider_name}
              onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
              placeholder="e.g., Smith, Johnson"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : appointment ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}