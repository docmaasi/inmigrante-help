import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckCircle2, Circle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';

const priorityColors = {
  low: 'bg-slate-100 text-slate-700 border-slate-200',
  medium: 'bg-orange-100 text-orange-700 border-orange-200',
  high: 'bg-red-100 text-red-700 border-red-200'
};

const categoryColors = {
  medical: 'bg-blue-100 text-blue-700',
  personal_care: 'bg-purple-100 text-purple-700',
  household: 'bg-green-100 text-green-700',
  transportation: 'bg-yellow-100 text-yellow-700',
  social: 'bg-pink-100 text-pink-700',
  other: 'bg-slate-100 text-slate-700'
};

export default function Tasks() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [formData, setFormData] = useState({
    care_recipient_id: '',
    title: '',
    description: '',
    category: 'other',
    due_date: '',
    assigned_to: '',
    priority: 'medium',
    status: 'pending',
    recurring: false,
    recurrence_pattern: 'daily'
  });

  const queryClient = useQueryClient();

  const { data: recipients = [] } = useQuery({
    queryKey: ['recipients'],
    queryFn: () => base44.entities.CareRecipient.list(),
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.CareTask.list('-due_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CareTask.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.CareTask.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries(['tasks']),
  });

  const resetForm = () => {
    setFormData({
      care_recipient_id: '',
      title: '',
      description: '',
      category: 'other',
      due_date: '',
      assigned_to: '',
      priority: 'medium',
      status: 'pending',
      recurring: false,
      recurrence_pattern: 'daily'
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleToggleStatus = (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateStatusMutation.mutate({ id: task.id, status: newStatus });
  };

  const getRecipientName = (id) => {
    return recipients.find(r => r.id === id)?.name || 'Unknown';
  };

  const filteredTasks = tasks.filter(task => {
    if (statusFilter === 'all') return true;
    return task.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-slate-800 mb-2">Care Tasks</h1>
            <p className="text-slate-500">Coordinate shared responsibilities</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Care Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Care Recipient *</Label>
                  <Select
                    value={formData.care_recipient_id}
                    onValueChange={(value) => setFormData({...formData, care_recipient_id: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      {recipients.map(recipient => (
                        <SelectItem key={recipient.id} value={recipient.id}>
                          {recipient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Task Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({...formData, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medical">Medical</SelectItem>
                        <SelectItem value="personal_care">Personal Care</SelectItem>
                        <SelectItem value="household">Household</SelectItem>
                        <SelectItem value="transportation">Transportation</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({...formData, priority: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="due">Due Date</Label>
                    <Input
                      id="due"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assigned">Assigned To (email)</Label>
                    <Input
                      id="assigned"
                      type="email"
                      value={formData.assigned_to}
                      onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Creating...' : 'Create Task'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="pending" onValueChange={setStatusFilter} className="mb-6">
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle2 className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-800 mb-2">
              {statusFilter === 'pending' ? 'No pending tasks' : 'No tasks found'}
            </h3>
            <p className="text-slate-500 mb-6">
              {statusFilter === 'pending' ? "You're all caught up!" : 'Try a different filter'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map(task => (
              <div 
                key={task.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleToggleStatus(task)}
                    className="mt-1 flex-shrink-0"
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-300 hover:text-green-600 transition-colors" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h3 className={`text-lg font-medium mb-2 ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                          {task.title}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={`${priorityColors[task.priority]} border`}>
                            {task.priority} priority
                          </Badge>
                          <Badge className={categoryColors[task.category]}>
                            {task.category?.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-sm text-slate-600 mb-3">{task.description}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <span>For: {getRecipientName(task.care_recipient_id)}</span>
                      {task.due_date && (
                        <span>Due: {format(parseISO(task.due_date), 'MMM d, yyyy')}</span>
                      )}
                      {task.assigned_to && (
                        <span>Assigned: {task.assigned_to}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}