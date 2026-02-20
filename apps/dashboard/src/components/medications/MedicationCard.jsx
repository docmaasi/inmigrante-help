import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pill, User, Clock, Calendar, AlertCircle, Edit2, Trash2, Archive } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export function MedicationCard({
  med,
  getRecipientName,
  onEdit,
  onToggleActive,
  onDelete,
}) {
  return (
    <Card className={`shadow-sm border-[#4F46E5]/10 bg-white hover:shadow-md transition-shadow ${
      med.is_active === false ? 'opacity-60' : ''
    }`}>
      <CardContent className="p-6">
        <MedicationHeader med={med} getRecipientName={getRecipientName} />
        <DosageInfo med={med} />
        <AdditionalInfo med={med} />
        <MedicationActions
          med={med}
          onEdit={onEdit}
          onToggleActive={onToggleActive}
          onDelete={onDelete}
        />
      </CardContent>
    </Card>
  );
}

function MedicationHeader({ med, getRecipientName }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="bg-gradient-to-br from-[#4F46E5] to-[#8B7EC8] p-3 rounded-lg flex-shrink-0">
          <Pill className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-[#4F46E5] mb-1">{med.name}</h3>
          <p className="text-sm text-[#8B7EC8] flex items-center gap-2">
            <User className="w-4 h-4 text-[#8B7EC8]/60" />
            {getRecipientName(med.care_recipient_id)}
          </p>
        </div>
      </div>
      {med.is_active === false && (
        <Badge variant="outline" className="bg-[#8B7EC8]/10 text-[#8B7EC8] border-[#8B7EC8]/20">
          Inactive
        </Badge>
      )}
    </div>
  );
}

function DosageInfo({ med }) {
  return (
    <div className="bg-[#4F46E5]/5 rounded-lg p-4 mb-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[#4F46E5]/70">Dosage:</span>
        <span className="text-sm font-semibold text-[#4F46E5]">{med.dosage}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[#4F46E5]/70">Frequency:</span>
        <span className="text-sm text-[#8B7EC8]">{med.frequency}</span>
      </div>
      {med.scheduled_times && med.scheduled_times.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[#4F46E5]/70">Time:</span>
          <span className="text-sm text-[#8B7EC8] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {med.scheduled_times.join(', ')}
          </span>
        </div>
      )}
    </div>
  );
}

function AdditionalInfo({ med }) {
  return (
    <div className="space-y-2 mb-4">
      {med.purpose && (
        <p className="text-sm text-[#8B7EC8]">
          <span className="font-medium text-[#4F46E5]/70">Purpose:</span> {med.purpose}
        </p>
      )}
      {med.prescribing_doctor && (
        <p className="text-sm text-[#8B7EC8]">
          <span className="font-medium text-[#4F46E5]/70">Prescribed by:</span> Dr. {med.prescribing_doctor}
        </p>
      )}
      {med.instructions && (
        <div className="flex items-start gap-2 bg-[#F4A261]/10 rounded-lg p-3 border border-[#F4A261]/25">
          <AlertCircle className="w-4 h-4 text-[#E07A5F] mt-0.5 flex-shrink-0" />
          <p className="text-sm text-[#E07A5F]">{med.instructions}</p>
        </div>
      )}
      {med.refill_date && (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-[#8B7EC8]/60" />
          <span className="text-[#8B7EC8]">
            Refill by: {format(parseISO(med.refill_date), 'MMM d, yyyy')}
          </span>
        </div>
      )}
    </div>
  );
}

function MedicationActions({ med, onEdit, onToggleActive, onDelete }) {
  return (
    <div className="flex flex-wrap gap-2 pt-4 border-t border-[#4F46E5]/10">
      {med.is_active !== false && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onToggleActive(med, false)}
          className="text-[#8B7EC8] border-[#8B7EC8]/20"
        >
          <Archive className="w-3 h-3 mr-1" />
          Mark Inactive
        </Button>
      )}
      {med.is_active === false && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onToggleActive(med, true)}
          className="text-green-600"
        >
          <Pill className="w-3 h-3 mr-1" />
          Reactivate
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        onClick={() => onEdit(med)}
        className="border-[#4F46E5]/20 text-[#4F46E5]"
      >
        <Edit2 className="w-3 h-3 mr-1" />
        Edit
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onDelete(med)}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
}
