import React, { useState } from 'react';
import { useCreateCarePlan, useUpdateCarePlan, useMedications } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2, Plus, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function CarePlanForm({ plan, recipients, onClose }) {
  const [formData, setFormData] = useState(plan ? {
    care_recipient_id: plan.care_recipient_id || '',
    title: plan.title || '',
    description: plan.description || '',
    status: plan.status || 'active',
    goals: plan.goals || []
  } : {
    care_recipient_id: '',
    title: '',
    description: '',
    status: 'active',
    goals: []
  });

  const [goals, setGoals] = useState(plan?.goals || []);

  const { data: medications = [] } = useMedications(formData.care_recipient_id || undefined);
  const createMutation = useCreateCarePlan();
  const updateMutation = useUpdateCarePlan();

  const recipientMeds = medications.filter(
    m => m.care_recipient_id === formData.care_recipient_id && m.is_active !== false
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.care_recipient_id || !formData.title) {
      toast.error('Please fill in all required fields');
      return;
    }

    const dataToSave = {
      care_recipient_id: formData.care_recipient_id,
      title: formData.title,
      description: formData.description || null,
      status: formData.status,
      goals: goals.filter(g => g.trim() !== ''),
    };

    if (plan?.id) {
      updateMutation.mutate(
        { id: plan.id, ...dataToSave },
        {
          onSuccess: () => {
            toast.success('Care plan updated');
            onClose();
          },
          onError: () => {
            toast.error('Failed to update care plan');
          },
        }
      );
    } else {
      createMutation.mutate(dataToSave, {
        onSuccess: () => {
          toast.success('Care plan created');
          onClose();
        },
        onError: () => {
          toast.error('Failed to create care plan');
        },
      });
    }
  };

  const addGoal = () => {
    setGoals([...goals, '']);
  };

  const updateGoal = (index, value) => {
    const updated = [...goals];
    updated[index] = value;
    setGoals(updated);
  };

  const removeGoal = (index) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="shadow-lg border-slate-200/60">
      <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">
          {plan ? 'Edit Care Plan' : 'Create Care Plan'}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Basic Information</h3>

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
              <Label htmlFor="title">Plan Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Daily Care Routine, Weekend Plan"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this care plan..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Goals */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Care Goals</h3>
              <Button type="button" onClick={addGoal} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Goal
              </Button>
            </div>

            {goals.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No goals added yet</p>
            ) : (
              <div className="space-y-3">
                {goals.map((goal, index) => (
                  <Card key={index} className="p-4 bg-slate-50">
                    <div className="flex items-center gap-3">
                      <Input
                        value={goal}
                        onChange={(e) => updateGoal(index, e.target.value)}
                        placeholder="Enter a care goal..."
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeGoal(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Medications Info */}
          {formData.care_recipient_id && recipientMeds.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Current Medications</h3>
              <div className="space-y-2">
                {recipientMeds.map(med => (
                  <div
                    key={med.id}
                    className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{med.name}</p>
                      <p className="text-sm text-slate-600">
                        {med.dosage} {med.dosage_unit} - {med.frequency}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : plan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
