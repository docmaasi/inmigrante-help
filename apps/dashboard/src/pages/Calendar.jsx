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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Calendar</h1>
            <p className="text-slate-500 mt-1">View all appointments, tasks, and medication logs</p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
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
