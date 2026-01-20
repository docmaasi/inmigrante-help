import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Calendar, Pill, ListTodo, FileText, Stethoscope, Phone } from 'lucide-react';
import AppointmentForm from '../appointments/AppointmentForm';
import MedicationForm from '../medications/MedicationForm';
import TaskForm from '../tasks/TaskForm';
import CareNoteForm from '../notes/CareNoteForm';

export default function QuickActions() {
  const [showDialog, setShowDialog] = useState(false);
  const [actionType, setActionType] = useState(null);

  const actions = [
    { id: 'appointment', label: 'Appointment', icon: Calendar, color: 'bg-purple-600 hover:bg-purple-700' },
    { id: 'medication', label: 'Medication', icon: Pill, color: 'bg-green-600 hover:bg-green-700' },
    { id: 'task', label: 'Task', icon: ListTodo, color: 'bg-blue-600 hover:bg-blue-700' },
    { id: 'note', label: 'Care Note', icon: FileText, color: 'bg-orange-600 hover:bg-orange-700' }
  ];

  const handleAction = (type) => {
    setActionType(type);
    setShowDialog(true);
  };

  const handleClose = () => {
    setShowDialog(false);
    setActionType(null);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse gap-2">
        {actions.map(action => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              onClick={() => handleAction(action.id)}
              className={`${action.color} shadow-lg hover:shadow-xl transition-all`}
              size="lg"
            >
              <Icon className="w-5 h-5 mr-2" />
              {action.label}
            </Button>
          );
        })}
      </div>

      <Dialog open={showDialog} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Quick Add {actionType === 'appointment' ? 'Appointment' : 
                        actionType === 'medication' ? 'Medication' :
                        actionType === 'task' ? 'Task' : 'Care Note'}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {actionType === 'appointment' && <AppointmentForm onClose={handleClose} />}
            {actionType === 'medication' && <MedicationForm onClose={handleClose} />}
            {actionType === 'task' && <TaskForm onClose={handleClose} />}
            {actionType === 'note' && <CareNoteForm onClose={handleClose} />}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}