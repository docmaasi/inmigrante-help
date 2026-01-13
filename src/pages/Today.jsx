import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Pill, ListTodo, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { format, isToday, parseISO, isPast } from 'date-fns';
import { toast } from 'sonner';

export default function Today() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list('-date')
  });

  const { data: medications = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: () => base44.entities.Medication.list()
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-due_date')
  });

  const { data: recipients = [] } = useQuery({
    queryKey: ['careRecipients'],
    queryFn: () => base44.entities.CareRecipient.list()
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      toast.success('Task updated');
    }
  });

  const todayAppointments = appointments.filter(apt => 
    apt.date && isToday(parseISO(apt.date)) && apt.status !== 'completed'
  );

  const todayTasks = tasks.filter(task => 
    task.due_date && isToday(parseISO(task.due_date)) && task.status !== 'completed'
  );

  const overdueTasks = tasks.filter(task =>
    task.due_date && isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date)) && task.status !== 'completed'
  );

  const activeMedications = medications.filter(med => med.active);

  const getRecipientName = (id) => {
    return recipients.find(r => r.id === id)?.full_name || 'Unknown';
  };

  const completeTask = (task) => {
    updateTaskMutation.mutate({
      id: task.id,
      data: { ...task, status: 'completed' }
    });
  };

  const priorityColors = {
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700'
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            {greeting()}, {user?.full_name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-slate-600 mt-1">Here's what needs attention today</p>
          <p className="text-sm text-slate-500">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="shadow-sm border-slate-200/60">
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">{todayAppointments.length}</div>
              <div className="text-xs text-slate-500">Appointments</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-slate-200/60">
            <CardContent className="p-4 text-center">
              <ListTodo className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">{todayTasks.length}</div>
              <div className="text-xs text-slate-500">Tasks Due</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-slate-200/60">
            <CardContent className="p-4 text-center">
              <Pill className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">{activeMedications.length}</div>
              <div className="text-xs text-slate-500">Medications</div>
            </CardContent>
          </Card>
        </div>

        {/* Overdue Alert */}
        {overdueTasks.length > 0 && (
          <Card className="mb-6 bg-red-50 border-red-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-900">
                  {overdueTasks.length} overdue task{overdueTasks.length !== 1 ? 's' : ''}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Appointments */}
        <Card className="mb-6 shadow-sm border-slate-200/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Today's Appointments ({todayAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No appointments today</p>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map(apt => (
                  <div key={apt.id} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <div className="flex-1">
                      <div className="font-medium text-slate-800">{apt.title}</div>
                      <div className="text-sm text-slate-600">
                        {getRecipientName(apt.care_recipient_id)}
                        {apt.time && ` • ${apt.time}`}
                        {apt.location && ` • ${apt.location}`}
                      </div>
                    </div>
                    <Badge className="bg-purple-100 text-purple-700">{apt.appointment_type}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Tasks */}
        <Card className="mb-6 shadow-sm border-slate-200/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-blue-600" />
              Today's Tasks ({todayTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayTasks.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No tasks due today</p>
            ) : (
              <div className="space-y-3">
                {todayTasks.map(task => (
                  <div key={task.id} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <button
                      onClick={() => completeTask(task)}
                      className="mt-1 text-blue-600 hover:text-blue-700"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                      <div className="font-medium text-slate-800">{task.title}</div>
                      <div className="text-sm text-slate-600">
                        {getRecipientName(task.care_recipient_id)}
                        {task.assigned_to && ` • Assigned to ${task.assigned_to}`}
                      </div>
                      {task.description && (
                        <p className="text-xs text-slate-500 mt-1">{task.description}</p>
                      )}
                    </div>
                    <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Medications */}
        <Card className="shadow-sm border-slate-200/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-green-600" />
              Medications to Administer ({activeMedications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeMedications.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No active medications</p>
            ) : (
              <div className="space-y-3">
                {activeMedications.map(med => (
                  <div key={med.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Pill className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium text-slate-800">{med.medication_name}</div>
                      <div className="text-sm text-slate-600">
                        {getRecipientName(med.care_recipient_id)} • {med.dosage}
                        {med.time_of_day && ` • ${med.time_of_day}`}
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700">{med.frequency}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}