import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Edit, Printer, Clock, Pill, Users, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import CarePlanPrint from './CarePlanPrint';

export default function CarePlanCard({ plan, recipients, onEdit }) {
  const recipient = recipients.find(r => r.id === plan.care_recipient_id);
  const routines = JSON.parse(plan.daily_routines || '[]');
  const contacts = JSON.parse(plan.important_contacts || '[]');
  const medications = JSON.parse(plan.medication_schedule || '[]');

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(CarePlanPrint({ plan, recipient }));
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <Card className="shadow-sm border-slate-200/60 hover:shadow-md transition-shadow">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              {plan.plan_name}
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              {recipient?.full_name || 'Unknown Recipient'}
            </p>
            {plan.last_updated && (
              <p className="text-xs text-slate-500 mt-1">
                Updated {format(new Date(plan.last_updated), 'MMM d, yyyy')}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-slate-600">{routines.length} routines</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Pill className="w-4 h-4 text-green-600" />
              <span className="text-slate-600">{medications.length} meds</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-slate-600">{contacts.length} contacts</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-slate-600">
                {plan.emergency_procedures ? 'Emergency info' : 'No emergency info'}
              </span>
            </div>
          </div>

          {/* Preview */}
          {routines.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-700 mb-2">First routines:</p>
              <div className="space-y-1">
                {routines.slice(0, 2).map((routine, idx) => (
                  <div key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                    <Badge variant="outline" className="text-xs shrink-0">{routine.time}</Badge>
                    <span className="truncate">{routine.activity}</span>
                  </div>
                ))}
                {routines.length > 2 && (
                  <p className="text-xs text-slate-500 italic">+{routines.length - 2} more</p>
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}