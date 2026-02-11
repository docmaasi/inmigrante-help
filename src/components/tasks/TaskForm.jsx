import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
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
import RecipientCheckboxList from '../shared/RecipientCheckboxList';

export default function TaskForm({ task, recipients, teamMembers = [], onClose }) {
  const queryClient = useQueryClient();
  const isEditing = !!task?.id;
  const [selectedRecipientIds, setSelectedRecipientIds] = useState(() => {
    if (task?.care_recipient_id) return [task.care_recipient_id];
    return [];
  });
  const [formData, setFormData] = useState(task || {
    care_recipient_id: '',
    title: '',
    description: '',
    task_type: 'other',
    assigned_to: '',
    due_date: '',
    priority: 'medium',
    status: 'pending',
    recurring: 'none'
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (task?.id) {
        return base44.entities.Task.update(task.id, data);
      }
      const created = await base44.entities.Task.create(data);
      
      // Log action
      if (created && data.care_recipient_id) {
        const user = await base44.auth.me();
        await base44.entities.ActionLog.create({
          care_recipient_id: data.care_recipient_id,
          actor_email: user.email,
          actor_name: user.full_name,
          action_type: 'task_created',
          entity_type: 'task',
          entity_id: created.id,
          description: `Created task: ${data.title}`,
          details: JSON.stringify({ priority: data.priority, due_date: data.due_date })
        });
      }
      
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      if (isEditing) {
        toast.success('Task updated');
        onClose();
      }
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isEditing) {
      const recipientId = selectedRecipientIds[0] || formData.care_recipient_id;
      if (!recipientId) {
        toast.error('Please select a care recipient');
        return;
      }
      try {
        await saveMutation.mutateAsync({ ...formData, care_recipient_id: recipientId });
      } catch {
        toast.error('Failed to update task');
      }
      return;
    }

    if (selectedRecipientIds.length === 0) {
      toast.error('Please select at least one care recipient');
      return;
    }

    try {
      for (const recipientId of selectedRecipientIds) {
        await saveMutation.mutateAsync({ ...formData, care_recipient_id: recipientId });
      }
      const count = selectedRecipientIds.length;
      toast.success(count === 1 ? 'Task created' : `${count} tasks created`);
      onClose();
    } catch {
      toast.error('Failed to create task');
    }
  };

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
          {isEditing ? (
            <div className="space-y-2">
              <Label htmlFor="care_recipient_id">Care Recipient *</Label>
              <Select
                value={selectedRecipientIds[0] || formData.care_recipient_id}
                onValueChange={(value) => setSelectedRecipientIds([value])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {recipients.map(recipient => (
                    <SelectItem key={recipient.id} value={recipient.id}>
                      {recipient.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <RecipientCheckboxList
              careRecipients={recipients}
              selectedIds={selectedRecipientIds}
              onChange={setSelectedRecipientIds}
            />
          )}

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
              <Label htmlFor="task_type">Task Type</Label>
              <Select
                value={formData.task_type}
                onValueChange={(value) => setFormData({ ...formData, task_type: value })}
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

          {formData.task_type === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="custom_task_type">Specify Task Type *</Label>
              <Input
                id="custom_task_type"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Garden maintenance, Pet care"
                required
              />
            </div>
          )}

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
              <Label htmlFor="recurring">Recurring</Label>
              <Select
                value={formData.recurring}
                onValueChange={(value) => setFormData({ ...formData, recurring: value })}
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
              value={formData.assigned_to || ''}
              onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Unassigned</SelectItem>
                {teamMembers
                  .filter(member => !selectedRecipientIds[0] || member.care_recipient_id === selectedRecipientIds[0])
                  .map(member => (
                    <SelectItem key={member.id} value={member.user_email}>
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
              disabled={saveMutation.isPending}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {saveMutation.isPending ? (
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