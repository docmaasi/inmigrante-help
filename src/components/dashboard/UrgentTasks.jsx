import React from 'react';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { base44 } from '@/api/base44Client';

const priorityColors = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-orange-100 text-orange-700',
  high: 'bg-red-100 text-red-700'
};

export default function UrgentTasks({ tasks, onTaskUpdate }) {
  const handleToggleComplete = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await base44.entities.Task.update(task.id, { status: newStatus });
    if (onTaskUpdate) onTaskUpdate();
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto mb-3" />
        <p className="text-slate-500">All caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <div 
          key={task.id} 
          className="bg-white rounded-xl p-5 border border-slate-200 hover:border-orange-300 transition-colors"
        >
          <div className="flex items-start gap-3">
            <button
              onClick={() => handleToggleComplete(task)}
              className="mt-0.5 flex-shrink-0"
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                task.status === 'completed' 
                  ? 'bg-green-500 border-green-500' 
                  : 'border-slate-300 hover:border-green-500'
              }`}>
                {task.status === 'completed' && (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                )}
              </div>
            </button>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h4 className={`font-medium ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                  {task.title}
                </h4>
                <Badge className={priorityColors[task.priority] || priorityColors.medium}>
                  {task.priority}
                </Badge>
              </div>
              {task.description && (
                <p className="text-sm text-slate-500 mb-2">{task.description}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-slate-600">
                {task.due_date && (
                  <span className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Due {format(parseISO(task.due_date), 'MMM d')}
                  </span>
                )}
                {task.assigned_to && (
                  <span>Assigned to {task.assigned_to}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      <Link to={createPageUrl('Tasks')}>
        <Button variant="outline" size="sm" className="w-full gap-2 mt-4">
          View All <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  );
}