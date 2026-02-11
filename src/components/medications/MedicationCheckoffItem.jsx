import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '../ui/card';
import { AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import DoseRow from './DoseRow';
import { MedHeader, ManualActions, LegacyLogList, HistoryToggle } from './MedicationCheckoffHelpers';

export default function MedicationCheckoffItem({ medication, recipientName }) {
  const [showLogs, setShowLogs] = useState(false);
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: todayLogs = [] } = useQuery({
    queryKey: ['medicationLogs', medication.id, today],
    queryFn: async () => {
      const logs = await base44.entities.MedicationLog.list('-time_taken', 100);
      return logs.filter(log => log.medication_id === medication.id && log.date_taken === today);
    }
  });

  const { data: recentLogs = [] } = useQuery({
    queryKey: ['medicationLogs', medication.id],
    queryFn: async () => {
      const logs = await base44.entities.MedicationLog.list('-date_taken', 10);
      return logs.filter(log => log.medication_id === medication.id);
    },
    enabled: showLogs
  });

  // Separate system-generated doses from legacy manual logs
  const systemDoses = todayLogs.filter(log => log.generated_by === 'system');
  const hasSystemDoses = systemDoses.length > 0;

  // Sort doses by dose_number so Morning comes before Evening
  const sortedDoses = [...systemDoses].sort(
    (a, b) => (a.dose_number || 0) - (b.dose_number || 0)
  );

  const allCompleted = hasSystemDoses &&
    sortedDoses.every(log => log.status !== 'pending');
  const hasTakenToday = todayLogs.some(log => log.status === 'taken');

  // Fallback: old manual create flow (no system doses exist yet)
  const logMutation = useMutation({
    mutationFn: (logData) => base44.entities.MedicationLog.create(logData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicationLogs'] });
      toast.success('Medication logged');
      setNotes('');
    }
  });

  const handleManualLog = (status) => {
    logMutation.mutate({
      medication_id: medication.id,
      care_recipient_id: medication.care_recipient_id,
      medication_name: medication.medication_name,
      dosage: medication.dosage,
      date_taken: today,
      time_taken: format(new Date(), 'HH:mm'),
      status,
      notes: notes || undefined
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem(`med-notes-${medication.id}`);
    if (saved) setNotes(saved);
  }, [medication.id]);

  useEffect(() => {
    localStorage.setItem(`med-notes-${medication.id}`, notes);
  }, [notes, medication.id]);

  const isAllDone = hasSystemDoses ? allCompleted : hasTakenToday;

  return (
    <Card className={`shadow-sm border-slate-200/60 ${isAllDone ? 'bg-green-50/50' : ''}`}>
      <CardContent className="p-5">
        <MedHeader
          medication={medication}
          recipientName={recipientName}
          isAllDone={isAllDone}
        />

        {medication.special_instructions && (
          <div className="flex items-start gap-2 bg-orange-50 rounded-lg p-3 mb-3 border border-orange-200">
            <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-orange-800">{medication.special_instructions}</p>
          </div>
        )}

        {/* Per-dose rows (system-generated) */}
        {hasSystemDoses && (
          <div className="mb-3 space-y-2">
            {sortedDoses.map(log => (
              <DoseRow key={log.id} log={log} medication={medication} />
            ))}
          </div>
        )}

        {/* Fallback: old manual buttons if no system doses */}
        {!hasSystemDoses && !hasTakenToday && (
          <ManualActions
            notes={notes}
            setNotes={setNotes}
            onLog={handleManualLog}
            isPending={logMutation.isPending}
          />
        )}

        {/* Legacy log display for non-system entries */}
        {!hasSystemDoses && todayLogs.length > 0 && (
          <LegacyLogList logs={todayLogs} />
        )}

        <HistoryToggle
          showLogs={showLogs}
          setShowLogs={setShowLogs}
          recentLogs={recentLogs}
        />
      </CardContent>
    </Card>
  );
}
