import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppointments, useUpdateAppointment } from '@/hooks/use-appointments';
import { useTasks, useUpdateTask } from '@/hooks/use-tasks';
import { useMedications, useMedicationLogs } from '@/hooks/use-medications';
import { useCareRecipients } from '@/hooks/use-care-recipients';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Pill, CheckSquare, User, Filter, CheckCircle2, AlertCircle, Clock, Edit } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { toast } from 'sonner';
import AppointmentForm from '../appointments/AppointmentForm';
import TaskForm from '../tasks/TaskForm';

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [filterRecipient, setFilterRecipient] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const queryClient = useQueryClient();

  const { data: appointments = [] } = useAppointments();
  const { data: tasks = [] } = useTasks();
  const { data: medications = [] } = useMedications();
  const { data: medicationLogs = [] } = useMedicationLogs();
  const { data: recipients = [] } = useCareRecipients();

  const updateAppointmentMutation = useUpdateAppointment();
  const updateTaskMutation = useUpdateTask();

  const recipientColors = [
    'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500',
    'bg-cyan-500', 'bg-teal-500', 'bg-emerald-500', 'bg-lime-500',
    'bg-amber-500', 'bg-orange-500', 'bg-rose-500', 'bg-fuchsia-500'
  ];

  const getRecipientColor = (recipientId) => {
    const index = recipients.findIndex(r => r.id === recipientId);
    return index !== -1 ? recipientColors[index % recipientColors.length] : 'bg-slate-500';
  };

  const getRecipientName = (id) => {
    const recipient = recipients.find(r => r.id === id);
    return recipient ? `${recipient.first_name} ${recipient.last_name}` : 'Unknown';
  };

  const getEventsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const events = [];

    appointments.forEach(apt => {
      const aptDate = apt.start_time ? format(new Date(apt.start_time), 'yyyy-MM-dd') : apt.date;
      if (aptDate === dateStr) {
        if (filterRecipient !== 'all' && apt.care_recipient_id !== filterRecipient) return;
        if (filterType !== 'all' && filterType !== 'appointment') return;

        events.push({
          type: 'appointment',
          title: apt.title,
          time: apt.start_time ? format(new Date(apt.start_time), 'HH:mm') : apt.time,
          color: getRecipientColor(apt.care_recipient_id),
          data: apt,
          draggable: true
        });
      }
    });

    if (filterType === 'all' || filterType === 'task') {
      tasks.forEach(task => {
        if (task.due_date === dateStr && task.status !== 'completed') {
          if (filterRecipient !== 'all' && task.care_recipient_id !== filterRecipient) return;

          events.push({
            type: 'task',
            title: task.title,
            color: task.priority === 'urgent' ? 'bg-red-500' : task.priority === 'high' ? 'bg-orange-500' : 'bg-purple-500',
            data: task,
            draggable: false
          });
        }
      });
    }

    if (filterType === 'all' || filterType === 'medication') {
      medicationLogs.forEach(log => {
        const logDate = log.scheduled_time ? format(new Date(log.scheduled_time), 'yyyy-MM-dd') : log.date_taken;
        if (logDate === dateStr) {
          if (filterRecipient !== 'all' && log.care_recipient_id !== filterRecipient) return;

          events.push({
            type: 'medication',
            title: log.medications?.name || 'Medication',
            time: log.scheduled_time ? format(new Date(log.scheduled_time), 'HH:mm') : log.time_taken,
            color: log.status === 'taken' ? 'bg-green-500' : log.status === 'skipped' ? 'bg-yellow-500' : 'bg-slate-400',
            data: log,
            draggable: false
          });
        }
      });
    }

    return events;
  };

  const handleDragStart = (e, event, date) => {
    if (!event.draggable) return;
    setDraggedEvent({ event, originalDate: date });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newDate) => {
    e.preventDefault();
    if (!draggedEvent || draggedEvent.event.type !== 'appointment') return;

    const newDateStr = format(newDate, 'yyyy-MM-dd');
    const appointment = draggedEvent.event.data;

    updateAppointmentMutation.mutate(
      { id: appointment.id, start_time: `${newDateStr}T${appointment.start_time?.split('T')[1] || '09:00:00'}` },
      {
        onSuccess: () => toast.success('Appointment rescheduled successfully'),
        onError: () => toast.error('Failed to reschedule appointment')
      }
    );

    setDraggedEvent(null);
  };

  const getViewDays = () => {
    if (viewMode === 'day') {
      return [currentDate];
    }
    if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate);
      return eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });
    }
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  const navigateDate = (direction) => {
    if (viewMode === 'day') {
      setCurrentDate(direction === 'prev' ? addDays(currentDate, -1) : addDays(currentDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
    } else {
      setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    }
  };

  const handleAppointmentStatusUpdate = (appointmentId, status) => {
    updateAppointmentMutation.mutate(
      { id: appointmentId, status },
      {
        onSuccess: () => toast.success('Appointment status updated'),
        onError: () => toast.error('Failed to update appointment status')
      }
    );
  };

  const handleTaskComplete = (task) => {
    updateTaskMutation.mutate(
      { id: task.id, status: 'completed', completed_at: new Date().toISOString() },
      {
        onSuccess: () => toast.success('Task completed'),
        onError: () => toast.error('Failed to complete task')
      }
    );
  };

  const calendarDays = getViewDays();
  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">View:</span>
              <div className="flex gap-1">
                {['day', 'week', 'month'].map(mode => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode(mode)}
                    className="capitalize"
                  >
                    {mode}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Care Recipient:</span>
              <Select value={filterRecipient} onValueChange={setFilterRecipient}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Recipients</SelectItem>
                  {recipients.map(recipient => (
                    <SelectItem key={recipient.id} value={recipient.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getRecipientColor(recipient.id)}`} />
                        {recipient.first_name} {recipient.last_name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Type:</span>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="appointment">Appointments</SelectItem>
                  <SelectItem value="task">Tasks</SelectItem>
                  <SelectItem value="medication">Medications</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {recipients.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-xs font-medium text-slate-600 mb-2">Care Recipients:</p>
              <div className="flex flex-wrap gap-3">
                {recipients.map(recipient => (
                  <div key={recipient.id} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${getRecipientColor(recipient.id)}`} />
                    <span className="text-xs text-slate-600">{recipient.first_name} {recipient.last_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                {viewMode === 'day' && format(currentDate, 'MMMM d, yyyy')}
                {viewMode === 'week' && `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}`}
                {viewMode === 'month' && format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {viewMode !== 'day' && (
              <div className={`grid gap-2 mb-2 ${viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-7'}`}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-slate-600 py-2">
                    {day}
                  </div>
                ))}
              </div>
            )}

            <div className={`grid gap-2 ${viewMode === 'day' ? 'grid-cols-1' : viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-7'}`}>
              {calendarDays.map(day => {
                const events = getEventsForDate(day);
                const isCurrentMonth = viewMode === 'month' ? isSameMonth(day, currentDate) : true;
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={day.toString()}
                    onClick={() => setSelectedDate(day)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, day)}
                    className={`${viewMode === 'day' ? 'min-h-[400px]' : 'min-h-[80px]'} p-2 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300 shadow-md'
                        : isToday
                        ? 'bg-orange-50 border-orange-300'
                        : isCurrentMonth
                        ? 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                        : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isToday ? 'text-orange-600' : isCurrentMonth ? 'text-slate-800' : 'text-slate-400'
                    }`}>
                      {viewMode === 'day' ? format(day, 'EEEE, MMMM d') : format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {events.slice(0, viewMode === 'day' ? 20 : 2).map((event, idx) => (
                        <div
                          key={idx}
                          draggable={event.draggable}
                          onDragStart={(e) => handleDragStart(e, event, day)}
                          className={`text-xs px-2 py-1 rounded text-white truncate ${event.color} ${
                            event.draggable ? 'cursor-move hover:opacity-80' : ''
                          }`}
                          title={event.draggable ? 'Drag to reschedule' : ''}
                        >
                          {event.time || ''} {event.title}
                        </div>
                      ))}
                      {events.length > (viewMode === 'day' ? 20 : 2) && (
                        <div className="text-xs text-slate-500 px-1">
                          +{events.length - (viewMode === 'day' ? 20 : 2)} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                {format(selectedDate, 'MMMM d, yyyy')}
              </h3>
              <p className="text-sm text-slate-500">
                {selectedDateEvents.length} {selectedDateEvents.length === 1 ? 'event' : 'events'}
              </p>
            </div>

            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No events on this day</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((event, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-white hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${event.color}`}>
                        {event.type === 'appointment' && <CalendarIcon className="w-4 h-4 text-white" />}
                        {event.type === 'task' && <CheckSquare className="w-4 h-4 text-white" />}
                        {event.type === 'medication' && <Pill className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 text-sm">{event.title}</p>
                        {event.time && (
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.time}
                          </p>
                        )}
                        {event.data.care_recipient_id && (
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {getRecipientName(event.data.care_recipient_id)}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge className="text-xs" variant="outline">
                            {event.type}
                          </Badge>
                          {event.type === 'appointment' && event.data.status && (
                            <Badge className={`text-xs ${
                              event.data.status === 'completed' ? 'bg-green-100 text-green-700' :
                              event.data.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {event.data.status}
                            </Badge>
                          )}
                          {event.type === 'task' && event.data.status && (
                            <Badge className={`text-xs ${
                              event.data.status === 'completed' ? 'bg-green-100 text-green-700' :
                              event.data.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {event.data.status}
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          {event.type === 'appointment' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingAppointment(event.data)}
                                className="text-xs h-7"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                              {event.data.status !== 'completed' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAppointmentStatusUpdate(event.data.id, 'completed')}
                                  className="text-xs h-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  disabled={updateAppointmentMutation.isPending}
                                >
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Complete
                                </Button>
                              )}
                              {event.data.status !== 'cancelled' && event.data.status !== 'completed' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAppointmentStatusUpdate(event.data.id, 'cancelled')}
                                  className="text-xs h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  disabled={updateAppointmentMutation.isPending}
                                >
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Cancel
                                </Button>
                              )}
                            </>
                          )}
                          {event.type === 'task' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingTask(event.data)}
                                className="text-xs h-7"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                              {event.data.status !== 'completed' && event.data.status !== 'cancelled' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleTaskComplete(event.data)}
                                  className="text-xs h-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  disabled={updateTaskMutation.isPending}
                                >
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Complete
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                        {event.draggable && (
                          <span className="text-xs text-slate-400 italic mt-2 block">Drag to reschedule</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {editingAppointment && (
        <AppointmentForm
          appointment={editingAppointment}
          onClose={() => setEditingAppointment(null)}
        />
      )}
      {editingTask && (
        <TaskForm
          task={editingTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}

export default CalendarView;
