import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, AlertCircle, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function AssignedTasksSummary({ tasks, userEmail, recipients }) {
  const myTasks = tasks.filter(task => task.assigned_to === userEmail);
  
  const pendingTasks = myTasks.filter(t => t.status === 'pending');
  const inProgressTasks = myTasks.filter(t => t.status === 'in_progress');
  const completedToday = myTasks.filter(t => 
    t.status === 'completed' && 
    new Date(t.updated_date).toDateString() === new Date().toDateString()
  );

  const getRecipientName = (id) => {
    return recipients.find(r => r.id === id)?.full_name || 'Unknown';
  };

  const priorityColors = {
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700'
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-700">{pendingTasks.length}</div>
          <div className="text-xs text-slate-600">Pending</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-700">{inProgressTasks.length}</div>
          <div className="text-xs text-slate-600">In Progress</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-700">{completedToday.length}</div>
          <div className="text-xs text-slate-600">Done Today</div>
        </div>
      </div>

      {/* Task List */}
      {myTasks.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-4">No tasks assigned to you</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {myTasks.slice(0, 5).map(task => (
            <div key={task.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="mt-1">
                {task.status === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : task.status === 'in_progress' ? (
                  <Clock className="w-4 h-4 text-blue-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-medium text-sm ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                  {task.title}
                </div>
                <div className="text-xs text-slate-600 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {getRecipientName(task.care_recipient_id)}
                </div>
              </div>
              <Badge className={`${priorityColors[task.priority]} text-xs border-0`}>
                {task.priority}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {myTasks.length > 5 && (
        <Link to={createPageUrl('Tasks')}>
          <Button variant="outline" size="sm" className="w-full">
            View All Tasks ({myTasks.length})
          </Button>
        </Link>
      )}
    </div>
  );
}