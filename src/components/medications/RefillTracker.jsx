import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Pill, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format, parseISO, differenceInDays, isBefore, startOfToday } from 'date-fns';
import { toast } from 'sonner';

export default function RefillTracker({ recipientId = null, statusFilter = 'all' }) {
  const queryClient = useQueryClient();

  const { data: refills = [] } = useQuery({
    queryKey: ['medicationRefills'],
    queryFn: () => base44.entities.MedicationRefill.list('refill_date')
  });

  const { data: recipients = [] } = useQuery({
    queryKey: ['careRecipients'],
    queryFn: () => base44.entities.CareRecipient.list()
  });

  const updateRefillMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MedicationRefill.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['medicationRefills']);
      toast.success('Refill updated');
    }
  });

  const markCompleted = (refill) => {
    updateRefillMutation.mutate({
      id: refill.id,
      data: {
        status: 'completed',
        completed_date: new Date().toISOString().split('T')[0]
      }
    });
  };

  const markOrdered = (refill) => {
    updateRefillMutation.mutate({
      id: refill.id,
      data: { status: 'ordered' }
    });
  };

  const filteredRefills = recipientId
    ? refills.filter(r => r.care_recipient_id === recipientId)
    : refills;

  const today = startOfToday();

  const displayedRefills = filteredRefills.filter(r => {
    if (statusFilter === 'pending') {
      return r.status !== 'completed' && !isBefore(parseISO(r.refill_date), today);
    }
    if (statusFilter === 'overdue') {
      return r.status !== 'completed' && isBefore(parseISO(r.refill_date), today);
    }
    if (statusFilter === 'completed') {
      return r.status === 'completed';
    }
    // 'all' — show non-completed (original behavior)
    return r.status !== 'completed';
  });

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

  if (displayedRefills.length === 0) {
    const emptyMsg = statusFilter === 'completed'
      ? 'No completed refills yet'
      : statusFilter === 'overdue'
        ? 'No overdue refills — great job!'
        : statusFilter === 'pending'
          ? 'No pending refills right now'
          : 'All refills are up to date';

    return (
      <Card className="border-slate-200/60">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-slate-600">{emptyMsg}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {displayedRefills.map(refill => {
        const urgency = getUrgency(refill.refill_date);
        
        return (
          <Card key={refill.id} className={`border-2 ${urgency.color.includes('red') ? 'border-red-300' : urgency.color.includes('orange') ? 'border-orange-300' : 'border-slate-200'}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${urgency.color}`}>
                    <Pill className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{refill.medication_name}</h3>
                    <p className="text-sm text-slate-600 mb-2">
                      For: {getRecipientName(refill.care_recipient_id)}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">
                          {format(parseISO(refill.refill_date), 'MMM d, yyyy')}
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

                      <Badge variant="outline" className={
                        refill.status === 'ordered' ? 'bg-blue-50 text-blue-700' : ''
                      }>
                        {refill.status}
                      </Badge>
                    </div>

                    {refill.pharmacy && (
                      <p className="text-xs text-slate-500 mt-2">
                        Pharmacy: {refill.pharmacy}
                      </p>
                    )}
                    {refill.assigned_to && (
                      <p className="text-xs text-slate-500">
                        Assigned to: {refill.assigned_to}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {refill.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markOrdered(refill)}
                      className="whitespace-nowrap"
                    >
                      Mark Ordered
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => markCompleted(refill)}
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