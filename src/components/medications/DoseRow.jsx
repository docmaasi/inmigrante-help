import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Check, X, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

/**
 * A single dose row — shows either pending buttons (take/skip)
 * or a completed status badge with the time it was logged.
 */
export default function DoseRow({ log, medication }) {
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      base44.entities.MedicationLog.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicationLogs'] });
      toast.success('Dose logged');
    }
  });

  const handleUpdate = (status) => {
    const now = format(new Date(), 'HH:mm');
    updateMutation.mutate({
      id: log.id,
      data: {
        status,
        time_taken: now,
        notes: notes || undefined
      }
    });
  };

  const label = log.dose_label || 'Dose';
  const isPending = log.status === 'pending';

  if (!isPending) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
        <Badge className={
          log.status === 'taken' ? 'bg-green-600 text-white' :
          log.status === 'skipped' ? 'bg-yellow-600 text-white' :
          log.status === 'missed' ? 'bg-red-600 text-white' :
          'bg-slate-600 text-white'
        }>
          {log.status}
        </Badge>
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {log.time_taken && (
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="w-3 h-3" />
            {log.time_taken}
          </span>
        )}
        {log.notes && (
          <span className="text-xs text-slate-500 ml-auto">{log.notes}</span>
        )}
      </div>
    );
  }

  return (
    <div className="p-3 rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-32 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <Button
            size="sm"
            onClick={() => handleUpdate('taken')}
            disabled={updateMutation.isPending}
            className="bg-green-600 hover:bg-green-700 h-8 text-xs"
          >
            <Check className="w-3 h-3 mr-1" />
            Taken
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleUpdate('skipped')}
            disabled={updateMutation.isPending}
            className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 h-8 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Skip
          </Button>
        </div>
      </div>
    </div>
  );
}
