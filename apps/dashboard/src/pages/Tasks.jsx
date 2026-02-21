import React, { useState } from 'react';
import { useTasks, useUpdateTask, useDeleteTask, useCareRecipients, useTeamMembers } from '@/hooks';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CheckSquare, User, Calendar, Clock, AlertCircle, Edit2, Trash2, Check, Printer } from 'lucide-react';
import { printTasks } from '@/components/tasks/tasks-print';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { Skeleton } from '../components/ui/skeleton';
import TaskForm from '../components/tasks/TaskForm';
import TaskCompletionModal from '../components/tasks/TaskCompletionModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

export default function Tasks() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [completingTask, setCompletingTask] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterRecipient, setFilterRecipient] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('due_date');
  const [groupBy, setGroupBy] = useState('none');

  const { data: tasks = [], isLoading } = useTasks();
  const { data: recipients = [] } = useCareRecipients();
  const { data: teamMembers = [] } = useTeamMembers();

  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const getRecipientName = (id) => {
    const recipient = recipients.find(r => r.id === id);
    if (recipient) {
      return `${recipient.first_name} ${recipient.last_name}`;
    }
    return 'Unknown';
  };

  const handleComplete = (notes) => {
    if (completingTask) {
      updateTaskMutation.mutate(
        { id: completingTask.id, status: 'completed', notes },
        {
          onSuccess: () => {
            setCompletingTask(null);
          }
        }
      );
    }
  };

  let filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterRecipient !== 'all' && task.care_recipient_id !== filterRecipient) return false;
    if (filterType !== 'all' && task.category !== filterType) return false;
    return true;
  });

  // Sort tasks
  filteredTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'due_date') {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    } else if (sortBy === 'priority') {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    } else if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  // Group tasks
  const groupedTasks = {};
  if (groupBy === 'none') {
    groupedTasks['All Tasks'] = filteredTasks;
  } else if (groupBy === 'status') {
    filteredTasks.forEach(task => {
      const status = task.status || 'pending';
      if (!groupedTasks[status]) groupedTasks[status] = [];
      groupedTasks[status].push(task);
    });
  } else if (groupBy === 'priority') {
    filteredTasks.forEach(task => {
      const priority = task.priority || 'medium';
      if (!groupedTasks[priority]) groupedTasks[priority] = [];
      groupedTasks[priority].push(task);
    });
  } else if (groupBy === 'recipient') {
    filteredTasks.forEach(task => {
      const recipientName = getRecipientName(task.care_recipient_id);
      if (!groupedTasks[recipientName]) groupedTasks[recipientName] = [];
      groupedTasks[recipientName].push(task);
    });
  } else if (groupBy === 'type') {
    filteredTasks.forEach(task => {
      const type = task.category || 'other';
      if (!groupedTasks[type]) groupedTasks[type] = [];
      groupedTasks[type].push(task);
    });
  }

  const taskTypeColors = {
    personal_care: 'bg-pink-100 text-pink-700',
    meal_prep: 'bg-green-100 text-green-700',
    transportation: 'bg-blue-100 text-blue-700',
    medication: 'bg-purple-100 text-purple-700',
    housekeeping: 'bg-cyan-100 text-cyan-700',
    companionship: 'bg-orange-100 text-orange-700',
    exercise: 'bg-lime-100 text-lime-700',
    shopping: 'bg-indigo-100 text-indigo-700',
    bill_payment: 'bg-yellow-100 text-yellow-700',
    other: 'bg-slate-100 text-slate-700'
  };

  const priorityColors = {
    urgent: 'bg-red-600 text-white',
    high: 'bg-orange-600 text-white',
    medium: 'bg-blue-600 text-white',
    low: 'bg-slate-400 text-white'
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Tasks</h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">Manage caregiver responsibilities</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => printTasks(filteredTasks, getRecipientName)}
            disabled={isLoading || filteredTasks.length === 0}
            className="border-teal-200 text-teal-700"
          >
            <Printer className="w-4 h-4 mr-2" />Print
          </Button>
          <Button
            onClick={() => { setSelectedTask(null); setShowForm(true); }}
            className="flex-1 sm:flex-initial bg-teal-600 hover:bg-teal-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">Status</Label>
              <div className="flex gap-2 flex-wrap">
                {['all', 'pending', 'in_progress', 'completed'].map(status => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                    className={`whitespace-nowrap ${filterStatus === status ? 'bg-teal-600 hover:bg-teal-700' : 'hover:border-teal-300'}`}
                  >
                    {status === 'all' ? 'All' : status.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">Priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">Care Recipient</Label>
              <Select value={filterRecipient} onValueChange={setFilterRecipient}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Recipients</SelectItem>
                  {recipients.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.first_name} {r.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">Task Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="personal_care">Personal Care</SelectItem>
                  <SelectItem value="meal_prep">Meal Prep</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="housekeeping">Housekeeping</SelectItem>
                  <SelectItem value="companionship">Companionship</SelectItem>
                  <SelectItem value="exercise">Exercise</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="bill_payment">Bill Payment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="due_date">Due Date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">Group By</Label>
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="recipient">Recipient</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      {showForm && (
        <TaskForm
          task={selectedTask}
          recipients={recipients}
          teamMembers={teamMembers}
          onClose={() => {
            setShowForm(false);
            setSelectedTask(null);
          }}
        />
      )}

      {/* Completion Modal */}
      <TaskCompletionModal
        isOpen={!!completingTask}
        onClose={() => setCompletingTask(null)}
        onComplete={handleComplete}
        task={completingTask}
        isLoading={updateTaskMutation.isPending}
      />

      {/* Tasks List */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="shadow-sm border-slate-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <Skeleton className="w-16 h-6 rounded-full" />
                </div>
                <div className="flex gap-2 mb-4">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : Object.keys(groupedTasks).length === 0 || filteredTasks.length === 0 ? (
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="p-8 md:p-16 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckSquare className="w-8 h-8 md:w-10 md:h-10 text-slate-400" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-2">No Tasks</h3>
            <p className="text-sm md:text-base text-slate-500 mb-6 max-w-sm mx-auto">
              {filterStatus === 'all' ? 'Add your first task to get started' : `No ${filterStatus.replace(/_/g, ' ')} tasks`}
            </p>
            {filterStatus === 'all' && (
              <Button onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
            <div key={groupName}>
              {groupBy !== 'none' && (
                <h2 className="text-lg font-semibold text-slate-800 mb-4 capitalize">
                  {groupName.replace(/_/g, ' ')} ({groupTasks.length})
                </h2>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {groupTasks.map(task => {
            const isOverdue = task.due_date && isPast(parseISO(task.due_date)) && task.status !== 'completed';
            const isDueToday = task.due_date && isToday(parseISO(task.due_date));
            const taskType = task.category || 'other';

            return (
              <Card key={task.id} className={`shadow-sm border-slate-200 bg-white hover:shadow-md transition-shadow ${
                isOverdue ? 'border-l-4 border-l-red-500' : ''
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-3 rounded-lg flex-shrink-0 ${
                        task.status === 'completed' ? 'bg-green-100' : 'bg-teal-600'
                      }`}>
                        {task.status === 'completed' ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <CheckSquare className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg font-bold mb-1 ${
                          task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-800'
                        }`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4 text-slate-400" />
                            {getRecipientName(task.care_recipient_id)}
                          </span>
                          {task.due_date && (
                            <>
                              <span className="text-slate-400">•</span>
                              <span className={`flex items-center gap-1 ${
                                isOverdue ? 'text-red-600 font-medium' :
                                isDueToday ? 'text-orange-600 font-medium' : ''
                              }`}>
                                <Calendar className="w-4 h-4" />
                                {isOverdue ? 'Overdue' : isDueToday ? 'Due Today' : format(parseISO(task.due_date), 'MMM d')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge className={`${priorityColors[task.priority]} border-0`}>
                      {task.priority}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={`${taskTypeColors[taskType]} border-0`}>
                      {taskType.replace(/_/g, ' ')}
                    </Badge>
                    {task.recurring && task.recurrence_pattern && (
                      <Badge variant="outline" className="text-xs">
                        Recurring: {task.recurrence_pattern}
                      </Badge>
                    )}
                    {task.assigned_to && (
                      <Badge variant="outline" className="text-xs">
                        Assigned: {task.team_members?.full_name || task.assigned_to}
                      </Badge>
                    )}
                  </div>

                  {task.notes && task.status === 'completed' && (
                    <p className="text-sm text-slate-600 bg-green-50 rounded-lg p-3 mb-4 border border-green-200">
                      <span className="font-medium">Completed:</span> {task.notes}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {task.status !== 'completed' && task.status !== 'cancelled' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCompletingTask(task)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Complete
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedTask(task);
                        setShowForm(true);
                      }}
                      className="text-slate-700"
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteTarget(task)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
                );
              })}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Task"
        description="Delete this task? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => { deleteTaskMutation.mutate(deleteTarget.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
