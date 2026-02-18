import React, { useState } from 'react';
import {
  useAppointments, useCreateAppointment, useUpdateAppointment,
  useDeleteAppointment, useCareRecipients
} from '@/hooks';
import { Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { AppointmentFormFields } from '@/components/appointments/AppointmentFormFields';

export default function Appointments() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState(getEmptyForm());

  const { data: recipients = [] } = useCareRecipients();
  const { data: appointments = [], isLoading } = useAppointments();
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const deleteMutation = useDeleteAppointment();

  function getEmptyForm() {
    return {
      care_recipient_ids: [], title: '', appointment_type: 'doctor',
      description: '', start_time: '', end_time: '',
      location: '', provider_name: '', notes: '', status: 'scheduled'
    };
  }

  function openCreateDialog() {
    setEditingAppointment(null);
    setFormData(getEmptyForm());
    setIsDialogOpen(true);
  }

  function openEditDialog(apt) {
    setEditingAppointment(apt);
    setFormData({
      care_recipient_ids: apt.care_recipient_ids || (apt.care_recipient_id ? [apt.care_recipient_id] : []),
      title: apt.title || '', appointment_type: apt.appointment_type || 'doctor',
      description: apt.description || '',
      start_time: apt.start_time ? apt.start_time.slice(0, 16) : '',
      end_time: apt.end_time ? apt.end_time.slice(0, 16) : '',
      location: apt.location || '', provider_name: apt.provider_name || '',
      notes: apt.notes || '', status: apt.status || 'scheduled'
    });
    setIsDialogOpen(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (formData.care_recipient_ids.length === 0) {
      toast.error('Please select at least one care recipient');
      return;
    }
    const data = buildAppointmentData(formData);

    if (editingAppointment) {
      updateMutation.mutate({ id: editingAppointment.id, ...data }, {
        onSuccess: () => { setIsDialogOpen(false); toast.success('Appointment updated'); }
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => { setIsDialogOpen(false); setFormData(getEmptyForm()); toast.success('Appointment created'); }
      });
    }
  }

  function handleDelete(apt) {
    if (!window.confirm(`Delete "${apt.title}"? This cannot be undone.`)) return;
    deleteMutation.mutate(apt.id, {
      onSuccess: () => toast.success('Appointment deleted'),
      onError: (err) => toast.error(err.message || 'Failed to delete')
    });
  }

  function handleToggleStatus(apt) {
    updateMutation.mutate({
      id: apt.id, status: apt.status === 'completed' ? 'scheduled' : 'completed'
    });
  }

  const getRecipientName = (id) => {
    const r = recipients.find(r => r.id === id);
    return r ? (r.full_name || `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'Unknown') : 'Unknown';
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Appointments</h1>
            <p className="text-sm md:text-base text-slate-500 mt-1">Schedule and track medical visits</p>
          </div>
          <Button onClick={openCreateDialog} className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white shadow-sm">
            <Plus className="w-4 h-4 mr-2" />Add Appointment
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAppointment ? 'Edit Appointment' : 'Schedule Appointment'}</DialogTitle>
            </DialogHeader>
            <AppointmentFormFields
              formData={formData} setFormData={setFormData}
              recipients={recipients} isPending={isPending}
              isEditing={!!editingAppointment}
              onSubmit={handleSubmit} onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 md:p-16 text-center">
            <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-7 h-7 text-teal-600" />
            </div>
            <h3 className="text-lg md:text-xl font-medium text-slate-800 mb-2">No appointments scheduled</h3>
            <p className="text-sm text-slate-500 mb-6">Schedule your first appointment to get started</p>
            <Button onClick={openCreateDialog} className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm">
              <Plus className="w-4 h-4 mr-2" />Add Appointment
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {appointments.map(apt => (
              <AppointmentCard
                key={apt.id} appointment={apt} getRecipientName={getRecipientName}
                onToggleStatus={handleToggleStatus} onEdit={openEditDialog} onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function buildAppointmentData(formData) {
  return {
    care_recipient_id: formData.care_recipient_ids[0],
    care_recipient_ids: formData.care_recipient_ids,
    title: formData.title, appointment_type: formData.appointment_type,
    description: formData.description || null,
    start_time: formData.start_time ? (formData.start_time.length <= 16 ? formData.start_time + ':00' : formData.start_time) : null,
    end_time: formData.end_time ? (formData.end_time.length <= 16 ? formData.end_time + ':00' : formData.end_time) : null,
    location: formData.location || null, provider_name: formData.provider_name || null,
    notes: formData.notes || null, status: formData.status
  };
}
