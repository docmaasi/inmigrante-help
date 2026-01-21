import React, { useState } from 'react';
import {
  useMedications,
  useUpdateMedication,
  useDeleteMedication,
  useCareRecipients,
} from '@/hooks';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pill, User, Clock, Calendar, AlertCircle, Edit2, Trash2, Archive } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '../components/ui/skeleton';
import MedicationForm from '../components/medications/MedicationForm';
import ShareQRCode from '../components/shared/ShareQRCode';

export default function Medications() {
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

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

  const handleUpdateActive = (med, active) => {
    updateMutation.mutate({ id: med.id, is_active: active });
  };

  const handleDelete = (med) => {
    if (confirm('Delete this medication?')) {
      deleteMutation.mutate(med.id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Medications</h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">Track medications and schedules</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInactive(!showInactive)}
            className={showInactive ? 'border-teal-300 text-teal-700' : ''}
          >
            {showInactive ? 'Hide Inactive' : 'Show Inactive'}
          </Button>
          <Button
            onClick={() => {
              setSelectedMedication(null);
              setShowForm(true);
            }}
            className="bg-teal-600 hover:bg-teal-700 flex-1 sm:flex-initial"
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
            <Card key={i} className="shadow-sm border-slate-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 mb-4 space-y-2">
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
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="p-8 md:p-16 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Pill className="w-8 h-8 md:w-10 md:h-10 text-slate-400" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-2">No Medications</h3>
            <p className="text-sm md:text-base text-slate-500 mb-6 max-w-sm mx-auto">Add your first medication to get started</p>
            <Button onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Medication
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMedications.map(med => (
            <Card key={med.id} className={`shadow-sm border-slate-200 bg-white hover:shadow-md transition-shadow ${
              med.is_active === false ? 'opacity-60' : ''
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="bg-teal-600 p-3 rounded-lg flex-shrink-0">
                      <Pill className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-800 mb-1">{med.name}</h3>
                      <p className="text-sm text-slate-600 flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        {getRecipientName(med.care_recipient_id)}
                      </p>
                    </div>
                  </div>
                  {med.is_active === false && (
                    <Badge variant="outline" className="bg-slate-100 text-slate-600">
                      Inactive
                    </Badge>
                  )}
                </div>

                {/* Dosage Info */}
                <div className="bg-slate-50 rounded-lg p-4 mb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Dosage:</span>
                    <span className="text-sm font-semibold text-slate-800">{med.dosage}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Frequency:</span>
                    <span className="text-sm text-slate-600">{med.frequency}</span>
                  </div>
                  {med.scheduled_times && med.scheduled_times.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Time:</span>
                      <span className="text-sm text-slate-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {med.scheduled_times.join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="space-y-2 mb-4">
                  {med.purpose && (
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Purpose:</span> {med.purpose}
                    </p>
                  )}
                  {med.prescribing_doctor && (
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Prescribed by:</span> Dr. {med.prescribing_doctor}
                    </p>
                  )}
                  {med.instructions && (
                    <div className="flex items-start gap-2 bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-orange-800">{med.instructions}</p>
                    </div>
                  )}
                  {med.refill_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">
                        Refill by: {format(parseISO(med.refill_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                  {med.is_active !== false && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateActive(med, false)}
                      className="text-slate-600"
                    >
                      <Archive className="w-3 h-3 mr-1" />
                      Mark Inactive
                    </Button>
                  )}
                  {med.is_active === false && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateActive(med, true)}
                      className="text-green-600"
                    >
                      <Pill className="w-3 h-3 mr-1" />
                      Reactivate
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedMedication(med);
                      setShowForm(true);
                    }}
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(med)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <ShareQRCode />
      </div>
      </div>
    </div>
  );
}
