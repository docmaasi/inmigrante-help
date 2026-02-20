import React, { useState } from 'react';
import { useCareRecipients } from '@/hooks';
import CalendarView from '../components/calendar/CalendarView';
import AppointmentForm from '../components/appointments/AppointmentForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function Calendar() {
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: recipients = [] } = useCareRecipients();

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#4F46E5]">Calendar</h1>
            <p className="text-[#4F46E5]/60 mt-1">View all appointments, tasks, and medication logs</p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-[#E07A5F] to-[#F4A261] hover:from-[#E07A5F]/90 hover:to-[#F4A261]/90 text-white shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>

        <div className="bg-white border border-[#E07A5F]/20 rounded-xl shadow-sm overflow-hidden">
          <CalendarView />
        </div>

        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent className="max-w-2xl">
            <AppointmentForm
              recipients={recipients}
              onClose={() => setShowAddForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
