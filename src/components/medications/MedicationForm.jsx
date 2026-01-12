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

export default function MedicationForm({ medication, recipients, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(medication || {
    care_recipient_id: '',
    medication_name: '',
    dosage: '',
    frequency: '',
    time_of_day: '',
    purpose: '',
    prescribing_doctor: '',
    start_date: '',
    refill_date: '',
    pharmacy: '',
    special_instructions: '',
    active: true
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (medication?.id) {
        return base44.entities.Medication.update(medication.id, data);
      }
      return base44.entities.Medication.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['medications']);
      toast.success(medication ? 'Medication updated' : 'Medication added');
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.care_recipient_id || !formData.medication_name || !formData.dosage) {
      toast.error('Please fill in all required fields');
      return;
    }
    saveMutation.mutate(formData);
  };

  return (
    <Card className="shadow-lg border-slate-200/60">
      <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">
          {medication ? 'Edit Medication' : 'Add Medication'}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
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
                    {recipient.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medication_name">Medication Name *</Label>
            <Input
              id="medication_name"
              value={formData.medication_name}
              onChange={(e) => setFormData({ ...formData, medication_name: e.target.value })}
              placeholder="e.g., Lisinopril, Metformin"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage *</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="e.g., 10mg, 2 tablets"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Input
                id="frequency"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                placeholder="e.g., Once daily, Twice daily"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time_of_day">Time of Day</Label>
              <Input
                id="time_of_day"
                value={formData.time_of_day}
                onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value })}
                placeholder="e.g., Morning, 8:00 AM"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prescribing_doctor">Prescribing Doctor</Label>
              <Input
                id="prescribing_doctor"
                value={formData.prescribing_doctor}
                onChange={(e) => setFormData({ ...formData, prescribing_doctor: e.target.value })}
                placeholder="Doctor's name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="What this medication is for"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refill_date">Next Refill Date</Label>
              <Input
                id="refill_date"
                type="date"
                value={formData.refill_date}
                onChange={(e) => setFormData({ ...formData, refill_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pharmacy">Pharmacy</Label>
            <Input
              id="pharmacy"
              value={formData.pharmacy}
              onChange={(e) => setFormData({ ...formData, pharmacy: e.target.value })}
              placeholder="Pharmacy name and location"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_instructions">Special Instructions</Label>
            <Textarea
              id="special_instructions"
              value={formData.special_instructions}
              onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
              placeholder="e.g., Take with food, Avoid grapefruit"
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : medication ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}