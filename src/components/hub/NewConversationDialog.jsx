import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import RecipientCheckboxList from '../shared/RecipientCheckboxList';

export default function NewConversationDialog({ open, onClose, recipients }) {
  const queryClient = useQueryClient();
  const [selectedRecipientIds, setSelectedRecipientIds] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    conversation_type: 'general',
    participants: []
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: () => base44.entities.TeamMember.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Conversation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['conversations']);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (selectedRecipientIds.length === 0) {
      toast.error('Please select at least one care recipient');
      return;
    }

    try {
      for (const recipientId of selectedRecipientIds) {
        await createMutation.mutateAsync({
          ...formData,
          care_recipient_id: recipientId,
          participants: JSON.stringify(formData.participants),
          last_message_at: new Date().toISOString()
        });
      }
      const count = selectedRecipientIds.length;
      toast.success(count === 1 ? 'Conversation created' : `${count} conversations created`);
      setSelectedRecipientIds([]);
      setFormData({ name: '', conversation_type: 'general', participants: [] });
      onClose();
    } catch {
      toast.error('Failed to create conversation');
    }
  };

  const addParticipant = (email) => {
    if (!formData.participants.includes(email)) {
      setFormData({
        ...formData,
        participants: [...formData.participants, email]
      });
    }
  };

  const removeParticipant = (email) => {
    setFormData({
      ...formData,
      participants: formData.participants.filter(e => e !== email)
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

          <RecipientCheckboxList
            careRecipients={recipients}
            selectedIds={selectedRecipientIds}
            onChange={setSelectedRecipientIds}
          />

          <div className="space-y-2">
            <Label htmlFor="conversation_type">Conversation Type</Label>
            <Select
              value={formData.conversation_type}
              onValueChange={(value) => setFormData({ ...formData, conversation_type: value })}
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
                {teamMembers.map(tm => (
                  <SelectItem key={tm.id} value={tm.user_email}>
                    {tm.full_name} ({tm.relationship})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {formData.participants.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.participants.map(email => {
                  const member = teamMembers.find(tm => tm.user_email === email);
                  return (
                    <div key={email} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center gap-2">
                      {member?.full_name || email}
                      <button
                        type="button"
                        onClick={() => removeParticipant(email)}
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
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
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
              ) : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}