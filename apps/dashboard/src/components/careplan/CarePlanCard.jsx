import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Edit, Printer, Clock, Target, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import CarePlanPrint from './CarePlanPrint';

export default function CarePlanCard({ plan, recipients, onEdit, onDelete }) {
  const recipient = recipients.find(r => r.id === plan.care_recipient_id);
  const recipientName = recipient
    ? `${recipient.first_name} ${recipient.last_name}`
    : plan.care_recipients
    ? `${plan.care_recipients.first_name} ${plan.care_recipients.last_name}`
    : 'Unknown Recipient';

  const goals = plan.goals || [];

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(CarePlanPrint({ plan, recipientName }));
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    draft: 'bg-yellow-100 text-yellow-700',
    archived: 'bg-slate-100 text-slate-700',
  };

  return (
    <Card className="shadow-sm border-slate-200/60 hover:shadow-md transition-shadow">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              {plan.title}
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              {recipientName}
            </p>
            {plan.updated_at && (
              <p className="text-xs text-slate-500 mt-1">
                Updated {format(new Date(plan.updated_at), 'MMM d, yyyy')}
              </p>
            )}
          </div>
          <Badge className={statusColors[plan.status] || statusColors.draft}>
            {plan.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-slate-600">{goals.length} goals</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-slate-600">{plan.status}</span>
            </div>
          </div>

          {/* Description Preview */}
          {plan.description && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-sm text-slate-600 line-clamp-2">{plan.description}</p>
            </div>
          )}

          {/* Goals Preview */}
          {goals.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-700 mb-2">Goals:</p>
              <div className="space-y-1">
                {goals.slice(0, 2).map((goal, idx) => (
                  <div key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-purple-600">-</span>
                    <span className="truncate">{goal}</span>
                  </div>
                ))}
                {goals.length > 2 && (
                  <p className="text-xs text-slate-500 italic">+{goals.length - 2} more</p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => onEdit(plan)}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              <Printer className="w-4 h-4 mr-1" />
              Print
            </Button>
            <Button
              onClick={() => onDelete(plan)}
              variant="outline"
              size="sm"
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
