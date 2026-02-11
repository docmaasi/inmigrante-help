import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Pill, ListTodo, Clock, CheckCircle2, AlertCircle, Settings, Eye, UserCheck, Bell } from 'lucide-react';
import { format, isToday, parseISO, isPast } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import {
  useAppointments,
  useMedications,
  useTasks,
  useCareRecipients,
  useNotifications,
  useUpdateTask
} from '@/hooks';
import CaregiverDashboardWidget from '../components/dashboard/CaregiverDashboardWidget';
import AssignedTasksSummary from '../components/dashboard/AssignedTasksSummary';
import ImportantAlerts from '../components/dashboard/ImportantAlerts';
import NotificationsWidget from '../components/dashboard/NotificationsWidget';
import HiddenWidgets from '../components/dashboard/HiddenWidgets';
import useWidgetManager from '../components/dashboard/WidgetManager';
import TaskCompletionModal from '../components/tasks/TaskCompletionModal';

export default function Today() {
  const [showCustomize, setShowCustomize] = useState(false);
  const [completingTask, setCompletingTask] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const widgetManager = useWidgetManager(user ? { ...user, ...profile } : null);

  const { data: appointments = [] } = useAppointments();
  const { data: medications = [] } = useMedications();
  const { data: tasks = [] } = useTasks();
  const { data: recipients = [] } = useCareRecipients();
  const { data: notifications = [] } = useNotifications();

  const updateTaskMutation = useUpdateTask();

  const todayAppointments = useMemo(() =>
    appointments.filter(apt =>
      apt.date && isToday(parseISO(apt.date)) && apt.status !== 'completed'
    ), [appointments]);

  const todayTasks = useMemo(() =>
    tasks.filter(task =>
      task.due_date && isToday(parseISO(task.due_date)) && task.status !== 'completed'
    ), [tasks]);

  const overdueTasks = useMemo(() =>
    tasks.filter(task =>
      task.due_date && isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date)) && task.status !== 'completed'
    ), [tasks]);

  const activeMedications = useMemo(() =>
    medications.filter(med => med.is_active !== false), [medications]);

  const unreadNotifications = useMemo(() =>
    notifications.filter(n => !n.is_read), [notifications]);

  const getRecipientName = (id) => {
    const recipient = recipients.find(r => r.id === id);
    if (!recipient) return 'Unknown';
    return `${recipient.first_name} ${recipient.last_name}`.trim() || 'Unknown';
  };

  const completeTask = (notes) => {
    if (completingTask) {
      updateTaskMutation.mutate(
        {
          id: completingTask.id,
          status: 'completed',
          completion_notes: notes
        },
        {
          onSuccess: () => {
            toast.success('Task updated');
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

  const userName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              {greeting()}, {userName}
            </h1>
            <p className="text-slate-700 mt-1">Here's what needs attention today</p>
            <p className="text-sm text-slate-600">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomize(!showCustomize)}
            className="flex items-center gap-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            {showCustomize ? <Eye className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
            {showCustomize ? 'Done' : 'Customize'}
          </Button>
        </div>

        {showCustomize && (
          <Card className="mb-6 bg-teal-50 border-teal-200">
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
          <Card className="shadow-sm border-slate-200 cursor-pointer hover:border-teal-300 transition-colors" onClick={() => navigate('/Appointments')}>
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 text-teal-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">{todayAppointments.length}</div>
              <div className="text-xs text-slate-500">Appointments</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-slate-200 cursor-pointer hover:border-blue-300 transition-colors" onClick={() => navigate('/Tasks')}>
            <CardContent className="p-4 text-center">
              <ListTodo className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">{todayTasks.length}</div>
              <div className="text-xs text-slate-500">Tasks Due</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-slate-200 cursor-pointer hover:border-amber-300 transition-colors" onClick={() => navigate('/Tasks')}>
            <CardContent className="p-4 text-center">
              <AlertCircle className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">{overdueTasks.length}</div>
              <div className="text-xs text-slate-500">Overdue</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-slate-200 cursor-pointer hover:border-green-300 transition-colors" onClick={() => navigate('/Medications')}>
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
                  title={`${widget.title} (${unreadNotifications.length})`}
                  icon={widget.icon}
                  isPinned={widgetManager.config[widget.id]?.pinned}
                  onPin={() => widgetManager.pinWidget(widget.id)}
                  onHide={() => widgetManager.hideWidget(widget.id)}
                >
                  <NotificationsWidget notifications={unreadNotifications} />
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
                          <div key={`apt-${apt.id}`} className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg">
                            <Clock className="w-5 h-5 text-teal-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-slate-800">{apt.title}</div>
                              <div className="text-sm text-slate-600">
                                {getRecipientName(apt.care_recipient_id)}
                                {apt.time && ` • ${apt.time}`}
                              </div>
                            </div>
                            <Badge className="bg-teal-100 text-teal-700 text-xs">{apt.appointment_type}</Badge>
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
