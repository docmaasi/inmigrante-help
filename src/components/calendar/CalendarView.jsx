import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Pill, CheckSquare, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list()
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list()
  });

  const { data: medications = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: () => base44.entities.Medication.list()
  });

  const { data: medicationLogs = [] } = useQuery({
    queryKey: ['medicationLogs'],
    queryFn: () => base44.entities.MedicationLog.list('-date_taken', 1000)
  });

  const { data: recipients = [] } = useQuery({
    queryKey: ['careRecipients'],
    queryFn: () => base44.entities.CareRecipient.list()
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getRecipientName = (id) => {
    return recipients.find(r => r.id === id)?.full_name || 'Unknown';
  };

  const getEventsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const events = [];

    // Add appointments
    appointments.forEach(apt => {
      if (apt.date === dateStr) {
        events.push({
          type: 'appointment',
          title: apt.title,
          time: apt.time,
          color: 'bg-blue-500',
          data: apt
        });
      }
    });

    // Add tasks
    tasks.forEach(task => {
      if (task.due_date === dateStr && task.status !== 'completed') {
        events.push({
          type: 'task',
          title: task.title,
          color: task.priority === 'urgent' ? 'bg-red-500' : task.priority === 'high' ? 'bg-orange-500' : 'bg-purple-500',
          data: task
        });
      }
    });

    // Add medication logs
    medicationLogs.forEach(log => {
      if (log.date_taken === dateStr) {
        events.push({
          type: 'medication',
          title: log.medication_name,
          time: log.time_taken,
          color: log.status === 'taken' ? 'bg-green-500' : log.status === 'skipped' ? 'bg-yellow-500' : 'bg-slate-400',
          data: log
        });
      }
    });

    return events;
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <Card className="lg:col-span-2">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-slate-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map(day => {
              const events = getEventsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[80px] p-2 rounded-lg border transition-all text-left ${
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
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {events.slice(0, 2).map((event, idx) => (
                      <div
                        key={idx}
                        className={`text-xs px-1 py-0.5 rounded text-white truncate ${event.color}`}
                      >
                        {event.time || ''} {event.title}
                      </div>
                    ))}
                    {events.length > 2 && (
                      <div className="text-xs text-slate-500 px-1">
                        +{events.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
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
                <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${event.color}`}>
                      {event.type === 'appointment' && <CalendarIcon className="w-4 h-4 text-white" />}
                      {event.type === 'task' && <CheckSquare className="w-4 h-4 text-white" />}
                      {event.type === 'medication' && <Pill className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 text-sm">{event.title}</p>
                      {event.time && (
                        <p className="text-xs text-slate-500 mt-0.5">{event.time}</p>
                      )}
                      {event.data.care_recipient_id && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {getRecipientName(event.data.care_recipient_id)}
                        </p>
                      )}
                      <Badge className="mt-2 text-xs" variant="outline">
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}