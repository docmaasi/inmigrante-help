import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCareRecipients, useTeamMembers, useCreateCareNote, useCareNotes } from '@/hooks';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, User, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ShiftHandoff() {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({
    care_recipient_id: '',
    shift_summary: '',
    tasks_completed: '',
    concerns: '',
    handoff_to: '',
    next_shift_notes: ''
  });

  const { data: recipients = [] } = useCareRecipients();
  const { data: teamMembers = [] } = useTeamMembers();

  const { data: recentHandoffs = [] } = useCareNotes(formData.care_recipient_id || undefined);
  const handoffNotes = recentHandoffs
    .filter(note => note.category === 'shift_handoff')
    .slice(0, 5);

  const createCareNoteMutation = useCreateCareNote();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.care_recipient_id || !formData.shift_summary || !formData.tasks_completed || !formData.handoff_to) {
      toast.error('Please fill in all required fields');
      return;
    }

    const handoffContent = `
**Shift Summary:** ${formData.shift_summary}

**Tasks Completed:** ${formData.tasks_completed}

${formData.concerns ? `**Concerns:** ${formData.concerns}` : ''}

${formData.next_shift_notes ? `**Next Shift Notes:** ${formData.next_shift_notes}` : ''}

**Handed off to:** ${formData.handoff_to}
**Logged by:** ${profile?.full_name || user?.email}
    `.trim();

    try {
      await createCareNoteMutation.mutateAsync({
        care_recipient_id: formData.care_recipient_id,
        category: 'shift_handoff',
        title: `Shift Handoff - ${format(new Date(), 'MMM d, h:mm a')}`,
        content: handoffContent,
        is_private: !!formData.concerns
      });

      toast.success('Shift handoff logged');
      setFormData({
        care_recipient_id: '',
        shift_summary: '',
        tasks_completed: '',
        concerns: '',
        handoff_to: '',
        next_shift_notes: ''
      });
    } catch (error) {
      toast.error('Failed to log handoff');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="shadow-sm border-slate-200/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Create Shift Handoff
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Care Recipient *</Label>
              <Select value={formData.care_recipient_id} onValueChange={(v) => setFormData({...formData, care_recipient_id: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {recipients.map(r => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.first_name} {r.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                  {profile?.full_name && (
                    <SelectItem value={profile.full_name}>
                      {profile.full_name} (Me)
                    </SelectItem>
                  )}
                  {teamMembers.map(tm => (
                    <SelectItem key={tm.id} value={tm.full_name}>
                      {tm.full_name} ({tm.relationship || 'Team Member'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createCareNoteMutation.isPending}
            >
              {createCareNoteMutation.isPending ? 'Submitting...' : 'Submit Handoff'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-green-600" />
            Recent Handoffs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {handoffNotes.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No recent handoffs</p>
          ) : (
            <div className="space-y-3">
              {handoffNotes.map(handoff => (
                <div key={handoff.id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-slate-800 text-sm">{handoff.title}</div>
                    {handoff.is_flagged && (
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
                    {format(new Date(handoff.created_at), 'MMM d, h:mm a')}
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
