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
    <Card className={`shadow-sm border-slate-200/60 ${isPinned ? 'border-l-4 border-l-blue-600' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {isDraggable && <GripVertical className="w-4 h-4 text-slate-400 cursor-move" />}
            {Icon && <Icon className="w-5 h-5" />}
            {title}
          </CardTitle>
          <div className="flex items-center gap-1">
            {headerActions}
            {onPin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onPin}
                className="h-7 w-7"
                title={isPinned ? "Unpin widget" : "Pin widget"}
              >
                <Pin className={`w-4 h-4 ${isPinned ? 'text-blue-600 fill-blue-600' : 'text-slate-400'}`} />
              </Button>
            )}
            {onHide && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onHide}
                className="h-7 w-7"
                title="Hide widget"
              >
                <EyeOff className="w-4 h-4 text-slate-400" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}