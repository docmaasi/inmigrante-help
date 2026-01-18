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
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

export default function TaskForm({ task, recipients, teamMembers = [], onClose }) {
  const queryClient = useQueryClient();
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
      toast.success(task ? 'Task updated' : 'Task created');
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.care_recipient_id || !formData.title) {
      toast.error('Please fill in all required fields');
      return;
    }
    saveMutation.mutate(formData);
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
                    {recipient.full_name}
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
              <Label htmlFor="task_type">Task Type</Label>
              <Input
                id="task_type"
                value={formData.task_type}
                onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
                placeholder="e.g., personal_care, meal_prep, transportation"
                list="task-type-suggestions"
              />
              <datalist id="task-type-suggestions">
                <option value="personal_care">Personal Care</option>
                <option value="meal_prep">Meal Prep</option>
                <option value="transportation">Transportation</option>
                <option value="medication">Medication</option>
                <option value="housekeeping">Housekeeping</option>
                <option value="companionship">Companionship</option>
                <option value="exercise">Exercise</option>
                <option value="shopping">Shopping</option>
                <option value="bill_payment">Bill Payment</option>
                <option value="other">Other</option>
              </datalist>
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
                    {formData.due_date ? format(new Date(formData.due_date), 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.due_date ? new Date(formData.due_date) : undefined}
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
                  .filter(member => !formData.care_recipient_id || member.care_recipient_id === formData.care_recipient_id)
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
              className="flex-1 bg-purple-600 hover:bg-purple-700"
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