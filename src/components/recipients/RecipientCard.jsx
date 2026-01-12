import React from 'react';
import { User, Calendar, Phone, Heart } from 'lucide-react';
import { format, parseISO, differenceInYears } from 'date-fns';
import { Badge } from '../ui/badge';

export default function RecipientCard({ recipient, onClick }) {
  const age = recipient.date_of_birth 
    ? differenceInYears(new Date(), parseISO(recipient.date_of_birth))
    : null;

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center flex-shrink-0">
          {recipient.photo_url ? (
            <img 
              src={recipient.photo_url} 
              alt={recipient.name}
              className="w-full h-full rounded-2xl object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-blue-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-medium text-slate-800 mb-1">{recipient.name}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {recipient.relationship && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                {recipient.relationship}
              </Badge>
            )}
            {age && (
              <span className="text-sm text-slate-500">{age} years old</span>
            )}
          </div>
        </div>
      </div>

      {recipient.medical_conditions && recipient.medical_conditions.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
            <Heart className="w-3 h-3" />
            Medical Conditions
          </div>
          <div className="flex flex-wrap gap-1">
            {recipient.medical_conditions.map((condition, idx) => (
              <span 
                key={idx}
                className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded-full"
              >
                {condition}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2 text-sm text-slate-600">
        {recipient.primary_doctor && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <span>Dr. {recipient.primary_doctor}</span>
          </div>
        )}
        {recipient.emergency_contact && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400" />
            <span>{recipient.emergency_contact}</span>
          </div>
        )}
      </div>
    </div>
  );
}