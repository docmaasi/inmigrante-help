import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckSquare, User, Calendar, Clock, AlertCircle, Edit2, Trash2, Check } from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import TaskForm from '../components/tasks/TaskForm';

export default function Tasks() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-due_date')
  });

  const { data: recipients = [] } = useQuery({
    queryKey: ['careRecipients'],
    queryFn: () => base44.entities.CareRecipient.list()
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }) => base44.entities.Task.update(id, { status, completion_notes: notes }),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    }
  });

  const getRecipientName = (id) => {
    const recipient = recipients.find(r => r.id === id);
    return recipient?.full_name || 'Unknown';
  };

  const handleComplete = (task) => {
    const notes = prompt('Add completion notes (optional):');
    if (notes !== null) {
      updateStatusMutation.mutate({ id: task.id, status: 'completed', notes });
    }
  };

  const filteredTasks = filterStatus === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filterStatus);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Tasks</h1>
          <p className="text-slate-500 mt-1">Manage caregiver responsibilities</p>
        </div>
        <Button
          onClick={() => {
            setSelectedTask(null);
            setShowForm(true);
          }}
          className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/30"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'pending', 'in_progress', 'completed', 'cancelled'].map(status => (
          <Button
            key={status}
            variant={filterStatus === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus(status)}
            className={filterStatus === status ? 'bg-purple-600' : ''}
          >
            {status === 'all' ? 'All' : status.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </Button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <TaskForm
          task={selectedTask}
          recipients={recipients}
          onClose={() => {
            setShowForm(false);
            setSelectedTask(null);
          }}
        />
      )}

      {/* Tasks List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <Card className="border-slate-200/60">
          <CardContent className="p-12 text-center">
            <CheckSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Tasks</h3>
            <p className="text-slate-500 mb-6">
              {filterStatus === 'all' ? 'Add your first task to get started' : `No ${filterStatus.replace(/_/g, ' ')} tasks`}
            </p>
            {filterStatus === 'all' && (
              <Button onClick={() => setShowForm(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTasks.map(task => {
            const isOverdue = task.due_date && isPast(parseISO(task.due_date)) && task.status !== 'completed';
            const isDueToday = task.due_date && isToday(parseISO(task.due_date));
            
            return (
              <Card key={task.id} className={`shadow-sm border-slate-200/60 hover:shadow-md transition-shadow ${
                isOverdue ? 'border-l-4 border-l-red-500' : ''
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-3 rounded-lg flex-shrink-0 ${
                        task.status === 'completed' ? 'bg-green-100' : 'bg-gradient-to-br from-purple-600 to-purple-700'
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
                    <Badge className={`${taskTypeColors[task.task_type]} border-0`}>
                      {task.task_type.replace(/_/g, ' ')}
                    </Badge>
                    {task.recurring !== 'none' && (
                      <Badge variant="outline" className="text-xs">
                        Recurring: {task.recurring}
                      </Badge>
                    )}
                    {task.assigned_to && (
                      <Badge variant="outline" className="text-xs">
                        Assigned: {task.assigned_to}
                      </Badge>
                    )}
                  </div>

                  {task.completion_notes && (
                    <p className="text-sm text-slate-600 bg-green-50 rounded-lg p-3 mb-4 border border-green-200">
                      <span className="font-medium">Completed:</span> {task.completion_notes}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {task.status !== 'completed' && task.status !== 'cancelled' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleComplete(task)}
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
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm('Delete this task?')) {
                          deleteMutation.mutate(task.id);
                        }
                      }}
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
      )}
      </div>
    </div>
  );
}