import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Sparkles, Calendar, MessageSquare } from 'lucide-react';

export function CarePlanInputForm({
  recipientName,
  medications,
  appointments,
  customPrompt,
  setCustomPrompt,
  isGenerating,
  permissions,
  onGenerate,
}) {
  const canGenerate = permissions?.canEditRecords !== false;

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Care Plan Generator
        </CardTitle>
        <p className="text-sm text-slate-500">
          Generate 3 personalized care plan options for {recipientName}
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-slate-600">Medications</p>
            <p className="font-bold text-slate-800">
              {medications.length} active
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-slate-600">Appointments</p>
            <p className="font-bold text-slate-800">
              {appointments.length} upcoming
            </p>
          </div>
        </div>

        <div className="pt-4 space-y-2">
          <Label
            htmlFor="ai-prompt"
            className="flex items-center gap-2 text-slate-700"
          >
            <MessageSquare className="w-4 h-4 text-purple-600" />
            Custom Instructions for AI (Optional)
          </Label>
          <Textarea
            id="ai-prompt"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="E.g., 'Focus on mobility exercises and fall prevention' or 'Include activities for dementia care'"
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="pt-4 space-y-3">
          <Button
            onClick={() => onGenerate('daily')}
            disabled={isGenerating || !canGenerate}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Daily Care Plan (3 Options)
          </Button>
          <Button
            onClick={() => onGenerate('weekly')}
            disabled={isGenerating || !canGenerate}
            variant="outline"
            className="w-full"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Generate Weekly Care Plan (3 Options)
          </Button>
          {!canGenerate && (
            <p className="text-xs text-slate-500 text-center">
              You need caregiver or admin access to generate plans.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default CarePlanInputForm;
