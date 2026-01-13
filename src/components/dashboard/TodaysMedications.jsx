import React from 'react';
import { Pill, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function TodaysMedications({ medications }) {
  if (!medications || medications.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
        <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">No medications scheduled</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {medications.map(med => (
        <div 
          key={med.id} 
          className="bg-white rounded-xl p-5 border border-slate-200 hover:border-green-300 transition-colors"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h4 className="font-medium text-slate-800">{med.name}</h4>
              <p className="text-sm text-slate-500 mt-1">{med.dosage}</p>
            </div>
            <Badge className={med.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
              {med.active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          {med.times && med.times.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mt-3">
              <Clock className="w-3 h-3 text-slate-400" />
              {med.times.map((time, idx) => (
                <span key={idx} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                  {time}
                </span>
              ))}
            </div>
          )}
          {med.instructions && (
            <p className="text-xs text-slate-600 mt-2 italic">{med.instructions}</p>
          )}
        </div>
      ))}
      <Link to={createPageUrl('Medications')}>
        <Button variant="outline" size="sm" className="w-full gap-2 mt-4">
          View All <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  );
}