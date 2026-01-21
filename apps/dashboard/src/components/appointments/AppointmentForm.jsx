import React, { useState } from 'react';
import { useCreateAppointment, useUpdateAppointment } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function AppointmentForm({ appointment, recipients, onClose }) {
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

  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.care_recipient_id || !formData.title || !formData.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Build the data for Supabase schema
    const dataToSave = {
      care_recipient_id: formData.care_recipient_id,
      title: formData.title,
      appointment_type: formData.appointment_type,
      start_time: formData.date && formData.time
        ? `${formData.date}T${formData.time}:00`
        : formData.date ? `${formData.date}T00:00:00` : null,
      location: formData.location,
      provider_name: formData.provider_name,
      notes: formData.notes,
      status: formData.status
    };

    try {
      if (appointment?.id) {
        await updateMutation.mutateAsync({ id: appointment.id, ...dataToSave });
        toast.success('Appointment updated');
      } else {
        await createMutation.mutateAsync(dataToSave);
        toast.success('Appointment added');
      }
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to save appointment');
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
            <div className="space-y-2">
              <Label htmlFor="care_recipient_id">Care Recipient *</Label>
              <Select
                value={formData.care_recipient_id}
                onValueChange={(value) => setFormData({ ...formData, care_recipient_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {recipients.map(recipient => (
                    <SelectItem key={recipient.id} value={recipient.id}>
                      {recipient.first_name} {recipient.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
              disabled={isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending ? (
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

export default AppointmentForm;
