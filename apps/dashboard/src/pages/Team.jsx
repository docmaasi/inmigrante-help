import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus, Shield, UserCheck, Eye } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import {
  useTeamMembers,
  useInviteTeamMember,
  useUpdateTeamMember,
  useRemoveTeamMember,
  useCareRecipients,
} from '@/hooks';
import { TeamMemberCard } from '../components/team/TeamMemberCard';
import { TeamMemberForm } from '../components/team/TeamMemberForm';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

const EMPTY_FORM = {
  email: '', care_recipient_ids: [], role: 'caregiver',
  full_name: '', relationship: '', phone: '', specialties: ''
};

export default function Team() {
  const { user } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: teamMembers = [], isLoading } = useTeamMembers();
  const { data: recipients = [] } = useCareRecipients();
  const inviteMutation = useInviteTeamMember();
  const updateMutation = useUpdateTeamMember();
  const removeMutation = useRemoveTeamMember();

  const formattedRecipients = recipients.map(r => ({
    ...r, full_name: `${r.first_name || ''} ${r.last_name || ''}`.trim(),
  }));

  const getRecipientName = (id) =>
    formattedRecipients.find(r => r.id === id)?.full_name || 'Unknown';

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setEditingMember(null);
    setFormData({ ...EMPTY_FORM });
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      email: member.email || '', role: member.role || 'caregiver',
      care_recipient_ids: Array.isArray(member.care_recipient_ids) ? member.care_recipient_ids : [],
      full_name: member.full_name || '', relationship: '',
      phone: member.phone || '', specialties: ''
    });
    setShowAddDialog(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.care_recipient_ids.length === 0) {
      toast.error('Please select at least one care recipient');
      return;
    }
    const payload = {
      email: formData.email, care_recipient_ids: formData.care_recipient_ids,
      role: formData.role, full_name: formData.full_name, phone: formData.phone || null,
    };
    const mutation = editingMember ? updateMutation : inviteMutation;
    const data = editingMember ? { id: editingMember.id, ...payload } : payload;
    mutation.mutate(data, {
      onSuccess: () => { toast.success(editingMember ? 'Team member updated' : 'Team member added successfully!'); handleCloseDialog(); },
      onError: (error) => toast.error(error.message || 'Failed to save team member'),
    });
  };

  const handleDelete = (member) => {
    setDeleteTarget(member);
  };

  const activeMembers = teamMembers.filter(m => m.status !== 'removed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7F2] via-[#FFF7ED] to-[#E07A5F]/8 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#E07A5F] to-[#F4A261] bg-clip-text text-transparent">Care Team</h1>
            <p className="text-sm md:text-base text-[#8B7EC8] mt-1">Manage caregivers, family members, and their roles</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-[#E07A5F] to-[#F4A261] hover:from-[#E07A5F]/90 hover:to-[#F4A261]/90 text-white w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" /> Add Team Member
          </Button>
        </div>

        <Card className="mb-6 bg-white/80 backdrop-blur-sm shadow-sm border border-[#E07A5F]/15">
          <CardContent className="p-4 md:p-6">
            <p className="text-sm font-semibold text-[#4F46E5] mb-3">Permission Levels:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-[#F4A261] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#8B7EC8]">Admin - Full access to all features</span>
              </div>
              <div className="flex items-start gap-2">
                <UserCheck className="w-4 h-4 text-[#4F46E5] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#8B7EC8]">Caregiver - Can create and edit records</span>
              </div>
              <div className="flex items-start gap-2">
                <Eye className="w-4 h-4 text-[#8B7EC8] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#8B7EC8]">Viewer - Read-only access</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-white/80 shadow-sm border border-[#4F46E5]/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1"><Skeleton className="h-5 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></div>
                  </div>
                  <Skeleton className="h-6 w-24 rounded-full mb-3" />
                  <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : activeMembers.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border border-[#E07A5F]/15 shadow-sm">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#E07A5F]/15 to-[#F4A261]/15 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-[#E07A5F]" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-[#4F46E5] mb-2">No Team Members</h3>
              <p className="text-sm md:text-base text-[#8B7EC8] mb-6">Add team members to coordinate care</p>
              <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-[#E07A5F] to-[#F4A261] hover:from-[#E07A5F]/90 hover:to-[#F4A261]/90 text-white w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" /> Add Team Member
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeMembers.map(member => (
              <TeamMemberCard key={member.id} member={member} getRecipientName={getRecipientName} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}

        <TeamMemberForm
          open={showAddDialog} onClose={handleCloseDialog}
          formData={formData} setFormData={setFormData}
          onSubmit={handleSubmit} isEditing={!!editingMember}
          isPending={inviteMutation.isPending || updateMutation.isPending}
          recipients={formattedRecipients}
        />
        <ConfirmDialog
          open={!!deleteTarget}
          title="Remove Team Member"
          description={`Remove ${deleteTarget?.full_name} from the care team?`}
          confirmLabel="Remove"
          onConfirm={() => {
            removeMutation.mutate(deleteTarget.id, { onSuccess: () => toast.success('Team member removed') });
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </div>
  );
}
