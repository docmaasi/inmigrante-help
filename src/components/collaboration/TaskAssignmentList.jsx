import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, AlertCircle, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import TaskCommentsDialog from './TaskCommentsDialog';

export default function TaskAssignmentList({ careRecipientId }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [commentsOpen, setCommentsOpen] = useState(false);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: tasks = [] } = useQuery({
    queryKey: ['assignedTasks', careRecipientId],
    queryFn: () => base44.entities.Task.filter(
      { care_recipient_id: careRecipientId },
      '-due_date'
    ),
    enabled: !!careRecipientId
  });

  const { data: allComments = [] } = useQuery({
    queryKey: ['allTaskComments', careRecipientId],
    queryFn: () => base44.entities.TaskComment.filter(
      { care_recipient_id: careRecipientId }
    ),
    enabled: !!careRecipientId
  });

  const getCommentCount = (taskId) => {
    return allComments.filter(c => c.task_id === taskId).length;
  };

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['teamMembers', careRecipientId],
    queryFn: () => base44.entities.TeamMember.filter({
      care_recipient_id: careRecipientId,
      active: true
    })
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['assignedTasks']);
    }
  });

  const createActionLogMutation = useMutation({
    mutationFn: (data) => base44.entities.ActionLog.create(data)
  });

  const handleTaskComplete = async (task) => {
    try {
      await updateTaskMutation.mutateAsync({
        id: task.id,
        data: { status: 'completed' }
      });

      await createActionLogMutation.mutateAsync({
        care_recipient_id: careRecipientId,
        actor_email: user?.email,
        actor_name: user?.full_name,
        action_type: 'task_completed',
        entity_type: 'task',
        entity_id: task.id,
        description: `Completed task: ${task.title}`
      });

      toast.success('Task completed');
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  const myTasks = tasks.filter(t => t.assigned_to === user?.email && t.status !== 'completed');
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

  const getAssignedMemberName = (email) => {
    const member = teamMembers.find(m => m.user_email === email);
    return member?.full_name || email.split('@')[0];
  };

  return (
    <div className="space-y-6">
      {/* My Tasks */}
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
                    {getCommentCount(task.id) || 0}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTaskComplete(task)}
                  >
                    Mark Done
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* All Pending Tasks */}
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
                      {getCommentCount(task.id)} comments
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