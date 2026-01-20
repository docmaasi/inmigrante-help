import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, getDaysInMonth, startOfMonth, getDay } from 'date-fns';

export default function ShiftCalendar({ careRecipientId }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: shifts = [] } = useQuery({
    queryKey: ['shifts', careRecipientId],
    queryFn: () => careRecipientId
      ? base44.entities.CaregiverShift.filter({ care_recipient_id: careRecipientId })
      : []
  });

  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();
  const monthStart = startOfMonth(selectedDate);
  const daysInMonth = getDaysInMonth(selectedDate);
  const startDay = getDay(monthStart);

  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(new Date(currentYear, currentMonth, i));

  const getShiftsForDate = (date) => {
    if (!date) return [];
    const dateStr = format(date, 'yyyy-MM-dd');
    return shifts.filter(shift => shift.start_date === dateStr && shift.status !== 'cancelled');
  };

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedDateShifts = getShiftsForDate(selectedDate);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Shift Calendar</h3>
            <div className="flex gap-2 text-sm">
              <button
                onClick={() => setSelectedDate(new Date(currentYear, currentMonth - 1))}
                className="px-2 py-1 hover:bg-slate-100 rounded"
              >
                ← Prev
              </button>
              <span className="px-3 py-1">{format(selectedDate, 'MMMM yyyy')}</span>
              <button
                onClick={() => setSelectedDate(new Date(currentYear, currentMonth + 1))}
                className="px-2 py-1 hover:bg-slate-100 rounded"
              >
                Next →
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-7 gap-1 text-xs font-semibold text-slate-600 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center p-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                const dayShifts = day ? getShiftsForDate(day) : [];
                const isSelected = day && format(day, 'yyyy-MM-dd') === selectedDateStr;

                return (
                  <button
                    key={idx}
                    onClick={() => day && setSelectedDate(day)}
                    className={`aspect-square p-1 rounded text-xs font-medium transition-colors ${
                      day
                        ? isSelected
                          ? 'bg-blue-600 text-white'
                          : dayShifts.length > 0
                          ? 'bg-green-50 text-slate-700 border border-green-200'
                          : 'bg-white text-slate-700 hover:bg-slate-100'
                        : ''
                    }`}
                  >
                    {day && (
                      <div className="flex flex-col items-center justify-center h-full">
                        <div>{format(day, 'd')}</div>
                        {dayShifts.length > 0 && (
                          <div className="text-[8px] font-bold text-green-600 mt-0.5">
                            {dayShifts.length} shift{dayShifts.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Shifts */}
          {selectedDateShifts.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">
                Shifts for {format(selectedDate, 'MMM d, yyyy')}
              </p>
              {selectedDateShifts.map(shift => (
                <div key={shift.id} className="p-3 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-800">{shift.caregiver_name}</p>
                      <p className="text-xs text-slate-600 mt-1">
                        {shift.start_time} - {shift.end_time}
                      </p>
                      {shift.notes && (
                        <p className="text-xs text-slate-500 mt-1">{shift.notes}</p>
                      )}
                    </div>
                    <Badge className={shift.recurring !== 'none' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'}>
                      {shift.recurring !== 'none' ? `Recurring (${shift.recurring})` : 'One-time'}
                    </Badge>
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