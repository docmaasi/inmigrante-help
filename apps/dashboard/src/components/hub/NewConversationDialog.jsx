import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useTeamMembers, useCreateConversation } from '@/hooks';

export default function NewConversationDialog({ open, onClose, recipients }) {
  const [formData, setFormData] = useState({
    name: '',
    care_recipient_id: '',
    conversation_type: 'general',
    participants: [],
  });

  const { data: teamMembers = [] } = useTeamMembers();
  const createMutation = useCreateConversation();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.care_recipient_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    createMutation.mutate(
      {
        title: formData.name,
        care_recipient_id: formData.care_recipient_id,
        type: formData.conversation_type,
        participant_ids: formData.participants.length > 0
          ? formData.participants
          : null,
        last_message_at: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          toast.success('Conversation created');
          setFormData({
            name: '',
            care_recipient_id: '',
            conversation_type: 'general',
            participants: [],
          });
          onClose();
        },
        onError: (error) => {
          toast.error(
            'Failed to create conversation: ' + error.message
          );
        },
      }
    );
  };

  const addParticipant = (email) => {
    if (!formData.participants.includes(email)) {
      setFormData({
        ...formData,
        participants: [...formData.participants, email],
      });
    }
  };

  const removeParticipant = (email) => {
    setFormData({
      ...formData,
      participants: formData.participants.filter((e) => e !== email),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Conversation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Conversation Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Mom's Care Team"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="care_recipient_id">Care Recipient *</Label>
            <Select
              value={formData.care_recipient_id}
              onValueChange={(value) =>
                setFormData({ ...formData, care_recipient_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select recipient" />
              </SelectTrigger>
              <SelectContent>
                {recipients.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.first_name} {r.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="conversation_type">Conversation Type</Label>
            <Select
              value={formData.conversation_type}
              onValueChange={(value) =>
                setFormData({ ...formData, conversation_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="care_team">Care Team</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Add Participants</Label>
            <Select onValueChange={addParticipant}>
              <SelectTrigger>
                <SelectValue placeholder="Select team members" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((tm) => (
                  <SelectItem key={tm.id} value={tm.id}>
                    {tm.full_name} ({tm.relationship || tm.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {formData.participants.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.participants.map((id) => {
                  const member = teamMembers.find(
                    (tm) => tm.id === id
                  );
                  return (
                    <div
                      key={id}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center gap-2"
                    >
                      {member?.full_name || id}
                      <button
                        type="button"
                        onClick={() => removeParticipant(id)}
                        className="hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
