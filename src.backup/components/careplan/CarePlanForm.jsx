import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2, Plus, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function CarePlanForm({ plan, recipients, onClose }) {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState(plan || {
    care_recipient_id: '',
    plan_name: '',
    daily_routines: '[]',
    medication_schedule: '[]',
    important_contacts: '[]',
    emergency_procedures: '',
    special_notes: ''
  });

  const [routines, setRoutines] = useState(
    plan ? JSON.parse(plan.daily_routines || '[]') : []
  );
  const [contacts, setContacts] = useState(
    plan ? JSON.parse(plan.important_contacts || '[]') : []
  );
  const [selectedMeds, setSelectedMeds] = useState(
    plan ? JSON.parse(plan.medication_schedule || '[]') : []
  );

  const { data: medications = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: () => base44.entities.Medication.list(),
    enabled: !!formData.care_recipient_id
  });

  const recipientMeds = medications.filter(
    m => m.care_recipient_id === formData.care_recipient_id && m.active !== false
  );

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (plan?.id) {
        return base44.entities.CarePlanDetail.update(plan.id, data);
      }
      return base44.entities.CarePlanDetail.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['carePlanDetails']);
      toast.success(plan ? 'Care plan updated' : 'Care plan created');
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.care_recipient_id || !formData.plan_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    const dataToSave = {
      ...formData,
      daily_routines: JSON.stringify(routines),
      medication_schedule: JSON.stringify(selectedMeds),
      important_contacts: JSON.stringify(contacts),
      last_updated: new Date().toISOString()
    };

    saveMutation.mutate(dataToSave);
  };

  const addRoutine = () => {
    setRoutines([...routines, { time: '', activity: '', notes: '' }]);
  };

  const updateRoutine = (index, field, value) => {
    const updated = [...routines];
    updated[index][field] = value;
    setRoutines(updated);
  };

  const removeRoutine = (index) => {
    setRoutines(routines.filter((_, i) => i !== index));
  };

  const addContact = () => {
    setContacts([...contacts, { name: '', relationship: '', phone: '', email: '' }]);
  };

  const updateContact = (index, field, value) => {
    const updated = [...contacts];
    updated[index][field] = value;
    setContacts(updated);
  };

  const removeContact = (index) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const toggleMedication = (medId) => {
    if (selectedMeds.includes(medId)) {
      setSelectedMeds(selectedMeds.filter(id => id !== medId));
    } else {
      setSelectedMeds([...selectedMeds, medId]);
    }
  };

  return (
    <Card className="shadow-lg border-slate-200/60">
      <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">
          {plan ? 'Edit Care Plan' : 'Create Care Plan'}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Basic Information</h3>
            
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
              <Label htmlFor="plan_name">Plan Name *</Label>
              <Input
                id="plan_name"
                value={formData.plan_name}
                onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
                placeholder="e.g., Daily Care Routine, Weekend Plan"
                required
              />
            </div>
          </div>

          {/* Daily Routines */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Daily Routines</h3>
              <Button type="button" onClick={addRoutine} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Routine
              </Button>
            </div>
            
            {routines.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No routines added yet</p>
            ) : (
              <div className="space-y-3">
                {routines.map((routine, index) => (
                  <Card key={index} className="p-4 bg-slate-50">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-slate-400 mt-2" />
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input
                            type="time"
                            value={routine.time}
                            onChange={(e) => updateRoutine(index, 'time', e.target.value)}
                            placeholder="Time"
                          />
                          <Input
                            value={routine.activity}
                            onChange={(e) => updateRoutine(index, 'activity', e.target.value)}
                            placeholder="Activity (e.g., Morning medication)"
                          />
                        </div>
                        <Input
                          value={routine.notes}
                          onChange={(e) => updateRoutine(index, 'notes', e.target.value)}
                          placeholder="Notes (optional)"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRoutine(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Medication Schedule */}
          {formData.care_recipient_id && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Medication Schedule</h3>
              {recipientMeds.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No medications found for this recipient</p>
              ) : (
                <div className="space-y-2">
                  {recipientMeds.map(med => (
                    <label
                      key={med.id}
                      className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMeds.includes(med.id)}
                        onChange={() => toggleMedication(med.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{med.medication_name}</p>
                        <p className="text-sm text-slate-600">
                          {med.dosage} • {med.frequency} • {med.time_of_day}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Important Contacts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Important Contacts</h3>
              <Button type="button" onClick={addContact} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Contact
              </Button>
            </div>
            
            {contacts.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No contacts added yet</p>
            ) : (
              <div className="space-y-3">
                {contacts.map((contact, index) => (
                  <Card key={index} className="p-4 bg-slate-50">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input
                            value={contact.name}
                            onChange={(e) => updateContact(index, 'name', e.target.value)}
                            placeholder="Name"
                          />
                          <Input
                            value={contact.relationship}
                            onChange={(e) => updateContact(index, 'relationship', e.target.value)}
                            placeholder="Relationship (e.g., Primary Doctor)"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input
                            value={contact.phone}
                            onChange={(e) => updateContact(index, 'phone', e.target.value)}
                            placeholder="Phone"
                            type="tel"
                          />
                          <Input
                            value={contact.email}
                            onChange={(e) => updateContact(index, 'email', e.target.value)}
                            placeholder="Email (optional)"
                            type="email"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeContact(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Emergency Procedures */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Emergency Procedures</h3>
            <Textarea
              value={formData.emergency_procedures}
              onChange={(e) => setFormData({ ...formData, emergency_procedures: e.target.value })}
              placeholder="Describe what to do in case of an emergency..."
              rows={4}
            />
          </div>

          {/* Special Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Special Notes</h3>
            <Textarea
              value={formData.special_notes}
              onChange={(e) => setFormData({ ...formData, special_notes: e.target.value })}
              placeholder="Any additional notes or considerations..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : plan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}