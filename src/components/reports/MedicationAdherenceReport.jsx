import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { parseISO, startOfDay } from 'date-fns';
import ReportExporter from './ReportExporter';
import { Pill, TrendingUp } from 'lucide-react';

export default function MedicationAdherenceReport({ recipientId, recipientName, dateRange }) {
  const contentRef = useRef(null);
  const { data: medicationLogs = [] } = useQuery({
    queryKey: ['medicationLogs', recipientId, dateRange],
    queryFn: () => base44.entities.MedicationLog.filter({
      care_recipient_id: recipientId
    })
  });

  const { data: medications = [] } = useQuery({
    queryKey: ['medications', recipientId],
    queryFn: () => base44.entities.Medication.filter({
      care_recipient_id: recipientId,
      active: true
    })
  });

  // Filter logs by date range
  const filteredLogs = medicationLogs.filter(log => {
    const logDate = parseISO(log.date_taken);
    const startDate = parseISO(dateRange.startDate);
    const endDate = parseISO(dateRange.endDate);
    return logDate >= startDate && logDate <= endDate;
  });

  // Exclude pending entries — today's unfinished doses shouldn't skew the math
  const resolvedLogs = filteredLogs.filter(log => log.status !== 'pending');

  // Calculate adherence metrics
  const totalDoses = resolvedLogs.length;
  const takenDoses = resolvedLogs.filter(log => log.status === 'taken').length;
  const skippedDoses = resolvedLogs.filter(log => log.status === 'skipped').length;
  const missedDoses = resolvedLogs.filter(log => log.status === 'missed').length;
  const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;

  // Prepare chart data by date (only resolved entries)
  const chartData = {};
  resolvedLogs.forEach(log => {
    const date = log.date_taken;
    if (!chartData[date]) {
      chartData[date] = { date, taken: 0, skipped: 0, missed: 0, total: 0 };
    }
    chartData[date][log.status === 'taken' ? 'taken' : log.status === 'skipped' ? 'skipped' : 'missed']++;
    chartData[date].total++;
  });

  const chartDataArray = Object.values(chartData).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Medication-specific adherence
  const medicationAdherence = {};
  medications.forEach(med => {
    const medLogs = resolvedLogs.filter(log => log.medication_id === med.id);
    const medTaken = medLogs.filter(log => log.status === 'taken').length;
    const medRate = medLogs.length > 0 ? Math.round((medTaken / medLogs.length) * 100) : 0;
    medicationAdherence[med.medication_name] = {
      total: medLogs.length,
      taken: medTaken,
      rate: medRate
    };
  });

  const reportContent = (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{adherenceRate}%</p>
            <p className="text-sm text-slate-600">Overall Adherence</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{takenDoses}</p>
            <p className="text-sm text-slate-600">Doses Taken</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">{skippedDoses}</p>
            <p className="text-sm text-slate-600">Doses Skipped</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-red-600">{missedDoses}</p>
            <p className="text-sm text-slate-600">Doses Missed</p>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      {chartDataArray.length > 0 && (
        <Card>
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Adherence Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartDataArray}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="taken" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="skipped" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="missed" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Medication-Specific Adherence */}
      {Object.keys(medicationAdherence).length > 0 && (
        <Card>
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5" />
              Adherence by Medication
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {Object.entries(medicationAdherence).map(([medName, data]) => (
                <div key={medName} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{medName}</p>
                    <p className="text-sm text-slate-600">{data.taken} of {data.total} doses taken</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-800">{data.rate}%</p>
                    <Badge className={data.rate >= 80 ? 'bg-green-100 text-green-800' : data.rate >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                      {data.rate >= 80 ? 'Good' : data.rate >= 50 ? 'Fair' : 'Poor'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <ReportExporter
        title={`Medication Adherence Report - ${recipientName}`}
        dateRange={dateRange}
        contentRef={contentRef}
      />
      <div ref={contentRef}>
        {reportContent}
      </div>
    </div>
  );
}