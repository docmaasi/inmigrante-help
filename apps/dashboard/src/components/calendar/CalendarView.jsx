import React, { useState, useCallback } from 'react';
import { useAppointments, useUpdateAppointment } from '@/hooks/use-appointments';
import { useTasks, useUpdateTask } from '@/hooks/use-tasks';
import { useMedications, useMedicationLogs } from '@/hooks/use-medications';
import { useCareRecipients } from '@/hooks/use-care-recipients';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  subWeeks,
} from 'date-fns';
import { toast } from 'sonner';
import AppointmentForm from '../appointments/AppointmentForm';
import TaskForm from '../tasks/TaskForm';
import { CalendarFilters } from './CalendarFilters';
import { CalendarGrid } from './CalendarGrid';
import { CalendarDayDetail } from './CalendarDayDetail';
import {
  getRecipientColorByIndex,
  getRecipientNameById,
  collectEventsForDate,
} from './calendar-events';

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [filterRecipient, setFilterRecipient] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const { data: appointments = [] } = useAppointments();
  const { data: tasks = [] } = useTasks();
  const { data: medicationLogs = [] } = useMedicationLogs();
  const { data: recipients = [] } = useCareRecipients();
  useMedications();

  const updateAppointmentMutation = useUpdateAppointment();
  const updateTaskMutation = useUpdateTask();

  const getRecipientColor = useCallback(
    (id) => getRecipientColorByIndex(recipients, id),
    [recipients]
  );

  const getRecipientName = useCallback(
    (id) => getRecipientNameById(recipients, id),
    [recipients]
  );

  const getEventsForDate = useCallback(
    (date) =>
      collectEventsForDate(date, {
        appointments,
        tasks,
        medicationLogs,
        filterRecipient,
        filterType,
        getRecipientColor,
      }),
    [appointments, tasks, medicationLogs, filterRecipient, filterType, getRecipientColor]
  );

  const getViewDays = () => {
    if (viewMode === 'day') return [currentDate];
    if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate);
      return eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });
    }
    const monthStart = startOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(endOfMonth(currentDate));
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
    const apt = draggedEvent.event.data;
    updateAppointmentMutation.mutate(
      { id: apt.id, start_time: `${newDateStr}T${apt.start_time?.split('T')[1] || '09:00:00'}` },
      {
        onSuccess: () => toast.success('Appointment rescheduled successfully'),
        onError: () => toast.error('Failed to reschedule appointment'),
      }
    );
    setDraggedEvent(null);
  };

  const handleAppointmentStatus = (appointmentId, status) => {
    updateAppointmentMutation.mutate(
      { id: appointmentId, status },
      {
        onSuccess: () => toast.success('Appointment status updated'),
        onError: () => toast.error('Failed to update appointment status'),
      }
    );
  };

  const handleTaskComplete = (task) => {
    updateTaskMutation.mutate(
      { id: task.id, status: 'completed', completed_at: new Date().toISOString() },
      {
        onSuccess: () => toast.success('Task completed'),
        onError: () => toast.error('Failed to complete task'),
      }
    );
  };

  return (
    <div className="space-y-6">
      <CalendarFilters
        viewMode={viewMode}
        setViewMode={setViewMode}
        filterRecipient={filterRecipient}
        setFilterRecipient={setFilterRecipient}
        filterType={filterType}
        setFilterType={setFilterType}
        recipients={recipients}
        getRecipientColor={getRecipientColor}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CalendarGrid
          currentDate={currentDate}
          viewMode={viewMode}
          calendarDays={getViewDays()}
          selectedDate={selectedDate}
          getEventsForDate={getEventsForDate}
          onSelectDate={setSelectedDate}
          onNavigate={navigateDate}
          onSetToday={() => setCurrentDate(new Date())}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />

        <CalendarDayDetail
          selectedDate={selectedDate}
          events={getEventsForDate(selectedDate)}
          getRecipientName={getRecipientName}
          onEditAppointment={setEditingAppointment}
          onEditTask={setEditingTask}
          onCompleteAppointment={(id) => handleAppointmentStatus(id, 'completed')}
          onCancelAppointment={(id) => handleAppointmentStatus(id, 'cancelled')}
          onCompleteTask={handleTaskComplete}
          isUpdating={updateAppointmentMutation.isPending || updateTaskMutation.isPending}
        />
      </div>

      {editingAppointment && (
        <AppointmentForm
          appointment={editingAppointment}
          recipients={recipients}
          onClose={() => setEditingAppointment(null)}
        />
      )}
      {editingTask && (
        <TaskForm
          task={editingTask}
          recipients={recipients}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}

export default CalendarView;
