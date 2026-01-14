import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CalendarView from '../components/calendar/CalendarView';
import AppointmentForm from '../components/appointments/AppointmentForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function Calendar() {
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: recipients = [] } = useQuery({
    queryKey: ['recipients'],
    queryFn: () => base44.entities.CareRecipient.list(),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Calendar</h1>
          <p className="text-slate-500 mt-1">View all appointments, tasks, and medication logs</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>
      
      <CalendarView />

      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl">
          <AppointmentForm 
            recipients={recipients}
            onClose={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}