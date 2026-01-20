import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, ChevronLeft, Check, Sparkles, Users, CreditCard, Calendar, Heart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const tutorialSteps = [
  {
    title: "Welcome to FamilyCare.Help! 🎉",
    description: "We're here to help you coordinate care for your loved ones with clarity and peace of mind.",
    icon: Heart,
    color: "text-blue-600"
  },
  {
    title: "Managing Your Care Team",
    description: "Add family members, professional caregivers, and healthcare providers to collaborate seamlessly. Go to the Team page to invite members and assign roles.",
    icon: Users,
    color: "text-purple-600"
  },
  {
    title: "Subscription & Team Limits",
    description: "Your subscription determines how many team members you can add. Visit the Subscribe page to view plans and add more members as needed.",
    icon: CreditCard,
    color: "text-green-600"
  },
  {
    title: "Track Appointments & Tasks",
    description: "Use the Calendar to schedule appointments, and Tasks to assign and track care activities. Stay organized and never miss important dates.",
    icon: Calendar,
    color: "text-orange-600"
  },
  {
    title: "You're All Set!",
    description: "Start by adding your first care recipient and building your care team. We're here to support you every step of the way.",
    icon: Sparkles,
    color: "text-pink-600"
  }
];

const checklistItems = [
  { id: 'add_recipient', label: 'Add your first care recipient', page: 'CareRecipients' },
  { id: 'invite_team', label: 'Invite a team member', page: 'Team' },
  { id: 'schedule_appointment', label: 'Schedule an appointment', page: 'Appointments' },
  { id: 'add_medication', label: 'Add a medication', page: 'Medications' },
  { id: 'review_subscription', label: 'Review subscription options', page: 'Checkout' }
];

export default function OnboardingFlow({ user }) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const queryClient = useQueryClient();

  const { data: progress, isLoading } = useQuery({
    queryKey: ['onboarding', user?.email],
    queryFn: async () => {
      const results = await base44.entities.OnboardingProgress.filter({ user_email: user.email });
      return results[0] || null;
    },
    enabled: !!user?.email
  });

  const createProgressMutation = useMutation({
    mutationFn: (data) => base44.entities.OnboardingProgress.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['onboarding'] })
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.OnboardingProgress.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['onboarding'] })
  });

  const sendWelcomeEmail = async () => {
    try {
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: "Welcome to FamilyCare.Help! 🎉",
        body: `
          <h2>Welcome to FamilyCare.Help!</h2>
          <p>Hi ${user.full_name || 'there'},</p>
          <p>We're thrilled to have you join our community of caregivers dedicated to providing the best care for their loved ones.</p>
          
          <h3>Getting Started:</h3>
          <ul>
            <li><strong>Add Care Recipients:</strong> Create profiles for those you're caring for</li>
            <li><strong>Build Your Team:</strong> Invite family members and caregivers to collaborate</li>
            <li><strong>Stay Organized:</strong> Track medications, appointments, and daily tasks</li>
            <li><strong>Communicate:</strong> Share updates and coordinate care in real-time</li>
          </ul>
          
          <p>If you have any questions, our support team is here to help!</p>
          <p>Best regards,<br>The FamilyCare.Help Team</p>
        `
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  };

  useEffect(() => {
    if (user && !isLoading && !progress) {
      // New user - create progress and show tutorial
      const checklist = checklistItems.map(item => ({ ...item, completed: false }));
      createProgressMutation.mutate({
        user_email: user.email,
        onboarding_completed: false,
        tutorial_completed: false,
        welcome_email_sent: false,
        checklist_items: JSON.stringify(checklist),
        current_step: 0
      });
      setShowTutorial(true);
      sendWelcomeEmail();
    } else if (progress && !progress.tutorial_completed) {
      setShowTutorial(true);
      setCurrentStep(progress.current_step || 0);
    }

    // Send welcome email if not sent
    if (progress && !progress.welcome_email_sent) {
      sendWelcomeEmail();
      updateProgressMutation.mutate({
        id: progress.id,
        data: { welcome_email_sent: true }
      });
    }
  }, [user, progress, isLoading]);

  const handleNext = () => {
    const nextStep = currentStep + 1;
    if (nextStep < tutorialSteps.length) {
      setCurrentStep(nextStep);
      if (progress) {
        updateProgressMutation.mutate({
          id: progress.id,
          data: { current_step: nextStep }
        });
      }
    } else {
      handleCompleteTutorial();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      if (progress) {
        updateProgressMutation.mutate({
          id: progress.id,
          data: { current_step: prevStep }
        });
      }
    }
  };

  const handleCompleteTutorial = () => {
    if (progress) {
      updateProgressMutation.mutate({
        id: progress.id,
        data: { tutorial_completed: true }
      });
    }
    setShowTutorial(false);
  };

  const handleSkip = () => {
    handleCompleteTutorial();
  };

  const toggleChecklistItem = (itemId) => {
    if (!progress) return;
    const checklist = JSON.parse(progress.checklist_items || '[]');
    const updatedChecklist = checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    
    const allCompleted = updatedChecklist.every(item => item.completed);
    
    updateProgressMutation.mutate({
      id: progress.id,
      data: {
        checklist_items: JSON.stringify(updatedChecklist),
        onboarding_completed: allCompleted
      }
    });
  };

  if (isLoading || !progress) return null;

  const currentTutorialStep = tutorialSteps[currentStep];
  const Icon = currentTutorialStep.icon;
  const progressPercent = ((currentStep + 1) / tutorialSteps.length) * 100;

  const checklist = JSON.parse(progress.checklist_items || '[]');
  const completedCount = checklist.filter(item => item.completed).length;

  return (
    <>
      {/* Tutorial Dialog */}
      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon className={`w-6 h-6 ${currentTutorialStep.color}`} />
              {currentTutorialStep.title}
            </DialogTitle>
            <DialogDescription>{currentTutorialStep.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Progress value={progressPercent} className="h-2" />
            <p className="text-sm text-slate-500 text-center">
              Step {currentStep + 1} of {tutorialSteps.length}
            </p>
          </div>

          <div className="flex justify-between gap-3">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="text-slate-600"
            >
              Skip Tutorial
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button onClick={handleNext}>
                {currentStep === tutorialSteps.length - 1 ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Finish
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Setup Checklist - Show if tutorial completed but not all items done */}
      {progress.tutorial_completed && !progress.onboarding_completed && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Sparkles className="w-5 h-5" />
              Complete Your Setup ({completedCount}/{checklist.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => toggleChecklistItem(item.id)}
                    id={item.id}
                  />
                  <label
                    htmlFor={item.id}
                    className={`flex-1 cursor-pointer ${
                      item.completed ? 'line-through text-slate-500' : 'text-slate-700'
                    }`}
                  >
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}