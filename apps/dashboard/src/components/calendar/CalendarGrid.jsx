import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import {
  format,
  isSameMonth,
  isSameDay,
  startOfWeek,
} from 'date-fns';

function DayCell({
  day,
  events,
  isCurrentMonth,
  isSelected,
  isToday,
  viewMode,
  onSelect,
  onDragOver,
  onDrop,
  onDragStart,
}) {
  const cellClass = isSelected
    ? 'bg-[#4F46E5]/10 border-[#4F46E5] shadow-md'
    : isToday
      ? 'bg-[#E07A5F]/10 border-[#E07A5F]'
      : isCurrentMonth
        ? 'bg-white border-[#E07A5F]/10 hover:border-[#4F46E5]/30 hover:shadow-sm'
        : 'bg-[#8B7EC8]/5 border-[#8B7EC8]/10 text-[#8B7EC8]/60';

  const dateClass = isToday
    ? 'text-[#E07A5F]'
    : isCurrentMonth
      ? 'text-[#4F46E5]/80'
      : 'text-[#8B7EC8]/50';

  return (
    <div
      onClick={() => onSelect(day)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, day)}
      className={`${viewMode === 'day' ? 'min-h-[400px]' : 'min-h-[80px]'} p-2 rounded-lg border transition-all cursor-pointer ${cellClass}`}
    >
      <div className={`text-sm font-medium mb-1 ${dateClass}`}>
        {viewMode === 'day' ? format(day, 'EEEE, MMMM d') : format(day, 'd')}
      </div>
      <div className="space-y-1">
        {events.slice(0, viewMode === 'day' ? 20 : 2).map((event, idx) => (
          <div
            key={idx}
            draggable={event.draggable}
            onDragStart={(e) => onDragStart(e, event, day)}
            className={`text-xs px-2 py-1 rounded text-white truncate ${event.color} ${
              event.draggable ? 'cursor-move hover:opacity-80' : ''
            }`}
            title={event.draggable ? 'Drag to reschedule' : ''}
          >
            {event.time || ''} {event.title}
          </div>
        ))}
        {events.length > (viewMode === 'day' ? 20 : 2) && (
          <div className="text-xs text-[#8B7EC8] px-1">
            +{events.length - (viewMode === 'day' ? 20 : 2)} more
          </div>
        )}
      </div>
    </div>
  );
}

export function CalendarGrid({
  currentDate,
  viewMode,
  calendarDays,
  selectedDate,
  getEventsForDate,
  onSelectDate,
  onNavigate,
  onSetToday,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  const heading =
    viewMode === 'day'
      ? format(currentDate, 'MMMM d, yyyy')
      : viewMode === 'week'
        ? `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}`
        : format(currentDate, 'MMMM yyyy');

  return (
    <Card className="lg:col-span-2 border-[#E07A5F]/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#4F46E5]">{heading}</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('prev')}
              className="border-[#4F46E5]/30 text-[#4F46E5] hover:bg-[#4F46E5]/10"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onSetToday}
              className="border-[#4F46E5]/30 text-[#4F46E5] hover:bg-[#4F46E5]/10"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('next')}
              className="border-[#4F46E5]/30 text-[#4F46E5] hover:bg-[#4F46E5]/10"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {viewMode !== 'day' && (
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-[#4F46E5]/70 py-2"
              >
                {day}
              </div>
            ))}
          </div>
        )}

        <div
          className={`grid gap-2 ${
            viewMode === 'day'
              ? 'grid-cols-1'
              : 'grid-cols-7'
          }`}
        >
          {calendarDays.map((day) => {
            const events = getEventsForDate(day);
            const isCurrentMonth =
              viewMode === 'month' ? isSameMonth(day, currentDate) : true;

            return (
              <DayCell
                key={day.toString()}
                day={day}
                events={events}
                isCurrentMonth={isCurrentMonth}
                isSelected={isSameDay(day, selectedDate)}
                isToday={isSameDay(day, new Date())}
                viewMode={viewMode}
                onSelect={onSelectDate}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onDragStart={onDragStart}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
