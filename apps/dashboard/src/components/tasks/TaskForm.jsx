import React, { useState } from 'react';
import { useCreateTask, useUpdateTask } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { X, Loader2, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { cn } from "@/lib/utils";

export default function TaskForm({ task, recipients, teamMembers = [], onClose }) {
  const [formData, setFormData] = useState(task ? {
    care_recipient_id: task.care_recipient_id || '',
    title: task.title || '',
    description: task.description || '',
    category: task.category || 'other',
    assigned_to: task.assigned_to || '',
    due_date: task.due_date || '',
    priority: task.priority || 'medium',
    status: task.status || 'pending',
    recurring: task.recurring || false,
    recurrence_pattern: task.recurrence_pattern || ''
  } : {
    care_recipient_id: '',
    title: '',
    description: '',
    category: 'other',
    assigned_to: '',
    due_date: '',
    priority: 'medium',
    status: 'pending',
    recurring: false,
    recurrence_pattern: ''
  });

  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.care_recipient_id || !formData.title) {
      toast.error('Please fill in all required fields');
      return;
    }

    const taskData = {
      care_recipient_id: formData.care_recipient_id,
      title: formData.title,
      description: formData.description || null,
      category: formData.category,
      assigned_to: formData.assigned_to || null,
      due_date: formData.due_date || null,
      priority: formData.priority,
      status: formData.status,
      recurring: formData.recurring,
      recurrence_pattern: formData.recurrence_pattern || null
    };

    if (task?.id) {
      updateMutation.mutate(
        { id: task.id, ...taskData },
        {
          onSuccess: () => {
            toast.success('Task updated');
            onClose();
          },
          onError: (error) => {
            toast.error('Failed to update task');
          }
        }
      );
    } else {
      createMutation.mutate(taskData, {
        onSuccess: () => {
          toast.success('Task created');
          onClose();
        },
        onError: (error) => {
          toast.error('Failed to create task');
        }
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="shadow-lg border-slate-200/60">
      <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">
          {task ? 'Edit Task' : 'Add Task'}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="care_recipient_id">Care Recipient *</Label>
            <Select
              value={formData.care_recipient_id}
              onValueChange={(value) => setFormData({ ...formData, care_recipient_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select recipient" />
              </SelectTrigger>
              <SelectContent>
                {recipients.map(recipient => (
                  <SelectItem key={recipient.id} value={recipient.id}>
                    {recipient.first_name} {recipient.last_name}
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
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Prepare lunch, Drive to appointment"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Task Type</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.due_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date ? format(parseISO(formData.due_date), 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.due_date ? parseISO(formData.due_date) : null}
                    onSelect={(date) => setFormData({ ...formData, due_date: date ? format(date, 'yyyy-MM-dd') : '' })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurrence_pattern">Recurring</Label>
              <Select
                value={formData.recurrence_pattern || 'none'}
                onValueChange={(value) => setFormData({
                  ...formData,
                  recurrence_pattern: value === 'none' ? '' : value,
                  recurring: value !== 'none'
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">One-time</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned_to">Assign To</Label>
            <Select
              value={formData.assigned_to || 'unassigned'}
              onValueChange={(value) => setFormData({ ...formData, assigned_to: value === 'unassigned' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {teamMembers
                  .filter(member => !formData.care_recipient_id ||
                    !member.care_recipient_ids ||
                    member.care_recipient_ids.includes(formData.care_recipient_id))
                  .map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name} ({member.role})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : task ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
