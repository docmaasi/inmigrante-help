import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import RecipientCheckboxList from '../shared/RecipientCheckboxList';

export default function CareNoteForm({ note, recipients, onClose }) {
  const queryClient = useQueryClient();
  const isEditing = !!note?.id;
  const [selectedRecipientIds, setSelectedRecipientIds] = useState(() => {
    if (note?.care_recipient_id) return [note.care_recipient_id];
    return [];
  });
  const [formData, setFormData] = useState(note || {
    care_recipient_id: '',
    note_type: 'daily_log',
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    mood: '',
    flagged_important: false
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (note?.id) {
        return base44.entities.CareNote.update(note.id, data);
      }
      return base44.entities.CareNote.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['careNotes']);
      if (isEditing) {
        toast.success('Note updated');
        onClose();
      }
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.content || !formData.date) {
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
        toast.error('Failed to update note');
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
      toast.success(count === 1 ? 'Note added' : `${count} notes added`);
      onClose();
    } catch {
      toast.error('Failed to add note');
    }
  };

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
              <Label htmlFor="note_type">Note Type *</Label>
              <Select
                value={formData.note_type}
                onValueChange={(value) => setFormData({ ...formData, note_type: value })}
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

          {formData.note_type === 'other' && (
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

          {formData.note_type !== 'other' && (
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
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
          </div>

          <div className="flex items-center space-x-2 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <Checkbox
              id="flagged_important"
              checked={formData.flagged_important}
              onCheckedChange={(checked) => setFormData({ ...formData, flagged_important: checked })}
            />
            <Label htmlFor="flagged_important" className="text-sm font-medium cursor-pointer">
              Flag as important for family members to review
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saveMutation.isPending ? (
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