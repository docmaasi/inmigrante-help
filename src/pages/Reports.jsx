import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { FileText, TrendingUp, Calendar, Pill, BarChart3 } from 'lucide-react';
import ReportFilters from '../components/reports/ReportFilters';
import MedicationAdherenceReport from '../components/reports/MedicationAdherenceReport';
import ActivityLogReport from '../components/reports/ActivityLogReport';
import AppointmentSummaryReport from '../components/reports/AppointmentSummaryReport';
import RefillHistoryReport from '../components/reports/RefillHistoryReport';

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [activeTab, setActiveTab] = useState('medication');

  const { data: recipients = [] } = useQuery({
    queryKey: ['careRecipients'],
    queryFn: () => base44.entities.CareRecipient.list()
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Care Reports
          </h1>
          <p className="text-slate-600">Generate comprehensive reports and insights for your care recipients</p>
        </div>

        {/* Filters */}
        <ReportFilters
          dateRange={dateRange}
          setDateRange={setDateRange}
          selectedRecipient={selectedRecipient}
          setSelectedRecipient={setSelectedRecipient}
          recipients={recipients}
        />

        {selectedRecipient ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-4 bg-white border border-slate-200">
              <TabsTrigger value="medication" className="flex items-center gap-2">
                <Pill className="w-4 h-4" />
                <span className="hidden md:inline">Medication</span>
              </TabsTrigger>
              <TabsTrigger value="appointments" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="hidden md:inline">Appointments</span>
              </TabsTrigger>
              <TabsTrigger value="refills" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden md:inline">Refills</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden md:inline">Activity</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="medication" className="mt-6">
              <MedicationAdherenceReport
                recipientId={selectedRecipient.id}
                recipientName={selectedRecipient.full_name}
                dateRange={dateRange}
              />
            </TabsContent>

            <TabsContent value="appointments" className="mt-6">
              <AppointmentSummaryReport
                recipientId={selectedRecipient.id}
                recipientName={selectedRecipient.full_name}
                dateRange={dateRange}
              />
            </TabsContent>

            <TabsContent value="refills" className="mt-6">
              <RefillHistoryReport
                recipientId={selectedRecipient.id}
                recipientName={selectedRecipient.full_name}
                dateRange={dateRange}
              />
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <ActivityLogReport
                recipientId={selectedRecipient.id}
                recipientName={selectedRecipient.full_name}
                dateRange={dateRange}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="mt-6 border-slate-200">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 text-lg">Select a care recipient to view their reports</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}