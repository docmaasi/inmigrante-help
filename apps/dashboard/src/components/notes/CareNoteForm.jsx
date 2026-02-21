import React, { useState } from 'react';
import { useCreateCareNote, useUpdateCareNote } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CareNoteForm({ note, recipients, onClose }) {
  const [formData, setFormData] = useState(note ? {
    care_recipient_id: note.care_recipient_id || '',
    category: note.category || 'daily_log',
    title: note.title || '',
    content: note.content || '',
    mood: note.mood || '',
    is_private: note.is_private || false
  } : {
    care_recipient_id: '',
    category: 'daily_log',
    title: '',
    content: '',
    mood: '',
    is_private: false
  });

  const createMutation = useCreateCareNote();
  const updateMutation = useUpdateCareNote();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.care_recipient_id || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    const dataToSave = {
      care_recipient_id: formData.care_recipient_id,
      category: formData.category || 'daily_log',
      title: formData.title || null,
      content: formData.content,
      mood: formData.mood || null,
      is_private: formData.is_private,
    };

    if (note?.id) {
      updateMutation.mutate(
        { id: note.id, ...dataToSave },
        {
          onSuccess: () => {
            toast.success('Note updated');
            onClose();
          },
          onError: (error) => {
            console.error(error);
            toast.error('Failed to update note');
          },
        }
      );
    } else {
      createMutation.mutate(dataToSave, {
        onSuccess: () => {
          toast.success('Note added');
          onClose();
        },
        onError: (error) => {
          console.error(error);
          toast.error('Failed to add note');
        },
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="shadow-lg border-slate-200/60">
      <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">
          {note ? 'Edit Care Note' : 'Add Care Note'}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="category">Note Type *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily_log">Daily Log</SelectItem>
                  <SelectItem value="observation">Observation</SelectItem>
                  <SelectItem value="incident">Incident</SelectItem>
                  <SelectItem value="medication_change">Medication Change</SelectItem>
                  <SelectItem value="behavior">Behavior</SelectItem>
                  <SelectItem value="mood">Mood</SelectItem>
                  <SelectItem value="vital_signs">Vital Signs</SelectItem>
                  <SelectItem value="shift_handoff">Shift Handoff</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.category === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="custom_note_type">Specify Note Type *</Label>
              <Input
                id="custom_note_type"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Special event, Visitor note"
                required
              />
            </div>
          )}

          {formData.category !== 'other' && (
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief summary (optional)"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="content">Note Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Describe what happened, observations, or important information..."
              rows={6}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mood">Mood/Condition</Label>
            <Select
              value={formData.mood}
              onValueChange={(value) => setFormData({ ...formData, mood: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select mood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="great">Great</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="okay">Okay</SelectItem>
                <SelectItem value="difficult">Difficult</SelectItem>
                <SelectItem value="concerning">Concerning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <Checkbox
              id="is_private"
              checked={formData.is_private}
              onCheckedChange={(checked) => setFormData({ ...formData, is_private: checked })}
            />
            <Label htmlFor="is_private" className="text-sm font-medium cursor-pointer">
              Flag as important for family members to review
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : note ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
