import React, { useState } from 'react';
import { useCareRecipients, useMedications, useAppointments, useTasks, useCarePlans } from '@/hooks';
import { usePermissions } from '@/hooks/use-permissions';
import CarePlanGenerator from '../components/ai/CarePlanGenerator';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, User, Calendar, Clock, Heart, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function CarePlans() {
  const [selectedRecipientId, setSelectedRecipientId] = useState(null);
  const [showSavedPlans, setShowSavedPlans] = useState(false);

  const { data: recipients = [] } = useCareRecipients();
  const { data: medications = [] } = useMedications();
  const { data: appointments = [] } = useAppointments();
  const { data: tasks = [] } = useTasks();
  const { permissions } = usePermissions();

  const { data: savedPlans = [] } = useCarePlans(showSavedPlans ? undefined : null);

  const selectedRecipient = recipients.find(r => r.id === selectedRecipientId);
  const recipientMedications = medications.filter(m => m.care_recipient_id === selectedRecipientId && m.is_active !== false);
  const recipientAppointments = appointments.filter(a => a.care_recipient_id === selectedRecipientId);
  const recipientTasks = tasks.filter(t => t.care_recipient_id === selectedRecipientId);

  const getRecipientName = (id) => {
    const recipient = recipients.find(r => r.id === id);
    if (!recipient) return 'Unknown';
    return `${recipient.first_name} ${recipient.last_name}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
          AI Care Plans
        </h1>
        <p className="text-slate-600">Generate personalized care plans with AI assistance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecipientSidebar
          recipients={recipients}
          selectedRecipientId={selectedRecipientId}
          showSavedPlans={showSavedPlans}
          onSelectRecipient={(id) => { setSelectedRecipientId(id); setShowSavedPlans(false); }}
          onToggleSavedPlans={() => setShowSavedPlans(!showSavedPlans)}
        />

        <div className="lg:col-span-2">
          {showSavedPlans ? (
            <SavedPlansList
              savedPlans={savedPlans}
              getRecipientName={getRecipientName}
            />
          ) : (
            <CarePlanGenerator
              recipient={selectedRecipient}
              medications={recipientMedications}
              appointments={recipientAppointments}
              tasks={recipientTasks}
              permissions={permissions}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function RecipientSidebar({ recipients, selectedRecipientId, showSavedPlans, onSelectRecipient, onToggleSavedPlans }) {
  return (
    <Card className="lg:col-span-1 border border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-200">
        <CardTitle className="text-lg text-slate-800">Select Recipient</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2 mb-4">
          {recipients.map(recipient => (
            <Button
              key={recipient.id}
              variant={selectedRecipientId === recipient.id ? "default" : "outline"}
              className={`w-full justify-start ${selectedRecipientId === recipient.id ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
              onClick={() => onSelectRecipient(recipient.id)}
            >
              <User className="w-4 h-4 mr-2" />
              {recipient.first_name} {recipient.last_name}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          className="w-full border-slate-200 text-slate-700 hover:bg-slate-50"
          onClick={onToggleSavedPlans}
        >
          <Calendar className="w-4 h-4 mr-2" />
          View Saved Plans
        </Button>
      </CardContent>
    </Card>
  );
}

function SavedPlansList({ savedPlans, getRecipientName }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Saved Care Plans</h2>
      {savedPlans.length === 0 ? (
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-teal-600" />
            </div>
            <p className="text-slate-500">No saved care plans yet</p>
          </CardContent>
        </Card>
      ) : (
        savedPlans.map(plan => (
          <Card key={plan.id} className="border border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-200 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <FileText className="w-5 h-5 text-teal-600" />
                    {getRecipientName(plan.care_recipient_id)}
                  </CardTitle>
                  <p className="text-sm text-slate-500 mt-1">
                    {plan.title} - Created {format(new Date(plan.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <Badge className="bg-slate-100 text-slate-700 font-medium">{plan.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span className="text-slate-600">{plan.goals?.length || 0} goals</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span className="text-slate-600">{plan.status}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-600">Care Plan</span>
                </div>
              </div>
              {plan.description && (
                <p className="text-sm text-slate-600 mt-2">{plan.description}</p>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
