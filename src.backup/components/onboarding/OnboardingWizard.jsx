import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Users, FileText, Calendar, Pill, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function OnboardingWizard({ onDismiss }) {
  const [dismissed, setDismissed] = useState(false);

  const { data: recipients = [] } = useQuery({
    queryKey: ['careRecipients'],
    queryFn: () => base44.entities.CareRecipient.list()
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: () => base44.entities.TeamMember.list()
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list()
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list()
  });

  const { data: medications = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: () => base44.entities.Medication.list()
  });

  useEffect(() => {
    const isDismissed = localStorage.getItem('onboarding_dismissed');
    setDismissed(isDismissed === 'true');
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('onboarding_dismissed', 'true');
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  const steps = [
    {
      id: 'recipients',
      title: 'Add Care Recipients',
      description: 'Add the people you care for',
      icon: Users,
      completed: recipients.length > 0,
      link: 'CareRecipients'
    },
    {
      id: 'team',
      title: 'Invite Team Members',
      description: 'Add family and caregivers',
      icon: Users,
      completed: teamMembers.length > 0,
      link: 'Team'
    },
    {
      id: 'documents',
      title: 'Upload Documents',
      description: 'Add insurance and medical records',
      icon: FileText,
      completed: documents.length > 0,
      link: 'Documents'
    },
    {
      id: 'appointments',
      title: 'Schedule Appointments',
      description: 'Add upcoming doctor visits',
      icon: Calendar,
      completed: appointments.length > 0,
      link: 'Appointments'
    },
    {
      id: 'medications',
      title: 'Add Medications',
      description: 'Track prescriptions and dosages',
      icon: Pill,
      completed: medications.length > 0,
      link: 'Medications'
    }
  ];

  const completedSteps = steps.filter(s => s.completed).length;
  const progress = (completedSteps / steps.length) * 100;
  const allComplete = completedSteps === steps.length;

  if (dismissed || allComplete) return null;

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Get Started with FamilyCare.Help</CardTitle>
          <Button variant="ghost" size="icon" onClick={handleDismiss}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-600">{completedSteps} of {steps.length} completed</span>
            <span className="font-medium text-blue-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {steps.map(step => {
            const Icon = step.icon;
            return (
              <Link key={step.id} to={createPageUrl(step.link)}>
                <div className={`p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                  step.completed 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-white border-slate-200 hover:border-blue-300'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {step.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Icon className="w-5 h-5 text-slate-400" />
                    )}
                    <h4 className={`font-medium text-sm ${step.completed ? 'text-green-700' : 'text-slate-700'}`}>
                      {step.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500">{step.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}