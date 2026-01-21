import React from 'react';
import { useMedications, useCareRecipients, useUpdateMedication } from '@/hooks';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Pill, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format, parseISO, differenceInDays, isBefore, startOfToday } from 'date-fns';
import { toast } from 'sonner';

export function RefillTracker({ recipientId = null }) {
  const { data: medications = [] } = useMedications(recipientId);
  const { data: recipients = [] } = useCareRecipients();
  const updateMutation = useUpdateMedication();

  const filteredMedications = recipientId
    ? medications.filter(m => m.care_recipient_id === recipientId)
    : medications;

  const pendingRefills = filteredMedications.filter(m => {
    if (!m.is_active || !m.refill_date) return false;
    const today = startOfToday();
    const refillDate = parseISO(m.refill_date);
    return !isBefore(today, refillDate) || differenceInDays(refillDate, today) <= 14;
  });

  const markCompleted = (medication) => {
    const nextRefillDate = new Date();
    nextRefillDate.setDate(nextRefillDate.getDate() + 30);

    updateMutation.mutate(
      {
        id: medication.id,
        refill_date: format(nextRefillDate, 'yyyy-MM-dd')
      },
      {
        onSuccess: () => {
          toast.success('Refill completed - next refill date updated');
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to update refill');
        }
      }
    );
  };

  const getUrgency = (refillDate) => {
    const today = startOfToday();
    const refill = parseISO(refillDate);
    const daysUntil = differenceInDays(refill, today);

    if (isBefore(refill, today)) {
      return { level: 'overdue', color: 'bg-red-100 text-red-800 border-red-200', days: Math.abs(daysUntil) };
    } else if (daysUntil <= 3) {
      return { level: 'urgent', color: 'bg-orange-100 text-orange-800 border-orange-200', days: daysUntil };
    } else if (daysUntil <= 7) {
      return { level: 'soon', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', days: daysUntil };
    }
    return { level: 'upcoming', color: 'bg-blue-100 text-blue-800 border-blue-200', days: daysUntil };
  };

  const getRecipientName = (id) => {
    return recipients.find(r => r.id === id)?.full_name || 'Unknown';
  };

  if (pendingRefills.length === 0) {
    return (
      <Card className="border-slate-200/60">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-slate-600">All refills are up to date</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {pendingRefills.map(medication => {
        const urgency = getUrgency(medication.refill_date);

        return (
          <Card key={medication.id} className={`border-2 ${urgency.color.includes('red') ? 'border-red-300' : urgency.color.includes('orange') ? 'border-orange-300' : 'border-slate-200'}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${urgency.color}`}>
                    <Pill className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{medication.name}</h3>
                    <p className="text-sm text-slate-600 mb-2">
                      For: {getRecipientName(medication.care_recipient_id)}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">
                          {format(parseISO(medication.refill_date), 'MMM d, yyyy')}
                        </span>
                      </div>

                      {urgency.level === 'overdue' ? (
                        <Badge className="bg-red-600 text-white">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {urgency.days} days overdue
                        </Badge>
                      ) : urgency.level === 'urgent' ? (
                        <Badge className="bg-orange-600 text-white">
                          <Clock className="w-3 h-3 mr-1" />
                          {urgency.days} days left
                        </Badge>
                      ) : urgency.level === 'soon' ? (
                        <Badge className="bg-yellow-600 text-white">
                          {urgency.days} days left
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          {urgency.days} days left
                        </Badge>
                      )}
                    </div>

                    {medication.pharmacy && (
                      <p className="text-xs text-slate-500 mt-2">
                        Pharmacy: {medication.pharmacy}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={() => markCompleted(medication)}
                    disabled={updateMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Complete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default RefillTracker;
