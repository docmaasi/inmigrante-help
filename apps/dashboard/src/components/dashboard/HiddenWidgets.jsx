import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, Eye } from 'lucide-react';

const WIDGET_LABELS = {
  upcomingAppointments: 'Upcoming Appointments',
  todaysMedications: "Today's Medications",
  urgentTasks: 'Urgent Tasks',
  activityLog: 'Recent Activity',
  refillTracker: 'Upcoming Refills',
};

export default function HiddenWidgets({ config, onShowWidget }) {
  const [isOpen, setIsOpen] = useState(false);

  const hiddenWidgets = Object.entries(config || {})
    .filter(([id, cfg]) => cfg?.visible === false && WIDGET_LABELS[id])
    .map(([id]) => id);

  if (hiddenWidgets.length === 0) return null;

  return (
    <Card className="mb-6 bg-slate-50 border-slate-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-100 transition-colors"
      >
        <span className="font-medium text-slate-800">
          Hidden Widgets ({hiddenWidgets.length})
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="border-t border-slate-200 p-4 space-y-2">
          {hiddenWidgets.map(widgetId => (
            <div key={widgetId} className="flex items-center justify-between">
              <span className="text-sm text-slate-600">{WIDGET_LABELS[widgetId]}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onShowWidget(widgetId)}
                className="h-7"
              >
                <Eye className="w-3 h-3 mr-1" />
                Show
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}