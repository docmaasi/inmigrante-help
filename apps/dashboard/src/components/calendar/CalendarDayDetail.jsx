import React from 'react';
import {
  Calendar as CalendarIcon,
  CheckSquare,
  Pill,
  User,
  Clock,
  Edit,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { format } from 'date-fns';

function EventCard({
  event,
  getRecipientName,
  onEditAppointment,
  onEditTask,
  onCompleteAppointment,
  onCancelAppointment,
  onCompleteTask,
  isUpdating,
}) {
  return (
    <div className="p-3 rounded-lg border border-[#E07A5F]/20 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${event.color}`}
        >
          {event.type === 'appointment' && (
            <CalendarIcon className="w-4 h-4 text-white" />
          )}
          {event.type === 'task' && (
            <CheckSquare className="w-4 h-4 text-white" />
          )}
          {event.type === 'medication' && (
            <Pill className="w-4 h-4 text-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[#4F46E5] text-sm">{event.title}</p>
          {event.time && (
            <p className="text-xs text-[#8B7EC8] mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {event.time}
            </p>
          )}
          {event.data.care_recipient_id && (
            <p className="text-xs text-[#8B7EC8] mt-1 flex items-center gap-1">
              <User className="w-3 h-3" />
              {getRecipientName(event.data.care_recipient_id)}
            </p>
          )}
          <EventBadges event={event} />
          <EventActions
            event={event}
            onEditAppointment={onEditAppointment}
            onEditTask={onEditTask}
            onCompleteAppointment={onCompleteAppointment}
            onCancelAppointment={onCancelAppointment}
            onCompleteTask={onCompleteTask}
            isUpdating={isUpdating}
          />
          {event.draggable && (
            <span className="text-xs text-[#8B7EC8]/60 italic mt-2 block">
              Drag to reschedule
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function EventBadges({ event }) {
  return (
    <div className="flex items-center gap-2 mt-2 flex-wrap">
      <Badge
        className="text-xs border-[#4F46E5]/20 text-[#4F46E5]"
        variant="outline"
      >
        {event.type}
      </Badge>
      {event.type === 'appointment' && event.data.status && (
        <Badge
          className={`text-xs ${
            event.data.status === 'completed'
              ? 'bg-green-100 text-green-700'
              : event.data.status === 'cancelled'
                ? 'bg-red-100 text-red-700'
                : 'bg-[#4F46E5]/10 text-[#4F46E5]'
          }`}
        >
          {event.data.status}
        </Badge>
      )}
      {event.type === 'task' && event.data.status && (
        <Badge
          className={`text-xs ${
            event.data.status === 'completed'
              ? 'bg-green-100 text-green-700'
              : event.data.status === 'in_progress'
                ? 'bg-[#4F46E5]/10 text-[#4F46E5]'
                : 'bg-[#8B7EC8]/10 text-[#8B7EC8]'
          }`}
        >
          {event.data.status}
        </Badge>
      )}
    </div>
  );
}

function EventActions({
  event,
  onEditAppointment,
  onEditTask,
  onCompleteAppointment,
  onCancelAppointment,
  onCompleteTask,
  isUpdating,
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {event.type === 'appointment' && (
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEditAppointment(event.data)}
            className="text-xs h-7 border-[#4F46E5]/20 text-[#4F46E5]"
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          {event.data.status !== 'completed' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCompleteAppointment(event.data.id)}
              className="text-xs h-7 text-green-600 hover:text-green-700 hover:bg-green-50"
              disabled={isUpdating}
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Complete
            </Button>
          )}
          {event.data.status !== 'cancelled' &&
            event.data.status !== 'completed' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCancelAppointment(event.data.id)}
                className="text-xs h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={isUpdating}
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
            onClick={() => onEditTask(event.data)}
            className="text-xs h-7 border-[#4F46E5]/20 text-[#4F46E5]"
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          {event.data.status !== 'completed' &&
            event.data.status !== 'cancelled' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCompleteTask(event.data)}
                className="text-xs h-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                disabled={isUpdating}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Complete
              </Button>
            )}
        </>
      )}
    </div>
  );
}

export function CalendarDayDetail({
  selectedDate,
  events,
  getRecipientName,
  onEditAppointment,
  onEditTask,
  onCompleteAppointment,
  onCancelAppointment,
  onCompleteTask,
  isUpdating,
}) {
  return (
    <Card className="border-[#E07A5F]/20">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-[#4F46E5] mb-1">
            {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          <p className="text-sm text-[#8B7EC8]">
            {events.length} {events.length === 1 ? 'event' : 'events'}
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-8">
            <CalendarIcon className="w-12 h-12 text-[#8B7EC8]/40 mx-auto mb-3" />
            <p className="text-[#8B7EC8] text-sm">No events on this day</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event, idx) => (
              <EventCard
                key={idx}
                event={event}
                getRecipientName={getRecipientName}
                onEditAppointment={onEditAppointment}
                onEditTask={onEditTask}
                onCompleteAppointment={onCompleteAppointment}
                onCancelAppointment={onCancelAppointment}
                onCompleteTask={onCompleteTask}
                isUpdating={isUpdating}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
