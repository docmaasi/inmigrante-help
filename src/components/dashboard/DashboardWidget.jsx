import React from 'react';
import { GripVertical, X, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardWidget({ widget, onHide, onPin, isDragging, dragHandleProps, isPinned }) {
  return (
    <div
      className={`relative border border-slate-200/60 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onPin(widget.id)}
          className="h-7 w-7"
          title={isPinned ? 'Unpin widget' : 'Pin widget'}
        >
          <Pin className={`w-4 h-4 ${isPinned ? 'fill-blue-500 text-blue-500' : 'text-slate-400'}`} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onHide(widget.id)}
          className="h-7 w-7"
          title="Hide widget"
        >
          <X className="w-4 h-4 text-slate-400" />
        </Button>
      </div>

      <div {...dragHandleProps} className="absolute left-2 top-2 opacity-0 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4 text-slate-400" />
      </div>

      <div className="p-6">
        {widget.children}
      </div>
    </div>
  );
}