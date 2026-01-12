import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Pill, Check, X, Clock, User, AlertCircle, History } from 'lucide-react';
import { format } from 'date-fns';

export default function MedicationCheckoffItem({ medication, recipientName }) {
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: logs = [] } = useQuery({
    queryKey: ['medicationLogs', medication.id],
    queryFn: () => base44.entities.MedicationLog.filter({ medication_id: medication.id }, '-date_taken', 10)
  });

  const logMedicationMutation = useMutation({
    mutationFn: (logData) => base44.entities.MedicationLog.create(logData),
    onSuccess: () => {
      queryClient.invalidateQueries(['medicationLogs', medication.id]);
      setShowLogDialog(false);
      setNotes('');
    }
  });

  const handleLogDose = (status) => {
    const now = new Date();
    const logData = {
      medication_id: medication.id,
      care_recipient_id: medication.care_recipient_id,
      medication_name: medication.medication_name,
      dosage: medication.dosage,
      date_taken: format(now, 'yyyy-MM-dd'),
      time_taken: format(now, 'HH:mm'),
      status: status,
      notes: notes
    };
    logMedicationMutation.mutate(logData);
  };

  const todayLogs = logs.filter(log => log.date_taken === format(new Date(), 'yyyy-MM-dd'));
  const hasBeenTakenToday = todayLogs.some(log => log.status === 'taken');
  const hasBeenSkippedToday = todayLogs.some(log => log.status === 'skipped');

  return (
    <>
      <Card className={`shadow-sm border-slate-200/60 hover:shadow-md transition-shadow ${
        hasBeenTakenToday ? 'bg-green-50 border-green-300' : 
        hasBeenSkippedToday ? 'bg-orange-50 border-orange-300' : ''
      }`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-3 flex-1">
              <div className={`p-3 rounded-lg flex-shrink-0 ${
                hasBeenTakenToday ? 'bg-green-500' : 'bg-gradient-to-br from-green-600 to-green-700'
              }`}>
                {hasBeenTakenToday ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <Pill className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800 mb-1">{medication.medication_name}</h3>
                <p className="text-sm text-slate-600 mb-2">
                  <span className="font-semibold">{medication.dosage}</span>
                  {medication.frequency && <span className="ml-2">• {medication.frequency}</span>}
                </p>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <User className="w-4 h-4 text-slate-400" />
                  {recipientName}
                </div>
                {medication.time_of_day && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {medication.time_of_day}
                  </div>
                )}
              </div>
            </div>
            <div>
              {hasBeenTakenToday && (
                <Badge className="bg-green-600 text-white">
                  ✓ Taken Today
                </Badge>
              )}
              {hasBeenSkippedToday && !hasBeenTakenToday && (
                <Badge className="bg-orange-600 text-white">
                  Skipped Today
                </Badge>
              )}
            </div>
          </div>

          {medication.special_instructions && (
            <div className="flex items-start gap-2 bg-orange-50 rounded-lg p-3 mb-4 border border-orange-200">
              <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-orange-800">{medication.special_instructions}</p>
            </div>
          )}

          {/* Today's Logs */}
          {todayLogs.length > 0 && (
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-xs font-semibold text-slate-600 mb-2">Today's Activity</p>
              {todayLogs.map((log, idx) => (
                <div key={idx} className="text-xs text-slate-600 mb-1">
                  <span className={`font-medium ${
                    log.status === 'taken' ? 'text-green-600' : 
                    log.status === 'skipped' ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {log.status.toUpperCase()}
                  </span> at {log.time_taken} by {log.created_by}
                  {log.notes && <span className="ml-2 italic">- {log.notes}</span>}
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => setShowLogDialog(true)}
              disabled={hasBeenTakenToday}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Mark as Taken
            </Button>
            <Button
              onClick={() => handleLogDose('skipped')}
              disabled={hasBeenTakenToday || hasBeenSkippedToday}
              variant="outline"
              className="text-orange-600 hover:bg-orange-50"
            >
              <X className="w-4 h-4 mr-2" />
              Skip
            </Button>
            <Button
              onClick={() => setShowHistoryDialog(true)}
              variant="outline"
              size="icon"
            >
              <History className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Log Dialog */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Dose - {medication.medication_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Medication</p>
              <p className="font-semibold text-slate-800">{medication.medication_name}</p>
              <p className="text-sm text-slate-600">{medication.dosage}</p>
            </div>
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any observations or notes about this dose..."
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowLogDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleLogDose('taken')}
                disabled={logMedicationMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {logMedicationMutation.isPending ? 'Logging...' : 'Confirm Taken'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>History - {medication.medication_name}</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto space-y-3 mt-4">
            {logs.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No history yet</p>
            ) : (
              logs.map(log => (
                <div key={log.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {format(new Date(log.date_taken), 'MMM d, yyyy')} at {log.time_taken}
                      </p>
                      <p className="text-sm text-slate-600">by {log.created_by}</p>
                    </div>
                    <Badge className={
                      log.status === 'taken' ? 'bg-green-600' :
                      log.status === 'skipped' ? 'bg-orange-600' : 'bg-red-600'
                    }>
                      {log.status}
                    </Badge>
                  </div>
                  {log.notes && (
                    <p className="text-sm text-slate-600 italic mt-2">{log.notes}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}