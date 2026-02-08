import React, { useState, useEffect } from 'react';
import { useMedicationLogs, useLogMedication } from '@/hooks';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Pill, Check, X, Clock, User, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function MedicationCheckoffItem({ medication, recipientName }) {
  const [showLogs, setShowLogs] = useState(false);
  const [notes, setNotes] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const currentTime = format(new Date(), 'HH:mm');

  const { data: allLogs = [] } = useMedicationLogs(medication.id, medication.care_recipient_id);

  const todayLogs = allLogs.filter(log => {
    const logDate = log.scheduled_time?.split('T')[0] || log.taken_at?.split('T')[0];
    return logDate === today;
  });

  const recentLogs = showLogs ? allLogs.slice(0, 10) : [];

  const logMutation = useLogMedication();

  const handleLog = (status) => {
    const logData = {
      medication_id: medication.id,
      care_recipient_id: medication.care_recipient_id,
      scheduled_time: `${today}T${currentTime}:00`,
      status: status,
      notes: notes || null
    };

    logMutation.mutate(logData, {
      onSuccess: () => {
        toast.success('Medication logged');
        setNotes('');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to log medication');
      }
    });
  };

  const hasTakenToday = todayLogs.some(log => log.status === 'taken');

  useEffect(() => {
    const key = `med-notes-${medication.id}`;
    localStorage.setItem(key, notes);
  }, [notes, medication.id]);

  useEffect(() => {
    const key = `med-notes-${medication.id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setNotes(saved);
    }
  }, [medication.id]);

  return (
    <Card className={`shadow-sm border-slate-200/60 ${hasTakenToday ? 'bg-green-50/50' : ''}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`p-3 rounded-lg flex-shrink-0 ${
              hasTakenToday ? 'bg-green-600' : 'bg-gradient-to-br from-green-600 to-green-700'
            }`}>
              {hasTakenToday ? (
                <Check className="w-5 h-5 text-white" />
              ) : (
                <Pill className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-slate-800 mb-1">{medication.name}</h3>
              <p className="text-sm text-slate-600 mb-2">
                <span className="font-medium">{medication.dosage}</span>
                {medication.frequency && ` - ${medication.frequency}`}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="flex items-center gap-1 text-slate-600">
                  <User className="w-4 h-4 text-slate-400" />
                  {recipientName}
                </span>
                {medication.time_of_day && (
                  <>
                    <span className="text-slate-400">-</span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {medication.time_of_day}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          {hasTakenToday && (
            <Badge className="bg-green-600 text-white border-0">
              Taken Today
            </Badge>
          )}
        </div>

        {medication.special_instructions && (
          <div className="flex items-start gap-2 bg-orange-50 rounded-lg p-3 mb-3 border border-orange-200">
            <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-orange-800">{medication.special_instructions}</p>
          </div>
        )}

        {todayLogs.length > 0 && (
          <div className="mb-3 space-y-2">
            {todayLogs.map(log => (
              <div key={log.id} className="flex items-center gap-2 text-sm p-2 rounded bg-slate-50">
                <Badge className={
                  log.status === 'taken' ? 'bg-green-600' :
                  log.status === 'skipped' ? 'bg-yellow-600' :
                  'bg-slate-600'
                }>
                  {log.status}
                </Badge>
                <span className="text-slate-600">
                  {log.scheduled_time && format(new Date(log.scheduled_time), 'HH:mm')}
                </span>
                {log.notes && <span className="text-slate-500">- {log.notes}</span>}
              </div>
            ))}
          </div>
        )}

        {!hasTakenToday && (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Add notes (optional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleLog('taken')}
                disabled={logMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Mark as Taken
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleLog('skipped')}
                disabled={logMutation.isPending}
                className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
              >
                <X className="w-4 h-4 mr-2" />
                Skipped
              </Button>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLogs(!showLogs)}
          className="w-full mt-3 text-slate-600"
        >
          {showLogs ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
          {showLogs ? 'Hide' : 'View'} History
        </Button>

        {showLogs && (
          <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
            {recentLogs.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-2">No history yet</p>
            ) : (
              recentLogs.slice(0, 7).map(log => (
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
                  {log.notes && (
                    <span className="text-slate-500 text-xs ml-2">{log.notes}</span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MedicationCheckoffItem;
