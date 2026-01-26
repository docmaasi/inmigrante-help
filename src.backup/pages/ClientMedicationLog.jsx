import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClientPortalNav from '../components/client/ClientPortalNav';
import { createPageUrl } from '../utils';

export default function ClientMedicationLog() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [recipientId, setRecipientId] = useState(null);
  const [recipient, setRecipient] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => navigate(createPageUrl('Dashboard')));
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    
    base44.entities.ClientAccess.filter({
      client_email: user.email,
      approved: true
    }).then(accesses => {
      if (accesses.length === 0) {
        navigate(createPageUrl('Dashboard'));
      } else {
        setRecipientId(accesses[0].care_recipient_id);
      }
    });
  }, [user, navigate]);

  const { data: recipientData } = useQuery({
    queryKey: ['recipient', recipientId],
    queryFn: () => recipientId ? base44.entities.CareRecipient.filter({ id: recipientId }).then(data => data[0]) : null,
    enabled: !!recipientId
  });

  useEffect(() => {
    if (recipientData) setRecipient(recipientData);
  }, [recipientData]);

  const { data: medications = [] } = useQuery({
    queryKey: ['clientMeds', recipientId],
    queryFn: () => recipientId 
      ? base44.entities.Medication.filter({ care_recipient_id: recipientId, active: true })
      : [],
    enabled: !!recipientId
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['medLogs', recipientId],
    queryFn: () => recipientId 
      ? base44.entities.MedicationLog.filter(
          { care_recipient_id: recipientId },
          '-date_taken',
          30
        )
      : [],
    enabled: !!recipientId
  });

  if (!recipient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <ClientPortalNav careRecipientName={recipient.full_name} currentPageName="ClientMedicationLog" />
      
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Medications</h1>
          <p className="text-slate-600">Current medications and administration history</p>
        </div>

        {/* Active Medications */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Current Medications</h2>
          {medications.length === 0 ? (
            <Card>
              <CardContent className="pt-8 pb-8 text-center">
                <p className="text-slate-500">No active medications</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {medications.map(med => (
                <Card key={med.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Pill className="w-5 h-5 text-purple-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800">{med.medication_name}</h3>
                        <div className="space-y-1 mt-2 text-sm text-slate-600">
                          <p><span className="font-medium">Dosage:</span> {med.dosage}</p>
                          <p><span className="font-medium">Frequency:</span> {med.frequency}</p>
                          {med.purpose && <p><span className="font-medium">Purpose:</span> {med.purpose}</p>}
                          {med.time_of_day && <p><span className="font-medium">Time:</span> {med.time_of_day}</p>}
                          {med.special_instructions && (
                            <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                              <p className="text-xs font-medium text-yellow-800">⚠ {med.special_instructions}</p>
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
            <Card>
              <CardContent className="pt-8 pb-8 text-center">
                <p className="text-slate-500">No medication logs</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {logs.map(log => {
                const statusColors = {
                  taken: 'bg-green-100 text-green-800',
                  skipped: 'bg-yellow-100 text-yellow-800',
                  missed: 'bg-red-100 text-red-800'
                };
                return (
                  <Card key={log.id}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-800">{log.medication_name}</p>
                          <p className="text-sm text-slate-600 mt-1">
                            {log.date_taken} {log.time_taken && `at ${log.time_taken}`}
                          </p>
                          {log.notes && (
                            <p className="text-xs text-slate-500 mt-1">{log.notes}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[log.status]}`}>
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