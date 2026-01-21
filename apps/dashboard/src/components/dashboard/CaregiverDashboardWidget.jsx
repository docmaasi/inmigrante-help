import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Pin, GripVertical } from 'lucide-react';

export default function CaregiverDashboardWidget({
  title,
  icon: Icon,
  children,
  widgetId,
  isPinned,
  onPin,
  onHide,
  isDraggable = false,
  headerActions
}) {
  return (
    <Card className={`bg-white border border-slate-200 shadow-sm rounded-xl ${isPinned ? 'ring-2 ring-teal-500/20 border-teal-300' : ''}`}>
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDraggable && (
              <GripVertical className="w-4 h-4 text-slate-300 cursor-move hover:text-slate-500 transition-colors" />
            )}
            {Icon && (
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                <Icon className="w-4 h-4 text-teal-600" />
              </div>
            )}
            <CardTitle className="text-base font-semibold text-slate-800">
              {title}
            </CardTitle>
          </div>
          <div className="flex items-center gap-0.5">
            {headerActions}
            {onPin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onPin}
                className="h-8 w-8 rounded-lg hover:bg-slate-100"
                title={isPinned ? "Unpin widget" : "Pin widget"}
              >
                <Pin className={`w-3.5 h-3.5 ${isPinned ? 'text-teal-600 fill-teal-600' : 'text-slate-400 hover:text-slate-600'}`} />
              </Button>
            )}
            {onHide && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onHide}
                className="h-8 w-8 rounded-lg hover:bg-slate-100"
                title="Hide widget"
              >
                <EyeOff className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {children}
      </CardContent>
    </Card>
  );
}