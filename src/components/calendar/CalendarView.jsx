import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Pill, CheckSquare } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
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

  const { data: recipients = [] } = useQuery({
    queryKey: ['careRecipients'],
    queryFn: () => base44.entities.CareRecipient.list()
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const events = [];

    appointments.forEach(apt => {
      if (apt.date === dateStr) {
        events.push({
          type: 'appointment',
          title: apt.title,
          time: apt.time,
          data: apt,
          color: 'blue'
        });
      }
    });

    tasks.forEach(task => {
      if (task.due_date === dateStr && task.status !== 'completed') {
        events.push({
          type: 'task',
          title: task.title,
          data: task,
          color: 'purple'
        });
      }
    });

    return events;
  };

  const getRecipientName = (id) => {
    return recipients.find(r => r.id === id)?.full_name || 'Unknown';
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border-slate-200/60">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentMonth(new Date());
                  setSelectedDate(new Date());
                }}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-slate-600 py-2">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map(day => {
              const events = getEventsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-20 p-2 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                      : isToday
                      ? 'bg-blue-50 border-blue-300 text-slate-800'
                      : isCurrentMonth
                      ? 'bg-white border-slate-200 hover:border-blue-300 text-slate-800'
                      : 'bg-slate-50 border-slate-100 text-slate-400'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${isSelected ? 'text-white' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {events.slice(0, 2).map((event, idx) => (
                      <div
                        key={idx}
                        className={`text-xs px-1 py-0.5 rounded truncate ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : event.color === 'blue'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {event.type === 'appointment' ? '📅' : '✓'} {event.title}
                      </div>
                    ))}
                    {events.length > 2 && (
                      <div className={`text-xs ${isSelected ? 'text-white/70' : 'text-slate-500'}`}>
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
      <Card className="shadow-sm border-slate-200/60">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {selectedDateEvents.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No events scheduled for this day</p>
          ) : (
            <div className="space-y-3">
              {selectedDateEvents.map((event, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className={`p-2 rounded-lg ${
                    event.type === 'appointment' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    {event.type === 'appointment' ? (
                      <CalendarIcon className="w-5 h-5 text-blue-600" />
                    ) : (
                      <CheckSquare className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 mb-1">{event.title}</h4>
                    {event.time && (
                      <p className="text-sm text-slate-600 mb-1">{event.time}</p>
                    )}
                    <p className="text-sm text-slate-500">
                      For: {getRecipientName(event.data.care_recipient_id)}
                    </p>
                    {event.data.location && (
                      <p className="text-sm text-slate-500">{event.data.location}</p>
                    )}
                  </div>
                  <Badge className={event.type === 'appointment' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}>
                    {event.type}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}