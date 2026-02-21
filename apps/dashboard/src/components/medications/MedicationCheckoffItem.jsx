import React, { useState } from 'react';
import { useMedicationLogs, useLogMedication, useDeleteMedication } from '@/hooks';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Check, X, ChevronDown, ChevronUp, Trash2, User } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { MedicationCardHeader, TodayLogsList, LogHistory } from './MedicationCardBody';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

function TakenCollapsedRow({ medication, recipientName, onExpand, onDelete }) {
  return (
    <Card className="shadow-sm border-slate-200/60 bg-green-50/50">
      <CardContent className="px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-green-600 flex-shrink-0">
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-800 truncate">{medication.name}</span>
            <span className="text-sm text-slate-500 truncate hidden sm:inline">{medication.dosage}</span>
            <span className="text-sm text-slate-500 hidden sm:inline">
              <User className="w-3 h-3 inline mr-1" />{recipientName}
            </span>
            <Badge className="bg-green-600 text-white border-0 text-xs">Taken</Badge>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={onExpand} className="text-slate-500 h-8 px-2">
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}
              className="text-slate-400 hover:text-red-600 h-8 px-2">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MedicationCheckoffItem({ medication, recipientName }) {
  const [showLogs, setShowLogs] = useState(false);
  const [notes, setNotes] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [justMarkedTaken, setJustMarkedTaken] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const currentTime = format(new Date(), 'HH:mm');

  const { data: allLogs = [] } = useMedicationLogs(medication.id, medication.care_recipient_id);
  const logMutation = useLogMedication();
  const deleteMutation = useDeleteMedication();

  const todayLogs = allLogs.filter(log => {
    const logDate = log.scheduled_time?.split('T')[0] || log.taken_at?.split('T')[0];
    return logDate === today;
  });

  const recentLogs = showLogs ? allLogs.slice(0, 10) : [];
  const hasTakenToday = todayLogs.some(log => log.status === 'taken');

  const handleLog = (status) => {
    logMutation.mutate({
      medication_id: medication.id,
      care_recipient_id: medication.care_recipient_id,
      scheduled_time: `${today}T${currentTime}:00`,
      status,
      notes: notes || null
    }, {
      onSuccess: () => {
        toast.success('Medication logged');
        setNotes('');
        if (status === 'taken') { setJustMarkedTaken(true); } else { setShowLogs(true); }
      },
      onError: (err) => { toast.error(err.message || 'Failed to log medication'); }
    });
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(medication.id, {
      onSuccess: () => toast.success(`${medication.name} deleted`),
      onError: (err) => toast.error(err.message || 'Failed to delete medication')
    });
    setShowDeleteDialog(false);
  };

  if ((hasTakenToday || justMarkedTaken) && !isExpanded) {
    return (
      <TakenCollapsedRow
        medication={medication} recipientName={recipientName}
        onExpand={() => setIsExpanded(true)} onDelete={handleDelete}
      />
    );
  }

  return (
    <Card className={`shadow-sm border-slate-200/60 ${hasTakenToday ? 'bg-green-50/50' : ''}`}>
      <CardContent className="p-5">
        <MedicationCardHeader
          medication={medication} recipientName={recipientName}
          isTaken={hasTakenToday || justMarkedTaken} onCollapse={() => setIsExpanded(false)}
          onDelete={handleDelete}
        />

        {medication.special_instructions && (
          <div className="flex items-start gap-2 bg-orange-50 rounded-lg p-3 mb-3 border border-orange-200">
            <span className="text-orange-600 mt-0.5 flex-shrink-0">⚠</span>
            <p className="text-sm text-orange-800">{medication.special_instructions}</p>
          </div>
        )}

        <TodayLogsList todayLogs={todayLogs} />

        {!hasTakenToday && (
          <div className="space-y-3">
            <input
              type="text" placeholder="Add notes (optional)..." value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleLog('taken')} disabled={logMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700">
                <Check className="w-4 h-4 mr-2" />Mark as Taken
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleLog('skipped')}
                disabled={logMutation.isPending} className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50">
                <X className="w-4 h-4 mr-2" />Skipped
              </Button>
            </div>
          </div>
        )}

        <Button variant="ghost" size="sm" onClick={() => setShowLogs(!showLogs)}
          className="w-full mt-3 text-slate-600">
          {showLogs ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
          {showLogs ? 'Hide' : 'View'} History
        </Button>

        {showLogs && (
          <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
            <LogHistory logs={recentLogs} />
          </div>
        )}
      </CardContent>
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Medication"
        description={`Delete "${medication.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </Card>
  );
}

export default MedicationCheckoffItem;
