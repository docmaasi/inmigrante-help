import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useCreateCarePlan, useUpdateCarePlanDetails } from '@/hooks/use-care-plans';
import { useCreateAnnouncement } from '@/hooks/use-team';
import { Card, CardContent } from '../ui/card';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { CarePlanOptions } from './CarePlanOptions';
import { CarePlanViewer } from './CarePlanViewer';
import { CarePlanInputForm } from './CarePlanInputForm';
import { printCarePlanAI } from './CarePlanPrintAI';
import { buildPrompt, buildResponseSchema } from './care-plan-prompt';

export function CarePlanGenerator({
  recipient,
  medications = [],
  appointments = [],
  tasks = [],
  permissions,
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlans, setGeneratedPlans] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planType, setPlanType] = useState('daily');
  const [customPrompt, setCustomPrompt] = useState('');

  const createCarePlanMutation = useCreateCarePlan();
  const updateDetailsMutation = useUpdateCarePlanDetails();
  const createAnnouncementMutation = useCreateAnnouncement();

  const recipientName = recipient
    ? `${recipient.first_name} ${recipient.last_name}`
    : '';

  const generateCarePlan = async (type) => {
    setPlanType(type);
    setIsGenerating(true);
    setGeneratedPlans(null);
    setSelectedPlan(null);

    try {
      const prompt = buildPrompt(type, recipient, medications, appointments, tasks, customPrompt);
      const responseSchema = buildResponseSchema();

      const { data, error } = await supabase.functions.invoke(
        'generate-care-plan',
        { body: { prompt, responseSchema } }
      );

      if (error) throw error;

      const plans = data?.plans || [data];
      setGeneratedPlans(plans);
    } catch (err) {
      toast.error('Failed to generate care plans. Please try again.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    const today = new Date().toLocaleDateString();
    const typeLabel = planType === 'daily' ? 'Daily' : 'Weekly';
    const label = selectedPlan.label ? ` (${selectedPlan.label})` : '';

    createCarePlanMutation.mutate(
      {
        care_recipient_id: recipient.id,
        title: `${typeLabel} Care Plan — ${recipientName}${label} (${today})`,
        description: selectedPlan.summary || `AI-generated ${typeLabel.toLowerCase()} care plan`,
        status: 'active',
        goals: selectedPlan.special_considerations || [],
      },
      {
        onSuccess: (saved) => {
          const details = [
            { section: 'daily_schedule', content: selectedPlan.daily_schedule },
            { section: 'health_monitoring', content: selectedPlan.health_monitoring },
            { section: 'activities_recommendations', content: selectedPlan.activities_recommendations },
            { section: 'special_considerations', content: selectedPlan.special_considerations },
          ].filter((d) => d.content);

          updateDetailsMutation.mutate(
            { carePlanId: saved.id, details },
            {
              onSuccess: () => {
                toast.success('Care plan saved');
                setSelectedPlan(null);
                setGeneratedPlans(null);
              },
              onError: () => toast.error('Plan created but failed to save details'),
            }
          );
        },
        onError: () => toast.error('Failed to save care plan'),
      }
    );
  };

  const handlePrint = () => {
    printCarePlanAI({
      plan: selectedPlan,
      recipientName,
      planType,
    });
  };

  const handleShare = () => {
    const typeLabel = planType === 'daily' ? 'Daily' : 'Weekly';
    const label = selectedPlan.label || typeLabel;

    createAnnouncementMutation.mutate(
      {
        title: `Care Plan Shared: ${recipientName} — ${label}`,
        content: selectedPlan.summary || `A new ${typeLabel.toLowerCase()} care plan has been shared.`,
        priority: 'normal',
      },
      {
        onSuccess: () => toast.success('Plan shared with your team'),
        onError: () => toast.error('Failed to share plan'),
      }
    );
  };

  // No recipient selected
  if (!recipient) {
    return (
      <Card className="border-slate-200/60">
        <CardContent className="p-8 text-center">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">
            Select a care recipient to generate an AI care plan
          </p>
        </CardContent>
      </Card>
    );
  }

  // Step 3: Viewing selected plan
  if (selectedPlan) {
    return (
      <CarePlanViewer
        plan={selectedPlan}
        planType={planType}
        recipientName={recipientName}
        permissions={permissions}
        onBack={() => setSelectedPlan(null)}
        onSave={handleSave}
        onPrint={handlePrint}
        onShare={handleShare}
        isSaving={createCarePlanMutation.isPending}
      />
    );
  }

  // Step 2: Comparing 3 options
  if (generatedPlans || isGenerating) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              AI Care Plan Options for {recipientName}
            </CardTitle>
            <p className="text-sm text-purple-100">
              {planType === 'daily' ? 'Daily' : 'Weekly'} care plan — choose the best option
            </p>
          </CardHeader>
        </Card>
        <CarePlanOptions
          plans={generatedPlans || []}
          isLoading={isGenerating}
          onSelect={setSelectedPlan}
          onRegenerate={() => generateCarePlan(planType)}
        />
      </div>
    );
  }

  // Step 1: Input form
  return (
    <CarePlanInputForm
      recipientName={recipientName}
      medications={medications}
      appointments={appointments}
      customPrompt={customPrompt}
      setCustomPrompt={setCustomPrompt}
      isGenerating={isGenerating}
      permissions={permissions}
      onGenerate={generateCarePlan}
    />
  );
}

export default CarePlanGenerator;
