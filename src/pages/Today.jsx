import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Pill, ListTodo, Clock, CheckCircle2, AlertCircle, Settings, Eye, UserCheck, Bell } from 'lucide-react';
import { format, isToday, parseISO, isPast } from 'date-fns';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import CaregiverDashboardWidget from '../components/dashboard/CaregiverDashboardWidget';
import AssignedTasksSummary from '../components/dashboard/AssignedTasksSummary';
import ImportantAlerts from '../components/dashboard/ImportantAlerts';
import NotificationsWidget from '../components/dashboard/NotificationsWidget';
import HiddenWidgets from '../components/dashboard/HiddenWidgets';
import useWidgetManager from '../components/dashboard/WidgetManager';
import TaskCompletionModal from '../components/tasks/TaskCompletionModal';

export default function Today() {
  const [user, setUser] = useState(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [completingTask, setCompletingTask] = useState(null);
  const queryClient = useQueryClient();
  const widgetManager = useWidgetManager(user);

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

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => user ? base44.entities.Notification.filter({ user_email: user.email, read: false }) : [],
    enabled: !!user
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

  const completeTask = (notes) => {
    if (completingTask) {
      updateTaskMutation.mutate(
        {
          id: completingTask.id,
          data: { status: 'completed', completion_notes: notes }
        },
        {
          onSuccess: () => {
            setCompletingTask(null);
          }
        }
      );
    }
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

  const widgets = [
    { id: 'notifications', title: 'Notifications', icon: Bell },
    { id: 'todaySchedule', title: "Today's Schedule", icon: Calendar },
    { id: 'urgentTasks', title: 'Urgent & Overdue', icon: AlertCircle },
    { id: 'importantAlerts', title: 'Important Alerts', icon: AlertCircle },
    { id: 'assignedTasks', title: 'My Assigned Tasks', icon: UserCheck },
    { id: 'medications', title: 'Medications', icon: Pill }
  ].filter(w => widgetManager.config[w.id]?.visible !== false)
   .sort((a, b) => (widgetManager.config[a.id]?.order || 999) - (widgetManager.config[b.id]?.order || 999));

  return (
    <div className="min-h-screen relative p-4 md:p-8">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ 
          backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/2b8d6ca55_Untitleddesign18.png)'
        }}
      />
      <div className="max-w-6xl mx-auto relative">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              {greeting()}, {user?.full_name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-slate-700 mt-1">Here's what needs attention today</p>
            <p className="text-sm text-slate-600">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowCustomize(!showCustomize)}
            className="flex items-center gap-2"
          >
            {showCustomize ? <Eye className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
            {showCustomize ? 'Done' : 'Customize'}
          </Button>
        </div>

        {showCustomize && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <HiddenWidgets 
                config={widgetManager.config}
                onShow={widgetManager.showWidget}
              />
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
              <AlertCircle className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">{overdueTasks.length}</div>
              <div className="text-xs text-slate-500">Overdue</div>
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

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {widgets.map(widget => {
            if (widget.id === 'notifications') {
              return (
                <CaregiverDashboardWidget
                  key={widget.id}
                  widgetId={widget.id}
                  title={`${widget.title} (${notifications.length})`}
                  icon={widget.icon}
                  isPinned={widgetManager.config[widget.id]?.pinned}
                  onPin={() => widgetManager.pinWidget(widget.id)}
                  onHide={() => widgetManager.hideWidget(widget.id)}
                >
                  <NotificationsWidget notifications={notifications} />
                </CaregiverDashboardWidget>
              );
            }
            
            if (widget.id === 'todaySchedule') {
              return (
                <CaregiverDashboardWidget
                  key={widget.id}
                  widgetId={widget.id}
                  title={`${widget.title} (${todayAppointments.length + todayTasks.length})`}
                  icon={widget.icon}
                  isPinned={widgetManager.config[widget.id]?.pinned}
                  onPin={() => widgetManager.pinWidget(widget.id)}
                  onHide={() => widgetManager.hideWidget(widget.id)}
                >
                  <div className="space-y-3">
                    {todayAppointments.length === 0 && todayTasks.length === 0 ? (
                      <p className="text-slate-500 text-sm text-center py-4">No appointments or tasks scheduled for today</p>
                    ) : (
                      <>
                        {todayAppointments.map(apt => (
                          <div key={`apt-${apt.id}`} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                            <Clock className="w-5 h-5 text-purple-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-slate-800">{apt.title}</div>
                              <div className="text-sm text-slate-600">
                                {getRecipientName(apt.care_recipient_id)}
                                {apt.time && ` • ${apt.time}`}
                              </div>
                            </div>
                            <Badge className="bg-purple-100 text-purple-700 text-xs">{apt.appointment_type}</Badge>
                          </div>
                        ))}
                        {todayTasks.map(task => (
                          <div key={`task-${task.id}`} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                            <button
                              onClick={() => setCompletingTask(task)}
                              className="mt-1 text-blue-600 hover:text-blue-700"
                            >
                              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-slate-800">{task.title}</div>
                              <div className="text-sm text-slate-600">
                                {getRecipientName(task.care_recipient_id)}
                              </div>
                            </div>
                            <Badge className={`${priorityColors[task.priority]} text-xs`}>{task.priority}</Badge>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </CaregiverDashboardWidget>
              );
            }
            
            if (widget.id === 'urgentTasks') {
              return (
                <CaregiverDashboardWidget
                  key={widget.id}
                  widgetId={widget.id}
                  title={`${widget.title} (${overdueTasks.length})`}
                  icon={widget.icon}
                  isPinned={widgetManager.config[widget.id]?.pinned}
                  onPin={() => widgetManager.pinWidget(widget.id)}
                  onHide={() => widgetManager.hideWidget(widget.id)}
                >
                  {overdueTasks.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4">No overdue tasks</p>
                  ) : (
                    <div className="space-y-2">
                      {overdueTasks.map(task => (
                        <div key={task.id} className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-800">{task.title}</div>
                            <div className="text-sm text-red-700">
                              Due: {format(parseISO(task.due_date), 'MMM d')} • {getRecipientName(task.care_recipient_id)}
                            </div>
                          </div>
                          <Badge className="bg-red-600 text-white text-xs">{task.priority}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CaregiverDashboardWidget>
              );
            }

            if (widget.id === 'importantAlerts') {
              return (
                <CaregiverDashboardWidget
                  key={widget.id}
                  widgetId={widget.id}
                  title={widget.title}
                  icon={widget.icon}
                  isPinned={widgetManager.config[widget.id]?.pinned}
                  onPin={() => widgetManager.pinWidget(widget.id)}
                  onHide={() => widgetManager.hideWidget(widget.id)}
                >
                  <ImportantAlerts 
                    tasks={tasks}
                    appointments={appointments}
                    medications={medications}
                    recipients={recipients}
                  />
                </CaregiverDashboardWidget>
              );
            }

            if (widget.id === 'assignedTasks') {
              return (
                <CaregiverDashboardWidget
                  key={widget.id}
                  widgetId={widget.id}
                  title={widget.title}
                  icon={widget.icon}
                  isPinned={widgetManager.config[widget.id]?.pinned}
                  onPin={() => widgetManager.pinWidget(widget.id)}
                  onHide={() => widgetManager.hideWidget(widget.id)}
                >
                  <AssignedTasksSummary 
                    tasks={tasks}
                    userEmail={user?.email}
                    recipients={recipients}
                  />
                </CaregiverDashboardWidget>
              );
            }

            if (widget.id === 'medications') {
              return (
                <CaregiverDashboardWidget
                  key={widget.id}
                  widgetId={widget.id}
                  title={`${widget.title} (${activeMedications.length})`}
                  icon={widget.icon}
                  isPinned={widgetManager.config[widget.id]?.pinned}
                  onPin={() => widgetManager.pinWidget(widget.id)}
                  onHide={() => widgetManager.hideWidget(widget.id)}
                >
                  <div className="space-y-2">
                    {activeMedications.length === 0 ? (
                      <p className="text-slate-500 text-sm text-center py-4">No active medications</p>
                    ) : (
                      <>
                        {activeMedications.map(med => (
                          <div key={med.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <Pill className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-slate-800">{med.medication_name}</div>
                              <div className="text-sm text-slate-600">
                                {getRecipientName(med.care_recipient_id)} • {med.dosage}
                                {med.time_of_day && ` • ${med.time_of_day}`}
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-700 text-xs whitespace-nowrap">{med.frequency}</Badge>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </CaregiverDashboardWidget>
              );
            }

            return null;
          })}
        </div>

        {/* Completion Modal */}
        <TaskCompletionModal
          isOpen={!!completingTask}
          onClose={() => setCompletingTask(null)}
          onComplete={completeTask}
          task={completingTask}
          isLoading={updateTaskMutation.isPending}
        />
      </div>
    </div>
  );
}