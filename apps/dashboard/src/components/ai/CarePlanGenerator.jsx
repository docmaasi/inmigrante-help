import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { useCreateCarePlan } from '@/hooks/use-care-plans';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Sparkles, Calendar, Heart, Activity, Users, Clock, AlertCircle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export function CarePlanGenerator({ recipient, medications = [], appointments = [], tasks = [] }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createCarePlanMutation = useCreateCarePlan();

  const generateCarePlan = async (planType) => {
    setIsGenerating(true);
    try {
      const recipientName = `${recipient.first_name} ${recipient.last_name}`;
      const prompt = `You are a professional care planning assistant. Generate a comprehensive ${planType} care plan for the following care recipient:

**Care Recipient Profile:**
- Name: ${recipientName}
- Primary Condition: ${recipient.primary_condition || 'Not specified'}
- Allergies: ${recipient.allergies || 'None listed'}
- Date of Birth: ${recipient.date_of_birth || 'Not provided'}

**Current Medications (${medications.length}):**
${medications.map(m => `- ${m.name}: ${m.dosage}, ${m.frequency || ''} ${m.time_of_day ? `at ${m.time_of_day}` : ''}`).join('\n')}

**Upcoming Appointments (${appointments.length}):**
${appointments.slice(0, 5).map(a => `- ${a.title} on ${a.start_time ? new Date(a.start_time).toLocaleDateString() : a.date}`).join('\n')}

**Current Tasks (${tasks.length}):**
${tasks.slice(0, 5).map(t => `- ${t.title} (${t.priority} priority)`).join('\n')}

**Additional Notes:**
${recipient.notes || 'None'}

${customPrompt ? `**Special Instructions from Caregiver:**\n${customPrompt}\n` : ''}
Please generate a comprehensive care plan with the following sections:

1. **Daily/Weekly Schedule**: Structured schedule with specific times for medications, meals, activities, and rest periods
2. **Health Monitoring**: Specific vitals to monitor (blood pressure, glucose, etc.), warning signs to watch for, and when to contact healthcare providers
3. **Activities & Social Engagement**: Age-appropriate activities for physical, mental, and social well-being
4. **Special Considerations**: Important reminders based on their condition and medications

Format your response to be clear, actionable, and compassionate.`;

      const { data, error } = await supabase.functions.invoke('generate-care-plan', {
        body: {
          prompt,
          responseSchema: {
            type: "object",
            properties: {
              daily_schedule: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    time: { type: "string" },
                    activity: { type: "string" },
                    notes: { type: "string" }
                  }
                }
              },
              health_monitoring: {
                type: "object",
                properties: {
                  vitals_to_track: { type: "array", items: { type: "string" } },
                  warning_signs: { type: "array", items: { type: "string" } },
                  checkup_frequency: { type: "string" }
                }
              },
              activities_recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: { type: "string" },
                    activity: { type: "string" },
                    frequency: { type: "string" },
                    benefits: { type: "string" }
                  }
                }
              },
              special_considerations: { type: "array", items: { type: "string" } }
            }
          }
        }
      });

      if (error) throw error;

      setGeneratedPlan({
        type: planType,
        data: data
      });
    } catch (error) {
      toast.error('Failed to generate care plan');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const savePlan = () => {
    createCarePlanMutation.mutate(
      {
        care_recipient_id: recipient.id,
        plan_type: generatedPlan.type,
        daily_schedule: JSON.stringify(generatedPlan.data.daily_schedule),
        health_monitoring: JSON.stringify(generatedPlan.data.health_monitoring),
        activities_recommendations: JSON.stringify(generatedPlan.data.activities_recommendations),
        special_notes: JSON.stringify(generatedPlan.data.special_considerations),
        generated_date: new Date().toISOString().split('T')[0]
      },
      {
        onSuccess: () => {
          toast.success('Care plan saved');
          setGeneratedPlan(null);
        },
        onError: () => toast.error('Failed to save care plan')
      }
    );
  };

  if (!recipient) {
    return (
      <Card className="border-slate-200/60">
        <CardContent className="p-8 text-center">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Select a care recipient to generate an AI care plan</p>
        </CardContent>
      </Card>
    );
  }

  if (generatedPlan) {
    const recipientName = `${recipient.first_name} ${recipient.last_name}`;
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              AI-Generated Care Plan for {recipientName}
            </CardTitle>
            <p className="text-sm text-purple-100">
              {generatedPlan.type === 'daily' ? 'Daily' : 'Weekly'} care schedule and recommendations
            </p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Daily Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {generatedPlan.data.daily_schedule?.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <Badge className="bg-blue-600 text-white mt-0.5">{item.time}</Badge>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{item.activity}</p>
                    {item.notes && <p className="text-sm text-slate-600 mt-1">{item.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600" />
              Health Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-600" />
                Vitals to Track
              </h4>
              <div className="flex flex-wrap gap-2">
                {generatedPlan.data.health_monitoring?.vitals_to_track?.map((vital, idx) => (
                  <Badge key={idx} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {vital}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                Warning Signs
              </h4>
              <ul className="space-y-1">
                {generatedPlan.data.health_monitoring?.warning_signs?.map((sign, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">-</span>
                    {sign}
                  </li>
                ))}
              </ul>
            </div>
            {generatedPlan.data.health_monitoring?.checkup_frequency && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Check-up Frequency:</span> {generatedPlan.data.health_monitoring.checkup_frequency}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Recommended Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedPlan.data.activities_recommendations?.map((activity, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-slate-200 bg-white hover:shadow-md transition-shadow">
                  <Badge className="bg-purple-100 text-purple-800 mb-2">{activity.category}</Badge>
                  <h4 className="font-semibold text-slate-800 mb-1">{activity.activity}</h4>
                  <p className="text-sm text-slate-600 mb-2">{activity.frequency}</p>
                  <p className="text-xs text-slate-500 italic">{activity.benefits}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {generatedPlan.data.special_considerations?.length > 0 && (
          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader className="border-b border-orange-200">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertCircle className="w-5 h-5" />
                Special Considerations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-2">
                {generatedPlan.data.special_considerations.map((note, idx) => (
                  <li key={idx} className="text-sm text-orange-900 flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5 font-bold">-</span>
                    {note}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <Button onClick={() => setGeneratedPlan(null)} variant="outline" className="flex-1">
            Generate New Plan
          </Button>
          <Button onClick={savePlan} disabled={createCarePlanMutation.isPending} className="flex-1 bg-purple-600 hover:bg-purple-700">
            {createCarePlanMutation.isPending ? 'Saving...' : 'Save This Plan'}
          </Button>
        </div>
      </div>
    );
  }

  const recipientName = `${recipient.first_name} ${recipient.last_name}`;
  return (
    <Card className="border-slate-200/60">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Care Plan Generator
        </CardTitle>
        <p className="text-sm text-slate-500">Generate a personalized care plan for {recipientName}</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-slate-600">Medications</p>
              <p className="font-bold text-slate-800">{medications.length} active</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-slate-600">Appointments</p>
              <p className="font-bold text-slate-800">{appointments.length} upcoming</p>
            </div>
          </div>

          {/* AI Prompt Input */}
          <div className="pt-4 space-y-2">
            <Label htmlFor="ai-prompt" className="flex items-center gap-2 text-slate-700">
              <MessageSquare className="w-4 h-4 text-purple-600" />
              Custom Instructions for AI (Optional)
            </Label>
            <Textarea
              id="ai-prompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Tell the AI what to focus on, e.g., 'Focus on mobility exercises and fall prevention' or 'Include activities for dementia care and memory exercises' or 'Create a plan that works around dialysis appointments on Mon/Wed/Fri'"
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-slate-500">
              Add specific needs, preferences, or areas you want the AI to focus on when creating the care plan.
            </p>
          </div>

          <div className="pt-4 space-y-3">
            <Button
              onClick={() => generateCarePlan('daily')}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Daily Care Plan'}
            </Button>
            <Button
              onClick={() => generateCarePlan('weekly')}
              disabled={isGenerating}
              variant="outline"
              className="w-full"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Weekly Care Plan'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CarePlanGenerator;
