import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CarePlanGenerator from '../components/ai/CarePlanGenerator';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, User, Calendar, Clock, Heart, Users, Activity } from 'lucide-react';
import { format } from 'date-fns';

export default function CarePlans() {
  const [selectedRecipientId, setSelectedRecipientId] = useState(null);
  const [showSavedPlans, setShowSavedPlans] = useState(false);

  const { data: recipients = [] } = useQuery({
    queryKey: ['careRecipients'],
    queryFn: () => base44.entities.CareRecipient.list()
  });

  const { data: medications = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: () => base44.entities.Medication.list()
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list()
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list()
  });

  const { data: savedPlans = [] } = useQuery({
    queryKey: ['carePlans'],
    queryFn: () => base44.entities.CarePlan.list('-generated_date'),
    enabled: showSavedPlans
  });

  const selectedRecipient = recipients.find(r => r.id === selectedRecipientId);
  const recipientMedications = medications.filter(m => m.care_recipient_id === selectedRecipientId && m.active !== false);
  const recipientAppointments = appointments.filter(a => a.care_recipient_id === selectedRecipientId);
  const recipientTasks = tasks.filter(t => t.care_recipient_id === selectedRecipientId);

  const getRecipientName = (id) => {
    return recipients.find(r => r.id === id)?.full_name || 'Unknown';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-purple-600" />
          AI Care Plans
        </h1>
        <p className="text-slate-500 mt-1">Generate personalized care plans with AI assistance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recipient Selector */}
        <Card className="lg:col-span-1">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg">Select Recipient</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2 mb-4">
              {recipients.map(recipient => (
                <Button
                  key={recipient.id}
                  variant={selectedRecipientId === recipient.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => {
                    setSelectedRecipientId(recipient.id);
                    setShowSavedPlans(false);
                  }}
                >
                  <User className="w-4 h-4 mr-2" />
                  {recipient.full_name}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowSavedPlans(!showSavedPlans)}
            >
              <Calendar className="w-4 h-4 mr-2" />
              View Saved Plans
            </Button>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {showSavedPlans ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Saved Care Plans</h2>
              {savedPlans.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No saved care plans yet</p>
                  </CardContent>
                </Card>
              ) : (
                savedPlans.map(plan => {
                  const schedule = JSON.parse(plan.daily_schedule || '[]');
                  const health = JSON.parse(plan.health_monitoring || '{}');
                  const activities = JSON.parse(plan.activities_recommendations || '[]');
                  
                  return (
                    <Card key={plan.id} className="shadow-sm border-slate-200/60">
                      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-purple-50 to-blue-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-purple-600" />
                              {getRecipientName(plan.care_recipient_id)}
                            </CardTitle>
                            <p className="text-sm text-slate-600 mt-1">
                              {plan.plan_type === 'daily' ? 'Daily' : 'Weekly'} Plan • Generated {format(new Date(plan.generated_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <Badge className="bg-purple-600 text-white">{plan.plan_type}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="text-slate-600">{schedule.length} scheduled items</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Heart className="w-4 h-4 text-red-600" />
                            <span className="text-slate-600">{health.vitals_to_track?.length || 0} vitals to track</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-purple-600" />
                            <span className="text-slate-600">{activities.length} activities</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <details className="text-sm">
                            <summary className="cursor-pointer font-medium text-slate-700 hover:text-slate-900">
                              View Schedule ({schedule.length} items)
                            </summary>
                            <div className="mt-2 space-y-1 pl-4">
                              {schedule.slice(0, 5).map((item, idx) => (
                                <div key={idx} className="text-slate-600 flex items-start gap-2">
                                  <Badge variant="outline" className="text-xs">{item.time}</Badge>
                                  <span>{item.activity}</span>
                                </div>
                              ))}
                              {schedule.length > 5 && (
                                <p className="text-slate-500 italic">+{schedule.length - 5} more items</p>
                              )}
                            </div>
                          </details>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          ) : (
            <CarePlanGenerator
              recipient={selectedRecipient}
              medications={recipientMedications}
              appointments={recipientAppointments}
              tasks={recipientTasks}
            />
          )}
        </div>
      </div>
    </div>
  );
}