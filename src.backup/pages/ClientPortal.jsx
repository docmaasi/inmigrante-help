import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Pill, ListTodo, AlertCircle } from 'lucide-react';
import { isAfter, parseISO, startOfToday } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import ClientPortalNav from '../components/client/ClientPortalNav';
import { createPageUrl } from '../utils';

export default function ClientPortal() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [recipientId, setRecipientId] = useState(null);
  const [recipient, setRecipient] = useState(null);
  const [access, setAccess] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => navigate(createPageUrl('Dashboard')));
  }, [navigate]);

  // Check if user has client access
  useEffect(() => {
    if (!user) return;
    
    base44.entities.ClientAccess.filter({
      client_email: user.email,
      approved: true
    }).then(accesses => {
      if (accesses.length === 0) {
        navigate(createPageUrl('Dashboard'));
      } else {
        setAccess(accesses[0]);
        setRecipientId(accesses[0].care_recipient_id);
      }
    });
  }, [user, navigate]);

  // Fetch recipient
  const { data: recipientData } = useQuery({
    queryKey: ['recipient', recipientId],
    queryFn: () => recipientId ? base44.entities.CareRecipient.filter({ id: recipientId }).then(data => data[0]) : null,
    enabled: !!recipientId
  });

  useEffect(() => {
    if (recipientData) setRecipient(recipientData);
  }, [recipientData]);

  const { data: appointments = [] } = useQuery({
    queryKey: ['clientAppointments', recipientId],
    queryFn: () => recipientId 
      ? base44.entities.Appointment.filter({ care_recipient_id: recipientId, status: 'scheduled' })
      : [],
    enabled: !!recipientId
  });

  const { data: medications = [] } = useQuery({
    queryKey: ['clientMedications', recipientId],
    queryFn: () => recipientId 
      ? base44.entities.Medication.filter({ care_recipient_id: recipientId, active: true })
      : [],
    enabled: !!recipientId
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['clientTasks', recipientId],
    queryFn: () => recipientId 
      ? base44.entities.Task.filter({ care_recipient_id: recipientId, status: 'pending' })
      : [],
    enabled: !!recipientId
  });

  const upcomingAppointments = appointments
    .filter(apt => isAfter(parseISO(apt.date), startOfToday()))
    .slice(0, 3);

  const activeMedications = medications.slice(0, 3);
  const urgentTasks = tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').slice(0, 3);

  if (!recipient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <ClientPortalNav careRecipientName={recipient.full_name} currentPageName="ClientPortal" />
      
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome to Your Care Portal</h1>
          <p className="text-slate-600">Stay updated on appointments, medications, and care activities</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Upcoming Appointments</p>
                  <p className="text-3xl font-bold text-blue-600">{upcomingAppointments.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-100" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Active Medications</p>
                  <p className="text-3xl font-bold text-purple-600">{activeMedications.length}</p>
                </div>
                <Pill className="w-8 h-8 text-purple-100" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Pending Tasks</p>
                  <p className="text-3xl font-bold text-orange-600">{tasks.length}</p>
                </div>
                <ListTodo className="w-8 h-8 text-orange-100" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Access Level</p>
                  <p className="text-lg font-bold text-slate-800 capitalize">{access?.access_level.replace(/_/g, ' ')}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-slate-100" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingAppointments.length === 0 ? (
                <p className="text-sm text-slate-500">No upcoming appointments</p>
              ) : (
                upcomingAppointments.map(apt => (
                  <div key={apt.id} className="p-3 border border-slate-200 rounded-lg">
                    <p className="font-medium text-slate-800">{apt.title}</p>
                    <p className="text-xs text-slate-600 mt-1">{apt.date} at {apt.time}</p>
                    {apt.location && <p className="text-xs text-slate-600">{apt.location}</p>}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Active Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-purple-600" />
                Current Medications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeMedications.length === 0 ? (
                <p className="text-sm text-slate-500">No active medications</p>
              ) : (
                activeMedications.map(med => (
                  <div key={med.id} className="p-3 border border-slate-200 rounded-lg">
                    <p className="font-medium text-slate-800">{med.medication_name}</p>
                    <p className="text-xs text-slate-600 mt-1">{med.dosage} • {med.frequency}</p>
                    {med.purpose && <p className="text-xs text-slate-600">{med.purpose}</p>}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Urgent Tasks */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-orange-600" />
                Assigned Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {urgentTasks.length === 0 ? (
                <p className="text-sm text-slate-500">No urgent tasks</p>
              ) : (
                <div className="space-y-2">
                  {urgentTasks.map(task => (
                    <div key={task.id} className="p-3 border border-slate-200 rounded-lg flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-800">{task.title}</p>
                        <p className="text-xs text-slate-600 mt-1">{task.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ml-2 ${
                        task.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}