import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pill, User, Clock, Calendar, AlertCircle, Edit2, Trash2, Archive } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import MedicationForm from '../components/medications/MedicationForm';

export default function Medications() {
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const queryClient = useQueryClient();

  const { data: medications = [], isLoading } = useQuery({
    queryKey: ['medications'],
    queryFn: () => base44.entities.Medication.list('-created_date')
  });

  const { data: recipients = [] } = useQuery({
    queryKey: ['careRecipients'],
    queryFn: () => base44.entities.CareRecipient.list()
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Medication.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['medications']);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Medication.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['medications']);
    }
  });

  const getRecipientName = (id) => {
    const recipient = recipients.find(r => r.id === id);
    return recipient?.full_name || 'Unknown';
  };

  const filteredMedications = showInactive 
    ? medications 
    : medications.filter(med => med.active !== false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Medications</h1>
          <p className="text-slate-500 mt-1">Track medications and schedules</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive ? 'Hide Inactive' : 'Show Inactive'}
          </Button>
          <Button
            onClick={() => {
              setSelectedMedication(null);
              setShowForm(true);
            }}
            className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30"
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
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        </div>
      ) : filteredMedications.length === 0 ? (
        <Card className="border-slate-200/60">
          <CardContent className="p-12 text-center">
            <Pill className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Medications</h3>
            <p className="text-slate-500 mb-6">Add your first medication to get started</p>
            <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Medication
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMedications.map(med => (
            <Card key={med.id} className={`shadow-sm border-slate-200/60 hover:shadow-md transition-shadow ${
              med.active === false ? 'opacity-60' : ''
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="bg-gradient-to-br from-green-600 to-green-700 p-3 rounded-lg flex-shrink-0">
                      <Pill className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-800 mb-1">{med.medication_name}</h3>
                      <p className="text-sm text-slate-600 flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        {getRecipientName(med.care_recipient_id)}
                      </p>
                    </div>
                  </div>
                  {med.active === false && (
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
                  {med.time_of_day && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Time:</span>
                      <span className="text-sm text-slate-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {med.time_of_day}
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
                  {med.special_instructions && (
                    <div className="flex items-start gap-2 bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-orange-800">{med.special_instructions}</p>
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
                  {med.active !== false && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateMutation.mutate({ id: med.id, data: { active: false } })}
                      className="text-slate-600"
                    >
                      <Archive className="w-3 h-3 mr-1" />
                      Mark Inactive
                    </Button>
                  )}
                  {med.active === false && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateMutation.mutate({ id: med.id, data: { active: true } })}
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
                    onClick={() => {
                      if (confirm('Delete this medication?')) {
                        deleteMutation.mutate(med.id);
                      }
                    }}
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
      </div>
    </div>
  );
}