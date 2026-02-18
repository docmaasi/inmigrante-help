import React, { useState } from 'react';
import { useMedications, useCareRecipients, useMedicationLogs } from '@/hooks';
import MedicationCheckoffItem from '../components/medications/MedicationCheckoffItem';
import { MedicationLogExport } from '../components/medications/MedicationLogExport';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pill, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MedicationLog() {
  const [selectedRecipientId, setSelectedRecipientId] = useState('all');

  const { data: medications = [], isLoading } = useMedications();
  const { data: recipients = [] } = useCareRecipients();
  const { data: allLogs = [] } = useMedicationLogs();

  const getRecipientName = (id) => {
    const recipient = recipients.find(r => r.id === id);
    return recipient
      ? `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim() || 'Unknown'
      : 'Unknown';
  };

  const activeMedications = medications.filter(med => med.is_active !== false);
  const filteredMedications = selectedRecipientId === 'all'
    ? activeMedications
    : activeMedications.filter(med => med.care_recipient_id === selectedRecipientId);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-teal-50 rounded-lg">
            <Pill className="w-6 h-6 text-teal-600" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Medication Log</h1>
        </div>
        <p className="text-slate-500 ml-12">Track when medications are taken</p>
      </div>

      {/* Filter + Export Card */}
      <Card className="mb-6 border border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="w-5 h-5 text-slate-400" />
            <Select value={selectedRecipientId} onValueChange={setSelectedRecipientId}>
              <SelectTrigger className="w-64 border-slate-200 focus:ring-teal-500 focus:border-teal-500">
                <SelectValue placeholder="Filter by recipient" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Recipients</SelectItem>
                {recipients.map(recipient => (
                  <SelectItem key={recipient.id} value={recipient.id}>
                    {recipient.first_name} {recipient.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="bg-slate-100 text-slate-700">
              {filteredMedications.length} {filteredMedications.length === 1 ? 'medication' : 'medications'}
            </Badge>
            <div className="ml-auto">
              <MedicationLogExport logs={allLogs} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medications List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        </div>
      ) : filteredMedications.length === 0 ? (
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Pill className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Active Medications</h3>
            <p className="text-slate-500">No medications to track at this time</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredMedications.map(med => (
            <MedicationCheckoffItem
              key={med.id}
              medication={med}
              recipientName={getRecipientName(med.care_recipient_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
