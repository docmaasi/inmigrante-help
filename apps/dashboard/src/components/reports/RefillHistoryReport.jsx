import React, { useRef } from 'react';
import { useMedicationRefills } from '@/hooks/use-refills';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { parseISO, format, isWithinInterval } from 'date-fns';
import ReportExporter from './ReportExporter';
import { Bell, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export function RefillHistoryReport({ recipientId, recipientName, dateRange }) {
  const contentRef = useRef(null);

  const { data: refills = [] } = useMedicationRefills();

  const filteredRefills = refills.filter(refill => {
    if (!refill.requested_date) return false;
    try {
      const refillDate = parseISO(refill.requested_date);
      const startDate = parseISO(dateRange.startDate);
      const endDate = parseISO(dateRange.endDate);
      const matchesCareRecipient = refill.medications?.care_recipient_id === recipientId;
      return matchesCareRecipient && isWithinInterval(refillDate, { start: startDate, end: endDate });
    } catch {
      return false;
    }
  }).sort((a, b) => new Date(b.requested_date) - new Date(a.requested_date));

  const completed = filteredRefills.filter(r => r.status === 'completed').length;
  const ordered = filteredRefills.filter(r => r.status === 'ordered').length;
  const pending = filteredRefills.filter(r => r.status === 'pending').length;

  const statusConfig = {
    completed: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Completed' },
    ordered: { icon: Clock, color: 'bg-blue-100 text-blue-800', label: 'Ordered' },
    pending: { icon: AlertCircle, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' }
  };

  const medicationRefills = {};
  filteredRefills.forEach(refill => {
    const medName = refill.medications?.name || 'Unknown';
    if (!medicationRefills[medName]) {
      medicationRefills[medName] = [];
    }
    medicationRefills[medName].push(refill);
  });

  const reportContent = (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{completed}</p>
            <p className="text-sm text-slate-600">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{ordered}</p>
            <p className="text-sm text-slate-600">Ordered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">{pending}</p>
            <p className="text-sm text-slate-600">Pending</p>
          </CardContent>
        </Card>
      </div>

      {Object.keys(medicationRefills).length > 0 && (
        <Card>
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Refills by Medication</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Object.entries(medicationRefills).map(([medName, medRefills]) => (
                <div key={medName} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="font-semibold text-slate-800 mb-3">{medName}</h4>
                  <div className="space-y-2">
                    {medRefills.map((refill, idx) => {
                      const config = statusConfig[refill.status] || statusConfig.pending;
                      return (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white rounded">
                          <div className="flex-1">
                            <p className="text-sm text-slate-700">
                              {format(parseISO(refill.requested_date), 'MMM d, yyyy')}
                            </p>
                            {refill.pharmacy && (
                              <p className="text-xs text-slate-500">{refill.pharmacy}</p>
                            )}
                          </div>
                          <Badge className={config.color}>{config.label}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredRefills.length > 0 && (
        <Card>
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Refill Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {filteredRefills.map((refill) => {
                const config = statusConfig[refill.status] || statusConfig.pending;
                return (
                  <div key={refill.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-slate-800">{refill.medications?.name || 'Unknown'}</h4>
                        <p className="text-sm text-slate-600">
                          Requested: {format(parseISO(refill.requested_date), 'MMMM d, yyyy')}
                        </p>
                      </div>
                      <Badge className={config.color}>{config.label}</Badge>
                    </div>
                    {refill.pharmacy && (
                      <p className="text-sm text-slate-700">Pharmacy: {refill.pharmacy}</p>
                    )}
                    {refill.assigned_to && (
                      <p className="text-sm text-slate-700">Assigned to: {refill.assigned_to}</p>
                    )}
                    {refill.completed_at && (
                      <p className="text-sm text-green-700">
                        Completed: {format(parseISO(refill.completed_at), 'MMMM d, yyyy')}
                      </p>
                    )}
                    {refill.notes && (
                      <p className="text-sm text-slate-600 mt-2 italic">{refill.notes}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredRefills.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-500">No refills found in this date range</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <ReportExporter
        title={`Refill History Report - ${recipientName}`}
        dateRange={dateRange}
        contentRef={contentRef}
      />
      <div ref={contentRef}>
        {reportContent}
      </div>
    </div>
  );
}

export default RefillHistoryReport;
