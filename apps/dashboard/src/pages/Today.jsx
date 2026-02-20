import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Pill, ListTodo, AlertCircle, Settings, Eye, Bell, UserCheck } from 'lucide-react';
import { format, isToday, parseISO, isPast } from 'date-fns';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth-context';
import {
  useAppointments,
  useMedications,
  useTasks,
  useCareRecipients,
  useNotifications,
  useUpdateTask
} from '@/hooks';
import HiddenWidgets from '../components/dashboard/HiddenWidgets';
import useWidgetManager from '../components/dashboard/WidgetManager';
import TaskCompletionModal from '../components/tasks/TaskCompletionModal';
import UserPreferences from '../components/dashboard/UserPreferences';
import TodayWidgetsGrid from '../components/dashboard/TodayWidgetsGrid';

const TIME_FORMAT_KEY = 'familycare_time_format';

function formatTime(timeStr, timeFormat) {
  if (!timeStr || timeFormat === '24h') return timeStr;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return timeStr;
  const hours = parseInt(match[1], 10);
  const minutes = match[2];
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${h12}:${minutes} ${suffix}`;
}

export default function Today() {
  const [showCustomize, setShowCustomize] = useState(false);
  const [completingTask, setCompletingTask] = useState(null);
  const [timeFormat, setTimeFormat] = useState(
    () => localStorage.getItem(TIME_FORMAT_KEY) || '12h'
  );

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, profile, updateProfile } = useAuth();
  const widgetManager = useWidgetManager(user ? { ...user, ...profile } : null);

  const { data: appointments = [], isLoading: aptsLoading } = useAppointments();
  const { data: medications = [], isLoading: medsLoading } = useMedications();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: recipients = [] } = useCareRecipients();
  const { data: notifications = [] } = useNotifications();

  const isDataLoading = aptsLoading || medsLoading || tasksLoading;

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
        { id: completingTask.id, status: 'completed', completion_notes: notes },
        {
          onSuccess: () => {
            toast.success('Task updated');
            setCompletingTask(null);
          }
        }
      );
    }
  };

  const handleTimeFormatChange = (newFormat) => {
    setTimeFormat(newFormat);
    localStorage.setItem(TIME_FORMAT_KEY, newFormat);
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
              <UserPreferences
                profile={profile}
                updateProfile={updateProfile}
                timeFormat={timeFormat}
                onTimeFormatChange={handleTimeFormatChange}
              />
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
              {isDataLoading ? <Skeleton className="h-8 w-8 mx-auto mb-1" /> : (
                <div className="text-2xl font-bold text-slate-800">{todayAppointments.length}</div>
              )}
              <div className="text-xs text-slate-500">Appointments</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-slate-200 cursor-pointer hover:border-blue-300 transition-colors" onClick={() => navigate('/Tasks')}>
            <CardContent className="p-4 text-center">
              <ListTodo className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              {isDataLoading ? <Skeleton className="h-8 w-8 mx-auto mb-1" /> : (
                <div className="text-2xl font-bold text-slate-800">{todayTasks.length}</div>
              )}
              <div className="text-xs text-slate-500">Tasks Due</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-slate-200 cursor-pointer hover:border-amber-300 transition-colors" onClick={() => navigate('/Tasks')}>
            <CardContent className="p-4 text-center">
              <AlertCircle className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              {isDataLoading ? <Skeleton className="h-8 w-8 mx-auto mb-1" /> : (
                <div className="text-2xl font-bold text-slate-800">{overdueTasks.length}</div>
              )}
              <div className="text-xs text-slate-500">Overdue</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-slate-200 cursor-pointer hover:border-green-300 transition-colors" onClick={() => navigate('/Medications')}>
            <CardContent className="p-4 text-center">
              <Pill className="w-6 h-6 text-green-600 mx-auto mb-2" />
              {isDataLoading ? <Skeleton className="h-8 w-8 mx-auto mb-1" /> : (
                <div className="text-2xl font-bold text-slate-800">{activeMedications.length}</div>
              )}
              <div className="text-xs text-slate-500">Medications</div>
            </CardContent>
          </Card>
        </div>

        <TodayWidgetsGrid
          widgets={widgets}
          widgetManager={widgetManager}
          unreadNotifications={unreadNotifications}
          todayAppointments={todayAppointments}
          todayTasks={todayTasks}
          overdueTasks={overdueTasks}
          activeMedications={activeMedications}
          tasks={tasks}
          appointments={appointments}
          medications={medications}
          recipients={recipients}
          setCompletingTask={setCompletingTask}
          priorityColors={priorityColors}
          getRecipientName={getRecipientName}
          formatTime={(t) => formatTime(t, timeFormat)}
          userEmail={user?.email}
        />

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
