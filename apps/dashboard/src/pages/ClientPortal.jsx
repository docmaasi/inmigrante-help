import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Pill, ListTodo, AlertCircle } from 'lucide-react';
import { isAfter, parseISO, startOfToday } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import ClientPortalNav from '../components/client/ClientPortalNav';
import { createPageUrl } from '../utils';

export function ClientPortal() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  const { data: access, isLoading: accessLoading } = useQuery({
    queryKey: ['clientAccess', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const { data, error } = await supabase
        .from('client_access')
        .select('*')
        .eq('client_email', user.email)
        .eq('approved', true)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.email
  });

  const recipientId = access?.care_recipient_id;

  const { data: recipient } = useQuery({
    queryKey: ['recipient', recipientId],
    queryFn: async () => {
      if (!recipientId) return null;
      const { data, error } = await supabase
        .from('care_recipients')
        .select('*')
        .eq('id', recipientId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!recipientId
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['clientAppointments', recipientId],
    queryFn: async () => {
      if (!recipientId) return [];
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('care_recipient_id', recipientId)
        .eq('status', 'scheduled')
        .order('date', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!recipientId
  });

  const { data: medications = [] } = useQuery({
    queryKey: ['clientMedications', recipientId],
    queryFn: async () => {
      if (!recipientId) return [];
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('care_recipient_id', recipientId)
        .eq('active', true)
        .order('medication_name');
      if (error) throw error;
      return data;
    },
    enabled: !!recipientId
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['clientTasks', recipientId],
    queryFn: async () => {
      if (!recipientId) return [];
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('care_recipient_id', recipientId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!recipientId
  });

  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate(createPageUrl('Dashboard'));
    }
  }, [authLoading, user, navigate]);

  React.useEffect(() => {
    if (!accessLoading && user && !access) {
      navigate(createPageUrl('Dashboard'));
    }
  }, [accessLoading, user, access, navigate]);

  const upcomingAppointments = appointments
    .filter(apt => isAfter(parseISO(apt.date), startOfToday()))
    .slice(0, 3);

  const activeMedications = medications.slice(0, 3);
  const urgentTasks = tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').slice(0, 3);

  if (authLoading || accessLoading || !recipient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ClientPortalNav careRecipientName={recipient.full_name} currentPageName="ClientPortal" />

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome to Your Care Portal</h1>
          <p className="text-slate-600">Stay updated on appointments, medications, and care activities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Upcoming Appointments</p>
                  <p className="text-3xl font-bold text-teal-600">{upcomingAppointments.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-teal-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Active Medications</p>
                  <p className="text-3xl font-bold text-teal-600">{activeMedications.length}</p>
                </div>
                <Pill className="w-8 h-8 text-teal-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Pending Tasks</p>
                  <p className="text-3xl font-bold text-teal-600">{tasks.length}</p>
                </div>
                <ListTodo className="w-8 h-8 text-teal-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Access Level</p>
                  <p className="text-lg font-bold text-slate-800 capitalize">{access?.access_level?.replace(/_/g, ' ')}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-teal-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
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

          <Card className="border border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-teal-600" />
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
                    <p className="text-xs text-slate-600 mt-1">{med.dosage} - {med.frequency}</p>
                    {med.purpose && <p className="text-xs text-slate-600">{med.purpose}</p>}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-teal-600" />
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
