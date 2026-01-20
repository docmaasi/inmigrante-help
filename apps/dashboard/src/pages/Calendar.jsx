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
    <div className="min-h-screen relative">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ 
          backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/8e1951c10_Untitleddesign14.png)'
        }}
      />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 relative">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
          <p className="text-slate-700 mt-1">View all appointments, tasks, and medication logs</p>
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
    </div>
  );
}