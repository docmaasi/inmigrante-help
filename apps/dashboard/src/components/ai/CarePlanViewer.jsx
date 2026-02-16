import React from 'react';
import { Card, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  ArrowLeft,
  Save,
  Printer,
  Share2,
  Sparkles,
} from 'lucide-react';
import {
  ScheduleSection,
  MonitoringSection,
  ActivitiesSection,
  ConsiderationsSection,
} from './CarePlanSections';

export function CarePlanViewer({
  plan,
  planType,
  recipientName,
  permissions,
  onBack,
  onSave,
  onPrint,
  onShare,
  isSaving,
}) {
  const typeLabel = planType === 'daily' ? 'Daily' : 'Weekly';

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            {typeLabel} Care Plan for {recipientName}
          </CardTitle>
          <div className="flex items-center gap-2 mt-1">
            {plan.label && (
              <Badge className="bg-white/20 text-white border-white/30">
                {plan.label}
              </Badge>
            )}
            <span className="text-sm text-purple-100">
              {plan.summary}
            </span>
          </div>
        </CardHeader>
      </Card>

      <ScheduleSection items={plan.daily_schedule} />
      <MonitoringSection data={plan.health_monitoring} />
      <ActivitiesSection items={plan.activities_recommendations} />
      <ConsiderationsSection items={plan.special_considerations} />

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={onBack} className="gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex-1" />
        <Button variant="outline" onClick={onPrint} className="gap-1">
          <Printer className="w-4 h-4" /> Print / PDF
        </Button>
        {permissions?.canManageCarePlans && (
          <Button
            variant="outline"
            onClick={onShare}
            className="gap-1"
          >
            <Share2 className="w-4 h-4" /> Share
          </Button>
        )}
        {permissions?.canEditRecords && (
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="gap-1 bg-purple-600 hover:bg-purple-700"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Plan'}
          </Button>
        )}
      </div>
    </div>
  );
}

export default CarePlanViewer;
