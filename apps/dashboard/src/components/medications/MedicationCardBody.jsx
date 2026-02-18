import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Pill, Check, X, Clock, User, AlertCircle, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export function MedicationCardHeader({ medication, recipientName, isTaken, onCollapse, onDelete }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-3">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className={`p-3 rounded-lg flex-shrink-0 ${
          isTaken ? 'bg-green-600' : 'bg-gradient-to-br from-green-600 to-green-700'
        }`}>
          {isTaken ? <Check className="w-5 h-5 text-white" /> : <Pill className="w-5 h-5 text-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-slate-800 mb-1">{medication.name}</h3>
          <p className="text-sm text-slate-600 mb-2">
            <span className="font-medium">{medication.dosage}</span>
            {medication.frequency && ` - ${medication.frequency}`}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="flex items-center gap-1 text-slate-600">
              <User className="w-4 h-4 text-slate-400" />{recipientName}
            </span>
            {medication.time_of_day && (
              <>
                <span className="text-slate-400">-</span>
                <span className="flex items-center gap-1 text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400" />{medication.time_of_day}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {isTaken && <Badge className="bg-green-600 text-white border-0">Taken Today</Badge>}
        {isTaken && (
          <Button variant="ghost" size="sm" onClick={onCollapse} className="text-slate-500 h-8 px-2">
            <ChevronUp className="w-4 h-4" />
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onDelete} className="text-slate-400 hover:text-red-600 h-8 px-2">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function TodayLogsList({ todayLogs }) {
  if (todayLogs.length === 0) return null;
  return (
    <div className="mb-3 space-y-2">
      {todayLogs.map(log => (
        <div key={log.id} className="flex items-center gap-2 text-sm p-2 rounded bg-slate-50">
          <Badge className={
            log.status === 'taken' ? 'bg-green-600' :
            log.status === 'skipped' ? 'bg-yellow-600' : 'bg-slate-600'
          }>{log.status}</Badge>
          <span className="text-slate-600">
            {log.scheduled_time && format(new Date(log.scheduled_time), 'HH:mm')}
          </span>
          {log.notes && <span className="text-slate-500">- {log.notes}</span>}
        </div>
      ))}
    </div>
  );
}

export function LogHistory({ logs }) {
  if (logs.length === 0) {
    return <p className="text-sm text-slate-500 text-center py-2">No history yet</p>;
  }
  return logs.slice(0, 7).map(log => (
    <div key={log.id} className="flex items-center justify-between text-xs p-2 rounded bg-slate-50">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={
          log.status === 'taken' ? 'text-green-700 border-green-300' :
          log.status === 'skipped' ? 'text-yellow-700 border-yellow-300' :
          'text-slate-700 border-slate-300'
        }>
          {log.status}
        </Badge>
        <span className="text-slate-600">
          {log.scheduled_time && format(new Date(log.scheduled_time), 'MMM d, yyyy')}
        </span>
        <span className="text-slate-600">
          {log.scheduled_time && format(new Date(log.scheduled_time), 'HH:mm')}
        </span>
      </div>
      {log.notes && <span className="text-slate-500 text-xs ml-2">{log.notes}</span>}
    </div>
  ));
}
