import React, { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTasks, useTeamMembers, useCompleteTask, useTaskComments } from '@/hooks';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, AlertCircle, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import TaskCommentsDialog from './TaskCommentsDialog';

export default function TaskAssignmentList({ careRecipientId, careRecipientIds }) {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const [selectedTask, setSelectedTask] = useState(null);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const { data: tasks = [] } = useTasks({
    careRecipientId,
    careRecipientIds,
  });
  const { data: teamMembers = [] } = useTeamMembers();

  const completeTaskMutation = useCompleteTask();

  const taskIds = useMemo(() => tasks.map(t => t.id), [tasks]);

  const handleTaskComplete = async (task) => {
    try {
      await completeTaskMutation.mutateAsync(task.id);
      toast.success('Task completed');
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  const myTasks = tasks.filter(t =>
    (t.assigned_to === user?.id || t.assigned_to === user?.email) && t.status !== 'completed'
  );
  const allTasks = tasks.filter(t => t.status !== 'completed');

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
    urgent: 'bg-red-200 text-red-900'
  };

  const statusIcons = {
    pending: <Circle className="w-4 h-4 text-gray-400" />,
    in_progress: <AlertCircle className="w-4 h-4 text-blue-500" />,
    completed: <CheckCircle2 className="w-4 h-4 text-green-500" />
  };

  const getAssignedMemberName = (assignedTo) => {
    if (!assignedTo) return 'Unassigned';
    const member = teamMembers.find(m => m.id === assignedTo || m.user_email === assignedTo);
    return member?.full_name || assignedTo;
  };

  const getCommentCount = (task) => {
    return task.comment_count || 0;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">My Tasks ({myTasks.length})</h3>
        {myTasks.length === 0 ? (
          <p className="text-sm text-slate-500">No tasks assigned to you</p>
        ) : (
          <div className="space-y-3">
            {myTasks.map(task => (
              <div key={task.id} className="flex items-start justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {statusIcons[task.status]}
                    <span className="font-medium text-slate-800">{task.title}</span>
                    <Badge className={priorityColors[task.priority]}>
                      {task.priority}
                    </Badge>
                  </div>
                  {task.due_date && (
                    <p className="text-xs text-slate-500">
                      Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedTask(task);
                      setCommentsOpen(true);
                    }}
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    {getCommentCount(task)}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTaskComplete(task)}
                    disabled={completeTaskMutation.isPending}
                  >
                    Mark Done
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">All Pending Tasks ({allTasks.length})</h3>
        {allTasks.length === 0 ? (
          <p className="text-sm text-slate-500">No pending tasks</p>
        ) : (
          <div className="space-y-2">
            {allTasks.map(task => (
              <div key={task.id} className="flex items-start justify-between p-3 border border-slate-200 rounded-lg bg-slate-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800">{task.title}</span>
                    <Badge className={priorityColors[task.priority]}>
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                    {task.assigned_to && (
                      <span>Assigned to: <span className="font-medium">{getAssignedMemberName(task.assigned_to)}</span></span>
                    )}
                    {task.due_date && (
                      <span>Due: {format(new Date(task.due_date), 'MMM d')}</span>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs"
                      onClick={() => {
                        setSelectedTask(task);
                        setCommentsOpen(true);
                      }}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      {getCommentCount(task)} comments
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {selectedTask && (
        <TaskCommentsDialog
          task={selectedTask}
          open={commentsOpen}
          onOpenChange={setCommentsOpen}
        />
      )}
    </div>
  );
}
