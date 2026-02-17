import React, { useState } from 'react';
import { useAppointments, useCreateAppointment, useUpdateAppointment, useCareRecipients } from '@/hooks';
import { Plus, Calendar, MapPin, User, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const typeColors = {
  doctor: 'bg-blue-100 text-blue-700 border-blue-200',
  specialist: 'bg-purple-100 text-purple-700 border-purple-200',
  therapy: 'bg-green-100 text-green-700 border-green-200',
  dentist: 'bg-teal-100 text-teal-700 border-teal-200',
  lab_test: 'bg-orange-100 text-orange-700 border-orange-200',
  hospital: 'bg-red-100 text-red-700 border-red-200',
  other: 'bg-slate-100 text-slate-700 border-slate-200'
};

export default function Appointments() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    care_recipient_ids: [],
    title: '',
    appointment_type: 'doctor',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    provider_name: '',
    notes: '',
    status: 'scheduled'
  });

  const { data: recipients = [] } = useCareRecipients();
  const { data: appointments = [], isLoading } = useAppointments();

  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();

  const resetForm = () => {
    setFormData({
      care_recipient_ids: [],
      title: '',
      appointment_type: 'doctor',
      description: '',
      start_time: '',
      end_time: '',
      location: '',
      provider_name: '',
      notes: '',
      status: 'scheduled'
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.care_recipient_ids.length === 0) {
      toast.error('Please select at least one care recipient');
      return;
    }

    const appointmentData = {
      // Send first selected as care_recipient_id for backward compatibility
      care_recipient_id: formData.care_recipient_ids[0],
      // Send full array for multi-recipient support
      care_recipient_ids: formData.care_recipient_ids,
      title: formData.title,
      appointment_type: formData.appointment_type,
      description: formData.description || null,
      start_time: formData.start_time
        ? (formData.start_time.length <= 16 ? formData.start_time + ':00' : formData.start_time)
        : null,
      end_time: formData.end_time
        ? (formData.end_time.length <= 16 ? formData.end_time + ':00' : formData.end_time)
        : null,
      location: formData.location || null,
      provider_name: formData.provider_name || null,
      notes: formData.notes || null,
      status: formData.status
    };

    createMutation.mutate(appointmentData, {
      onSuccess: () => {
        setIsDialogOpen(false);
        resetForm();
      }
    });
  };

  const getRecipientName = (id) => {
    const recipient = recipients.find(r => r.id === id);
    if (recipient) {
      return recipient.full_name || `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim() || 'Unknown';
    }
    return 'Unknown';
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    try {
      const date = parseISO(dateTimeString);
      return format(date, 'MMMM d, yyyy');
    } catch {
      return '';
    }
  };

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    try {
      const date = parseISO(dateTimeString);
      return format(date, 'h:mm a');
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Appointments</h1>
            <p className="text-sm md:text-base text-slate-500 mt-1">Schedule and track medical visits</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Schedule Appointment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={formData.appointment_type}
                      onValueChange={(value) => setFormData({...formData, appointment_type: value})}
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

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief description of the appointment"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Date & Time *</Label>
                    <Input
                      id="start_time"
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">End Date & Time</Label>
                    <Input
                      id="end_time"
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor">Provider Name</Label>
                    <Input
                      id="doctor"
                      value={formData.provider_name}
                      onChange={(e) => setFormData({...formData, provider_name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 pb-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm">
                    {createMutation.isPending ? 'Scheduling...' : 'Schedule Appointment'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 md:p-16 text-center">
            <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-7 h-7 text-teal-600" />
            </div>
            <h3 className="text-lg md:text-xl font-medium text-slate-800 mb-2">No appointments scheduled</h3>
            <p className="text-sm md:text-base text-slate-500 mb-6">Schedule your first appointment to get started</p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Appointment
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {appointments?.map(apt => (
              <div
                key={apt.id}
                className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-medium text-slate-800">{apt.title}</h3>
                      <Badge className={`${typeColors[apt.appointment_type] || typeColors.other} border`}>
                        {apt.appointment_type?.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      For: {Array.isArray(apt.care_recipient_ids) && apt.care_recipient_ids.length > 0
                        ? apt.care_recipient_ids.map(id => getRecipientName(id)).join(', ')
                        : apt.care_recipients
                          ? `${apt.care_recipients.first_name} ${apt.care_recipients.last_name}`
                          : getRecipientName(apt.care_recipient_id)
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => updateMutation.mutate({
                      id: apt.id,
                      status: apt.status === 'completed' ? 'scheduled' : 'completed'
                    })}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      apt.status === 'completed'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {apt.status === 'completed' ? 'Completed' : 'Mark Complete'}
                  </button>
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4 text-teal-500" />
                    <span>{formatDateTime(apt.start_time)}</span>
                    {apt.start_time && (
                      <>
                        <span className="text-slate-300">|</span>
                        <Clock className="w-4 h-4 text-teal-500" />
                        <span>{formatTime(apt.start_time)}</span>
                      </>
                    )}
                  </div>
                  {apt.location && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-teal-500" />
                      <span>{apt.location}</span>
                    </div>
                  )}
                  {apt.provider_name && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="w-4 h-4 text-teal-500" />
                      <span>{apt.provider_name}</span>
                    </div>
                  )}
                  {apt.notes && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-sm text-slate-500">{apt.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
