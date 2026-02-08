import React, { useState } from 'react';
import {
  useMedications,
  useCareRecipients,
  useTeamMembers,
} from '@/hooks';
import {
  useMedicationRefills,
  useCreateMedicationRefill,
  useBulkCreateMedicationRefills,
} from '@/hooks/use-refills';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pill, Plus, Bell, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import RefillTracker from '../components/medications/RefillTracker';
import RefillReminders from '../components/medications/RefillReminders';

export default function Refills() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    medication_id: '',
    requested_date: '',
    pharmacy: '',
    notes: ''
  });

  const { data: medications = [] } = useMedications();
  const { data: recipients = [] } = useCareRecipients();
  const { data: teamMembers = [] } = useTeamMembers();
  const { data: refills = [] } = useMedicationRefills();

  const createRefillMutation = useCreateMedicationRefill();
  const bulkCreateMutation = useBulkCreateMedicationRefills();

  const handleClose = () => {
    setShowAddDialog(false);
    setFormData({
      medication_id: '',
      requested_date: '',
      pharmacy: '',
      notes: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createRefillMutation.mutate({
      medication_id: formData.medication_id,
      requested_date: formData.requested_date,
      pharmacy: formData.pharmacy || null,
      notes: formData.notes || null,
      status: 'pending'
    }, {
      onSuccess: () => {
        toast.success('Refill reminder created');
        handleClose();
      }
    });
  };

  const handleMedicationSelect = (medId) => {
    const med = medications.find(m => m.id === medId);
    if (med) {
      setFormData({
        ...formData,
        medication_id: medId,
        requested_date: med.refill_date || '',
        pharmacy: med.pharmacy || ''
      });
    }
  };

  const handleSyncFromMedications = () => {
    const today = new Date();
    const medicationsNeedingRefills = medications.filter(m => {
      if (!m.refill_date || !m.is_active) return false;
      const refillDate = new Date(m.refill_date);
      const existingRefill = refills.find(r =>
        r.medication_id === m.id &&
        r.requested_date === m.refill_date &&
        r.status !== 'filled'
      );
      return refillDate >= today && !existingRefill;
    });

    if (medicationsNeedingRefills.length === 0) {
      toast.info('No new refills to sync');
      return;
    }

    const newRefills = medicationsNeedingRefills.map(m => ({
      medication_id: m.id,
      requested_date: m.refill_date,
      pharmacy: m.pharmacy || null,
      status: 'pending'
    }));

    bulkCreateMutation.mutate(newRefills, {
      onSuccess: () => {
        toast.success(`Synced ${newRefills.length} upcoming refills from medications`);
      }
    });
  };

  const getRecipientName = (careRecipientId) => {
    const recipient = recipients.find(r => r.id === careRecipientId);
    return recipient
      ? `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim()
      : '';
  };

  const upcomingCount = refills.filter(r => r.status !== 'filled').length;
  const overdueCount = refills.filter(r => {
    if (r.status === 'filled') return false;
    return new Date(r.requested_date) < new Date();
  }).length;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-teal-50 rounded-lg">
            <Pill className="w-6 h-6 text-teal-600" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Medication Refills</h1>
        </div>
        <p className="text-slate-500 ml-12">Track and manage medication refill reminders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Pending Refills</p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">{upcomingCount}</p>
              </div>
              <div className="p-3 bg-teal-50 rounded-lg">
                <Bell className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-red-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Overdue</p>
                <p className="text-2xl font-semibold text-red-700 mt-1">{overdueCount}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <Bell className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-green-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-semibold text-green-700 mt-1">
                  {refills.filter(r => r.status === 'filled').length}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Refill Reminder
        </Button>
        <Button
          onClick={handleSyncFromMedications}
          variant="outline"
          disabled={bulkCreateMutation.isPending}
          className="border-slate-200 hover:bg-slate-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${bulkCreateMutation.isPending ? 'animate-spin' : ''}`} />
          {bulkCreateMutation.isPending ? 'Syncing...' : 'Sync from Medications'}
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reminder System */}
        <div className="lg:col-span-1">
          <RefillReminders />
        </div>

        {/* Refill Tracker */}
        <div className="lg:col-span-2">
          <RefillTracker />
        </div>
      </div>

      {/* Add Refill Dialog */}
      <Dialog open={showAddDialog} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">Add Refill Reminder</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Medication *</Label>
              <Select
                value={formData.medication_id}
                onValueChange={handleMedicationSelect}
                required
              >
                <SelectTrigger className="border-slate-200 focus:ring-teal-500 focus:border-teal-500">
                  <SelectValue placeholder="Select medication" />
                </SelectTrigger>
                <SelectContent>
                  {medications.filter(m => m.is_active !== false).map(med => (
                    <SelectItem key={med.id} value={med.id}>
                      {med.name} - {getRecipientName(med.care_recipient_id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Refill Date *</Label>
              <Input
                type="date"
                value={formData.requested_date}
                onChange={(e) => setFormData({...formData, requested_date: e.target.value})}
                required
                className="border-slate-200 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Pharmacy</Label>
              <Input
                value={formData.pharmacy}
                onChange={(e) => setFormData({...formData, pharmacy: e.target.value})}
                placeholder="Pharmacy name and location"
                className="border-slate-200 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Additional notes..."
                rows={3}
                className="border-slate-200 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} className="border-slate-200">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createRefillMutation.isPending}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                {createRefillMutation.isPending ? 'Creating...' : 'Create Reminder'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
