import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useMedications, useMedicationLogs, useCareRecipient } from '@/hooks';
import { useValidateClientAccess } from '@/hooks/use-client-access';
import { Card, CardContent } from '@/components/ui/card';
import { Pill } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ClientPortalNav from '../components/client/ClientPortalNav';
import { createPageUrl } from '../utils';

export default function ClientMedicationLog() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [recipientId, setRecipientId] = useState(null);

  const accessCode = searchParams.get('code');
  const validateAccess = useValidateClientAccess();

  useEffect(() => {
    if (!accessCode) {
      navigate('/');
      return;
    }

    validateAccess.mutate(accessCode, {
      onSuccess: (access) => {
        setRecipientId(access.care_recipient_id);
      },
      onError: () => {
        navigate('/');
      }
    });
  }, [accessCode]);

  const { data: recipient } = useCareRecipient(recipientId);
  const { data: medications = [] } = useMedications(recipientId);
  const { data: logs = [] } = useMedicationLogs(undefined, recipientId);

  const activeMedications = medications.filter(med => med.is_active !== false);

  if (!recipient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  const recipientFullName = `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim();

  return (
    <div className="min-h-screen bg-slate-50">
      <ClientPortalNav careRecipientName={recipientFullName} currentPageName="ClientMedicationLog" />

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Medications</h1>
          <p className="text-slate-600">Current medications and administration history</p>
        </div>

        {/* Active Medications */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Current Medications</h2>
          {activeMedications.length === 0 ? (
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="pt-8 pb-8 text-center">
                <Pill className="w-12 h-12 text-teal-200 mx-auto mb-4" />
                <p className="text-slate-500">No active medications</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeMedications.map(med => (
                <Card key={med.id} className="border border-slate-200 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Pill className="w-5 h-5 text-teal-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800">{med.name}</h3>
                        <div className="space-y-1 mt-2 text-sm text-slate-600">
                          <p><span className="font-medium">Dosage:</span> {med.dosage}</p>
                          <p><span className="font-medium">Frequency:</span> {med.frequency}</p>
                          {med.purpose && <p><span className="font-medium">Purpose:</span> {med.purpose}</p>}
                          {med.scheduled_times && med.scheduled_times.length > 0 && (
                            <p><span className="font-medium">Time:</span> {med.scheduled_times.join(', ')}</p>
                          )}
                          {med.instructions && (
                            <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                              <p className="text-xs font-medium text-yellow-800">Warning: {med.instructions}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Medication History */}
        <div>
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Recent Administration</h2>
          {logs.length === 0 ? (
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="pt-8 pb-8 text-center">
                <p className="text-slate-500">No medication logs</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {logs.slice(0, 30).map(log => {
                const statusColors = {
                  taken: 'bg-green-100 text-green-800',
                  skipped: 'bg-yellow-100 text-yellow-800',
                  missed: 'bg-red-100 text-red-800'
                };
                return (
                  <Card key={log.id} className="border border-slate-200 shadow-sm">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-800">
                            {log.medications?.name || 'Unknown Medication'}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            {log.scheduled_time && new Date(log.scheduled_time).toLocaleString()}
                          </p>
                          {log.notes && (
                            <p className="text-xs text-slate-500 mt-1">{log.notes}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[log.status] || 'bg-gray-100 text-gray-800'}`}>
                          {log.status}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
