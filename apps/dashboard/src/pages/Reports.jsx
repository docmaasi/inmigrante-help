import React, { useState } from 'react';
import { useCareRecipients } from '@/hooks';
import { Card, CardContent } from '../components/ui/card';
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

  const { data: recipients = [] } = useCareRecipients();

  const tabStyle = "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E07A5F] data-[state=active]:to-[#F4A261] data-[state=active]:text-white";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7F2] via-[#FFF7ED] to-[#F4A261]/8 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#E07A5F] to-[#F4A261] rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-[#E07A5F] to-[#F4A261] bg-clip-text text-transparent">
              Care Reports
            </span>
          </h1>
          <p className="text-[#8B7EC8] ml-14">Generate comprehensive reports and insights for your care recipients</p>
        </div>

        <ReportFilters
          dateRange={dateRange}
          setDateRange={setDateRange}
          selectedRecipient={selectedRecipient}
          setSelectedRecipient={setSelectedRecipient}
          recipients={recipients}
        />

        {selectedRecipient ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border border-[#E07A5F]/15 shadow-sm rounded-lg">
              <TabsTrigger value="medication" className={`flex items-center gap-2 ${tabStyle}`}>
                <Pill className="w-4 h-4" />
                <span className="hidden md:inline">Medication</span>
              </TabsTrigger>
              <TabsTrigger value="appointments" className={`flex items-center gap-2 ${tabStyle}`}>
                <Calendar className="w-4 h-4" />
                <span className="hidden md:inline">Appointments</span>
              </TabsTrigger>
              <TabsTrigger value="refills" className={`flex items-center gap-2 ${tabStyle}`}>
                <TrendingUp className="w-4 h-4" />
                <span className="hidden md:inline">Refills</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className={`flex items-center gap-2 ${tabStyle}`}>
                <BarChart3 className="w-4 h-4" />
                <span className="hidden md:inline">Activity</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="medication" className="mt-6">
              <MedicationAdherenceReport
                recipientId={selectedRecipient.id}
                recipientName={`${selectedRecipient.first_name} ${selectedRecipient.last_name}`}
                dateRange={dateRange}
              />
            </TabsContent>

            <TabsContent value="appointments" className="mt-6">
              <AppointmentSummaryReport
                recipientId={selectedRecipient.id}
                recipientName={`${selectedRecipient.first_name} ${selectedRecipient.last_name}`}
                dateRange={dateRange}
              />
            </TabsContent>

            <TabsContent value="refills" className="mt-6">
              <RefillHistoryReport
                recipientId={selectedRecipient.id}
                recipientName={`${selectedRecipient.first_name} ${selectedRecipient.last_name}`}
                dateRange={dateRange}
              />
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <ActivityLogReport
                recipientId={selectedRecipient.id}
                recipientName={`${selectedRecipient.first_name} ${selectedRecipient.last_name}`}
                dateRange={dateRange}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="mt-6 border-[#E07A5F]/15 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#E07A5F]/10 to-[#F4A261]/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-[#E07A5F]" />
              </div>
              <p className="text-[#4F46E5] text-lg">Select a care recipient to view their reports</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
