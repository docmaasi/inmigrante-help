import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export function AppointmentFormFields({ formData, setFormData, recipients, isPending, isEditing, onSubmit, onCancel }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label>Care Recipient(s) *</Label>
        <div className="border border-slate-200 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
          {recipients?.length === 0 ? (
            <p className="text-sm text-slate-500">No care recipients added yet</p>
          ) : (
            recipients?.map(recipient => (
              <label key={recipient.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded p-1">
                <Checkbox
                  checked={formData.care_recipient_ids.includes(recipient.id)}
                  onCheckedChange={(checked) => {
                    setFormData(prev => ({
                      ...prev,
                      care_recipient_ids: checked
                        ? [...prev.care_recipient_ids, recipient.id]
                        : prev.care_recipient_ids.filter(id => id !== recipient.id)
                    }));
                  }}
                />
                <span className="text-sm text-slate-700">
                  {recipient.full_name || `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim() || 'Unknown'}
                </span>
              </label>
            ))
          )}
        </div>
        {formData.care_recipient_ids.length > 0 && (
          <p className="text-xs text-slate-500">{formData.care_recipient_ids.length} selected</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Appointment Title *</Label>
          <Input id="title" value={formData.title}
            onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))} required />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={formData.appointment_type}
            onValueChange={(value) => setFormData(prev => ({...prev, appointment_type: value}))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
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

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={formData.description}
          onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
          placeholder="Brief description of the appointment" rows={2} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_time">Start Date & Time *</Label>
          <Input id="start_time" type="datetime-local" value={formData.start_time}
            onChange={(e) => setFormData(prev => ({...prev, start_time: e.target.value}))} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_time">End Date & Time</Label>
          <Input id="end_time" type="datetime-local" value={formData.end_time}
            onChange={(e) => setFormData(prev => ({...prev, end_time: e.target.value}))} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" value={formData.location}
            onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="doctor">Provider Name</Label>
          <Input id="doctor" value={formData.provider_name}
            onChange={(e) => setFormData(prev => ({...prev, provider_name: e.target.value}))} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={formData.notes}
          onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))} rows={3} />
      </div>

      <div className="flex justify-end gap-3 pt-4 pb-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isPending} className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm">
          {isPending ? 'Saving...' : isEditing ? 'Update Appointment' : 'Schedule Appointment'}
        </Button>
      </div>
    </form>
  );
}
