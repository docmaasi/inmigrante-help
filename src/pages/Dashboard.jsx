import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Calendar, Pill, CheckSquare, Users, AlertCircle, Clock, ChevronRight, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

export default function Dashboard() {
  const { data: careRecipients = [] } = useQuery({
    queryKey: ['careRecipients'],
    queryFn: () => base44.entities.CareRecipient.list()
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list('-date')
  });

  const { data: medications = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: () => base44.entities.Medication.filter({ active: true })
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-due_date')
  });

  // Filter today's and upcoming items
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(apt => apt.date === today && apt.status === 'scheduled');
  const upcomingAppointments = appointments.filter(apt => apt.date > today && apt.status === 'scheduled').slice(0, 3);
  const pendingTasks = tasks.filter(task => task.status === 'pending' || task.status === 'in_progress').slice(0, 5);

  const getDateLabel = (dateString) => {
    try {
      const date = parseISO(dateString);
      if (isToday(date)) return 'Today';
      if (isTomorrow(date)) return 'Tomorrow';
      return format(date, 'MMM d');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Care Dashboard</h1>
        <p className="text-lg text-slate-500">Everything you need to coordinate care, all in one place</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-lg shadow-blue-600/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Care Recipients</p>
                <p className="text-3xl font-bold">{careRecipients.length}</p>
              </div>
              <Users className="w-10 h-10 text-blue-200 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg shadow-orange-600/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium mb-1">Today's Appointments</p>
                <p className="text-3xl font-bold">{todayAppointments.length}</p>
              </div>
              <Calendar className="w-10 h-10 text-orange-200 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white border-0 shadow-lg shadow-green-600/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Active Medications</p>
                <p className="text-3xl font-bold">{medications.length}</p>
              </div>
              <Pill className="w-10 h-10 text-green-200 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0 shadow-lg shadow-purple-600/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Pending Tasks</p>
                <p className="text-3xl font-bold">{pendingTasks.length}</p>
              </div>
              <CheckSquare className="w-10 h-10 text-purple-200 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <Card className="shadow-sm border-slate-200/60">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Today's Appointments
              </CardTitle>
              <Link to={createPageUrl('Appointments')} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No appointments today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map(apt => (
                  <div key={apt.id} className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800">{apt.title}</p>
                      <p className="text-sm text-slate-600">{apt.time} • {apt.location}</p>
                      {apt.provider_name && (
                        <p className="text-sm text-slate-500 mt-1">Dr. {apt.provider_name}</p>
                      )}
                    </div>
                    <Badge className="bg-orange-100 text-orange-700 border-0">
                      {apt.appointment_type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card className="shadow-sm border-slate-200/60">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-green-600" />
                Pending Tasks
              </CardTitle>
              <Link to={createPageUrl('Tasks')} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No pending tasks</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className={`w-2 h-2 rounded-full ${
                      task.priority === 'urgent' ? 'bg-red-500' :
                      task.priority === 'high' ? 'bg-orange-500' :
                      task.priority === 'medium' ? 'bg-blue-500' : 'bg-slate-400'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 text-sm">{task.title}</p>
                      {task.due_date && (
                        <p className="text-xs text-slate-500">Due: {getDateLabel(task.due_date)}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {task.task_type.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card className="shadow-sm border-slate-200/60">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No upcoming appointments</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingAppointments.map(apt => (
                <div key={apt.id} className="p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className="bg-blue-100 text-blue-700 border-0">
                      {getDateLabel(apt.date)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {apt.appointment_type}
                    </Badge>
                  </div>
                  <p className="font-semibold text-slate-800 mb-1">{apt.title}</p>
                  <p className="text-sm text-slate-600">{apt.time}</p>
                  {apt.provider_name && (
                    <p className="text-sm text-slate-500 mt-2">Dr. {apt.provider_name}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {careRecipients.length === 0 && (
        <Card className="border-orange-200 bg-orange-50/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Heart className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 mb-1">Get Started with FamilyCare.Help</h3>
                <p className="text-slate-600 text-sm mb-3">
                  Begin by adding a care recipient to start coordinating care for your loved one.
                </p>
                <Link to={createPageUrl('CareRecipients')}>
                  <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Add Care Recipient
                  </button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}