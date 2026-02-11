import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import RecipientCheckboxList from '../shared/RecipientCheckboxList';

export default function ShiftHandoff() {
  const [user, setUser] = useState(null);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState([]);
  const [formData, setFormData] = useState({
    shift_summary: '',
    tasks_completed: '',
    concerns: '',
    handoff_to: '',
    next_shift_notes: ''
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: recipients = [] } = useQuery({
    queryKey: ['careRecipients'],
    queryFn: () => base44.entities.CareRecipient.list()
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: () => base44.entities.TeamMember.list()
  });

  const { data: recentHandoffs = [] } = useQuery({
    queryKey: ['careNotes', 'handoff'],
    queryFn: () => base44.entities.CareNote.filter({ note_type: 'shift_handoff' }, '-created_date', 5)
  });

  const createHandoffMutation = useMutation({
    mutationFn: (data) => base44.entities.CareNote.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['careNotes']);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedRecipientIds.length === 0) {
      toast.error('Please select at least one care recipient');
      return;
    }

    const handoffContent = `
**Shift Summary:** ${formData.shift_summary}

**Tasks Completed:** ${formData.tasks_completed}

${formData.concerns ? `**Concerns:** ${formData.concerns}` : ''}

${formData.next_shift_notes ? `**Next Shift Notes:** ${formData.next_shift_notes}` : ''}

**Handed off to:** ${formData.handoff_to}
**Logged by:** ${user?.full_name} (${user?.email})
    `.trim();

    try {
      for (const recipientId of selectedRecipientIds) {
        await createHandoffMutation.mutateAsync({
          care_recipient_id: recipientId,
          note_type: 'shift_handoff',
          title: `Shift Handoff - ${format(new Date(), 'MMM d, h:mm a')}`,
          content: handoffContent,
          date: new Date().toISOString().split('T')[0],
          time: format(new Date(), 'HH:mm'),
          flagged_important: !!formData.concerns
        });
      }
      const count = selectedRecipientIds.length;
      toast.success(count === 1 ? 'Shift handoff logged' : `${count} shift handoffs logged`);
      setSelectedRecipientIds([]);
      setFormData({ shift_summary: '', tasks_completed: '', concerns: '', handoff_to: '', next_shift_notes: '' });
    } catch {
      toast.error('Failed to log shift handoff');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Create Handoff */}
      <Card className="shadow-sm border-slate-200/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Create Shift Handoff
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <RecipientCheckboxList
              careRecipients={recipients}
              selectedIds={selectedRecipientIds}
              onChange={setSelectedRecipientIds}
            />

            <div>
              <Label>Shift Summary *</Label>
              <Textarea
                value={formData.shift_summary}
                onChange={(e) => setFormData({...formData, shift_summary: e.target.value})}
                placeholder="Brief overview of the shift"
                rows={2}
                required
              />
            </div>

            <div>
              <Label>Tasks Completed *</Label>
              <Textarea
                value={formData.tasks_completed}
                onChange={(e) => setFormData({...formData, tasks_completed: e.target.value})}
                placeholder="List what was accomplished"
                rows={3}
                required
              />
            </div>

            <div>
              <Label>Concerns / Issues</Label>
              <Textarea
                value={formData.concerns}
                onChange={(e) => setFormData({...formData, concerns: e.target.value})}
                placeholder="Any concerns or issues to watch"
                rows={2}
              />
            </div>

            <div>
              <Label>Next Shift Notes</Label>
              <Textarea
                value={formData.next_shift_notes}
                onChange={(e) => setFormData({...formData, next_shift_notes: e.target.value})}
                placeholder="What needs attention next"
                rows={2}
              />
            </div>

            <div>
              <Label>Hand Off To *</Label>
              <Select value={formData.handoff_to} onValueChange={(v) => setFormData({...formData, handoff_to: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {user?.full_name && (
                    <SelectItem value={user.full_name}>
                      {user.full_name} (Me)
                    </SelectItem>
                  )}
                  {teamMembers.map(tm => (
                    <SelectItem key={tm.id} value={tm.full_name}>
                      {tm.full_name} ({tm.relationship})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full">
              Submit Handoff
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Handoffs */}
      <Card className="shadow-sm border-slate-200/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-green-600" />
            Recent Handoffs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentHandoffs.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No recent handoffs</p>
          ) : (
            <div className="space-y-3">
              {recentHandoffs.map(handoff => (
                <div key={handoff.id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-slate-800 text-sm">{handoff.title}</div>
                    {handoff.flagged_important && (
                      <Badge className="bg-orange-100 text-orange-700">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Concerns
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 whitespace-pre-line line-clamp-4">
                    {handoff.content}
                  </p>
                  <div className="text-xs text-slate-500 mt-2">
                    {format(new Date(handoff.created_date), 'MMM d, h:mm a')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}