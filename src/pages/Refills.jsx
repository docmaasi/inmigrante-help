import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pill, Plus, Bell, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import RefillTracker from '../components/medications/RefillTracker';

export default function Refills() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    medication_id: '',
    care_recipient_id: '',
    refill_date: '',
    pharmacy: '',
    assigned_to: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  const { data: medications = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: () => base44.entities.Medication.list()
  });

  const { data: recipients = [] } = useQuery({
    queryKey: ['careRecipients'],
    queryFn: () => base44.entities.CareRecipient.list()
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: () => base44.entities.TeamMember.list()
  });

  const { data: refills = [] } = useQuery({
    queryKey: ['medicationRefills'],
    queryFn: () => base44.entities.MedicationRefill.list('refill_date')
  });

  const createRefillMutation = useMutation({
    mutationFn: (data) => base44.entities.MedicationRefill.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['medicationRefills']);
      toast.success('Refill reminder created');
      handleClose();
    }
  });

  const syncFromMedicationsMutation = useMutation({
    mutationFn: async () => {
      const today = new Date();
      const medicationsNeedingRefills = medications.filter(m => {
        if (!m.refill_date || !m.active) return false;
        const refillDate = new Date(m.refill_date);
        const existingRefill = refills.find(r => 
          r.medication_id === m.id && 
          r.refill_date === m.refill_date &&
          r.status !== 'completed'
        );
        return refillDate >= today && !existingRefill;
      });

      const newRefills = medicationsNeedingRefills.map(m => ({
        medication_id: m.id,
        care_recipient_id: m.care_recipient_id,
        medication_name: m.medication_name,
        refill_date: m.refill_date,
        pharmacy: m.pharmacy || '',
        status: 'pending'
      }));

      if (newRefills.length > 0) {
        await base44.entities.MedicationRefill.bulkCreate(newRefills);
      }
      return newRefills.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries(['medicationRefills']);
      toast.success(`Synced ${count} upcoming refills from medications`);
    }
  });

  const handleClose = () => {
    setShowAddDialog(false);
    setFormData({
      medication_id: '',
      care_recipient_id: '',
      refill_date: '',
      pharmacy: '',
      assigned_to: '',
      notes: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedMed = medications.find(m => m.id === formData.medication_id);
    createRefillMutation.mutate({
      ...formData,
      medication_name: selectedMed?.medication_name || '',
      status: 'pending'
    });
  };

  const handleMedicationSelect = (medId) => {
    const med = medications.find(m => m.id === medId);
    if (med) {
      setFormData({
        ...formData,
        medication_id: medId,
        care_recipient_id: med.care_recipient_id,
        refill_date: med.refill_date || '',
        pharmacy: med.pharmacy || ''
      });
    }
  };

  const upcomingCount = refills.filter(r => r.status !== 'completed').length;
  const overdueCount = refills.filter(r => {
    if (r.status === 'completed') return false;
    return new Date(r.refill_date) < new Date();
  }).length;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <Pill className="w-8 h-8 text-blue-600" />
          Medication Refills
        </h1>
        <p className="text-slate-500 mt-1">Track and manage medication refill reminders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Refills</p>
                <p className="text-2xl font-bold text-slate-800">{upcomingCount}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Overdue</p>
                <p className="text-2xl font-bold text-red-700">{overdueCount}</p>
              </div>
              <Bell className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-700">
                  {refills.filter(r => r.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Refill Reminder
        </Button>
        <Button
          onClick={() => syncFromMedicationsMutation.mutate()}
          variant="outline"
          disabled={syncFromMedicationsMutation.isPending}
        >
          <Bell className="w-4 h-4 mr-2" />
          {syncFromMedicationsMutation.isPending ? 'Syncing...' : 'Sync from Medications'}
        </Button>
      </div>

      {/* Refill Tracker */}
      <RefillTracker />

      {/* Add Refill Dialog */}
      <Dialog open={showAddDialog} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Refill Reminder</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label>Medication *</Label>
              <Select
                value={formData.medication_id}
                onValueChange={handleMedicationSelect}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select medication" />
                </SelectTrigger>
                <SelectContent>
                  {medications.filter(m => m.active !== false).map(med => (
                    <SelectItem key={med.id} value={med.id}>
                      {med.medication_name} - {recipients.find(r => r.id === med.care_recipient_id)?.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Refill Date *</Label>
              <Input
                type="date"
                value={formData.refill_date}
                onChange={(e) => setFormData({...formData, refill_date: e.target.value})}
                required
              />
            </div>

            <div>
              <Label>Pharmacy</Label>
              <Input
                value={formData.pharmacy}
                onChange={(e) => setFormData({...formData, pharmacy: e.target.value})}
                placeholder="Pharmacy name and location"
              />
            </div>

            <div>
              <Label>Assign To</Label>
              <Select
                value={formData.assigned_to}
                onValueChange={(value) => setFormData({...formData, assigned_to: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team member (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map(tm => (
                    <SelectItem key={tm.id} value={tm.user_email}>
                      {tm.full_name} ({tm.relationship})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={createRefillMutation.isPending}>
                {createRefillMutation.isPending ? 'Creating...' : 'Create Reminder'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}