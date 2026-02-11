import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useDoseGeneration } from '@/hooks/useDoseGeneration';
import MedicationCheckoffItem from '../components/medications/MedicationCheckoffItem';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pill, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MedicationLog() {
  const [selectedRecipientId, setSelectedRecipientId] = useState('all');

  const { data: medications = [], isLoading } = useQuery({
    queryKey: ['medications'],
    queryFn: () => base44.entities.Medication.list('-created_date')
  });

  const { data: recipients = [] } = useQuery({
    queryKey: ['careRecipients'],
    queryFn: () => base44.entities.CareRecipient.list()
  });

  const getRecipientName = (id) => {
    return recipients.find(r => r.id === id)?.full_name || 'Unknown';
  };

  const activeMedications = medications.filter(med => med.active !== false);

  // Auto-generate pending dose entries for today & mark past pending as missed
  useDoseGeneration(activeMedications);
  const filteredMedications = selectedRecipientId === 'all'
    ? activeMedications
    : activeMedications.filter(med => med.care_recipient_id === selectedRecipientId);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Medication Log</h1>
        <p className="text-slate-500 mt-1">Track when medications are taken</p>
      </div>

      {/* Filter */}
      <Card className="mb-6 shadow-sm border-slate-200/60">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-slate-400" />
            <Select value={selectedRecipientId} onValueChange={setSelectedRecipientId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by recipient" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Recipients</SelectItem>
                {recipients.map(recipient => (
                  <SelectItem key={recipient.id} value={recipient.id}>
                    {recipient.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline" className="ml-auto">
              {filteredMedications.length} {filteredMedications.length === 1 ? 'medication' : 'medications'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Medications List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        </div>
      ) : filteredMedications.length === 0 ? (
        <Card className="border-slate-200/60">
          <CardContent className="p-12 text-center">
            <Pill className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Active Medications</h3>
            <p className="text-slate-500">No medications to track at this time</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
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