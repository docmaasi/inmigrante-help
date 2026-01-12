import React from 'react';
import { Calendar, MapPin, User } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Badge } from '../ui/badge';

const typeColors = {
  doctor: 'bg-blue-100 text-blue-700',
  specialist: 'bg-purple-100 text-purple-700',
  therapy: 'bg-green-100 text-green-700',
  test: 'bg-orange-100 text-orange-700',
  other: 'bg-slate-100 text-slate-700'
};

export default function UpcomingAppointments({ appointments }) {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">No upcoming appointments</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map(apt => (
        <div 
          key={apt.id} 
          className="bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-300 transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-medium text-slate-800 mb-1">{apt.title}</h4>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(parseISO(apt.date), 'MMM d')} at {apt.time}
                </span>
              </div>
            </div>
            <Badge className={typeColors[apt.type] || typeColors.other}>
              {apt.type}
            </Badge>
          </div>
          {apt.location && (
            <div className="flex items-center gap-1 text-xs text-slate-600 mb-2">
              <MapPin className="w-3 h-3" />
              {apt.location}
            </div>
          )}
          {apt.assigned_to && (
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <User className="w-3 h-3" />
              Assigned to {apt.assigned_to}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}