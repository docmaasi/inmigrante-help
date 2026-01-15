import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function InviteTeamMemberDialog({ open, onClose }) {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'user',
    care_recipient_id: '',
    team_role: 'caregiver',
    relationship: '',
    phone: '',
    specialties: ''
  });

  const queryClient = useQueryClient();

  const { data: recipients = [] } = useQuery({
    queryKey: ['careRecipients'],
    queryFn: () => base44.entities.CareRecipient.list()
  });

  const inviteMutation = useMutation({
    mutationFn: async (data) => {
      // First, invite user to the app
      await base44.users.inviteUser(data.email, data.role);
      
      // Then create team member record
      await base44.entities.TeamMember.create({
        user_email: data.email,
        care_recipient_id: data.care_recipient_id,
        role: data.team_role,
        full_name: data.full_name,
        relationship: data.relationship,
        phone: data.phone,
        specialties: data.specialties
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teamMembers']);
      toast.success('Invitation sent! They will receive an email to join.');
      handleClose();
    },
    onError: (error) => {
      toast.error('Failed to send invitation. ' + error.message);
    }
  });

  const handleClose = () => {
    setFormData({
      email: '',
      full_name: '',
      role: 'user',
      care_recipient_id: '',
      team_role: 'caregiver',
      relationship: '',
      phone: '',
      specialties: ''
    });
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    inviteMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <DialogTitle className="text-xl">Invite Team Member</DialogTitle>
          </div>
          <DialogDescription>
            Send an invitation to join your care team. They'll receive an email with instructions to create their account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Access & Permissions */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <h4 className="font-semibold text-sm text-slate-800 mb-3">Access & Permissions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">App Access Level *</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User - Standard Access</SelectItem>
                      <SelectItem value="admin">Admin - Full Control</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 mt-1">Controls overall app permissions</p>
                </div>
                <div>
                  <Label htmlFor="team_role">Team Role *</Label>
                  <Select value={formData.team_role} onValueChange={(value) => setFormData({...formData, team_role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin - Full Access</SelectItem>
                      <SelectItem value="caregiver">Caregiver - Can Edit</SelectItem>
                      <SelectItem value="viewer">Viewer - Read Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 mt-1">Role for this care recipient</p>
                </div>
              </div>
            </div>

            {/* Care Assignment */}
            <div>
              <Label htmlFor="care_recipient_id">Assign to Care Recipient *</Label>
              <Select value={formData.care_recipient_id} onValueChange={(value) => setFormData({...formData, care_recipient_id: value})}>
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

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="relationship">Relationship</Label>
                <Input
                  id="relationship"
                  placeholder="e.g., Daughter, Nurse, Friend"
                  value={formData.relationship}
                  onChange={(e) => setFormData({...formData, relationship: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="specialties">Responsibilities / Areas of Focus</Label>
              <Textarea
                id="specialties"
                placeholder="e.g., Medication management, meal prep, transportation to appointments"
                value={formData.specialties}
                onChange={(e) => setFormData({...formData, specialties: e.target.value})}
                rows={3}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={inviteMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}