import React from 'react';
import { User, Heart, AlertCircle } from 'lucide-react';
import { parseISO, differenceInYears } from 'date-fns';
import { Badge } from '../ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function RecipientCard({ recipient }) {
  const age = recipient.date_of_birth 
    ? differenceInYears(new Date(), parseISO(recipient.date_of_birth))
    : null;

  const conditions = (() => {
    try {
      return recipient.conditions_diagnoses ? JSON.parse(recipient.conditions_diagnoses) : [];
    } catch {
      return [];
    }
  })();

  return (
    <Link
      to={createPageUrl('RecipientProfile') + '?id=' + recipient.id}
      className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all block"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center flex-shrink-0">
          {recipient.photo_url ? (
            <img 
              src={recipient.photo_url} 
              alt={recipient.full_name}
              className="w-full h-full rounded-2xl object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-blue-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-medium text-slate-800 mb-1">{recipient.full_name}</h3>
          {age && (
            <span className="text-sm text-slate-500">{age} years old</span>
          )}
        </div>
      </div>

      {recipient.primary_condition && (
        <div className="mb-3 p-2 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold mb-1">
            <Heart className="w-3 h-3" />
            Primary Condition
          </div>
          <p className="text-sm text-slate-700">{recipient.primary_condition}</p>
        </div>
      )}

      {conditions.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {conditions.slice(0, 3).map((cond, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {cond.condition}
              </Badge>
            ))}
            {conditions.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{conditions.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {recipient.allergies && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          <AlertCircle className="w-4 h-4" />
          <span className="font-medium">Has allergies</span>
        </div>
      )}
    </Link>
  );
}