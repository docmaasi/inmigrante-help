import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { parseISO, format } from 'date-fns';
import ReportExporter from './ReportExporter';
import { Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function AppointmentSummaryReport({ recipientId, recipientName, dateRange }) {
  const contentRef = useRef(null);
  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', recipientId, dateRange],
    queryFn: () => base44.entities.Appointment.filter({
      care_recipient_id: recipientId
    })
  });

  // Filter by date range
  const filteredAppointments = appointments.filter(apt => {
    const aptDate = parseISO(apt.date);
    const startDate = parseISO(dateRange.startDate);
    const endDate = parseISO(dateRange.endDate);
    return aptDate >= startDate && aptDate <= endDate;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const completed = filteredAppointments.filter(a => a.status === 'completed').length;
  const scheduled = filteredAppointments.filter(a => a.status === 'scheduled').length;
  const cancelled = filteredAppointments.filter(a => a.status === 'cancelled').length;
  const missed = filteredAppointments.filter(a => a.status === 'missed').length;

  const appointmentTypes = {};
  filteredAppointments.forEach(apt => {
    const type = apt.appointment_type || 'other';
    appointmentTypes[type] = (appointmentTypes[type] || 0) + 1;
  });

  const statusConfig = {
    completed: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Completed' },
    scheduled: { icon: Clock, color: 'bg-blue-100 text-blue-800', label: 'Scheduled' },
    cancelled: { icon: AlertCircle, color: 'bg-slate-100 text-slate-800', label: 'Cancelled' },
    missed: { icon: AlertCircle, color: 'bg-red-100 text-red-800', label: 'Missed' }
  };

  const reportContent = (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{completed}</p>
            <p className="text-sm text-slate-600">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{scheduled}</p>
            <p className="text-sm text-slate-600">Scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-red-600">{missed}</p>
            <p className="text-sm text-slate-600">Missed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-slate-600">{cancelled}</p>
            <p className="text-sm text-slate-600">Cancelled</p>
          </CardContent>
        </Card>
      </div>

      {/* Appointment Types */}
      {Object.keys(appointmentTypes).length > 0 && (
        <Card>
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Appointments by Type</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              {Object.entries(appointmentTypes).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="capitalize font-medium text-slate-800">{type}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed List */}
      {filteredAppointments.length > 0 && (
        <Card>
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              All Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {filteredAppointments.map(apt => {
                const config = statusConfig[apt.status] || statusConfig.scheduled;
                return (
                  <div key={apt.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-slate-800">{apt.title}</h4>
                        <p className="text-sm text-slate-600">{format(parseISO(apt.date), 'MMMM d, yyyy')} at {apt.time}</p>
                      </div>
                      <Badge className={config.color}>{config.label}</Badge>
                    </div>
                    {apt.provider_name && (
                      <p className="text-sm text-slate-700 mb-1">Provider: {apt.provider_name}</p>
                    )}
                    {apt.location && (
                      <p className="text-sm text-slate-700">{apt.location}</p>
                    )}
                    {apt.notes && (
                      <p className="text-sm text-slate-600 mt-2 italic">{apt.notes}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredAppointments.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-500">No appointments found in this date range</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <ReportExporter
        title={`Appointment Summary Report - ${recipientName}`}
        dateRange={dateRange}
        contentRef={contentRef}
      />
      <div ref={contentRef}>
        {reportContent}
      </div>
    </div>
  );
}