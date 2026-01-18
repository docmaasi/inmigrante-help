import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar, MapPin, User, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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
    care_recipient_id: '',
    title: '',
    appointment_type: 'doctor',
    date: '',
    time: '',
    location: '',
    provider_name: '',
    assigned_caregiver: '',
    notes: '',
    status: 'scheduled'
  });

  const queryClient = useQueryClient();

  const { data: recipients = [] } = useQuery({
    queryKey: ['recipients'],
    queryFn: () => base44.entities.CareRecipient.list(),
  });

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list('-date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Appointment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const toggleCompleteMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Appointment.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries(['appointments']),
  });

  const resetForm = () => {
    setFormData({
      care_recipient_id: '',
      title: '',
      appointment_type: 'doctor',
      date: '',
      time: '',
      location: '',
      provider_name: '',
      assigned_caregiver: '',
      notes: '',
      status: 'scheduled'
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const getRecipientName = (id) => {
    return recipients.find(r => r.id === id)?.full_name || 'Unknown';
  };

  return (
    <div className="min-h-screen relative p-4 md:p-8">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ 
          backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/6ebff87ba_Untitleddesign17.png)'
        }}
      />
      <div className="relative max-w-7xl mx-auto">
        <div className="mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Appointments</h1>
            <p className="text-sm md:text-base text-slate-700">Schedule and track medical visits</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule Appointment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Care Recipient *</Label>
                  <Select
                    value={formData.care_recipient_id}
                    onValueChange={(value) => setFormData({...formData, care_recipient_id: value})}
                    required
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

                {formData.appointment_type === 'other' && (
                  <div className="space-y-2">
                    <Label htmlFor="title">Specify Appointment Type *</Label>
                    <Input
                      id="other_title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., Physical Therapy, Vision Test, Social Worker"
                      required
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
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
                  <Label htmlFor="assigned">Assigned Caregiver (email)</Label>
                  <Input
                    id="assigned"
                    type="email"
                    value={formData.assigned_caregiver}
                    onChange={(e) => setFormData({...formData, assigned_caregiver: e.target.value})}
                    placeholder="caregiver@email.com"
                  />
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

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Scheduling...' : 'Schedule Appointment'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200/60">
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
          <div className="text-center py-12 md:py-16">
            <Calendar className="w-12 h-12 md:w-16 md:h-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-2">No appointments scheduled</h3>
            <p className="text-sm md:text-base text-slate-500 mb-6">Schedule your first appointment</p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Appointment
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {appointments.map(apt => (
              <div 
                key={apt.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-medium text-slate-800">{apt.title}</h3>
                      <Badge className={`${typeColors[apt.appointment_type]} border`}>
                        {apt.appointment_type?.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      For: {getRecipientName(apt.care_recipient_id)}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleCompleteMutation.mutate({ 
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

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {format(parseISO(apt.date), 'MMMM d, yyyy')}
                    {apt.time && (
                      <>
                        <Clock className="w-4 h-4 text-slate-400 ml-2" />
                        {apt.time}
                      </>
                    )}
                  </div>
                  {apt.location && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {apt.location}
                    </div>
                  )}
                  {apt.provider_name && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="w-4 h-4 text-slate-400" />
                      {apt.provider_name}
                    </div>
                  )}
                  {apt.assigned_caregiver && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-500">Assigned to: </span>
                      <span className="text-xs text-slate-700 font-medium">{apt.assigned_caregiver}</span>
                    </div>
                  )}
                  {apt.notes && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-600">{apt.notes}</p>
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