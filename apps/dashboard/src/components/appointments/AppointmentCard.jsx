import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User, Clock, Pencil, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const typeColors = {
  doctor: 'bg-blue-100 text-blue-700 border-blue-200',
  specialist: 'bg-purple-100 text-purple-700 border-purple-200',
  therapy: 'bg-green-100 text-green-700 border-green-200',
  dentist: 'bg-teal-100 text-teal-700 border-teal-200',
  lab_test: 'bg-orange-100 text-orange-700 border-orange-200',
  hospital: 'bg-red-100 text-red-700 border-red-200',
  other: 'bg-slate-100 text-slate-700 border-slate-200'
};

function formatDateTime(dateTimeString) {
  if (!dateTimeString) return '';
  try { return format(parseISO(dateTimeString), 'MMMM d, yyyy'); }
  catch { return ''; }
}

function formatTime(dateTimeString) {
  if (!dateTimeString) return '';
  try { return format(parseISO(dateTimeString), 'h:mm a'); }
  catch { return ''; }
}

export function AppointmentCard({ appointment, getRecipientName, onToggleStatus, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-medium text-slate-800">{appointment.title}</h3>
            <Badge className={`${typeColors[appointment.appointment_type] || typeColors.other} border`}>
              {appointment.appointment_type?.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-sm text-slate-600">
            For: {Array.isArray(appointment.care_recipient_ids) && appointment.care_recipient_ids.length > 0
              ? appointment.care_recipient_ids.map(id => getRecipientName(id)).join(', ')
              : appointment.care_recipients
                ? `${appointment.care_recipients.first_name} ${appointment.care_recipients.last_name}`
                : getRecipientName(appointment.care_recipient_id)
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(appointment)}
            className="p-1.5 rounded-md text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
            title="Edit appointment"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(appointment)}
            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete appointment"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleStatus(appointment)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              appointment.status === 'completed'
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {appointment.status === 'completed' ? 'Completed' : 'Mark Complete'}
          </button>
        </div>
      </div>

      <div className="space-y-2.5 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <Calendar className="w-4 h-4 text-teal-500" />
          <span>{formatDateTime(appointment.start_time)}</span>
          {appointment.start_time && (
            <>
              <span className="text-slate-300">|</span>
              <Clock className="w-4 h-4 text-teal-500" />
              <span>{formatTime(appointment.start_time)}</span>
            </>
          )}
        </div>
        {appointment.location && (
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-4 h-4 text-teal-500" />
            <span>{appointment.location}</span>
          </div>
        )}
        {appointment.provider_name && (
          <div className="flex items-center gap-2 text-slate-600">
            <User className="w-4 h-4 text-teal-500" />
            <span>{appointment.provider_name}</span>
          </div>
        )}
        {appointment.notes && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">{appointment.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
