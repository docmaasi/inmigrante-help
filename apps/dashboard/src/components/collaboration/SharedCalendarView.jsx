import React, { useState } from 'react';
import { useAppointments, useTasks, useTeamMembers } from '@/hooks';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { format, getDay, getDaysInMonth, startOfMonth } from 'date-fns';

export default function SharedCalendarView({ careRecipientId }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: appointments = [] } = useAppointments({
    careRecipientId,
    status: 'scheduled'
  });

  const { data: tasks = [] } = useTasks({
    careRecipientId,
    status: 'pending'
  });

  const { data: teamMembers = [] } = useTeamMembers();

  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();
  const monthStart = startOfMonth(selectedDate);
  const daysInMonth = getDaysInMonth(selectedDate);
  const startDay = getDay(monthStart);

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentYear, currentMonth, i));
  }

  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateStr = format(date, 'yyyy-MM-dd');

    const aptEvents = appointments
      .filter(a => {
        const aptDate = a.start_time ? format(new Date(a.start_time), 'yyyy-MM-dd') : a.date;
        return aptDate === dateStr;
      })
      .map(a => ({
        type: 'appointment',
        title: a.title,
        icon: <Calendar className="w-3 h-3" />,
        color: 'bg-blue-100 text-blue-800'
      }));

    const taskEvents = tasks
      .filter(t => t.due_date === dateStr)
      .map(t => ({
        type: 'task',
        title: t.title,
        icon: <CheckCircle2 className="w-3 h-3" />,
        color: 'bg-purple-100 text-purple-800'
      }));

    return [...aptEvents, ...taskEvents];
  };

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedDateEvents = getEventsForDate(selectedDate);

  const getAssignedMemberName = (assignedTo) => {
    if (!assignedTo) return null;
    const member = teamMembers.find(m => m.id === assignedTo || m.user_email === assignedTo);
    return member?.full_name || assignedTo;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Team Calendar</h3>
          <div className="flex gap-2 text-sm">
            <button
              onClick={() => setSelectedDate(new Date(currentYear, currentMonth - 1))}
              className="px-2 py-1 hover:bg-slate-100 rounded"
            >
              &larr; Prev
            </button>
            <span className="px-3 py-1">{format(selectedDate, 'MMMM yyyy')}</span>
            <button
              onClick={() => setSelectedDate(new Date(currentYear, currentMonth + 1))}
              className="px-2 py-1 hover:bg-slate-100 rounded"
            >
              Next &rarr;
            </button>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-7 gap-1 text-xs font-semibold text-slate-600 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center p-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              const events = day ? getEventsForDate(day) : [];
              const isSelected = day && format(day, 'yyyy-MM-dd') === selectedDateStr;

              return (
                <button
                  key={idx}
                  onClick={() => day && setSelectedDate(day)}
                  className={`aspect-square p-1 rounded text-xs font-medium transition-colors ${
                    day
                      ? isSelected
                        ? 'bg-blue-600 text-white'
                        : events.length > 0
                        ? 'bg-orange-50 text-slate-700 border border-orange-200'
                        : 'bg-white text-slate-700 hover:bg-slate-100'
                      : ''
                  }`}
                >
                  {day && (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div>{format(day, 'd')}</div>
                      {events.length > 0 && (
                        <div className="text-[9px] font-bold text-orange-600 mt-0.5">
                          {events.length} {events.length === 1 ? 'event' : 'events'}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {selectedDateEvents.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">
              Events for {format(selectedDate, 'MMM d, yyyy')}
            </p>
            {selectedDateEvents.map((event, idx) => {
              const entity = event.type === 'appointment'
                ? appointments.find(a => {
                    const aptDate = a.start_time ? format(new Date(a.start_time), 'yyyy-MM-dd') : a.date;
                    return a.title === event.title && aptDate === selectedDateStr;
                  })
                : tasks.find(t => t.title === event.title && t.due_date === selectedDateStr);

              return (
                <div key={idx} className={`flex items-start gap-2 p-2 rounded border ${event.color}`}>
                  <div className="mt-0.5">{event.icon}</div>
                  <div className="flex-1 text-xs">
                    <p className="font-medium">{event.title}</p>
                    {event.type === 'appointment' && entity?.start_time && (
                      <p className="text-opacity-70">
                        {format(new Date(entity.start_time), 'h:mm a')}
                      </p>
                    )}
                    {entity?.assigned_to && (
                      <p className="text-opacity-70">
                        Assigned to: {getAssignedMemberName(entity.assigned_to)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
