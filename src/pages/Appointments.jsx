import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar as CalendarIcon, MapPin, User, Clock, ChevronRight, Edit2, Trash2, Check, X } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';
import AppointmentForm from '../components/appointments/AppointmentForm';

export default function Appointments() {
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list('-date')
  });

  const { data: recipients = [] } = useQuery({
    queryKey: ['careRecipients'],
    queryFn: () => base44.entities.CareRecipient.list()
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Appointment.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Appointment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
    }
  });

  const getRecipientName = (id) => {
    const recipient = recipients.find(r => r.id === id);
    return recipient?.full_name || 'Unknown';
  };

  const getDateLabel = (dateString) => {
    try {
      const date = parseISO(dateString);
      if (isToday(date)) return 'Today';
      if (isTomorrow(date)) return 'Tomorrow';
      if (isPast(date)) return format(date, 'MMM d') + ' (Past)';
      return format(date, 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const filteredAppointments = filterStatus === 'all' 
    ? appointments 
    : appointments.filter(apt => apt.status === filterStatus);

  const appointmentTypeColors = {
    doctor: 'bg-blue-100 text-blue-700',
    specialist: 'bg-purple-100 text-purple-700',
    therapy: 'bg-green-100 text-green-700',
    dentist: 'bg-cyan-100 text-cyan-700',
    lab_test: 'bg-orange-100 text-orange-700',
    hospital: 'bg-red-100 text-red-700',
    other: 'bg-slate-100 text-slate-700'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Appointments</h1>
          <p className="text-slate-500 mt-1">Manage medical appointments and visits</p>
        </div>
        <Button
          onClick={() => {
            setSelectedAppointment(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Appointment
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'scheduled', 'completed', 'cancelled', 'missed'].map(status => (
          <Button
            key={status}
            variant={filterStatus === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus(status)}
            className={filterStatus === status ? 'bg-blue-600' : ''}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <AppointmentForm
          appointment={selectedAppointment}
          recipients={recipients}
          onClose={() => {
            setShowForm(false);
            setSelectedAppointment(null);
          }}
        />
      )}

      {/* Appointments List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <Card className="border-slate-200/60">
          <CardContent className="p-12 text-center">
            <CalendarIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Appointments</h3>
            <p className="text-slate-500 mb-6">
              {filterStatus === 'all' ? 'Add your first appointment to get started' : `No ${filterStatus} appointments`}
            </p>
            {filterStatus === 'all' && (
              <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Appointment
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map(apt => (
            <Card key={apt.id} className="shadow-sm border-slate-200/60 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Date Badge */}
                  <div className="flex-shrink-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg p-4 w-32">
                    <CalendarIcon className="w-6 h-6 mb-2" />
                    <div className="text-center">
                      <p className="text-xs font-medium opacity-90">
                        {getDateLabel(apt.date).includes('(Past)') ? 'Past' : getDateLabel(apt.date)}
                      </p>
                      <p className="text-2xl font-bold">{format(parseISO(apt.date), 'd')}</p>
                      <p className="text-xs opacity-90">{format(parseISO(apt.date), 'MMM')}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-800 mb-1">{apt.title}</h3>
                        <p className="text-sm text-slate-600 flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          {getRecipientName(apt.care_recipient_id)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={`${appointmentTypeColors[apt.appointment_type]} border-0`}>
                          {apt.appointment_type.replace(/_/g, ' ')}
                        </Badge>
                        <Badge variant={apt.status === 'completed' ? 'default' : 'outline'} className={
                          apt.status === 'completed' ? 'bg-green-600' :
                          apt.status === 'cancelled' ? 'bg-red-100 text-red-700 border-0' :
                          apt.status === 'missed' ? 'bg-orange-100 text-orange-700 border-0' : ''
                        }>
                          {apt.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {apt.time && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {apt.time}
                        </div>
                      )}
                      {apt.location && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {apt.location}
                        </div>
                      )}
                      {apt.provider_name && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <User className="w-4 h-4 text-slate-400" />
                          Dr. {apt.provider_name}
                        </div>
                      )}
                    </div>

                    {apt.notes && (
                      <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 mb-4">
                        {apt.notes}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {apt.status === 'scheduled' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatusMutation.mutate({ id: apt.id, status: 'completed' })}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatusMutation.mutate({ id: apt.id, status: 'cancelled' })}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedAppointment(apt);
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
                          if (confirm('Delete this appointment?')) {
                            deleteMutation.mutate(apt.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}