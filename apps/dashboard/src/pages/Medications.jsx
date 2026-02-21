import React, { useState } from 'react';
import {
  useMedications,
  useUpdateMedication,
  useDeleteMedication,
  useCareRecipients,
} from '@/hooks';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pill, Printer } from 'lucide-react';
import { printMedications } from '@/components/medications/medications-print';
import { Skeleton } from '../components/ui/skeleton';
import MedicationForm from '../components/medications/MedicationForm';
import { MedicationCard } from '../components/medications/MedicationCard';
import ShareQRCode from '../components/shared/ShareQRCode';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

export default function Medications() {
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: medications = [], isLoading } = useMedications();
  const { data: recipients = [] } = useCareRecipients();
  const updateMutation = useUpdateMedication();
  const deleteMutation = useDeleteMedication();

  const getRecipientName = (id) => {
    const recipient = recipients.find(r => r.id === id);
    return recipient
      ? `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim() || 'Unknown'
      : 'Unknown';
  };

  const filteredMedications = showInactive
    ? medications
    : medications.filter(med => med.is_active !== false);

  const handleToggleActive = (med, active) => {
    updateMutation.mutate({ id: med.id, is_active: active });
  };

  const handleDelete = (med) => {
    setDeleteTarget(med);
  };

  const handleEdit = (med) => {
    setSelectedMedication(med);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-[#F0FDFA] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#4F46E5]">Medications</h1>
          <p className="text-sm md:text-base text-[#8B7EC8] mt-1">Track medications and schedules</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInactive(!showInactive)}
            className={showInactive ? 'border-[#4F46E5]/30 text-[#4F46E5]' : 'border-[#8B7EC8]/30 text-[#8B7EC8]'}
          >
            {showInactive ? 'Hide Inactive' : 'Show Inactive'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => printMedications(filteredMedications, getRecipientName)}
            disabled={isLoading || filteredMedications.length === 0}
            className="border-[#8B7EC8]/30 text-[#8B7EC8]"
          >
            <Printer className="w-4 h-4 mr-1" />
            Print
          </Button>
          <Button
            onClick={() => {
              setSelectedMedication(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-[#4F46E5] to-[#8B7EC8] hover:from-[#4F46E5]/90 hover:to-[#8B7EC8]/90 text-white flex-1 sm:flex-initial"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Medication
          </Button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <MedicationForm
          medication={selectedMedication}
          recipients={recipients}
          onClose={() => {
            setShowForm(false);
            setSelectedMedication(null);
          }}
        />
      )}

      {/* Medications List */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="shadow-sm border-[#4F46E5]/10 bg-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <div className="bg-[#4F46E5]/5 rounded-lg p-4 mb-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredMedications.length === 0 ? (
        <Card className="border-[#4F46E5]/10 bg-white shadow-sm">
          <CardContent className="p-8 md:p-16 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-[#8B7EC8]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Pill className="w-8 h-8 md:w-10 md:h-10 text-[#8B7EC8]" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-[#4F46E5] mb-2">No Medications</h3>
            <p className="text-sm md:text-base text-[#8B7EC8] mb-6 max-w-sm mx-auto">Add your first medication to get started</p>
            <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-[#4F46E5] to-[#8B7EC8] hover:from-[#4F46E5]/90 hover:to-[#8B7EC8]/90 text-white w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Medication
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMedications.map(med => (
            <MedicationCard
              key={med.id}
              med={med}
              getRecipientName={getRecipientName}
              onEdit={handleEdit}
              onToggleActive={handleToggleActive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <ShareQRCode />
      </div>
      </div>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Medication"
        description={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => { deleteMutation.mutate(deleteTarget.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
